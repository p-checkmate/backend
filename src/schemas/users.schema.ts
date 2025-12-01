import { z } from "zod";
import { RowDataPacket } from "mysql2/promise";

// User 스키마
export const userSchema = z.object({
    user_id: z.number().int().positive(),
    email: z.email().max(100),
    password: z.string().max(255), // 나중에 비밀번호 제약 조건 추가
    nickname: z.string().max(100), // 닉네임 조건도 프론트와 상의
    profile_url: z.url().optional(),
    created_at: z.iso.datetime(),
});

// Login Input 스키마
export const loginInputSchema = userSchema.pick({
    email: true,
    password: true,
});

// Login Output 스키마
export const loginOutputSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: userSchema.omit({
        password: true,
        created_at: true,
    }),
});

// Refresh Token Input 스키마
export const refreshInputSchema = z.object({
    refreshToken: z.string(),
});

// Refresh Token Output 스키마
export const refreshOutputSchema = z.object({
    accessToken: z.string(),
});

// Signup Output 스키마
export const signupOutputSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: userSchema.pick({
        user_id: true,
        email: true,
    }),
});

// TypeScript 타입 추출
export type UserData = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type LoginOutput = z.infer<typeof loginOutputSchema>;
export type RefreshTokenInput = z.infer<typeof refreshInputSchema>;
export type RefreshTokenOutput = z.infer<typeof refreshOutputSchema>;
export type SignupOutput = z.infer<typeof signupOutputSchema>;

// MySQL2용 타입 (Repositories에서 사용)
export interface User extends RowDataPacket {
    user_id: number;
    email: string;
    password: string;
    nickname: string;
    profile_url: string;
    created_at: Date;
}

export interface RefreshToken extends RowDataPacket {
    token_id: number;
    user_id: number;
    token: string;
    created_at: Date;
}