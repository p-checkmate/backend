import { pool } from "../config/db.config.js";
import { User } from "../schemas/users.schema.js";

export const getUserById = async (userId: number): Promise<User | null> => {
    const [rows] = await pool.query<User[]>(`SELECT * FROM user WHERE id = ?;`, [userId]);

    // 배열의 첫 번째 요소만 반환 (없으면 null)
    return rows[0] || null;
};
