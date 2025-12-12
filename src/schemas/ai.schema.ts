import { z } from "zod";

// AI 채팅 스키마 (범용)
export const aiChatSchema = z.object({
    chatId: z.string(),
    message: z.string(),
});

// AI 채팅 메시지 스키마
export const aiChatMessageSchema = z.object({
    message: z.string(),
});

// TypeScript 추론 타입
export type AiChat = z.infer<typeof aiChatSchema>;
export type AiChatMessage = z.infer<typeof aiChatMessageSchema>;
