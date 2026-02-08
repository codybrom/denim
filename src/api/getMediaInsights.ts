import { THREADS_API_BASE_URL } from "../constants.ts";
import type { MediaInsightsResponse } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Retrieves insight metrics for a specific Threads media object.
 *
 * Available metrics: views, likes, replies, reposts, quotes, shares,
 * follower_demographics, non_follower_demographics, reach_demographics
 *
 * @param mediaId - The ID of the Threads media object
 * @param accessToken - The access token for authentication
 * @param metrics - Array of metric names to retrieve
 * @returns A Promise that resolves to the MediaInsightsResponse
 * @throws Will throw an error if the API request fails
 */
export async function getMediaInsights(
	mediaId: string,
	accessToken: string,
	metrics: string[],
): Promise<MediaInsightsResponse> {
	const api = getAPI();
	if (api) {
		return api.getMediaInsights(mediaId, accessToken, metrics);
	}

	const url = new URL(`${THREADS_API_BASE_URL}/${mediaId}/insights`);
	url.searchParams.append("metric", metrics.join(","));
	url.searchParams.append("access_token", accessToken);

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`Failed to get media insights: ${response.statusText}`);
	}

	return await response.json();
}
