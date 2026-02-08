import { THREADS_API_BASE_URL } from "../constants.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Hides or unhides a reply on a Threads post.
 *
 * @param replyId - The ID of the reply to manage
 * @param accessToken - The access token for authentication
 * @param hide - Whether to hide (true) or unhide (false) the reply
 * @returns A Promise that resolves to an object indicating success
 * @throws Will throw an error if the API request fails
 */
export async function manageReply(
	replyId: string,
	accessToken: string,
	hide: boolean,
): Promise<{ success: boolean }> {
	const api = getAPI();
	if (api) {
		return api.manageReply(replyId, accessToken, hide);
	}

	const url = `${THREADS_API_BASE_URL}/${replyId}/manage_reply`;
	const body = new URLSearchParams({
		access_token: accessToken,
		hide: String(hide),
	});

	const response = await fetch(url, {
		method: "POST",
		body: body,
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
	});

	if (!response.ok) {
		const responseText = await response.text();
		throw new Error(`Failed to manage reply: ${responseText}`);
	}

	return await response.json();
}
