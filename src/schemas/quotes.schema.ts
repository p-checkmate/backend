import { z } from "zod";
import { RowDataPacket } from "mysql2/promise";

//quote 수정 input (PATCH /quotes/:id)
export const updateQuoteSchema = z.object({
  content: z.string().min(1).max(500),
});

 //output schema (DB → API 응답)
export const quoteSchema = z.object({
  quote_id: z.number().int(),
  user_id: z.number().int(),
  nickname:z.string().nullable(),
  book_id: z.number().int(),
  content:z.string(),
  like_count: z.number().int(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime().nullable(),
});

// TypeScript 타입 추출
export type QuoteData = z.infer<typeof quoteSchema>;

// MySQL Row 타입
export interface QuoteRow extends RowDataPacket {
  quote_id: number;
  user_id: number;
  nickname: string | null;
  book_id: number;
  content: string;
  like_count: number;
  created_at: Date;
  updated_at: Date | null;
}
