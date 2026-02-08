import {
	getAPI,
	type PaginationOptions,
	THREADS_API_BASE_URL,
	type ThreadsListResponse,
} from "../../mod.ts";

const DEFAULT_FIELDS = [
	"id",
	"media_product_type",
	"media_type",
	"media_url",
	"permalink",
	"owner",
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
	"text_attachment",
	"is_verified",
	"profile_picture_url",
];

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
	const fieldList = (fields ?? DEFAULT_FIELDS).join(",");
	const url = new URL(`${THREADS_API_BASE_URL}/${userId}/threads`);
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
		throw new Error(`Failed to retrieve threads list: ${response.statusText}`);
	}

	return await response.json();
}
