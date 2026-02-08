import {
	type DebugTokenInfo,
	getAPI,
	THREADS_API_BASE_URL,
} from "../../mod.ts";

/**
 * Retrieves debug information about an access token.
 *
 * @param accessToken - The access token for authentication
 * @param inputToken - The token to debug
 * @returns A Promise that resolves to the DebugTokenInfo
 * @throws Will throw an error if the API request fails
 */
export async function debugToken(
	accessToken: string,
	inputToken: string,
): Promise<DebugTokenInfo> {
	const api = getAPI();
	if (api) {
		return api.debugToken(accessToken, inputToken);
	}

	const url = new URL(`${THREADS_API_BASE_URL}/debug_token`);
	url.searchParams.append("input_token", inputToken);
	url.searchParams.append("access_token", accessToken);

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`Failed to debug token: ${response.statusText}`);
	}

	return await response.json();
}
