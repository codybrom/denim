import { THREADS_API_BASE_URL } from "../constants.ts";
import type { PublicProfile } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Looks up a public Threads profile by username.
 *
 * @param accessToken - The access token for authentication
 * @param username - The exact username to look up
 * @returns A Promise that resolves to the PublicProfile object
 * @throws Will throw an error if the API request fails
 */
export async function lookupProfile(
	accessToken: string,
	username: string,
): Promise<PublicProfile> {
	const api = getAPI();
	if (api) {
		return api.lookupProfile(accessToken, username);
	}

	const url = new URL(`${THREADS_API_BASE_URL}/profile_lookup`);
	url.searchParams.append("username", username);
	url.searchParams.append("access_token", accessToken);

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`Failed to look up profile: ${response.statusText}`);
	}

	return await response.json();
}
