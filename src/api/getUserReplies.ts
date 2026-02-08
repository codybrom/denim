import { REPLY_FIELDS, THREADS_API_BASE_URL } from "../constants.ts";
import type { PaginationOptions, ThreadsListResponse } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

const DEFAULT_FIELDS = REPLY_FIELDS.filter(
	(f) => f !== "hide_status" && f !== "topic_tag",
);

/**
 * Retrieves a list of all replies created by a user.
 *
 * @param userId - The user ID of the Threads account
 * @param accessToken - The access token for authentication
 * @param options - Optional pagination parameters
 * @param fields - Optional array of fields to return
 * @returns A Promise that resolves to the ThreadsListResponse
 * @throws Will throw an error if the API request fails
 */
export async function getUserReplies(
	userId: string,
	accessToken: string,
	options?: PaginationOptions,
	fields?: string[],
): Promise<ThreadsListResponse> {
	const api = getAPI();
	if (api) {
		return api.getUserReplies(userId, accessToken, options, fields);
	}

	const fieldList = (fields ?? DEFAULT_FIELDS).join(",");
	const url = new URL(`${THREADS_API_BASE_URL}/${userId}/replies`);
	url.searchParams.append("fields", fieldList);
	url.searchParams.append("access_token", accessToken);

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
		throw new Error(`Failed to get user replies: ${response.statusText}`);
	}

	return await response.json();
}
