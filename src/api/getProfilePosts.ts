import { THREADS_API_BASE_URL } from "../constants.ts";
import type { PaginationOptions, ThreadsListResponse } from "../types.ts";
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
	"reply_audience",
	"quoted_post",
	"reposted_post",
	"gif_url",
	"is_spoiler_media",
	"text_entities",
];

/**
 * Retrieves posts from a public Threads profile by username.
 *
 * @param accessToken - The access token for authentication
 * @param username - The exact username whose posts to retrieve
 * @param options - Optional pagination parameters
 * @param fields - Optional array of fields to return
 * @returns A Promise that resolves to the ThreadsListResponse
 * @throws Will throw an error if the API request fails
 */
export async function getProfilePosts(
	accessToken: string,
	username: string,
	options?: PaginationOptions,
	fields?: string[],
): Promise<ThreadsListResponse> {
	const api = getAPI();
	if (api) {
		return api.getProfilePosts(accessToken, username, options, fields);
	}

	const fieldList = (fields ?? DEFAULT_FIELDS).join(",");
	const url = new URL(`${THREADS_API_BASE_URL}/profile_posts`);
	url.searchParams.append("username", username);
	url.searchParams.append("fields", fieldList);
	url.searchParams.append("access_token", accessToken);

	if (options) {
		if (options.since) url.searchParams.append("since", options.since);
		if (options.until) url.searchParams.append("until", options.until);
		if (options.limit) {
			url.searchParams.append("limit", options.limit.toString());
		}
		if (options.after) url.searchParams.append("after", options.after);
		if (options.before) url.searchParams.append("before", options.before);
	}

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`Failed to get profile posts: ${response.statusText}`);
	}

	return await response.json();
}
