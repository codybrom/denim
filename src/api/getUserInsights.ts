import { THREADS_API_BASE_URL } from "../constants.ts";
import type { UserInsightsOptions, UserInsightsResponse } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Retrieves insight metrics for a Threads user.
 *
 * Available metrics: views, likes, replies, reposts, quotes, clicks,
 * followers_count, follower_demographics
 *
 * @param userId - The user ID of the Threads account
 * @param accessToken - The access token for authentication
 * @param metrics - Array of metric names to retrieve
 * @param options - Optional parameters for time range and breakdown
 * @returns A Promise that resolves to the UserInsightsResponse
 * @throws Will throw an error if the API request fails
 */
export async function getUserInsights(
	userId: string,
	accessToken: string,
	metrics: string[],
	options?: UserInsightsOptions,
): Promise<UserInsightsResponse> {
	const api = getAPI();
	if (api) {
		return api.getUserInsights(userId, accessToken, metrics, options);
	}

	const url = new URL(`${THREADS_API_BASE_URL}/${userId}/threads_insights`);
	url.searchParams.append("metric", metrics.join(","));
	url.searchParams.append("access_token", accessToken);

	if (options) {
		if (options.since !== undefined) {
			url.searchParams.append("since", options.since.toString());
		}
		if (options.until !== undefined) {
			url.searchParams.append("until", options.until.toString());
		}
		if (options.breakdown) {
			url.searchParams.append("breakdown", options.breakdown);
		}
	}

	const response = await fetch(url.toString());
	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(
			`Failed to get user insights (${response.status}): ${errorBody}`,
		);
	}

	return await response.json();
}
