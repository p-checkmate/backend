import HttpError from "http-errors";
import {
    ReadingGroupListResponse,
    ReadingGroupListItem,
} from "../schemas/reading_groups.schema.js";
import {
    getActiveReadingGroups,
    getMembersByUserAndGroups,
    getUserRankInGroup,
} from "../repositories/reading_groups.repository.js";

// 날짜 포맷팅 헬퍼 함수 (YY.MM.DD)
const formatDate = (value: string | Date): string => {
    const date = value instanceof Date ? value : new Date(value);

    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yy}.${mm}.${dd}`;
};

// 남은 기간 계산 함수 (D-day)
const calcDaysLeft = (endDate: string | Date): number => {
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    const today = new Date();
    const diffMs = end.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// GET /api/reading-groups/list - 함께 읽기 목록 조회 서비스
export const getReadingGroupList = async (
    userId: number
): Promise<ReadingGroupListResponse> => {
    try {
        // 전체 진행 중인 그룹 조회
        const readingGroups = await getActiveReadingGroups();

        if (readingGroups.length === 0) {
            return { reading_groups: [] };
        }

        // 그룹 ID 리스트
        const groupIds = readingGroups.map((rg) => rg.reading_group_id);

        // 해당 유저의 참여 정보 한 번에 조회
        const members = await getMembersByUserAndGroups(userId, groupIds);

        const readingGroupItems: ReadingGroupListItem[] = [];

        for (const group of readingGroups) {
            const participation = members.find(
                (m) => m.reading_group_id === group.reading_group_id
            );

            // 참여 여부
            const isParticipating = !!participation;

            // 내 진도 정보
            let my_progress: { current_page: number } | null = null;
            if (participation) {
                my_progress = {
                    current_page: participation.current_page,
                };
            }

            // 내 순위
            const my_rank = isParticipating
                ? await getUserRankInGroup(group.reading_group_id, userId)
                : null;

            readingGroupItems.push({
                reading_group_id: group.reading_group_id,
                book: {
                    book_id: group.book_id,
                    title: group.book_title,
                    thumbnail_url: group.thumbnail_url,
                    page_count: group.page_count,
                },
                member_count: group.member_count,
                days_left: calcDaysLeft(group.end_date),
                start_date: formatDate(group.start_date),
                end_date: formatDate(group.end_date),
                is_participating: isParticipating,
                my_progress,
                member_reading_info:
                    my_rank !== null
                        ? `참여자 중 ${my_rank}번째로 많이 읽었어요`
                        : null,
            });
        }

        return { reading_groups: readingGroupItems };
    } catch (error) {
        console.error(error);
        throw HttpError(500, "함께 읽기 조회 실패");
    }
};
