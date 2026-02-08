import { THREADS_API_BASE_URL, type ThreadsPostRequest } from "../../mod.ts";
/**
 * Creates a video item container for Threads.
 *
 * @param request - The ThreadsPostRequest object containing video post details
 * @returns A Promise that resolves to the video item container ID
 * @throws Will throw an error if the API request fails
 */
export async function createVideoItemContainer(
	request: ThreadsPostRequest,
): Promise<string> {
	const url = `${THREADS_API_BASE_URL}/${request.userId}/threads`;
	const body = new URLSearchParams({
		access_token: request.accessToken,
		is_carousel_item: "true",
		media_type: "VIDEO",
		video_url: request.videoUrl!,
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
			`Failed to create video item container: ${response.statusText}. Details: ${responseText}`,
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
