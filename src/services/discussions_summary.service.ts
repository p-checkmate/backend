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
아래는 1번과 2번 측이 참여한 VS 토론입니다.
두 측의 주장·근거·반박 흐름을 정확하고 간결하게 요약해주세요.

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
1. **각 측에서 몇 개의 메시지가 작성되었는지 명확히 언급**하고,  
   각각의 **핵심 주장(결론)** + **주요 근거 1~2개**를 압축적으로 요약해주세요.
2. 상대 측으로부터 **반박을 받았는지**, 논지 상 어떤 약점이 있었는지도 언급해주세요.
3. 전체 토론의 **논조, 분위기, 흐름**을 한두 문장으로 분석해주세요.  
   - 어느 의견이 상대적으로 더 설득력을 가졌는지 평가해도 좋습니다.
   - 하지만 특정 의견을 편드는 듯한 표현은 피해주세요.
4. 300자 내외로 간결하고 읽기 쉽게 정리해주세요.
5. 아래 형식을 반드시 따라주세요:

응답 형식:
“1번 측은 ~라고 주장했으며, ~을 근거로 들었습니다. 
하지만 ~라는 반박을 받았습니다.  
2번 측은 ~라고 주장하며 ~을 강조했습니다.  
전체적으로 토론은 ~한 분위기였으며, 결론은 ~로 나뉘었습니다.”
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
