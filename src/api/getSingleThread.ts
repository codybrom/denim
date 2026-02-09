import { SINGLE_THREAD_FIELDS, THREADS_API_BASE_URL } from "../constants.ts";
import type { ThreadsPost } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Retrieves a single Threads media object.
 *
 * @param mediaId - The ID of the Threads media object
 * @param accessToken - The access token for authentication
 * @param fields - Optional array of fields to return (defaults to all available fields)
 * @returns A Promise that resolves to the ThreadsPost object
 * @throws Will throw an error if the API request fails
 */
export async function getSingleThread(
	mediaId: string,
	accessToken: string,
	fields?: string[],
): Promise<ThreadsPost> {
	const api = getAPI();
	if (api) {
		return api.getSingleThread(mediaId, accessToken, fields);
	}
	const fieldList = (fields ?? SINGLE_THREAD_FIELDS).join(",");
	const url = new URL(`${THREADS_API_BASE_URL}/${mediaId}`);
	url.searchParams.append("fields", fieldList);
	url.searchParams.append("access_token", accessToken);

	const response = await fetch(url.toString());
	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(
			`Failed to retrieve thread (${response.status}): ${errorBody}`,
		);
	}

	return await response.json();
}
