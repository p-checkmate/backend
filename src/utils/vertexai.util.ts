// utils/vertexai.util.ts

import { vertexAI } from "../config/vertexai.config.js";

// VS 토론 요약 생성
export const generateDiscussionSummary = async (
    title: string,
    option1: string,
    option2: string,
    option1Messages: { nickname: string; content: string }[],
    option2Messages: { nickname: string; content: string }[]
): Promise<string> => {
    const option1Contents = option1Messages
        .map((m) => `- ${m.nickname}: "${m.content}"`)
        .join("\n");

    const option2Contents = option2Messages
        .map((m) => `- ${m.nickname}: "${m.content}"`)
        .join("\n");

    const prompt = `
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

    try {
        const model = vertexAI.getGenerativeModel({
            model: "gemini-2.0-flash-lite-001",
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("AI 응답이 비어있습니다.");
        }

        return text;

    } catch (err: any) {
        console.error("Vertex AI 요청 실패:", err);

        if (err.message?.includes("quota") || err.message?.includes("rate") || err.message?.includes("429")) {
            throw new Error("AI 요약 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
        }

        if (err.message?.includes("permission") || err.message?.includes("403")) {
            throw new Error("Vertex AI 권한이 없습니다. 서비스 계정 설정을 확인해주세요.");
        }

        throw new Error(`AI 요약 생성 중 오류가 발생했습니다: ${err.message}`);
    }
};
