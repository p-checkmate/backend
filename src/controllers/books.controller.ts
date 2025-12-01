import { z } from "zod";
import { defaultEndpointsFactory } from "express-zod-api";
import { bookSearchResponseSchema } from "../schemas/aladin.schema.js";

import { searchBooks} from "../services/books.service.js";

/*GET /api/v1/books/search?q=
알라딘 API 기반 도서 검색 */
export const handleSearchBooks = defaultEndpointsFactory.build({
    method: "get",
    input: z.object({
        q: z.string().min(1),
        start: z.string().optional().default("1").transform((val) => parseInt(val, 10)),
        maxResults: z.string().optional().default("30").transform((val) => parseInt(val, 10)),
    }),
    output: bookSearchResponseSchema,
    handler: async ({ input }) => {
        return await searchBooks(input.q, input.start, input.maxResults);
    },
});

