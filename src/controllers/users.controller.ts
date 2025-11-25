import { z } from "zod";
import { defaultEndpointsFactory } from "express-zod-api";
import { userSchema } from "../schemas/users.schema.js";
import { userTest } from "../services/users.service.js";

/**
 * POST /test
 * 테스트 코드
 */
export const handleUserTest = defaultEndpointsFactory.build({
    method: "post",
    input: z.object({
        id: z.number().int().positive(), // req.body.id
    }),
    output: userSchema,
    handler: async ({ input }) => {
        return await userTest(input.id);
    },
});
