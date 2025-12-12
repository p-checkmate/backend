import HttpError from "http-errors";
import { AiChatResponse } from "../schemas/ai.schema.js";
import { startAiChat } from "../repositories/gemini.repository.js";

// AI 채팅 시작
export const initAiChatService = async (): Promise<AiChatResponse> => {
    return await startAiChat();
};
