import { pool } from "../config/db.config.js";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { ReadingGroupWithBookRow, memberRow, RankRow, MemberWithLevelRow } from "../schemas/reading_groups.schema.js";

// 함께 읽기 그룹 생성
export const insertReadingGroup = async (bookId: number, startDate: string, endDate: string): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO reading_group (book_id, start_date, end_date)
        VALUES (?, ?, ?)`,
        [bookId, startDate, endDate]
    );

    return result.insertId;
};

// 현재 진행 중인 함께 읽기 그룹 목록 조회 (책 정보 포함)
export const getActiveReadingGroups = async (): Promise<ReadingGroupWithBookRow[]> => {
    const [rows] = await pool.query<ReadingGroupWithBookRow[]>(
        `SELECT 
            rg.reading_group_id,
            b.book_id,
            b.aladin_item_id as item_id,
            b.title AS book_title,
            b.thumbnail_url,
            b.page_count,
            (SELECT COUNT(*) FROM reading_group_member WHERE reading_group_id = rg.reading_group_id) AS member_count,
            rg.start_date,
            rg.end_date
        FROM reading_group rg
        INNER JOIN book b ON rg.book_id = b.book_id
        WHERE rg.end_date >= CURDATE()
        ORDER BY rg.start_date ASC`
    );

    return rows;
};

// 사용자의 여러 그룹 참여 정보 조회
export const getMembersByUserAndGroups = async (userId: number, groupIds: number[]): Promise<memberRow[]> => {
    if (groupIds.length === 0) {
        return [];
    }

    const [rows] = await pool.query<memberRow[]>(
        `SELECT 
            member_id,
            reading_group_id,
            user_id,
            current_page,
            memo,
            joined_at
        FROM reading_group_member
        WHERE user_id = ? AND reading_group_id IN (?)`,
        [userId, groupIds]
    );

    return rows;
};

// 사용자의 특정 그룹 참여 정보 조회
export const getMemberByUserAndGroup = async (userId: number, groupId: number): Promise<memberRow | null> => {
    const members = await getMembersByUserAndGroups(userId, [groupId]);
    return members[0] ?? null;
};

// 특정 그룹에서 사용자의 순위 조회
export const getUserRankInGroup = async (groupId: number, userId: number): Promise<number | null> => {
    const [rows] = await pool.query<RankRow[]>(
        `SELECT 
            user_id,
            RANK() OVER (ORDER BY current_page DESC) AS rank_num
        FROM reading_group_member
        WHERE reading_group_id = ?`,
        [groupId]
    );

    const userRank = rows.find((row) => row.user_id === userId);
    return userRank ? userRank.rank_num : null;
};

// 함께 읽기 그룹 1개 + 책 정보 조회
export const getReadingGroupById = async (groupId: number): Promise<ReadingGroupWithBookRow | null> => {
    const [rows] = await pool.query<ReadingGroupWithBookRow[]>(
        `SELECT 
            rg.reading_group_id,
            b.book_id,
            b.aladin_item_id as item_id,
            b.title AS book_title,
            b.thumbnail_url,
            b.page_count,
            (SELECT COUNT(*) 
                FROM reading_group_member 
                WHERE reading_group_id = rg.reading_group_id) AS member_count,
            rg.start_date,
            rg.end_date
        FROM reading_group rg
        INNER JOIN book b ON rg.book_id = b.book_id
        WHERE rg.reading_group_id = ?`,
        [groupId]
    );

    return rows[0] ?? null;
};

// 함께 읽기 그룹 멤버 추가
export const insertReadingGroupMember = async (userId: number, groupId: number): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO reading_group_member (
            reading_group_id,
            user_id,
            current_page,
            memo
        ) VALUES (?, ?, 0, NULL)`,
        [groupId, userId]
    );

    return result.insertId;
};

// 함께 읽기 멤버 독서 진행/메모 업데이트
export const updateReadingGroupMemberProgress = async (
    userId: number,
    groupId: number,
    currentPage: number,
    memo: string | null
): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `UPDATE reading_group_member
        SET current_page = ?, 
            memo = ?, 
            updated_at = CURRENT_TIMESTAMP
        WHERE reading_group_id = ? AND user_id = ?`,
        [currentPage, memo, groupId, userId]
    );

    return result.affectedRows;
};

// 특정 그룹의 참여자 총 수 조회
export const countMembersByGroupId = async (groupId: number): Promise<number> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total_count
        FROM reading_group_member
        WHERE reading_group_id = ?`,
        [groupId]
    );

    return rows[0].total_count;
};

export const getMembersWithLevelByGroupId = async (
    groupId: number,
    limit: number,
    offset: number
): Promise<MemberWithLevelRow[]> => {
    const [rows] = await pool.query<MemberWithLevelRow[]>(
        `SELECT 
            rgm.member_id,
            rgm.reading_group_id,
            rgm.user_id,
            u.nickname,
            rgm.current_page,
            rgm.memo,
            COALESCE(ue.level, 1) AS level
        FROM reading_group_member rgm
        INNER JOIN user u ON rgm.user_id = u.user_id
        LEFT JOIN user_exp ue ON rgm.user_id = ue.user_id
        WHERE rgm.reading_group_id = ?
        ORDER BY rgm.current_page DESC, rgm.joined_at ASC
        LIMIT ? OFFSET ?`,
        [groupId, limit, offset]
    );

    return rows;
};
