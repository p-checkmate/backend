import { z } from "zod";
import { RowDataPacket } from "mysql2/promise";

/**
 * User 스키마 (검증 규칙 포함)
 */
export const userSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(2).max(50),
});

/**
 * TypeScript 타입 추출
 */
export type UserData = z.infer<typeof userSchema>;

/**
 * MySQL2용 타입 (RowDataPacket 상속)
 * Repository에서만 사용
 */
export interface User extends RowDataPacket {
    id: number;
    name: string;
}
