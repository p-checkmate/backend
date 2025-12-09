import { z } from "zod";
import { RowDataPacket } from "mysql2/promise";

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


// TypeScript 타입 추출
export type BookmarkBook = z.infer<typeof bookmarkBookSchema>;
export type MypageUser = z.infer<typeof mypageUserSchema>;
export type MypageOutput = z.infer<typeof mypageOutputSchema>;

// MySQL2용 타입 (Repositories에서 사용)
export interface UserRow extends RowDataPacket {
    user_id: number;
    nickname: string | null;
    email: string;
}

export interface ExpRow extends RowDataPacket {
    exp: number;
    level: number;
}

export interface GenreRow extends RowDataPacket {
    genre_name: string;
}

export interface BookmarkBookRow extends RowDataPacket {
    book_id: number;
    title: string;
    author: string | null;
    thumbnail_url: string | null;
}
