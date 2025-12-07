import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";


//함꼐 읽기 생성 요청 바디 스키마
export const createReadingGroupInputSchema = z.object({
    book_id: z.number().int().positive(),
    start_date: z.string(), 
    end_date: z.string(),
});

//함꼐 읽기 생성 응답 스키마
export const createReadingGroupResponseSchema = z.object({
    reading_group_id: z.number().int(),
    book_id: z.number().int(),
    start_date: z.string(),
    end_date: z.string(),
});

// TypeScript 타입 추출
export type CreateReadingGroupInput = z.infer<typeof createReadingGroupInputSchema>;
export type CreateReadingGroupResponse = z.infer<typeof createReadingGroupResponseSchema>;

//reading_group 테이블 Row 타입
export interface ReadingGroupRow extends RowDataPacket {
    reading_group_id: number;
    book_id: number;
    start_date: string; 
    end_date: string;  
    created_at: string;  
}
