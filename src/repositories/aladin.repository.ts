import { aladinConfig } from "../config/aladin.config.js";
import { AladinApiResponse, AladinApiItem, AladinItemLookupResponse } from "../schemas/aladin.schema.js";
import HttpErrors from "http-errors";

const apiKey = aladinConfig.ALADIN_API_KEY;
const baseUrl = aladinConfig.ALADIN_BASE_URL;

//알라딘 검색 API 호출 (ItemSearch)
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
        throw HttpErrors(response.status, "알라딘 API 호출 실패");
    }

    const data = await response.json();
    return data as AladinApiResponse;
};

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
        throw HttpErrors(response.status, "알라딘 API 호출 실패");
    }

    const data = (await response.json()) as AladinItemLookupResponse;

    if (!data.item || data.item.length === 0) {
        return null;
    }

    return data.item[0];
};

// 알라딘 검색 베스트셀러 조회 (ItemList)
export const viewBestsellersFromAladin = async (
    start: number = 1,
    maxResults: number = 30
): Promise<AladinApiResponse> => {
    const url = new URL(`${baseUrl}/ItemList.aspx`);

    url.searchParams.append("ttbkey", apiKey);
    url.searchParams.append("QueryType", "Bestseller");
    url.searchParams.append("MaxResults", maxResults.toString());
    url.searchParams.append("Start", start.toString());
    url.searchParams.append("SearchTarget", "Book");
    url.searchParams.append("Output", "JS");
    url.searchParams.append("Version", "20131101");
    const response = await fetch(url.toString());

    if (!response.ok) {
        throw HttpErrors(response.status, "알라딘 API 호출 실패");
    }

    const data = await response.json();
    console.log(data);
    return data as AladinApiResponse;
};
