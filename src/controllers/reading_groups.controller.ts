import { z } from "zod";
import { defaultEndpointsFactory } from "express-zod-api";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
    createReadingGroupInputSchema,
    createReadingGroupResponseSchema,
    readingGroupListResponseSchema,
    readingGroupOverviewResponseSchema,
    joinReadingGroupResponseSchema,
    updateReadingProgressInputSchema,
    updateReadingProgressResponseSchema,
    readingGroupMembersResponseSchema,
} from "../schemas/reading_groups.schema.js";
import {
    createReadingGroupService,
    getReadingGroupList,
    joinReadingGroup,
    getReadingGroupOverview,
    updateReadingProgress,
    getReadingGroupMembers,
} from "../services/reading_groups.service.js";

// 인증이 필요한 엔드포인트용 팩토리
const authEndpointsFactory = defaultEndpointsFactory.addMiddleware(authMiddleware);

// POST /api/reading-groups/create - 관리자용 함께 읽기 생성
export const handleCreateReadingGroup = authEndpointsFactory.build({
    method: "post",
    input: createReadingGroupInputSchema,
    output: createReadingGroupResponseSchema,
    handler: async ({ input }) => {
        return await createReadingGroupService(
            input.book_id,
            input.start_date,
            input.end_date
        );
    },
});
// GET /api/reading-groups/list - 함께 읽기 목록 조회
export const handleGetReadingGroupList = authEndpointsFactory.build({
    method: "get",
    input: z.object({}),
    output: readingGroupListResponseSchema,
    handler: async ({ options }) => {
        const userId = options.user.user_id;
        return await getReadingGroupList(userId);
    },
});

// GET /api/reading-groups/:groupId/overview - 함께 읽기 기본 정보 조회
export const handleGetReadingGroupOverview = authEndpointsFactory.build({
    method: "get",
    input: z.object({
        groupId: z
            .string()
            .regex(/^\d+$/)
            .transform((v) => Number(v)),
    }),
    output: readingGroupOverviewResponseSchema,
    handler: async ({ input, options }) => {
        const userId = options.user.user_id;
        return await getReadingGroupOverview(userId, input.groupId);
    },
});

// POST /api/reading-groups/:groupId/join - 함께 읽기 참여하기
export const handleJoinReadingGroup = authEndpointsFactory.build({
    method: "post",
    input: z.object({
        groupId: z
            .string()
            .regex(/^\d+$/)
            .transform((v) => Number(v)),
    }),
    output: joinReadingGroupResponseSchema,
    handler: async ({ input, options }) => {
        const userId = options.user.user_id;
        return await joinReadingGroup(userId, input.groupId);
    },
});

// PATCH /api/reading-groups/:groupId/progress - 내 독서 진행/메모 업데이트
export const handleUpdateReadingProgress = authEndpointsFactory.build({
    method: "patch",
    input: updateReadingProgressInputSchema.extend({
        groupId: z
            .string()
            .regex(/^\d+$/)
            .transform((v) => Number(v)),
    }),
    output: updateReadingProgressResponseSchema,
    handler: async ({ input, options }) => {
        const userId = options.user.user_id;

        const { groupId, current_page, memo } = input;

        return await updateReadingProgress(
            userId,
            groupId,
            current_page,
            memo ?? null
        );
    },
});

// GET /api/reading-groups/:groupId/members - 참여자 진행 현황 목록 조회
export const handleGetReadingGroupMembers = authEndpointsFactory.build({
    method: "get",
    input: z.object({
        groupId: z
            .string()
            .regex(/^\d+$/)
            .transform((v) => Number(v)),
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(50).default(10),
    }),
    output: readingGroupMembersResponseSchema,
    handler: async ({ input, options }) => {
        const userId = options.user.user_id;
        return await getReadingGroupMembers(
            userId,
            input.groupId,
            input.page,
            input.limit
        );
    },
});