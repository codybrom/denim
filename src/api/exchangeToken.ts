import { THREADS_OAUTH_BASE_URL } from "../constants.ts";
import type { TokenResponse } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Exchanges a short-lived access token for a long-lived one.
 *
 * @param clientSecret - The app's client secret
 * @param accessToken - The short-lived access token to exchange
 * @returns A Promise that resolves to the TokenResponse with the long-lived token
 * @throws Will throw an error if the API request fails
 */
export async function exchangeToken(
	clientSecret: string,
	accessToken: string,
): Promise<TokenResponse> {
	const api = getAPI();
	if (api) {
		return api.exchangeToken(clientSecret, accessToken);
	}

	const url = new URL(`${THREADS_OAUTH_BASE_URL}/access_token`);
	url.searchParams.append("grant_type", "th_exchange_token");
	url.searchParams.append("client_secret", clientSecret);
	url.searchParams.append("access_token", accessToken);

	const response = await fetch(url.toString());
	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(
			`Failed to exchange token (${response.status}): ${errorBody}`,
		);
	}

	return await response.json();
}
