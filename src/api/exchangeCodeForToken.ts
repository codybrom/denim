import { THREADS_OAUTH_BASE_URL } from "../constants.ts";
import type { AuthCodeResponse } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Exchanges an OAuth authorization code for a short-lived access token.
 * This is the first step in the OAuth flow after the user authorizes your app.
 *
 * @param clientId - Your Threads App ID
 * @param clientSecret - Your Threads App Secret
 * @param code - The authorization code received from the redirect
 * @param redirectUri - The redirect URI used in the authorization request
 * @returns A Promise that resolves to the access token and user ID
 * @throws Will throw an error if the API request fails
 */
export async function exchangeCodeForToken(
	clientId: string,
	clientSecret: string,
	code: string,
	redirectUri: string,
): Promise<AuthCodeResponse> {
	const api = getAPI();
	if (api) {
		return api.exchangeCodeForToken(clientId, clientSecret, code, redirectUri);
	}

	const url = `${THREADS_OAUTH_BASE_URL}/oauth/access_token`;
	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		code: code,
		grant_type: "authorization_code",
		redirect_uri: redirectUri,
	});

	const response = await fetch(url, {
		method: "POST",
		body: body,
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
	});

	if (!response.ok) {
		const responseText = await response.text();
		throw new Error(
			`Failed to exchange authorization code: ${responseText}`,
		);
	}

	return await response.json();
}
