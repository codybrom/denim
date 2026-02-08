import { THREADS_API_BASE_URL } from "../constants.ts";
import type { KeywordSearchOptions, ThreadsListResponse } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

const DEFAULT_FIELDS = [
	"id",
	"media_product_type",
	"media_type",
	"media_url",
	"permalink",
	"username",
	"text",
	"timestamp",
	"shortcode",
	"thumbnail_url",
	"children",
	"is_quote_post",
	"alt_text",
	"link_attachment_url",
	"has_replies",
	"is_reply",
	"root_post",
	"replied_to",
	"reply_audience",
	"quoted_post",
	"reposted_post",
	"gif_url",
	"poll_attachment",
	"topic_tag",
];

/**
 * Searches for Threads posts by keyword or topic tag.
 *
 * @param accessToken - The access token for authentication
 * @param options - Search options including query string and filters
 * @param fields - Optional array of fields to return
 * @returns A Promise that resolves to the ThreadsListResponse
 * @throws Will throw an error if the API request fails
 */
export async function searchKeyword(
	accessToken: string,
	options: KeywordSearchOptions,
	fields?: string[],
): Promise<ThreadsListResponse> {
	const api = getAPI();
	if (api) {
		return api.searchKeyword(accessToken, options);
	}

	const fieldList = (fields ?? DEFAULT_FIELDS).join(",");
	const url = new URL(`${THREADS_API_BASE_URL}/keyword_search`);
	url.searchParams.append("q", options.q);
	url.searchParams.append("fields", fieldList);
	url.searchParams.append("access_token", accessToken);

	if (options.search_type) {
		url.searchParams.append("search_type", options.search_type);
	}
	if (options.search_mode) {
		url.searchParams.append("search_mode", options.search_mode);
	}
	if (options.media_type) {
		url.searchParams.append("media_type", options.media_type);
	}
	if (options.author_username) {
		url.searchParams.append("author_username", options.author_username);
	}
	if (options.since) url.searchParams.append("since", options.since);
	if (options.until) url.searchParams.append("until", options.until);
	if (options.limit) {
		url.searchParams.append("limit", options.limit.toString());
	}
	if (options.after) url.searchParams.append("after", options.after);
	if (options.before) url.searchParams.append("before", options.before);

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`Failed to search keywords: ${response.statusText}`);
	}

	return await response.json();
}
