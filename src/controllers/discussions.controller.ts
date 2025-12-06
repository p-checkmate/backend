import { z } from "zod";
import { defaultEndpointsFactory } from "express-zod-api";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createDiscussionService } from "../services/discussions.service.js";

const authEndpointsFactory = defaultEndpointsFactory.addMiddleware(authMiddleware);


//토론생성(자유토론 / vs토론)
export const handleCreateDiscussion = authEndpointsFactory.build({
  method: "post",

  input: z.object({
    params: z.object({
      bookId: z.coerce.number().int().positive(),
    }),
    body: z
      .object({
        title: z.string().min(1).max(200),
        content: z.string().min(1),
        discussion_type: z.enum(["FREE", "VS"]),
        option1: z.string().optional(),
        option2: z.string().optional(),
      })
      .refine(
        (data) => {
          //vs토론일 경우 option1, option2 필드 검증
          if (data.discussion_type === "VS") {
            return Boolean(data.option1 && data.option2);
          }
          return true;
        },
        {
          message: "VS 토론은 option1, option2 모두 필요합니다.",
          path: ["option1"],
        }
      ),
  }),

  output: z.object({
    discussion_id: z.number(),
  }),

  handler: async ({ input, options }) => {
    //인증된 사용자 ID및 책 ID추출
    const userId = options.user.user_id;
    const bookId = input.params.bookId;

    const discussionId = await createDiscussionService({
      user_id: userId,
      book_id: bookId,
      title: input.body.title,
      content: input.body.content,
      discussion_type: input.body.discussion_type,
      option1: input.body.option1 ?? null,
      option2: input.body.option2 ?? null,
    });

    return { discussion_id: discussionId };
  },
});