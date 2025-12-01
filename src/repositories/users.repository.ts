import { pool } from "../config/db.config.js";
import { User, RefreshToken } from "../schemas/users.schema.js";
import { ResultSetHeader } from "mysql2/promise";
// 이메일로 사용자 조회
export const getUserByEmail = async (userEmail: string): Promise<User | null> => {
    const [rows] = await pool.query<User[]>(`SELECT * FROM user WHERE email = ?;`, [userEmail]);

    return rows[0] || null;
};

// 리프레시 토큰 저장
export const saveRefreshToken = async (userId: number, refreshToken: string): Promise<User | null> => {
    const [rows] = await pool.query<User[]>(`INSERT INTO refresh_token (user_id, token) VALUES (?, ?);`, [
        userId,
        refreshToken,
    ]);

    return rows[0] || null;
};

// 토큰으로 리프레시 토큰 조회
export const getRefreshTokenByToken = async (token: string): Promise<RefreshToken | null> => {
    const [rows] = await pool.query<RefreshToken[]>("SELECT * FROM refresh_token WHERE token = ?", [token]);
    return rows[0] || null;
};

// 리프레시 토큰 삭제
export const deleteRefreshToken = async (token: string): Promise<void> => {
    await pool.query("DELETE FROM refresh_token WHERE token = ?", [token]);
};

// 사용자 생성
export const createUser = async (userEmail: string, password: string): Promise<User | null> => {
    // INSERT 쿼리 실행
    const [result] = await pool.query<ResultSetHeader>("INSERT INTO user (email, password) VALUES (?, ?);", [
        userEmail,
        password,
    ]);

    // 삽입 실패 또는 affectedRows가 0인 경우 처리
    if (result.affectedRows === 0) {
        return null;
    }

    const newUserId = result.insertId;

    // SELECT 쿼리를 이용해 방금 생성된 사용자 정보를 조회
    const [rows] = await pool.query<User[]>("SELECT * FROM user WHERE user_id = ?;", [newUserId]);

    return rows[0] || null;
};