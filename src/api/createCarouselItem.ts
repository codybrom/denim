import {
	getAPI,
	THREADS_API_BASE_URL,
	type ThreadsPostRequest,
} from "../../mod.ts";
/**
 * Creates a carousel item for a Threads carousel post.
 *
 * This function sends a request to the Threads API to create a single item
 * that will be part of a carousel post. It can be used for both image and
 * video items.
 *
 * @param request - The request object containing carousel item details
 * @param request.userId - The user ID of the Threads account
 * @param request.accessToken - The access token for authentication
 * @param request.mediaType - The type of media for this carousel item ('IMAGE' or 'VIDEO')
 * @param request.imageUrl - The URL of the image (required if mediaType is 'IMAGE')
 * @param request.videoUrl - The URL of the video (required if mediaType is 'VIDEO')
 * @param request.altText - Optional accessibility text for the image or video
 * @returns A Promise that resolves to the carousel item ID
 * @throws Will throw an error if the API request fails or returns an invalid response
 *
 * @example
 * ```typescript
 * const itemRequest = {
 *   userId: "123456",
 *   accessToken: "your_access_token",
 *   mediaType: "IMAGE" as const,
 *   imageUrl: "https://example.com/image.jpg",
 *   altText: "A beautiful landscape"
 * };
 * const itemId = await createCarouselItem(itemRequest);
 * ```
 */
export async function createCarouselItem(
	request: Omit<ThreadsPostRequest, "mediaType"> & {
		mediaType: "IMAGE" | "VIDEO";
	},
): Promise<string | { id: string }> {
	const api = getAPI();
	if (api) {
		// Use mock API
		return api.createCarouselItem(request);
	}
	if (request.mediaType !== "IMAGE" && request.mediaType !== "VIDEO") {
		throw new Error("Carousel items must be either IMAGE or VIDEO type");
	}

	if (request.mediaType === "IMAGE" && !request.imageUrl) {
		throw new Error("imageUrl is required for IMAGE type carousel items");
	}

	if (request.mediaType === "VIDEO" && !request.videoUrl) {
		throw new Error("videoUrl is required for VIDEO type carousel items");
	}

	const url = `${THREADS_API_BASE_URL}/${request.userId}/threads`;
	const body = new URLSearchParams({
		access_token: request.accessToken,
		media_type: request.mediaType,
		is_carousel_item: "true",
		...(request.imageUrl && { image_url: request.imageUrl }),
		...(request.videoUrl && { video_url: request.videoUrl }),
		...(request.altText && { alt_text: request.altText }),
	});

	const response = await fetch(url, {
		method: "POST",
		body: body,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	});

	const responseText = await response.text();

	if (!response.ok) {
		throw new Error(
			`Failed to create carousel item: ${response.statusText}. Details: ${responseText}`,
		);
	}

	try {
		const data = JSON.parse(responseText);
		return data.id;
	} catch (error) {
		console.error(`Failed to parse response JSON: ${error}`);
		throw new Error(`Invalid response from Threads API: ${responseText}`);
	}
}
