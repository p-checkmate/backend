import { z } from "zod";

export const discussionTypeEnum = z.enum(["FREE", "VS"]);
export type DiscussionType = z.infer<typeof discussionTypeEnum>;

export const createDiscussionInputSchema = z.object({
  bookId: z.coerce.number().int().positive(),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  discussion_type: discussionTypeEnum,
  option1: z.string().optional(),
  option2: z.string().optional(),
})
.refine(
  (data) => {
    if (data.discussion_type === "VS") {
      return Boolean(data.option1 && data.option2);
    }
    return true;
  },
  {
    message: "VS 토론은 option1, option2 모두 필요합니다.",
    path: ["option1"],
  }
);

export const createDiscussionResponseSchema = z.object({
  discussion_id: z.number(),
});

export type CreateDiscussionInput = z.infer<typeof createDiscussionInputSchema>;
export type CreateDiscussionResponse = z.infer<typeof createDiscussionResponseSchema>;

// payload 타입
export type CreateDiscussionPayload = {
  user_id: number;
  book_id: number;
  title: string;
  content: string;
  discussion_type: DiscussionType;
  option1: string | null;
  option2: string | null;
};

// 특정 책 토론 목록 조회 Input 스키마
export const getDiscussionsByBookInputSchema = z.object({
  bookId: z.coerce.number().int().positive(),
});

// Response 스키마
export const discussionListItemSchema = z.object({
  discussion_id: z.number(),
  title: z.string(),
  content: z.string(),
  discussion_type: discussionTypeEnum,
  option1: z.string().nullable(),
  option2: z.string().nullable(),
  created_at: z.date(),
  nickname: z.string(),
});

export const getDiscussionsByBookResponseSchema = z.object({
  discussions: z.array(discussionListItemSchema),
});

// 토론 상세조회 스키마
export const getDiscussionDetailInputSchema = z.object({
  discussionId: z.coerce.number().int().positive(),
});

export const discussionDetailSchema = z.object({
  discussion_id: z.number(),
  book_id: z.number(),
  title: z.string(),
  content: z.string(),
  discussion_type: discussionTypeEnum,
  option1: z.string().nullable(),
  option2: z.string().nullable(),
  created_at: z.date(),
  nickname: z.string(),
});

export const getDiscussionDetailResponseSchema = z.object({
  discussion: discussionDetailSchema,
});
