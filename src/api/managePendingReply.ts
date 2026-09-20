import { THREADS_API_BASE_URL } from "../constants.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Approves or ignores a pending reply on a Threads post with reply approvals enabled.
 * Ignored replies can still be approved later.
 *
 * @param replyId - The ID of the pending reply to manage
 * @param accessToken - The access token for authentication
 * @param approve - Whether to approve (true) or ignore (false) the reply
 * @returns A Promise that resolves to an object indicating success
 * @throws Will throw an error if the API request fails
 */
export async function managePendingReply(
	replyId: string,
	accessToken: string,
	approve: boolean,
): Promise<{ success: boolean }> {
	const api = getAPI();
	if (api) {
		return api.managePendingReply(replyId, accessToken, approve);
	}

	const url = `${THREADS_API_BASE_URL}/${replyId}/manage_pending_reply`;
	const body = new URLSearchParams({
		access_token: accessToken,
		approve: String(approve),
	});

	const response = await fetch(url, {
		method: "POST",
		body: body,
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
	});

	if (!response.ok) {
		const responseText = await response.text();
		throw new Error(`Failed to manage pending reply: ${responseText}`);
	}

	return await response.json();
}
