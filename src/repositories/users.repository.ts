import { pool } from "../config/db.config.js";
import { User, RefreshToken } from "../schemas/users.schema.js";

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
