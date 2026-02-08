import { getAPI, THREADS_API_BASE_URL, type ThreadsPost } from "../../mod.ts";

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
	"is_reply",
	"is_reply_owned_by_me",
	"root_post",
	"replied_to",
	"hide_status",
	"reply_audience",
	"quoted_post",
	"reposted_post",
	"gif_url",
	"poll_attachment",
	"topic_tag",
	"is_spoiler_media",
	"text_entities",
	"text_attachment",
	"location_id",
	"location",
	"is_verified",
	"profile_picture_url",
];

/**
 * Retrieves a single Threads media object.
 *
 * @param mediaId - The ID of the Threads media object
 * @param accessToken - The access token for authentication
 * @param fields - Optional array of fields to return (defaults to all available fields)
 * @returns A Promise that resolves to the ThreadsPost object
 * @throws Will throw an error if the API request fails
 */
export async function getSingleThread(
	mediaId: string,
	accessToken: string,
	fields?: string[],
): Promise<ThreadsPost> {
	const api = getAPI();
	if (api) {
		// Use mock API
		return api.getSingleThread(mediaId, accessToken, fields);
	}
	const fieldList = (fields ?? DEFAULT_FIELDS).join(",");
	const url = new URL(`${THREADS_API_BASE_URL}/${mediaId}`);
	url.searchParams.append("fields", fieldList);
	url.searchParams.append("access_token", accessToken);

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`Failed to retrieve thread: ${response.statusText}`);
	}

	return await response.json();
}
