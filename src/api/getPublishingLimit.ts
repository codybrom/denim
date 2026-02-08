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
		// Use mock API
		return api.getPublishingLimit(userId, accessToken, fields);
	}
	const fieldList = (fields ?? DEFAULT_FIELDS).join(",");
	const url = `${THREADS_API_BASE_URL}/${userId}/threads_publishing_limit`;
	const params = new URLSearchParams({
		access_token: accessToken,
		fields: fieldList,
	});

	const response = await fetch(`${url}?${params}`);
	if (!response.ok) {
		throw new Error(`Failed to get publishing limit: ${response.statusText}`);
	}

	const data = await response.json();
	return data.data[0];
}
