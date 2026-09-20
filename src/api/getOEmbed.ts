import { THREADS_API_BASE_URL } from "../constants.ts";
import type { OEmbedResponse } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

function isUrl(value: string): boolean {
	return /^https?:\/\//i.test(value);
}

/**
 * Retrieves oEmbed HTML for a Threads post.
 * Since March 3, 2026 the oEmbed endpoint works without an access token.
 *
 * Supports both call orders for backwards compatibility:
 * - `getOEmbed(accessToken, postUrl, maxWidth?)` (legacy)
 * - `getOEmbed(postUrl, accessToken?, maxWidth?)` (preferred)
 * - `getOEmbed(postUrl, maxWidth?)` — no token; pass maxWidth as second arg
 *   only via the 3-arg form `getOEmbed(postUrl, undefined, maxWidth)`
 *
 * @param accessTokenOrUrl - Legacy access token OR the post URL
 * @param urlOrAccessTokenOrMaxWidth - Post URL, optional access token, or maxWidth
 * @param maxWidth - Optional maximum width of the embed in pixels
 * @returns A Promise that resolves to the OEmbedResponse
 * @throws Will throw an error if the API request fails
 */
export async function getOEmbed(
	accessTokenOrUrl: string,
	urlOrAccessTokenOrMaxWidth?: string | number,
	maxWidth?: number,
): Promise<OEmbedResponse> {
	let accessToken: string | undefined;
	let postUrl: string;
	let resolvedMaxWidth = maxWidth;

	if (typeof urlOrAccessTokenOrMaxWidth === "number") {
		// getOEmbed(postUrl, maxWidth)
		postUrl = accessTokenOrUrl;
		resolvedMaxWidth = urlOrAccessTokenOrMaxWidth;
	} else if (urlOrAccessTokenOrMaxWidth === undefined) {
		// Single-arg: must be the post URL (no token)
		postUrl = accessTokenOrUrl;
	} else if (isUrl(accessTokenOrUrl) && !isUrl(urlOrAccessTokenOrMaxWidth)) {
		// New order: getOEmbed(postUrl, accessToken?, maxWidth?)
		postUrl = accessTokenOrUrl;
		accessToken = urlOrAccessTokenOrMaxWidth || undefined;
	} else {
		// Legacy order: getOEmbed(accessToken, postUrl, maxWidth?)
		accessToken = accessTokenOrUrl || undefined;
		postUrl = urlOrAccessTokenOrMaxWidth;
	}

	const api = getAPI();
	if (api) {
		// Mock preserves legacy (token, url) ordering
		return api.getOEmbed(accessToken ?? "", postUrl, resolvedMaxWidth);
	}

	const url = new URL(`${THREADS_API_BASE_URL}/oembed`);
	url.searchParams.append("url", postUrl);
	if (accessToken) {
		url.searchParams.append("access_token", accessToken);
	}

	if (resolvedMaxWidth !== undefined) {
		url.searchParams.append("maxwidth", resolvedMaxWidth.toString());
	}

	const response = await fetch(url.toString());
	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(
			`Failed to get oEmbed (${response.status}): ${errorBody}`,
		);
	}

	return await response.json();
}
