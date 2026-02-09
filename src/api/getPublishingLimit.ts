import { THREADS_API_BASE_URL } from "../constants.ts";
import type { PublishingLimit } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

const DEFAULT_FIELDS = [
	"quota_usage",
	"config",
	"reply_quota_usage",
	"reply_config",
	"delete_quota_usage",
	"delete_config",
	"location_search_quota_usage",
	"location_search_config",
];

/**
 * Retrieves the current publishing rate limit usage for a user.
 *
 * @param userId - The user ID of the Threads account
 * @param accessToken - The access token for authentication
 * @param fields - Optional array of fields to return (defaults to all quota fields)
 * @returns A Promise that resolves to the rate limit usage information
 * @throws Will throw an error if the API request fails
 * @example
 * ```typescript
 * const rateLimit = await getPublishingLimit("123456", "your_access_token");
 * console.log(`Current usage: ${rateLimit.quota_usage}`);
 * ```
 */
export async function getPublishingLimit(
	userId: string,
	accessToken: string,
	fields?: string[],
): Promise<PublishingLimit> {
	const api = getAPI();
	if (api) {
		return api.getPublishingLimit(userId, accessToken, fields);
	}
	const fieldList = (fields ?? DEFAULT_FIELDS).join(",");
	const url = new URL(
		`${THREADS_API_BASE_URL}/${userId}/threads_publishing_limit`,
	);
	url.searchParams.append("access_token", accessToken);
	url.searchParams.append("fields", fieldList);

	const response = await fetch(url.toString());
	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(
			`Failed to get publishing limit (${response.status}): ${errorBody}`,
		);
	}

	const data = await response.json();
	if (!data.data?.[0]) {
		throw new Error("No publishing limit data returned");
	}
	return data.data[0];
}
