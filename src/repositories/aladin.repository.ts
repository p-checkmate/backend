import { aladinConfig } from '../config/aladin.config.js';
import { AladinApiResponse, AladinApiItem } from "../schemas/aladin.schema.js";

const apiKey = aladinConfig.ALADIN_API_KEY;
const baseUrl = aladinConfig.ALADIN_BASE_URL;


export const searchBooksFromAladin = async (
    query: string,
    start: number = 1,
    maxResults: number = 30
): Promise<AladinApiResponse> => {
    const url = new URL(`${baseUrl}/ItemSearch.aspx`);

    url.searchParams.append("ttbkey", apiKey);
    url.searchParams.append("Query", query);
    url.searchParams.append("QueryType", "Keyword");
    url.searchParams.append("MaxResults", maxResults.toString());
    url.searchParams.append("Start", start.toString());
    url.searchParams.append("SearchTarget", "Book");
    url.searchParams.append("Output", "JS");
    url.searchParams.append("Version", "20131101");
    url.searchParams.append("OptResult", "subInfo");
    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`알라딘 API 호출 실패: ${response.status}`);
    }

    const data = await response.json();
    return data as AladinApiResponse;
};



// 알라딘 API ItemLookup 응답 타입
export interface AladinItemLookupResponse {
    version: string;
    title: string;
    link: string;
    pubDate: string;
    item: AladinApiItem[];
}

// 알라딘 API 도서 상세 조회 (ItemLookup)
export const getBookDetailFromAladin = async (itemId: number): Promise<AladinApiItem | null> => {
    const url = new URL(`${baseUrl}/ItemLookUp.aspx`);

    url.searchParams.append("ttbkey", apiKey);
    url.searchParams.append("ItemId", itemId.toString());
    url.searchParams.append("ItemIdType", "ItemId");
    url.searchParams.append("Output", "JS");
    url.searchParams.append("Version", "20131101");
    url.searchParams.append("OptResult", "subInfo");
    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`알라딘 API 호출 실패: ${response.status}`);
    }

    const data = (await response.json()) as AladinItemLookupResponse;

    if (!data.item || data.item.length === 0) {
        return null;
    }

    return data.item[0];

};
