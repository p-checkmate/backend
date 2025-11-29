import { searchBooksFromAladin } from "../repositories/aladin.repository.js";
import { BookSearchResponse, AladinBookItem } from "../schemas/aladin.schema.js";
import HttpErrors from "http-errors";

// 도서 검색 서비스
export const searchBooks = async (
    query: string,
    start: number = 1,
    maxResults: number = 30
): Promise<BookSearchResponse> => {

    const aladinResponse = await searchBooksFromAladin(query, start, maxResults);

    const items: AladinBookItem[] = (aladinResponse.item ?? []).map((item) => {
        const categoryNames = (item.categoryName ?? "")
            .split(">")
            .map((c) => c.trim())
            .filter((c) => c.length > 0);

        return {
            itemId: item.itemId,
            title: item.title,
            author: item.author,
            publisher: item.publisher,
            pubDate: item.pubDate,
            description: item.description,
            isbn13: item.isbn13,
            cover: item.cover,
            categoryNames,
        };
    });

    //검색 결과가 없는 경우 404 오류 반환
    if (items.length === 0) {
        throw HttpErrors(404, "검색 결과가 없습니다.");
    }

    return {
        totalResults: aladinResponse.totalResults,
        startIndex: aladinResponse.startIndex,
        itemsPerPage: aladinResponse.itemsPerPage,
        items,
    };
};
