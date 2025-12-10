import HttpError from "http-errors";
import {
    getDiscussionById,
    insertDiscussionComment,
    hasUserCommentedOnDiscussion,
    addUserExp,
} from "../repositories/discussions.repository.js";
import { CreateDiscussionMessageResponse } from "../schemas/discussions.schema.js";

const EXP_REWARD = 10;

// 토론 메시지 생성 서비스
export const createDiscussionMessageService = async (
    discussionId: number,
    userId: number,
    content: string
): Promise<CreateDiscussionMessageResponse> => {
    // 토론 존재 여부 확인
    const discussion = await getDiscussionById(discussionId);
    if (!discussion) {
        throw HttpError(404, "해당 토론을 찾을 수 없습니다.");
    }

    // 사용자가 이 토론에 이미 메시지를 작성했는지 확인
    const hasCommented = await hasUserCommentedOnDiscussion(discussionId, userId);

    try {
        // 메시지 생성
        const commentId = await insertDiscussionComment(discussionId, userId, content);

        let expEarned = 0;

        // 첫 메시지인 경우에만 경험치 부여
        if (!hasCommented) {
            await addUserExp(userId, EXP_REWARD);
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