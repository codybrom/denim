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
	"username",
	"text",
	"timestamp",
	"shortcode",
	"thumbnail_url",
	"children",
	"is_quote_post",
	"has_replies",
	"root_post",
	"replied_to",
	"is_reply",
	"hide_status",
	"is_verified",
	"profile_picture_url",
];

/**
 * Retrieves the full conversation thread for a Threads media object.
 *
 * @param mediaId - The ID of the root Threads media object
 * @param accessToken - The access token for authentication
 * @param options - Optional pagination parameters
 * @param fields - Optional array of fields to return
 * @returns A Promise that resolves to the ThreadsListResponse
 * @throws Will throw an error if the API request fails
 */
export async function getConversation(
	mediaId: string,
	accessToken: string,
	options?: PaginationOptions,
	fields?: string[],
): Promise<ThreadsListResponse> {
	const api = getAPI();
	if (api) {
		return api.getConversation(mediaId, accessToken, options, fields);
	}

	const fieldList = (fields ?? DEFAULT_FIELDS).join(",");
	const url = new URL(`${THREADS_API_BASE_URL}/${mediaId}/conversation`);
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
		throw new Error(`Failed to get conversation: ${response.statusText}`);
	}

	return await response.json();
}
