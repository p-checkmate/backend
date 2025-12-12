import HttpError from "http-errors";
import { AiChat, AiChatMessage } from "../schemas/ai.schema.js";
import { startAiChat, continueAiChat } from "../repositories/gemini.repository.js";

// AI 채팅 시작
export const initAiChatService = async (): Promise<AiChat> => {
    return await startAiChat();
};

// AI 채팅 시작
export const aiChatService = async (chatId: string, message: string): Promise<AiChatMessage> => {
    return await continueAiChat(chatId, message);
};
