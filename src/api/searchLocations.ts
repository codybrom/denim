import { LOCATION_FIELDS, THREADS_API_BASE_URL } from "../constants.ts";
import type { LocationSearchOptions, ThreadsLocation } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Searches for locations on Threads.
 *
 * @param accessToken - The access token for authentication
 * @param options - Search options including query and coordinates
 * @param fields - Optional array of fields to return
 * @returns A Promise that resolves to an array of locations
 * @throws Will throw an error if the API request fails
 */
export async function searchLocations(
	accessToken: string,
	options: LocationSearchOptions,
	fields?: string[],
): Promise<{ data: ThreadsLocation[] }> {
	const api = getAPI();
	if (api) {
		return api.searchLocations(accessToken, options);
	}

	const fieldList = (fields ?? LOCATION_FIELDS).join(",");
	const url = new URL(`${THREADS_API_BASE_URL}/location_search`);
	url.searchParams.append("access_token", accessToken);
	url.searchParams.append("fields", fieldList);

	if (options.query) url.searchParams.append("query", options.query);
	if (options.latitude !== undefined) {
		url.searchParams.append("latitude", options.latitude.toString());
	}
	if (options.longitude !== undefined) {
		url.searchParams.append("longitude", options.longitude.toString());
	}

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`Failed to search locations: ${response.statusText}`);
	}

	return await response.json();
}
