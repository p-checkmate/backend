import HttpError from "http-errors";
import {
    ReadingGroupListResponse,
    ReadingGroupListItem,
} from "../schemas/reading_groups.schema.js";
import {
    getActiveReadingGroups,
    getParticipantsByUserAndGroups,
    getUserRankInGroup,
} from "../repositories/reading_groups.repository.js";

// 날짜 포맷팅 헬퍼 함수
const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yy}.${mm}.${dd}`;
};

// 남은 일수 계산 헬퍼 함수
const calculateDaysLeft = (endDateStr: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(endDateStr);
    endDate.setHours(0, 0, 0, 0);
    return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// GET /api/reading-groups/list - 함께 읽기 목록 조회 서비스
export const getReadingGroupListService = async (
    userId: number
): Promise<ReadingGroupListResponse> => {
    try {
        // 현재 진행 중인 함께 읽기 그룹 조회
        const readingGroups = await getActiveReadingGroups();

        if (readingGroups.length === 0) {
            return { reading_groups: [] };
        }

        // 그룹 ID 목록 추출
        const groupIds = readingGroups.map((group) => group.reading_group_id);

        // 사용자 참여 정보 조회
        const participations = await getParticipantsByUserAndGroups(userId, groupIds);

        // 참여 정보를 Map으로 변환
        const participationMap = new Map(
            participations.map((p) => [p.reading_group_id, p])
        );

        // 응답 데이터 생성
        const readingGroupItems: ReadingGroupListItem[] = await Promise.all(
            readingGroups.map(async (group) => {
                const participation = participationMap.get(group.reading_group_id);
                const isParticipating = !!participation;

                // 내 진행 정보 (참여 중인 경우에만)
                let myProgress: { current_page: number } | null = null;
                let participantReadingInfo: string | null = null;

                if (isParticipating && participation) {
                    myProgress = {
                        current_page: participation.current_page,
                    };

                    // 참여자 순위 정보 조회
                    const rank = await getUserRankInGroup(group.reading_group_id, userId);

                    if (rank !== null) {
                        participantReadingInfo = `참여자 중 ${rank}번째로 많이 읽었어요`;
                    }
                }

                return {
                    reading_group_id: group.reading_group_id,
                    book: {
                        book_id: group.book_id,
                        title: group.book_title,
                        thumbnail_url: group.thumbnail_url,
                        page_count: group.page_count,
                    },
                    participant_count: group.participant_count,
                    days_left: calculateDaysLeft(group.end_date),
                    start_date: formatDate(group.start_date),
                    end_date: formatDate(group.end_date),
                    is_participating: isParticipating,
                    my_progress: myProgress,
                    participant_reading_info: participantReadingInfo,
                };
            })
        );

        return { reading_groups: readingGroupItems };
    } catch (err) {
        console.error(err);
        throw HttpError(500, "함께 읽기 목록 조회에 실패했습니다.");
    }
};
