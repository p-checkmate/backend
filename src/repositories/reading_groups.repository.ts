import { pool } from "../config/db.config.js";
import { ResultSetHeader } from "mysql2/promise";
import {
    ReadingGroupRow,
    ReadingGroupWithBookRow,
    ParticipantRow,
    ParticipantWithUserRow,
} from "../schemas/reading_groups.schema.js";

// ============================================
// 함께 읽기 그룹 조회
// ============================================

// 현재 진행 중인 함께 읽기 그룹 목록 조회 (책 정보 포함)
export const getActiveReadingGroups = async (): Promise<ReadingGroupWithBookRow[]> => {
    const [rows] = await pool.query<ReadingGroupWithBookRow[]>(
        `SELECT 
            rg.reading_group_id,
            b.book_id,
            b.title AS book_title,
            b.thumbnail_url,
            b.page_count,
            (SELECT COUNT(*) FROM reading_group_participant WHERE reading_group_id = rg.reading_group_id) AS participant_count,
            rg.start_date,
            rg.end_date
        FROM reading_group rg
        INNER JOIN book b ON rg.book_id = b.book_id
        WHERE rg.end_date >= CURDATE()
        ORDER BY rg.start_date ASC`
    );

    return rows;
};

// 특정 함께 읽기 그룹 조회 (책 정보 포함)
export const getReadingGroupById = async (
    groupId: number
): Promise<ReadingGroupWithBookRow | null> => {
    const [rows] = await pool.query<ReadingGroupWithBookRow[]>(
        `SELECT 
            rg.reading_group_id,
            b.book_id,
            b.title AS book_title,
            b.thumbnail_url,
            b.page_count,
            (SELECT COUNT(*) FROM reading_group_participant WHERE reading_group_id = rg.reading_group_id) AS participant_count,
            rg.start_date,
            rg.end_date
        FROM reading_group rg
        INNER JOIN book b ON rg.book_id = b.book_id
        WHERE rg.reading_group_id = ?`,
        [groupId]
    );

    return rows[0] || null;
};

// 함께 읽기 그룹 생성
export const insertReadingGroup = async (
    bookId: number,
    startDate: string,
    endDate: string
): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO reading_group (book_id, start_date, end_date)
        VALUES (?, ?, ?)`,
        [bookId, startDate, endDate]
    );

    return result.insertId;
};

// ============================================
// 참여자 관련
// ============================================

// 사용자의 특정 그룹 참여 정보 조회
export const getParticipantByUserAndGroup = async (
    userId: number,
    groupId: number
): Promise<ParticipantRow | null> => {
    const [rows] = await pool.query<ParticipantRow[]>(
        `SELECT 
            participant_id,
            reading_group_id,
            user_id,
            current_page,
            memo,
            joined_at
        FROM reading_group_participant
        WHERE user_id = ? AND reading_group_id = ?`,
        [userId, groupId]
    );

    return rows[0] || null;
};

// 사용자의 여러 그룹 참여 정보 조회
export const getParticipantsByUserAndGroups = async (
    userId: number,
    groupIds: number[]
): Promise<ParticipantRow[]> => {
    if (groupIds.length === 0) {
        return [];
    }

    const [rows] = await pool.query<ParticipantRow[]>(
        `SELECT 
            participant_id,
            reading_group_id,
            user_id,
            current_page,
            memo,
            joined_at
        FROM reading_group_participant
        WHERE user_id = ? AND reading_group_id IN (?)`,
        [userId, groupIds]
    );

    return rows;
};

// 특정 그룹의 모든 참여자 진행 현황 조회 (닉네임 포함)
export const getParticipantsByGroupId = async (
    groupId: number
): Promise<ParticipantWithUserRow[]> => {
    const [rows] = await pool.query<ParticipantWithUserRow[]>(
        `SELECT 
            rgp.participant_id,
            rgp.reading_group_id,
            rgp.user_id,
            u.nickname,
            rgp.current_page,
            rgp.memo
        FROM reading_group_participant rgp
        INNER JOIN user u ON rgp.user_id = u.user_id
        WHERE rgp.reading_group_id = ?
        ORDER BY rgp.current_page DESC`,
        [groupId]
    );

    return rows;
};

// 참여자 추가
export const insertParticipant = async (
    groupId: number,
    userId: number
): Promise<number> => {
    try {
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO reading_group_participant (reading_group_id, user_id, current_page, memo)
            VALUES (?, ?, 0, NULL)`,
            [groupId, userId]
        );

        return result.insertId;
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            throw new Error("ALREADY_JOINED");
        }
        throw err;
    }
};

// 참여자 진행 상황 업데이트
export const updateParticipantProgress = async (
    groupId: number,
    userId: number,
    currentPage: number,
    memo?: string
): Promise<boolean> => {
    const [result] = await pool.query<ResultSetHeader>(
        `UPDATE reading_group_participant
        SET current_page = ?, memo = COALESCE(?, memo), updated_at = NOW()
        WHERE reading_group_id = ? AND user_id = ?`,
        [currentPage, memo ?? null, groupId, userId]
    );

    return result.affectedRows > 0;
};

// 특정 그룹에서 사용자의 순위 조회
export const getUserRankInGroup = async (
    groupId: number,
    userId: number
): Promise<number | null> => {
    const [rows] = await pool.query<any[]>(
        `SELECT 
            user_id,
            RANK() OVER (ORDER BY current_page DESC) AS rank_num
        FROM reading_group_participant
        WHERE reading_group_id = ?`,
        [groupId]
    );

    const userRank = rows.find((row) => row.user_id === userId);
    return userRank ? userRank.rank_num : null;
};
