import { THREADS_API_BASE_URL } from "../constants.ts";
import type { TokenResponse } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Gets an app-level access token using client credentials.
 * App tokens are used for server-to-server requests that don't act on behalf of a user.
 *
 * @param clientId - Your Threads App ID
 * @param clientSecret - Your Threads App Secret
 * @returns A Promise that resolves to the app access token
 * @throws Will throw an error if the API request fails
 */
export async function getAppAccessToken(
	clientId: string,
	clientSecret: string,
): Promise<TokenResponse> {
	const api = getAPI();
	if (api) {
		return api.getAppAccessToken(clientId, clientSecret);
	}

	const url = new URL(`${THREADS_API_BASE_URL}/oauth/access_token`);
	url.searchParams.append("grant_type", "client_credentials");
	url.searchParams.append("client_id", clientId);
	url.searchParams.append("client_secret", clientSecret);

	const response = await fetch(url.toString());
	if (!response.ok) {
		const responseText = await response.text();
		throw new Error(`Failed to get app access token: ${responseText}`);
	}

	return await response.json();
}
