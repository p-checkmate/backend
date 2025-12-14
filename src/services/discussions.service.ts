import HttpError from "http-errors";
import {
    getDiscussionById,
    insertDiscussionComment,
    hasUserCommentedOnDiscussion,
    findVoteByUserAndDiscussion,
    insertVote,
    findDiscussionsByCommentCount,
    getVsVoteStats
} from "../repositories/discussions.repository.js";
import {
    CreateDiscussionMessageResponse,
    VoteResponse,
    PopularDiscussionResponse,
    VoteStatusResponse,
    OpinionRatio
} from "../schemas/discussions.schema.js";
import { addExpToUser } from "../services/mypage.service.js";
import { formatDate } from "../utils/date.util.js";

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

// VS 토론 투표 서비스
export const voteDiscussionService = async (
    userId: number,
    discussionId: number,
    choice: number
): Promise<VoteResponse> => {
    // 토론 존재 여부 및 타입 확인
    const discussion = await getDiscussionById(discussionId);
    if (!discussion) {
        throw HttpError(404, "해당 토론을 찾을 수 없습니다.");
    }

    // VS 토론인지 확인
    if (discussion.discussion_type !== "VS") {
        throw HttpError(400, "VS 토론에서만 투표할 수 있습니다.");
    }

    // 이미 투표했는지 확인
    const existingVote = await findVoteByUserAndDiscussion(userId, discussionId);
    if (existingVote) {
        throw HttpError(400, "이미 투표한 토론입니다.");
    }

    try {
        // 투표 등록
        await insertVote(userId, discussionId, choice);

        return { message: "투표가 완료되었습니다." };
    } catch (err: any) {
        if (err.status) {
            throw err;
        }
        console.error(err);
        throw HttpError(500, "투표에 실패했습니다.");
    }
};

// 인기 토론 조회 서비스
export const getPopularDiscussionsService = async (): Promise<PopularDiscussionResponse> => {
    const rawData = await findDiscussionsByCommentCount();

    const popularDiscussions = rawData.map((data) => {
        return {
            discussion_id: data.discussion_id,
            title: data.title,
            content: data.content,
            like_count: data.like_count,
            comment_count: data.comment_count,
            created_at: data.created_at.toISOString(),
            book: {
                book_id: data.book_id,
                title: data.book_title,
            },
            user: {
                nickname: data.nickname,
            },
        };
    });
    return { discussions: popularDiscussions };
};

// VS 토론 투표 여부, 선택 조회
export const getVoteStatusService = async (
    discussionId: number,
    userId: number
): Promise<VoteStatusResponse> => {
    const discussion = await getDiscussionById(discussionId);

    if (!discussion) {
        throw HttpError(404, "토론을 찾을 수 없습니다.");
    }

    if (discussion.discussion_type !== "VS") {
        throw HttpError(400, "VS 토론이 아닙니다.");
    }

    const vote = await findVoteByUserAndDiscussion(userId, discussionId);

    return {
        is_voted: !!vote,
        choice: vote ? vote.choice : null,
    };
};

// VS 토론 투표 통계 조회 서비스
export const getVsDiscussionVoteStatsService = async (
    discussionId: number
): Promise<OpinionRatio> => {
    const stats = await getVsVoteStats(discussionId);

    if (!stats) throw HttpError(404, "해당 VS 토론을 찾을 수 없습니다.");
    if (stats.discussion_type !== "VS") throw HttpError(400, "VS 토론만 투표 현황 조회가 가능합니다.");

    const vote1Count = Number(stats.vote1_count ?? 0);
    const vote2Count = Number(stats.vote2_count ?? 0);
    const total = vote1Count + vote2Count;

    const option1Percentage = total > 0
        ? Math.round((vote1Count / total) * 100)
        : 0;

    const option2Percentage = total > 0
        ? Math.round((vote2Count / total) * 100)
        : 0;

    return {
        vote1_count: vote1Count,
        vote2_count: vote2Count,
        option1_percentage: option1Percentage,
        option2_percentage: option2Percentage,
        end_date: stats.end_date ? formatDate(stats.end_date) : null,
    };
};