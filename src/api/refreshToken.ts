import { getAPI, THREADS_API_BASE_URL, type TokenResponse } from "../../mod.ts";

/**
 * Refreshes a long-lived access token.
 *
 * @param accessToken - The long-lived access token to refresh
 * @returns A Promise that resolves to the TokenResponse with the refreshed token
 * @throws Will throw an error if the API request fails
 */
export async function refreshToken(
	accessToken: string,
): Promise<TokenResponse> {
	const api = getAPI();
	if (api) {
		return api.refreshToken(accessToken);
	}

	const url = new URL(`${THREADS_API_BASE_URL}/refresh_access_token`);
	url.searchParams.append("grant_type", "th_refresh_token");
	url.searchParams.append("access_token", accessToken);

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`Failed to refresh token: ${response.statusText}`);
	}

	return await response.json();
}
