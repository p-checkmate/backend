import HttpError from "http-errors";
import { GoogleGenAI, Chat } from "@google/genai";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { AiChat, AiChatMessage } from "../schemas/ai.schema";

dotenv.config();

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const GCP_LOCATION = process.env.GCP_LOCATION || "us-central1";
const MODEL = "gemini-2.5-flash";

const ai = new GoogleGenAI({
    vertexai: true,
    project: GCP_PROJECT_ID,
    location: GCP_LOCATION,
});

// 인메모리 세션 저장소
const chatSessions: Map<string, Chat> = new Map();

// AI 채팅 시작
export const startAiChat = async (): Promise<AiChat> => {
    const defaultStartMessage = "안녕하세요! 오늘은 무슨 책으로 토론을 하고 싶으신가요?";

    // 시스템 지침
    const systemInstruction = `당신은 사용자와 책에 대해 깊이 있는 토론을 나누는 전문 북 토론 파트너입니다.
    [역할 및 목표]
    1.  토론 주도: 사용자가 제시한 책의 내용(주제, 등장인물, 배경 등)을 완벽히 이해하고 대화에 참여해야 합니다.
    2.  적극적인 의견 개진: 사용자가 의견을 제시하면, 당신 역시 "저는 이렇게 생각합니다"라는 형태로 자신의 해석이나 의견을 적극적으로 개진하여 토론을 심화시켜야 합니다. 단순한 질문이나 요약은 지양하고 건설적인 의견을 제시하세요.
    3.  지식 확보 요청: 사용자가 토론할 책을 제시했을 때, 만약 해당 책의 내용을 바로 토론하기 어렵다고 판단되면, 모델의 지식 한계를 인정하고 다음과 같이 정중하게 선행 정보를 요청해야 합니다: "제가 현재 해당 책에 대한 정보가 충분하지 않아서, 깊이 있는 토론을 위해 혹시 책의 핵심 줄거리나 주요 주제를 먼저 간단히 공유해 주실 수 있을까요? 사용자의 관점에서 중요한 부분을 먼저 듣고 싶습니다."
    [어조 및 스타일]
    1.  어조: 항상 정중하고 차분하며 다정한 말투를 사용합니다. 너무 딱딱하거나 학술적이지 않게, 편안하고 친근한 분위기를 유지하세요.
    2.  금지: 절대 비속어, 은어, 줄임말, 폭력적이거나 부적절한 언어를 사용해서는 안 됩니다.`;

    try {
        const chat = ai.chats.create({
            model: MODEL,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        const newChatId = uuidv4();
        chatSessions.set(newChatId, chat);

        return {
            chatId: newChatId,
            message: defaultStartMessage, // 챗봇이 먼저 보내는 메시지
        };
    } catch (error) {
        console.error("채팅 세션 생성 중 오류 발생:", error);
        throw HttpError(500, "채팅 세션을 시작하는 데 실패했습니다");
    }
};

// chatSessions 맵을 반환하여 외부에서 접근할 수 있도록 함 (디버깅 또는 메시지 전송용)
export const getChatSessions = () => chatSessions;

// AI 채팅 이어가기
export const continueAiChat = async (chatId: string, userMessage: string): Promise<AiChatMessage> => {
    // 세션 객체 찾기
    const chatSession = chatSessions.get(chatId);

    if (!chatSession) {
        // 세션 ID가 유효하지 않거나 서버 재시작으로 메모리에서 사라진 경우
        throw HttpError(404, `세션을 찾을 수 없습니다.: ${chatId}.`);
    }

    try {
        const response = await chatSession.sendMessage({ message: userMessage });

        if (!response.text) {
            throw HttpError(500, "Gemini 모델이 텍스트 응답을 생성하지 못했습니다.");
        }

        return {
            message: response.text,
        };
    } catch (error) {
        console.error(`메시지 전송 중 오류 발생 (Chat ID: ${chatId}):`, error);
        throw HttpError(500, "메시지 전송에 실패했습니다");
    }
};

// VS토론 요약 텍스트 생성 요청
export const requestGeminiContent = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
        });

        const text = response.text;

        if (!text) {
            throw HttpError(500, "Gemini 모델이 텍스트 응답을 생성하지 못했습니다.");
        }

        return text.trim();
    } catch (err: any) {
        console.error("Gemini API 호출 실패:", err);
        throw HttpError(500, `Gemini API 호출 중 오류가 발생했습니다: ${err.message}`);
    }
};