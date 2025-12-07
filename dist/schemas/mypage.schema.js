import { z } from "zod";
// 북마크한 책 스키마
export const bookmarkBookSchema = z.object({
    book_id: z.number().int().positive(),
    title: z.string(),
    author: z.string().nullable(),
    thumbnail_url: z.string().nullable()
});
// 마이페이지 유저 정보 스키마
export const mypageUserSchema = z.object({
    user_id: z.number().int().positive(),
    nickname: z.string().nullable(),
    email: z.string(),
    exp: z.number().int(),
    level: z.number().int().min(1).max(5),
    preferred_genres: z.array(z.string())
});
// 마이페이지 전체 응답 스키마
export const mypageOutputSchema = z.object({
    user: mypageUserSchema,
    my_bookshelf: z.array(bookmarkBookSchema)
});
