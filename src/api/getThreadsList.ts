import { THREADS_API_BASE_URL, USER_THREADS_FIELDS } from "../constants.ts";
import type { PaginationOptions, ThreadsListResponse } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Retrieves a list of all threads created by a user.
 *
 * @param userId - The user ID of the Threads account
 * @param accessToken - The access token for authentication
 * @param options - Optional parameters for pagination and date range
 * @param fields - Optional array of fields to return (defaults to all available fields)
 * @returns A Promise that resolves to the ThreadsListResponse
 * @throws Will throw an error if the API request fails
 */
export async function getThreadsList(
	userId: string,
	accessToken: string,
	options?: PaginationOptions,
	fields?: string[],
): Promise<ThreadsListResponse> {
	const api = getAPI();
	if (api) {
		// Use mock API
		return api.getThreadsList(userId, accessToken, options, fields);
	}
	const fieldList = (fields ?? USER_THREADS_FIELDS).join(",");
	const url = new URL(`${THREADS_API_BASE_URL}/${userId}/threads`);
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
		throw new Error(`Failed to retrieve threads list: ${response.statusText}`);
	}

	return await response.json();
}
