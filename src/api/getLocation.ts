import { LOCATION_FIELDS, THREADS_API_BASE_URL } from "../constants.ts";
import type { ThreadsLocation } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Retrieves information about a specific location.
 *
 * @param locationId - The ID of the location
 * @param accessToken - The access token for authentication
 * @param fields - Optional array of fields to return
 * @returns A Promise that resolves to the ThreadsLocation object
 * @throws Will throw an error if the API request fails
 */
export async function getLocation(
	locationId: string,
	accessToken: string,
	fields?: string[],
): Promise<ThreadsLocation> {
	const api = getAPI();
	if (api) {
		return api.getLocation(locationId, accessToken, fields);
	}

	const fieldList = (fields ?? LOCATION_FIELDS).join(",");
	const url = new URL(`${THREADS_API_BASE_URL}/${locationId}`);
	url.searchParams.append("fields", fieldList);
	url.searchParams.append("access_token", accessToken);

	const response = await fetch(url.toString());
	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(
			`Failed to get location (${response.status}): ${errorBody}`,
		);
	}

	return await response.json();
}
