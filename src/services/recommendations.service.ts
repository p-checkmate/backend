import axios from "axios";
import dotenv from "dotenv";
import { getPreferredGenresByUserId, getBookmarksByUserId } from "../repositories/mypage.repository.js";
import { getQuotesByUserId } from "../repositories/quotes.repository.js";
import { getDiscussionsByUserId } from "../repositories/discussions.repository.js";
import { getActiveReadingGroups, getMembersByUserAndGroups } from "../repositories/reading_groups.repository.js";
import { getBookDetail } from "./books.service.js";
import { AiRecommendationData, AiRecommendationResponse } from "../schemas/books.schema.js";

dotenv.config();
const API_BASE_URL = process.env.API_BASE_URL;

// 문자열 자르기 헬퍼 함수
const truncateDescription = (text: string | null | undefined, maxLength: number = 150): string | null => {
    if (!text) {
        return null;
    }

    // 문자열이 최대 길이보다 짧거나 같으면 그대로 반환
    if (text.length <= maxLength) {
        return text;
    }

    // 문자열을 자르고 말줄임표 추가
    return text.substring(0, maxLength) + "...";
};

// AI 책 추천
export const getRecommendedBooks = async (userId: number): Promise<AiRecommendationResponse> => {
    try {
        // 사용자 선호 장르 불러오기
        const genres = await getPreferredGenresByUserId(userId);

        // 북마크한 책 불러오기
        const bookmarkedBook = await getBookmarksByUserId(userId, 20);
        const bookmarkedBookObj = bookmarkedBook.map((b) => ({
            itemId: b.item_id,
            createdAt: b.created_at,
        }));

        // 인용구를 남긴 책 불러오기
        const quotedBook = await getQuotesByUserId(userId, 20, 0);
        const quotedBookObj = quotedBook.map((b) => ({
            itemId: b.item_id,
            createdAt: b.created_at,
        }));

        // 토론을 생성한 책 불러오기
        const discussedBook = await getDiscussionsByUserId(userId, 20, 0);
        const discussedBookObj = discussedBook.map((b) => ({
            itemId: b.item_id,
            createdAt: b.created_at,
        }));

        // 함께 읽기에 참여한 책 불러오기
        let readingGroupBookObj: { itemId: number; createdAt: string }[] = [];
        const readingGroups = await getActiveReadingGroups();

        if (readingGroups.length !== 0) {
            const readingGroupMap = new Map();
            readingGroups.forEach((rg) => {
                readingGroupMap.set(rg.reading_group_id, rg.item_id);
            });

            const groupIds = readingGroups.map((rg) => rg.reading_group_id);
            const members = await getMembersByUserAndGroups(userId, groupIds);

            readingGroupBookObj = members.reduce((acc, member) => {
                const itemId = readingGroupMap.get(member.reading_group_id);

                if (itemId && member.joined_at) {
                    acc.push({
                        itemId: itemId,
                        createdAt: member.joined_at,
                    });
                }
                return acc;
            }, [] as { itemId: number; createdAt: string }[]);
        }

        // 데이터 통합 및 처리
        const allActivities = [...bookmarkedBookObj, ...quotedBookObj, ...discussedBookObj, ...readingGroupBookObj];

        const allItemIds = allActivities.map((activity) => activity.itemId);

        // createdAt 기준으로 내림차순 정렬
        allActivities.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        // 중복된 itemId 제거 및 최신 4개 추출
        const recentUniqueItemIds: number[] = [];
        const seenItemIds = new Set<number>(); // 중복 확인용 Set

        for (const activity of allActivities) {
            // 중복 데이터 건너뜀
            if (seenItemIds.has(activity.itemId)) {
                continue;
            }

            seenItemIds.add(activity.itemId);
            recentUniqueItemIds.push(activity.itemId);

            if (recentUniqueItemIds.length >= 4) {
                break;
            }
        }

        let recentItemInfo = [];
        for (let itemId of recentUniqueItemIds) {
            let info = await getBookDetail(itemId);
            let genreNames = info.genres.map((i) => i.genreName);
            let categoryNames = genreNames.join(", ");
            let truncatedDescription = truncateDescription(info.description, 150);

            recentItemInfo.push({
                itemId: itemId,
                title: info.title,
                author: info.author ?? null,
                publisher: info.publisher ?? null,
                pubDate: info.publishedDate ?? null,
                description: truncatedDescription,
                categoryNames: categoryNames,
            });
        }

        const requestPayload = {
            genres: genres,
            recent_activities: recentItemInfo,
            excluded_item_ids: allItemIds,
        };

        // API 호출
        const response = await axios.post(`${API_BASE_URL}/api/v1/recommend`, requestPayload);
        console.log(response.data);

        const itemIds = response.data.recommendations.map((d: { itemId: number }) => d.itemId);

        const bookDetail = itemIds.map(async (itemId: number) => {
            const bookInfo = await getBookDetail(itemId);

            return {
                itemId: itemId,
                thumbnailUrl: bookInfo.thumbnailUrl ?? null,
            } as AiRecommendationData;
        });

        const bookInfoList: AiRecommendationData[] = await Promise.all(bookDetail);

        return { recommendations: bookInfoList };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios 요청 오류 발생:", error.message);
            console.error("응답 데이터 (Error Data):", error.response?.data);
            throw new Error(`API 요청 실패: ${error.message}`);
        } else {
            // DB 조회 실패, 로직 내부 오류 등
            const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
            console.error("통합 오류 발생 (DB 또는 로직 오류):", error);
            throw new Error(`데이터 조회 또는 처리 중 오류가 발생했습니다: ${errorMessage}`);
        }
    }
};
