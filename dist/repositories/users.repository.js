import { pool } from "../config/db.config.js";
// 이메일로 사용자 조회
export const getUserByEmail = async (userEmail) => {
    const [rows] = await pool.query(`SELECT * FROM user WHERE email = ?;`, [userEmail]);
    return rows[0] || null;
};
// 리프레시 토큰 저장
export const saveRefreshToken = async (userId, refreshToken) => {
    const [rows] = await pool.query(`INSERT INTO refresh_token (user_id, token) VALUES (?, ?);`, [
        userId,
        refreshToken,
    ]);
    return rows[0] || null;
};
// 토큰으로 리프레시 토큰 조회
export const getRefreshTokenByToken = async (token) => {
    const [rows] = await pool.query("SELECT * FROM refresh_token WHERE token = ?", [token]);
    return rows[0] || null;
};
// 리프레시 토큰 삭제
export const deleteRefreshToken = async (token) => {
    const [results] = await pool.query("DELETE FROM refresh_token WHERE token = ?", [token]);
    const resultSetHeader = results;
    return resultSetHeader.affectedRows;
};
// 사용자 생성
export const createUser = async (userEmail, password) => {
    // INSERT 쿼리 실행
    const [result] = await pool.query("INSERT INTO user (email, password) VALUES (?, ?);", [
        userEmail,
        password,
    ]);
    // 삽입 실패 또는 affectedRows가 0인 경우 처리
    if (result.affectedRows === 0) {
        return null;
    }
    const newUserId = result.insertId;
    // SELECT 쿼리를 이용해 방금 생성된 사용자 정보를 조회
    const [rows] = await pool.query("SELECT * FROM user WHERE user_id = ?;", [newUserId]);
    return rows[0] || null;
};
// 회원탈퇴
export const deleteUser = async (userId) => {
    const [result] = await pool.query("DELETE FROM user WHERE user_id = ?", [userId]);
    return result.affectedRows;
};
// 회원 정보 수정(닉네임)
export const updateUser = async (nickname, userId) => {
    const [result] = await pool.query("UPDATE user SET nickname = ? WHERE user_id = ?", [
        nickname,
        userId,
    ]);
    return result.affectedRows;
};
export const createUserGenres = async (genreId, userId) => {
    const [result] = await pool.query(`INSERT INTO user_genre (user_id, onboarding_genre_id) VALUES (?, ?);`, [userId, genreId]);
    return result.insertId;
};
// 온보딩 장르 조회
export const getOnboardingGenres = async (parentId) => {
    const sql = parentId === null
        ? "SELECT * FROM onboarding_genre WHERE parent_id IS NULL" // 대분류 요청
        : "SELECT * FROM onboarding_genre WHERE parent_id = ?"; // 소분류 요청
    const params = parentId !== null ? [parentId] : [];
    const [rows] = await pool.query(sql, params);
    return rows;
};
