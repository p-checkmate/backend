import {
    searchBooksFromAladin,
    getBookDetailFromAladin,
    viewBestsellersFromAladin,
} from "../repositories/aladin.repository.js";
import { BookSearchResponse, AladinBookItem, AladinApiResponse } from "../schemas/aladin.schema.js";
import { BookDetailResponse, BookRow, Genre } from "../schemas/books.schema.js";
import {
    findBookByItemId,
    insertBook,
    findGenresByBookId,
    findOrCreateGenre,
    linkBookGenre,
} from "../repositories/books.repository.js";
import HttpErrors from "http-errors";

// searchBooks(), viewBestsellers()의 공통 로직을 처리하는 내부 헬퍼 함수
const processBookSearchResponse = (aladinResponse: AladinApiResponse): BookSearchResponse => {
    const items: AladinBookItem[] = (aladinResponse.item ?? []).map((item) => {
        // 카테고리 파싱 (">" 구분자로 분리 및 정제)
        const categoryNames = (item.categoryName ?? "")
            .split(">")
            .map((c) => c.trim())
            .filter((c) => c.length > 0);

        // BookSearchResponse 응답 스키마에 맞게 변환하여 반환
        // 검색 결과가 없어도 빈 배열로 정상 응답
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

    // 더 불러올 데이터가 있는지 계산
    const hasMore = items.length > 0 && aladinResponse.startIndex + items.length < aladinResponse.totalResults;

    // BookSearchResponse 응답 스키마에 맞게 변환하여 반환
    return {
        totalResults: aladinResponse.totalResults,
        startIndex: aladinResponse.startIndex,
        itemsPerPage: aladinResponse.itemsPerPage,
        hasMore,
        items,
    };
};

// 도서 검색 서비스(ItemSearch API 호출)
export const searchBooks = async (
    query: string,
    start: number = 1,
    maxResults: number = 30
): Promise<BookSearchResponse> => {
    const aladinResponse = await searchBooksFromAladin(query, start, maxResults);
    return processBookSearchResponse(aladinResponse);
};

// 도서 상세 조회 서비스
export const getBookDetail = async (bookId: number): Promise<BookDetailResponse> => {
    //알라딘 API에서 조회
    const aladinBook = await getBookDetailFromAladin(bookId);

    if (!aladinBook) {
        throw HttpErrors(404, "해당 도서를 찾을 수 없습니다.");
    }

    //카테고리 파싱( > 구분자로 분리)
    const categoryNames = (aladinBook.categoryName ?? "")
        .split(">")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

    const bookItem: AladinBookItem = {
        itemId: aladinBook.itemId,
        title: aladinBook.title,
        author: aladinBook.author,
        publisher: aladinBook.publisher,
        pubDate: aladinBook.pubDate,
        description: aladinBook.description,
        isbn13: aladinBook.isbn13,
        cover: aladinBook.cover,
        categoryNames,
    };

    //페이지 수 추출
    const page = aladinBook.subInfo?.itemPage ?? null;

    //DB에서 기존 책 확인
    const existingBook = await findBookByItemId(bookId.toString());

    let finalBookId: number;
    let savedGenres: { genreId: number; genreName: string }[] = [];

    if (existingBook) {
        finalBookId = existingBook.book_id;
        savedGenres = await findGenresByBookId(existingBook.book_id);
    } else {
        //DB에 책 저장
        finalBookId = await insertBook(bookItem, page);

        //장르 저장 및 연결
        const genresToSave = categoryNames.slice(-2);

        for (const genreName of genresToSave) {
            const genreId = await findOrCreateGenre(genreName);
            await linkBookGenre(finalBookId, genreId);
            savedGenres.push({ genreId, genreName });
        }
    }

    //응답 반환
    return {
        bookId: finalBookId,
        itemId: bookItem.itemId.toString(),
        title: bookItem.title,
        author: bookItem.author ?? null,
        publisher: bookItem.publisher ?? null,
        publishedDate: bookItem.pubDate ?? null,
        description: bookItem.description ?? null,
        thumbnailUrl: bookItem.cover ?? null,
        page,
        genres: savedGenres,
    };
};

// 베스트셀러 조회 서비스 (ItemList API 호출)
export const viewBestsellers = async (start: number = 1, maxResults: number = 30): Promise<BookSearchResponse> => {
    const aladinResponse = await viewBestsellersFromAladin(start, maxResults);
    return processBookSearchResponse(aladinResponse);
};
