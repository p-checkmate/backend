import HttpError from "http-errors";
import {
    CreateReadingGroupResponse,
} from "../schemas/reading_groups.schema.js";
import {
    insertReadingGroup,
} from "../repositories/reading_groups.repository.js";
import { getBookById } from "../repositories/books.repository.js";

// POST /api/reading-groups/create - 관리자용 함께 읽기 생성 서비스
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
