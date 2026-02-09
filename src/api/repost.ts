import { THREADS_API_BASE_URL } from "../constants.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Reposts a previously published Threads post.
 *
 * @param mediaId - The ID of the Threads media to repost
 * @param accessToken - The access token for authentication
 * @returns A Promise that resolves to an object with the repost ID
 * @throws Will throw an error if the API request fails
 */
export async function repost(
	mediaId: string,
	accessToken: string,
): Promise<{ id: string }> {
	const api = getAPI();
	if (api) {
		return api.repost(mediaId, accessToken);
	}

	const url = `${THREADS_API_BASE_URL}/${mediaId}/repost`;
	const body = new URLSearchParams({
		access_token: accessToken,
	});

	const response = await fetch(url, {
		method: "POST",
		body: body,
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
	});

	if (!response.ok) {
		const responseText = await response.text();
		throw new Error(`Failed to repost: ${responseText}`);
	}

	return await response.json();
}
