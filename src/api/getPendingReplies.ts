import { PENDING_REPLY_FIELDS, THREADS_API_BASE_URL } from "../constants.ts";
import type {
	ApprovalStatus,
	CursorPaginationOptions,
	ThreadsListResponse,
} from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";

/**
 * Retrieves pending replies awaiting approval on a Threads post.
 * Only applicable to posts created with reply approvals enabled.
 *
 * @param mediaId - The ID of the Threads media object
 * @param accessToken - The access token for authentication
 * @param options - Optional pagination parameters
 * @param fields - Optional array of fields to return
 * @param reverse - Optional boolean to sort in reverse chronological order (default: true)
 * @param approvalStatus - Optional filter: `pending` or `ignored` (default returns both)
 * @returns A Promise that resolves to the ThreadsListResponse
 * @throws Will throw an error if the API request fails
 */
export async function getPendingReplies(
	mediaId: string,
	accessToken: string,
	options?: CursorPaginationOptions,
	fields?: string[],
	reverse?: boolean,
	approvalStatus?: ApprovalStatus,
): Promise<ThreadsListResponse> {
	const api = getAPI();
	if (api) {
		return api.getPendingReplies(
			mediaId,
			accessToken,
			options,
			fields,
			reverse,
			approvalStatus,
		);
	}

	const fieldList = (fields ?? PENDING_REPLY_FIELDS).join(",");
	const url = new URL(`${THREADS_API_BASE_URL}/${mediaId}/pending_replies`);
	url.searchParams.append("fields", fieldList);
	url.searchParams.append("access_token", accessToken);

	if (reverse !== undefined) {
		url.searchParams.append("reverse", String(reverse));
	}

	if (approvalStatus !== undefined) {
		url.searchParams.append("approval_status", approvalStatus);
	}

	if (options) {
		if (options.after) url.searchParams.append("after", options.after);
		if (options.before) url.searchParams.append("before", options.before);
	}

	const response = await fetch(url.toString());
	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(
			`Failed to get pending replies (${response.status}): ${errorBody}`,
		);
	}

	return await response.json();
}
