// repositories/gemini.repository.ts

import { vertexAI } from "../config/gemini.config.js";

// Gemini API를 통한 텍스트 생성 요청
export const requestGeminiContent = async (prompt: string): Promise<string> => {
    try {
        const model = vertexAI.getGenerativeModel({
            model: "gemini-2.0-flash-lite-001",
        });

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
        });

        const candidates = result.response.candidates ?? [];
        const content = candidates[0]?.content;
        const parts = content?.parts ?? [];

        const text = parts
            .map((p) => ("text" in p ? (p as any).text : ""))
            .join("")
            .trim();

        if (!text) {
            throw new Error("Vertex AI 응답에서 텍스트를 찾을 수 없습니다.");
        }

        return text;
    } catch (err: any) {
        console.error("Vertex AI(Gemini) API 호출 실패:", err);

        if (err.message?.includes("quota") || err.message?.includes("rate") || err.message?.includes("429")) {
            throw new Error("AI 요약 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
        }

        if (err.message?.includes("permission") || err.message?.includes("403")) {
            throw new Error("Vertex AI 권한이 없습니다. 서비스 계정 설정을 확인해주세요.");
        }

        throw new Error(`Gemini API 호출 중 오류가 발생했습니다: ${err.message}`);
    }
};
