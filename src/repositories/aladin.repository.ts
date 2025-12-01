import { aladinConfig } from "../config/aladin.config.js";
import { AladinApiResponse } from "../schemas/aladin.schema.js";

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

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`알라딘 API 호출 실패: ${response.status}`);
    }

    const data = await response.json();
    return data as AladinApiResponse;
};
