import { THREADS_API_BASE_URL } from "../constants.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Deletes a Threads post.
 *
 * @param mediaId - The ID of the Threads media to delete
 * @param accessToken - The access token for authentication
 * @returns A Promise that resolves to an object indicating success
 * @throws Will throw an error if the API request fails
 */
export async function deleteThread(
	mediaId: string,
	accessToken: string,
): Promise<{ success: boolean }> {
	const api = getAPI();
	if (api) {
		return api.deleteThread(mediaId, accessToken);
	}

	const url = `${THREADS_API_BASE_URL}/${mediaId}`;
	const params = new URLSearchParams({
		access_token: accessToken,
	});

	const response = await fetch(`${url}?${params}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		const responseText = await response.text();
		throw new Error(`Failed to delete thread: ${responseText}`);
	}

	return await response.json();
}
