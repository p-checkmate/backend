import { z } from "zod";
// User 스키마
export const userSchema = z.object({
    user_id: z.number().int().positive(),
    email: z.email().max(100),
    password: z.string().max(255), // 나중에 비밀번호 제약 조건 추가
    nickname: z.string().max(12), // 닉네임 조건도 프론트와 상의
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
// Modify User Input 스키마
export const modifyUserInputSchema = userSchema.pick({
    nickname: true,
});
// onboarding genre output 스키마
// 단일 장르 객체의 형태
export const singleGenreSchema = z.object({
    id: z.number(),
    genre: z.string(),
});
// API 최종 응답 (Output) 스키마 정의
export const onboardingGenreOutputSchema = z.object({
    genres: z.array(singleGenreSchema),
});
