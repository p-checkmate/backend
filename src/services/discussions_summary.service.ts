// services/discussions_summary.service.ts

import HttpError from "http-errors";
import { VsDiscussionSummaryResponse } from "../schemas/discussions_summary.schema.js";
import {
    getVsDiscussionWithStats,
    getDiscussionMessagesForSummary,
    getUserVoteForDiscussion,
    isDiscussionEnded,
} from "../repositories/discussions_summary.repository.js";
import { generateDiscussionSummary } from "../utils/vertexai.util.js";

// 날짜 포맷팅 헬퍼 함수 (YYYY.MM.DD)
const formatDate = (date: Date | null): string | null => {
    if (!date) return null;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}.${mm}.${dd}`;
};

// VS 토론 종료 상세 조회 (요약 실시간 생성)
export const getVsDiscussionSummaryService = async (
    discussionId: number,
    userId: number
): Promise<VsDiscussionSummaryResponse> => {
    // VS 토론 정보 조회
    const discussion = await getVsDiscussionWithStats(discussionId);

    if (!discussion) {
        throw HttpError(404, "해당 VS 토론을 찾을 수 없습니다.");
    }

    if (discussion.discussion_type !== "VS") {
        throw HttpError(400, "VS 토론만 요약 조회가 가능합니다.");
    }

    // 종료 여부 확인
    const isEnded = await isDiscussionEnded(discussionId);

    if (!isEnded) {
        throw HttpError(400, "토론이 아직 종료되지 않았습니다.");
    }

    // 메시지 조회
    const messages = await getDiscussionMessagesForSummary(discussionId);

    // 의견 비율 계산
    const totalVotes = discussion.option1_count + discussion.option2_count;
    const option1Percentage = totalVotes > 0
        ? Math.round((discussion.option1_count / totalVotes) * 100)
        : 0;
    const option2Percentage = totalVotes > 0
        ? Math.round((discussion.option2_count / totalVotes) * 100)
        : 0;

    // 사용자 투표 여부 조회
    const userVote = await getUserVoteForDiscussion(userId, discussionId);

    // AI 요약 생성
    let summary = "작성된 의견이 없어 요약을 생성할 수 없습니다.";

    if (messages.length > 0) {
        // 1번 측, 2번 측 메시지 분리
        const option1Messages = messages
            .filter((m) => m.choice === 1)
            .map((m) => ({ nickname: m.nickname, content: m.content }));

        const option2Messages = messages
            .filter((m) => m.choice === 2)
            .map((m) => ({ nickname: m.nickname, content: m.content }));

        try {
            summary = await generateDiscussionSummary(
                discussion.title,
                discussion.option1,
                discussion.option2,
                option1Messages,
                option2Messages
            );
        } catch (err: any) {
            console.error("AI 요약 생성 실패:", err);
            summary = "AI 요약 생성에 실패했습니다. 잠시 후 다시 시도해주세요.";
        }
    }

    return {
        discussion_id: discussion.discussion_id,
        title: discussion.title,
        discussion_type: "VS",
        option1: discussion.option1,
        option2: discussion.option2,
        is_ended: isEnded,
        ended_at: formatDate(discussion.end_date),
        total_comments: discussion.total_comments,
        summary,
        opinion_ratio: {
            option1_count: discussion.option1_count,
            option2_count: discussion.option2_count,
            option1_percentage: option1Percentage,
            option2_percentage: option2Percentage,
        },
        user_vote: userVote,
    };
};
