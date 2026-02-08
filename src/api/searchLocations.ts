import {
	getAPI,
	type LocationSearchOptions,
	THREADS_API_BASE_URL,
	type ThreadsLocation,
} from "../../mod.ts";

/**
 * Searches for locations on Threads.
 *
 * @param accessToken - The access token for authentication
 * @param options - Search options including query, coordinates, and distance
 * @returns A Promise that resolves to an array of locations
 * @throws Will throw an error if the API request fails
 */
export async function searchLocations(
	accessToken: string,
	options: LocationSearchOptions,
): Promise<{ data: ThreadsLocation[] }> {
	const api = getAPI();
	if (api) {
		return api.searchLocations(accessToken, options);
	}

	const url = new URL(`${THREADS_API_BASE_URL}/location_search`);
	url.searchParams.append("access_token", accessToken);

	if (options.q) url.searchParams.append("q", options.q);
	if (options.latitude !== undefined) {
		url.searchParams.append("latitude", options.latitude.toString());
	}
	if (options.longitude !== undefined) {
		url.searchParams.append("longitude", options.longitude.toString());
	}
	if (options.distance !== undefined) {
		url.searchParams.append("distance", options.distance.toString());
	}
	if (options.limit !== undefined) {
		url.searchParams.append("limit", options.limit.toString());
	}

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`Failed to search locations: ${response.statusText}`);
	}

	return await response.json();
}
