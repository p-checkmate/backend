// services/discussions_summary.service.ts

import HttpError from "http-errors";
import { VsDiscussionSummaryResponse } from "../schemas/discussions.schema.js";
import {
    getVsDiscussionWithStats,
    getDiscussionMessagesForSummary,
    isDiscussionEnded,
} from "../repositories/discussions.repository.js";
import { requestGeminiContent } from "../repositories/gemini.repository.js";

import { formatDate} from "../utils/date.util.js";

// VS 토론 요약 프롬프트 생성
const buildSummaryPrompt = (
    title: string,
    option1: string,
    option2: string,
    option1Messages: { nickname: string; content: string }[],
    option2Messages: { nickname: string; content: string }[]
): string => {
    const option1Contents = option1Messages
        .map((m) => `- ${m.nickname}: "${m.content}"`)
        .join("\n");

    const option2Contents = option2Messages
        .map((m) => `- ${m.nickname}: "${m.content}"`)
        .join("\n");

    return `
당신은 독서 토론 요약 전문가입니다. 아래 VS 토론의 내용을 요약해주세요.

## 토론 제목
${title}

## 선택지
- 1번 의견: ${option1}
- 2번 의견: ${option2}

## 1번 측 의견들 (${option1Messages.length}개)
${option1Contents || "의견이 없습니다."}

## 2번 측 의견들 (${option2Messages.length}개)
${option2Contents || "의견이 없습니다."}

## 요약 작성 지침
1. 1번 측에서 몇 개의 메시지가 작성되었고, 어떤 주장을 했는지 간단히 요약해주세요.
2. 2번 측에서 몇 개의 메시지가 작성되었고, 어떤 주장을 했는지 간단히 요약해주세요.
3. 전체적인 토론 분위기를 한두 문장으로 정리해주세요.

응답 형식:
- 한국어로 작성해주세요.
- 200자 내외로 간결하게 요약해주세요.
- "1번 측에서 N개의 메시지가 작성되었어요. 1번 측은 ~라는 의견을 내세웠지만 ~에 반박당했어요" 같은 형식으로 작성해주세요.
`.trim();
};

// VS 토론 종료 상세 조회 (요약 실시간 생성)
export const getVsDiscussionSummaryService = async (
    discussionId: number,
    userId: number
): Promise<VsDiscussionSummaryResponse> => {
    // VS 토론 정보 조회
    const discussion = await getVsDiscussionWithStats(discussionId);

    if (!discussion) {
        throw HttpError(404, "해당 VS 토론을 찾을 수 없습니다.");
    }

    if (discussion.discussion_type !== "VS") {
        throw HttpError(400, "VS 토론만 요약 조회가 가능합니다.");
    }

    // 종료 여부 확인
    const isEnded = await isDiscussionEnded(discussionId);

    if (!isEnded) {
        throw HttpError(400, "토론이 아직 종료되지 않았습니다.");
    }

    // 메시지 조회
    const messages = await getDiscussionMessagesForSummary(discussionId);

    // 의견 비율 계산
    const totalVotes = discussion.option1_count + discussion.option2_count;
    const option1Percentage = totalVotes > 0
        ? Math.round((discussion.option1_count / totalVotes) * 100)
        : 0;
    const option2Percentage = totalVotes > 0
        ? Math.round((discussion.option2_count / totalVotes) * 100)
        : 0;

    // AI 요약 생성
    let summary = "작성된 의견이 없어 요약을 생성할 수 없습니다.";

    if (messages.length > 0) {
        // 1번 측, 2번 측 메시지 분리
        const option1Messages = messages
            .filter((m) => m.choice === 1)
            .map((m) => ({ nickname: m.nickname, content: m.content }));

        const option2Messages = messages
            .filter((m) => m.choice === 2)
            .map((m) => ({ nickname: m.nickname, content: m.content }));

        try {
            const prompt = buildSummaryPrompt(
                discussion.title,
                discussion.option1,
                discussion.option2,
                option1Messages,
                option2Messages
            );

            summary = await requestGeminiContent(prompt);
        } catch (err: any) {
            console.error("AI 요약 생성 실패:", err);
            summary = "AI 요약 생성에 실패했습니다. 잠시 후 다시 시도해주세요.";
        }
    }

    return {
        discussion_id: discussion.discussion_id,
        title: discussion.title,
        discussion_type: "VS",
        option1: discussion.option1,
        option2: discussion.option2,
        is_ended: isEnded,
        ended_at: discussion.end_date ? formatDate(discussion.end_date) : null,
        total_comments: discussion.total_comments,
        summary,
        opinion_ratio: {
            option1_count: discussion.option1_count,
            option2_count: discussion.option2_count,
            option1_percentage: option1Percentage,
            option2_percentage: option2Percentage,
        },
    };
};
