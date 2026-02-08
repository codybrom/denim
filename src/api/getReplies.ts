import { REPLY_FIELDS, THREADS_API_BASE_URL } from "../constants.ts";
import type { PaginationOptions, ThreadsListResponse } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Retrieves replies to a specific Threads media object.
 *
 * @param mediaId - The ID of the Threads media object
 * @param accessToken - The access token for authentication
 * @param options - Optional pagination parameters
 * @param fields - Optional array of fields to return
 * @param reverse - Optional boolean to sort in reverse chronological order (default: true)
 * @returns A Promise that resolves to the ThreadsListResponse
 * @throws Will throw an error if the API request fails
 */
export async function getReplies(
	mediaId: string,
	accessToken: string,
	options?: PaginationOptions,
	fields?: string[],
	reverse?: boolean,
): Promise<ThreadsListResponse> {
	const api = getAPI();
	if (api) {
		return api.getReplies(mediaId, accessToken, options, fields);
	}

	const fieldList = (fields ?? REPLY_FIELDS).join(",");
	const url = new URL(`${THREADS_API_BASE_URL}/${mediaId}/replies`);
	url.searchParams.append("fields", fieldList);
	url.searchParams.append("access_token", accessToken);

	if (reverse !== undefined) {
		url.searchParams.append("reverse", String(reverse));
	}

	if (options) {
		if (options.since) url.searchParams.append("since", String(options.since));
		if (options.until) url.searchParams.append("until", String(options.until));
		if (options.limit) {
			url.searchParams.append("limit", options.limit.toString());
		}
		if (options.after) url.searchParams.append("after", options.after);
		if (options.before) url.searchParams.append("before", options.before);
	}

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`Failed to get replies: ${response.statusText}`);
	}

	return await response.json();
}
