import { searchBooksFromAladin, getBookDetailFromAladin } from "../repositories/aladin.repository.js";
import {
    findBookByItemId,
    insertBook,
    findOrCreateGenre,
    linkBookGenre,
} from "../repositories/books.repository.js";
import { BookSearchResponse, AladinBookItem } from "../schemas/aladin.schema.js";
import { BookDetailResponse } from "../schemas/books.schema.js";
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

    // 더 불러올 데이터가 있는지 계산
    const hasMore = aladinResponse.startIndex + items.length < aladinResponse.totalResults;

    return {
        totalResults: aladinResponse.totalResults,
        startIndex: aladinResponse.startIndex,
        itemsPerPage: aladinResponse.itemsPerPage,
        hasMore,
        items,
    };
};

// 도서 상세 조회 서비스
export const getBookDetail = async (bookId: number): Promise<BookDetailResponse> => {
    //알라딘 API에서 조회
    const aladinBook = await getBookDetailFromAladin(bookId);

    if (!aladinBook) {
        throw HttpErrors(404, "해당 도서를 찾을 수 없습니다.");
    }

    //카테고리 파싱
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
        //존재하면 기존 정보 사용
        finalBookId = existingBook.bookId;
        savedGenres = existingBook.genres;
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