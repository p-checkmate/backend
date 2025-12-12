// src/utils/date.util.ts

// 날짜 포맷팅 헬퍼 함수 (YY.MM.DD)
export const formatDate = (value: string | Date): string => {
    const date = value instanceof Date ? value : new Date(value);

    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yy}.${mm}.${dd}`;
};

// 남은 기간 계산 함수 (D-day)
export const calcDaysLeft = (endDate: string | Date): number => {
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    const today = new Date();
    const diffMs = end.getTime() - today.getTime();

    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};
