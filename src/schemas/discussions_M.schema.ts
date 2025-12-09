import { z } from "zod";

export const discussionTypeEnum = z.enum(["FREE", "VS"]);
export type DiscussionType = z.infer<typeof discussionTypeEnum>;

   //토론 생성 Body 스키마
export const createDiscussionBodySchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),

    // FREE 또는 VS 선택
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

//  URL Params 스키마
export const createDiscussionParamsSchema = z.object({
  bookId: z.coerce.number().int().positive(),
});

export const createDiscussionInputSchema = z.object({
  params: createDiscussionParamsSchema,
  body: createDiscussionBodySchema,
});


export const createDiscussionResponseSchema = z.object({
  discussion_id: z.number(),
});

export type CreateDiscussionBody = z.infer<typeof createDiscussionBodySchema>;
export type CreateDiscussionParams = z.infer<typeof createDiscussionParamsSchema>;
export type CreateDiscussionInput = z.infer<typeof createDiscussionInputSchema>;
export type CreateDiscussionResponse = z.infer<typeof createDiscussionResponseSchema>;

export type CreateDiscussionPayload = CreateDiscussionBody & {
  user_id: number;
  book_id: number;
  option1: string | null;
  option2: string | null;
};
