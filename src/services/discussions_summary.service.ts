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
당신은 책 기반 VS 토론의 논리 구조를 분석하고 요약하는 전문가입니다.
아래는 1번과 2번 측이 참여한 VS 토론 내용입니다.
두 측의 주장·근거·반박 흐름을 명확하고 간결하게 요약해주세요.

---

## 토론 제목
${title}

## 선택지
- 1번 의견: ${option1}
- 2번 의견: ${option2}

## 1번 측 의견들 (${option1Messages.length}개)
${option1Contents || "의견이 없습니다."}

## 2번 측 의견들 (${option2Messages.length}개)
${option2Contents || "의견이 없습니다."}

---

## 요약 작성 지침
1. 각 측에서 작성된 메시지 개수를 언급하고, 핵심 주장과 주요 근거를 명확히 요약해주세요.
2. 상대 의견에 대한 반박 여부와 논리적 약점이 드러나는 부분이 있다면 언급해주세요.
3. 전체 토론의 흐름, 분위기, 논점의 차이를 간단히 정리해주세요.
4. 토론 내용 중 과격한 표현, 공격적인 발언, 비난성 멘트가 포함되어 있더라도 해당 문장을 그대로 재현하지 마세요.
5. 특정 사용자를 직접적으로 비난하거나 공격하는 듯한 표현은 절대 사용하지 않습니다.
6. 토론 요약은 객관적이고 공정한 시각에서 작성합니다.
7. 자연스럽고 읽기 쉬운 한국어로 작성하되, 불필요한 문장은 줄여 간결하게 요약해주세요.
8. 요약은 반드시 300자 이내로 작성해주세요.

## 어조
- 전체적으로 중립적이고 분석적인 톤을 유지하며, 어느 한쪽을 지지하거나 감정적으로 반응하지 않습니다.

`.trim();
};

// VS 토론 종료 요약 상세 조회 
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
