export const formatDateToYYMMDD = (date: string | Date): string => {
    const d = new Date(date);
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}.${mm}.${dd}`;
};

// src/utils/pagination.util.ts

// page / limit 안전하게 보정
export const normalizePageLimit = (
    page?: number,
    limit?: number,
    defaultLimit = 10,
) => {
    const safePage = page && page > 0 ? page : 1;
    const safeLimit = limit && limit > 0 ? limit : defaultLimit;

    return { safePage, safeLimit };
};

// 페이지네이션 정보 계산
export const calculatePagination = ({
    page,
    limit,
    totalCount,
}: {
    page: number;
    limit: number;
    totalCount: number;
}) => {
    return {
        page,
        limit,
        total_count: totalCount,
        total_pages: totalCount === 0 ? 0 : Math.ceil(totalCount / limit),
        has_next: page * limit < totalCount,
    };
};
