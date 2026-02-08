import { THREADS_API_BASE_URL } from "../constants.ts";
import type { OEmbedResponse } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Retrieves oEmbed HTML for a Threads post.
 *
 * @param accessToken - The access token for authentication
 * @param postUrl - The URL of the Threads post to embed
 * @param maxWidth - Optional maximum width of the embed in pixels
 * @returns A Promise that resolves to the OEmbedResponse
 * @throws Will throw an error if the API request fails
 */
export async function getOEmbed(
	accessToken: string,
	postUrl: string,
	maxWidth?: number,
): Promise<OEmbedResponse> {
	const api = getAPI();
	if (api) {
		return api.getOEmbed(accessToken, postUrl, maxWidth);
	}

	const url = new URL(`${THREADS_API_BASE_URL}/oembed`);
	url.searchParams.append("url", postUrl);
	url.searchParams.append("access_token", accessToken);

	if (maxWidth !== undefined) {
		url.searchParams.append("maxwidth", maxWidth.toString());
	}

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`Failed to get oEmbed: ${response.statusText}`);
	}

	return await response.json();
}
