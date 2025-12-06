import { z } from "zod";
import { RowDataPacket } from "mysql2";

//MySQL SELECT 결과 타입
export interface DiscussionRow extends RowDataPacket {
  discussion_id: number;
  user_id: number;
  book_id: number;
  title: string;
  content: string;
  discussion_type: "FREE" | "VS";
  option1: string | null;
  option2: string | null;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string | null;
}


//Discussion 출력용 zod 스키마
export const discussionSchema = z.object({
  discussion_id: z.number(),
  user_id: z.number(),
  book_id: z.number(),
  title: z.string(),
  content: z.string(),
  discussion_type: z.enum(["FREE", "VS"]),
  option1: z.string().nullable(),
  option2: z.string().nullable(),
  view_count: z.number(),
  like_count: z.number(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});
