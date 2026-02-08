import { THREADS_API_BASE_URL } from "../constants.ts";
import type { ThreadsProfile } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

const DEFAULT_FIELDS = [
	"id",
	"username",
	"name",
	"threads_profile_picture_url",
	"threads_biography",
	"is_verified",
	"is_eligible_for_geo_gating",
];

/**
 * Retrieves profile information for a Threads user.
 *
 * @param userId - The user ID (or "me" for the authenticated user)
 * @param accessToken - The access token for authentication
 * @param fields - Optional array of fields to return
 * @returns A Promise that resolves to the ThreadsProfile object
 * @throws Will throw an error if the API request fails
 */
export async function getProfile(
	userId: string,
	accessToken: string,
	fields?: string[],
): Promise<ThreadsProfile> {
	const api = getAPI();
	if (api) {
		return api.getProfile(userId, accessToken, fields);
	}

	const fieldList = (fields ?? DEFAULT_FIELDS).join(",");
	const url = new URL(`${THREADS_API_BASE_URL}/${userId}`);
	url.searchParams.append("fields", fieldList);
	url.searchParams.append("access_token", accessToken);

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`Failed to get profile: ${response.statusText}`);
	}

	return await response.json();
}
