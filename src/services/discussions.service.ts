import HttpError from "http-errors";
import {
    getDiscussionById,
    insertDiscussionComment,
    hasUserCommentedOnDiscussion,
} from "../repositories/discussions.repository.js";
import { CreateDiscussionMessageResponse } from "../schemas/discussions.schema.js";
import { addExpToUser } from "../services/mypage.service.js";

const EXP_REWARD = 10;

// 토론 메시지 생성 서비스
export const createDiscussionMessageService = async (
    discussionId: number,
    userId: number,
    content: string,
    choice?: number
): Promise<CreateDiscussionMessageResponse> => {
    // 토론 존재 여부 및 타입 확인
    const discussion = await getDiscussionById(discussionId);
    if (!discussion) {
        throw HttpError(404, "해당 토론을 찾을 수 없습니다.");
    }

    // VS 토론과 FREE 토론에 따른 choice 검증
    if (discussion.discussion_type === "VS") {
        if (choice === undefined || choice === null) {
            throw HttpError(400, "VS 토론에서는 선택지(1 또는 2)를 선택해야 합니다.");
        }
        if (choice !== 1 && choice !== 2) {
            throw HttpError(400, "선택지는 1 또는 2만 가능합니다.");
        }
    } else {
        // FREE 토론인 경우 choice가 있으면 에러
        if (choice !== undefined && choice !== null) {
            throw HttpError(400, "자유 토론에서는 선택지를 선택할 수 없습니다.");
        }
    }

    // 사용자가 이 토론에 이미 메시지를 작성했는지 확인
    const hasCommented = await hasUserCommentedOnDiscussion(discussionId, userId);

    try {
        // 메시지 생성 (VS 토론이면 choice 저장, FREE 토론이면 null)
        const finalChoice = discussion.discussion_type === "VS" ? choice! : null;
        const commentId = await insertDiscussionComment(discussionId, userId, content, finalChoice);

        let expEarned = 0;

        // 첫 메시지인 경우에만 경험치 부여
        if (!hasCommented) {
            await addExpToUser(userId, EXP_REWARD);
            expEarned = EXP_REWARD;
        }

        return {
            comment_id: commentId,
            exp_earned: expEarned,
        };
    } catch (err: any) {
        if (err.status) {
            throw err;
        }
        console.error(err);
        throw HttpError(500, "토론 메시지 작성에 실패했습니다.");
    }
};