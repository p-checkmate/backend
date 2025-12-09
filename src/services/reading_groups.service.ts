import HttpError from "http-errors";

import { getBookById } from "../repositories/books.repository.js";

import {
    ReadingGroupListResponse,
    ReadingGroupListItem,
    ReadingGroupOverviewResponse,
    CreateReadingGroupResponse,
    JoinReadingGroupResponse,
    UpdateReadingProgressResponse,
    ReadingGroupMembersResponse,
    ReadingGroupMemberItem,
} from "../schemas/reading_groups.schema.js";
import {
    insertReadingGroup,
    getActiveReadingGroups,
    getMembersByUserAndGroups,
    getUserRankInGroup,
    getReadingGroupById,
    getMemberByUserAndGroup,
    insertReadingGroupMember,
    updateReadingGroupMemberProgress,
    countMembersByGroupId,
    getMembersWithLevelByGroupId,
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


// POST /api/reading-groups/create - 관리자용 함께 읽기 생성
export const createReadingGroupService = async (
    bookId: number,
    startDate: string,
    endDate: string
): Promise<CreateReadingGroupResponse> => {
    try {
        // 책 존재 여부 확인
        const book = await getBookById(bookId);
        if (!book) {
            throw HttpError(404, "해당 도서를 찾을 수 없습니다.");
        }

        // 날짜 유효성 검사
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw HttpError(400, "유효하지 않은 날짜 형식입니다.");
        }

        if (start >= end) {
            throw HttpError(400, "종료일은 시작일보다 이후여야 합니다.");
        }

        // 함께 읽기 그룹 생성
        const readingGroupId = await insertReadingGroup(bookId, startDate, endDate);

        return {
            reading_group_id: readingGroupId,
            book_id: bookId,
            start_date: startDate,
            end_date: endDate,
        };
    } catch (err: any) {
        if (err.status) {
            throw err;
        }
        console.error(err);
        throw HttpError(500, "함께 읽기 생성에 실패했습니다.");
    }
};

// GET /api/reading-groups/:groupId/overview - 함께 읽기 기본 정보 + 내 진행
export const getReadingGroupOverview = async (
    userId: number,
    groupId: number
): Promise<ReadingGroupOverviewResponse> => {
    // 1) 그룹 + 책 정보 조회
    const group = await getReadingGroupById(groupId);
    if (!group) {
        throw HttpError(404, "함께 읽기 그룹을 찾을 수 없습니다.");
    }

    // 2) 내 참여 정보 조회 (없으면 null)
    const member = await getMemberByUserAndGroup(userId, groupId);

    // 3) days_left 계산 (list에서 쓰는 헬퍼 재사용)
    const daysLeft = calcDaysLeft(group.end_date);

    // 4) 내 진행 정보 구성 (참여 안 했으면 null)
    const myProgress = member
        ? {
            current_page: member.current_page,
            memo: member.memo,
        }
        : null;

    return {
        reading_group_id: group.reading_group_id,
        title: group.book_title,

        member_count: group.member_count, 
        days_left: daysLeft,
        total_pages: group.page_count,

        my_progress: myProgress,
    };
};

// POST /api/reading-groups/:groupId/join - 함께 읽기 참여하기
export const joinReadingGroup = async (
    userId: number,
    groupId: number
): Promise<JoinReadingGroupResponse> => {
    // 1) 그룹 존재 여부 확인
    const group = await getReadingGroupById(groupId);
    if (!group) {
        throw HttpError(404, "함께 읽기 그룹을 찾을 수 없습니다.");
    }

    // 2) 이미 참여했는지 확인
    const existingMember = await getMemberByUserAndGroup(userId, groupId);
    if (existingMember) {
        throw HttpError(409, "이미 이 함께 읽기에 참여하고 있습니다.");
    }

    // 3) 멤버 추가
    try {
        await insertReadingGroupMember(userId, groupId);

        return {
            reading_group_id: groupId,
        };
    } catch (err: any) {
        if (err.status) {
            throw err;
        }
        console.error(err);
        throw HttpError(500, "함께 읽기 참여에 실패했습니다.");
    }
};

// 내 독서 진행 / 메모 업데이트
export const updateReadingProgress = async (
    userId: number,
    groupId: number,
    currentPage?: number,
    memo?: string | null
): Promise<UpdateReadingProgressResponse> => {
    // 업데이트할 값이 하나도 없을 때
    if (currentPage === undefined && memo === undefined) {
        throw HttpError(400, "변경할 내용이 없습니다.");
    }

    // 그룹 존재 여부 확인
    const group = await getReadingGroupById(groupId);
    if (!group) {
        throw HttpError(404, "함께 읽기 그룹을 찾을 수 없습니다.");
    }

    // 멤버인지 확인
    const member = await getMemberByUserAndGroup(userId, groupId);
    if (!member) {
        throw HttpError(403, "해당 함께 읽기 그룹의 멤버가 아닙니다.");
    }

    // 페이지 범위 검증 (0 이상만)
    if (currentPage !== undefined && currentPage < 0) {
        throw HttpError(400, "읽은 페이지는 0 이상이어야 합니다.");
    }

    if (currentPage !== undefined) {
        const book = await getBookById(group.book_id);

        if (!book) {
            throw HttpError(404, "책 정보를 찾을 수 없습니다.");
        }

        const totalPage = book.page ?? book.page_count ?? null;

        if (!totalPage) {
            throw HttpError(500, "책 전체 페이지 정보를 찾을 수 없습니다.");
        }

        if (currentPage > totalPage) {
            throw HttpError(
                400,
                `읽은 페이지는 전체 페이지(${totalPage}p)를 초과할 수 없습니다.`
            );
        }
    }

    // 실제로 저장할 값 결정
    const nextPage = currentPage ?? member.current_page;
    const nextMemo = memo === undefined ? member.memo : memo;

    try {
        const affectedRows = await updateReadingGroupMemberProgress(
            userId,
            groupId,
            nextPage,
            nextMemo
        );

        if (affectedRows === 0) {
            throw HttpError(404, "독서 진행 정보를 찾을 수 없습니다.");
        }

        return {
            reading_group_id: groupId,
            current_page: nextPage,
            memo: nextMemo,
        };
    } catch (err: any) {
        if (err.status) {
            throw err;
        }
        console.error(err);
        throw HttpError(500, "독서 진행 업데이트에 실패했습니다.");
    }
}

// GET /api/reading-groups/:groupId/members - 참여자 목록 조회 (무한 스크롤)
export const getReadingGroupMembers = async (
    userId: number,
    groupId: number,
    page: number,
    limit: number
): Promise<ReadingGroupMembersResponse> => {
    // 그룹 존재 여부 확인
    const group = await getReadingGroupById(groupId);
    if (!group) {
        throw HttpError(404, "함께 읽기 그룹을 찾을 수 없습니다.");
    }

    // 총 참여자 수 조회
    const totalCount = await countMembersByGroupId(groupId);

    // 페이지네이션 계산
    const safePage = page > 0 ? page : 1;
    const safeLimit = limit > 0 ? limit : 10;
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / safeLimit);
    const offset = (safePage - 1) * safeLimit;
    const hasNext = safePage * safeLimit < totalCount;

    try {
        // 참여자 목록 조회 (레벨 정보 포함)
        const memberRows = await getMembersWithLevelByGroupId(groupId, safeLimit, offset);

        // 전체 페이지 수 (책의 총 페이지)
        const totalPageCount = group.page_count;

        // 응답 데이터 변환
        const members: ReadingGroupMemberItem[] = memberRows.map((row) => {
            // 진행률 계산 (전체 페이지가 없으면 0%)
            let progressPercent = 0;
            if (totalPageCount && totalPageCount > 0) {
                progressPercent = Math.round((row.current_page / totalPageCount) * 100);
                progressPercent = Math.min(progressPercent, 100);
            }

            return {
                member_id: row.member_id,
                user_id: row.user_id,
                nickname: row.nickname,
                level: row.level,
                current_page: row.current_page,
                progress_percent: progressPercent,
                memo: row.memo,
                is_current_user: row.user_id === userId,
            };
        });

        return {
            page: safePage,
            limit: safeLimit,
            total_count: totalCount,
            total_pages: totalPages,
            has_next: hasNext,
            total_page_count: totalPageCount,
            members,
        };
    } catch (err: any) {
        if (err.status) {
            throw err;
        }
        console.error(err);
        throw HttpError(500, "참여자 목록 조회에 실패했습니다.");
    }
};