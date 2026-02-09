import { THREADS_API_BASE_URL } from "../constants.ts";
import type { ThreadsPostRequest } from "../types.ts";
import { getAPI } from "../utils/getAPI.ts";
import { validateRequest } from "../utils/validateRequest.ts";
/**
 * Creates a Threads media container.
 *
 * @param request - The ThreadsPostRequest object containing post details
 * @returns A Promise that resolves to the container ID
 * @throws Will throw an error if the API request fails
 *
 * @example
 * ```typescript
 * const request: ThreadsPostRequest = {
 *   userId: "123456",
 *   accessToken: "your_access_token",
 *   mediaType: "VIDEO",
 *   text: "Check out this video!",
 *   videoUrl: "https://example.com/video.mp4",
 *   altText: "A cool video"
 * };
 * const containerId = await createThreadsContainer(request);
 * ```
 */
export async function createThreadsContainer(
	request: ThreadsPostRequest,
): Promise<string> {
	const api = getAPI();
	if (api) {
		return api.createThreadsContainer(request);
	}
	try {
		// Input validation
		await validateRequest(request);

		const url = `${THREADS_API_BASE_URL}/${request.userId}/threads`;
		const body = new URLSearchParams({
			access_token: request.accessToken,
			media_type: request.mediaType,
		});

		// Add common optional parameters
		if (request.text) body.append("text", request.text);
		if (request.altText) body.append("alt_text", request.altText);
		if (request.replyControl) {
			body.append("reply_control", request.replyControl);
		}
		if (request.allowlistedCountryCodes) {
			body.append(
				"allowlisted_country_codes",
				JSON.stringify(request.allowlistedCountryCodes),
			);
		}

		// New optional parameters
		if (request.replyToId) body.append("reply_to_id", request.replyToId);
		if (request.quotePostId) {
			body.append("quote_post_id", request.quotePostId);
		}
		if (request.topicTag) body.append("topic_tag", request.topicTag);
		if (request.isGhostPost !== undefined) {
			body.append("is_ghost_post", String(request.isGhostPost));
		}
		if (request.locationId) body.append("location_id", request.locationId);
		if (request.autoPublishText !== undefined) {
			body.append("auto_publish_text", String(request.autoPublishText));
		}
		if (request.isSpoilerMedia !== undefined) {
			body.append("is_spoiler_media", String(request.isSpoilerMedia));
		}

		// JSON-serialized parameters
		if (request.pollAttachment) {
			body.append("poll_attachment", JSON.stringify(request.pollAttachment));
		}
		if (request.textEntities) {
			body.append("text_entities", JSON.stringify(request.textEntities));
		}
		if (request.textAttachment) {
			body.append("text_attachment", JSON.stringify(request.textAttachment));
		}
		if (request.gifAttachment) {
			body.append("gif_attachment", JSON.stringify(request.gifAttachment));
		}

		// Handle media type specific parameters
		if (request.mediaType === "VIDEO" && request.videoUrl) {
			body.append("video_url", request.videoUrl);
		} else if (request.mediaType === "IMAGE" && request.imageUrl) {
			body.append("image_url", request.imageUrl);
		} else if (request.mediaType === "TEXT" && request.linkAttachment) {
			body.append("link_attachment", request.linkAttachment);
		} else if (request.mediaType === "CAROUSEL" && request.children) {
			body.append("children", request.children.join(","));
		}

		const response = await fetch(url, {
			method: "POST",
			body: body,
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
		});

		const responseText = await response.text();

		if (!response.ok) {
			throw new Error(
				`Failed to create container (${response.status} ${response.statusText}): ${responseText}`,
			);
		}

		const data = JSON.parse(responseText);

		return data.id;
	} catch (error) {
		// Rethrow the error if it's already an Error instance
		if (error instanceof Error) {
			throw error;
		}
		// Otherwise, wrap it in a new Error
		throw new Error(`Failed to create Threads container: ${String(error)}`);
	}
}
