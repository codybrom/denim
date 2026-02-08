import {
	getAPI,
	type KeywordSearchOptions,
	THREADS_API_BASE_URL,
	type ThreadsListResponse,
} from "../../mod.ts";

/**
 * Searches for Threads posts by keyword or hashtag.
 *
 * @param accessToken - The access token for authentication
 * @param options - Search options including query string and filters
 * @returns A Promise that resolves to the ThreadsListResponse
 * @throws Will throw an error if the API request fails
 */
export async function searchKeyword(
	accessToken: string,
	options: KeywordSearchOptions,
): Promise<ThreadsListResponse> {
	const api = getAPI();
	if (api) {
		return api.searchKeyword(accessToken, options);
	}

	const url = new URL(`${THREADS_API_BASE_URL}/keyword_search`);
	url.searchParams.append("q", options.q);
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
