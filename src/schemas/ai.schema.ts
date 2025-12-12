import { z } from "zod";

// AI 채팅 응답 결과 반환 스키마
export const aiChatResponseSchema = z.object({
    chatId: z.string(),
    response: z.string(),
});

// TypeScript 추론 타입
export type AiChatResponse = z.infer<typeof aiChatResponseSchema>;
