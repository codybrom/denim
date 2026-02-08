import type { ThreadsPostRequest } from "../types.ts";
/**
 * Validates the ThreadsPostRequest object to ensure correct usage of media-specific properties.
 *
 * @param request - The ThreadsPostRequest object to validate
 * @throws Will throw an error if the request contains invalid combinations of media type and properties
 *
 * @example
 * ```typescript
 * const request: ThreadsPostRequest = {
 *   userId: "123456",
 *   accessToken: "your_access_token",
 *   mediaType: "IMAGE",
 *   imageUrl: "https://example.com/image.jpg"
 * };
 * await validateRequest(request); // This will not throw an error
 * ```
 */
export async function validateRequest(
	request: ThreadsPostRequest,
): Promise<void> {
	// Check for invalid combinations first
	if (request.mediaType !== "IMAGE" && request.imageUrl) {
		throw new Error("imageUrl can only be used with IMAGE media type");
	}
	if (request.mediaType !== "VIDEO" && request.videoUrl) {
		throw new Error("videoUrl can only be used with VIDEO media type");
	}
	if (request.mediaType !== "TEXT" && request.linkAttachment) {
		throw new Error("linkAttachment can only be used with TEXT media type");
	}
	if (request.mediaType !== "CAROUSEL" && request.children) {
		throw new Error("children can only be used with CAROUSEL media type");
	}

	// Poll attachment can only be used with TEXT posts
	if (request.pollAttachment && request.mediaType !== "TEXT") {
		throw new Error("pollAttachment can only be used with TEXT media type");
	}

	// GIF attachment can only be used with TEXT posts
	if (request.gifAttachment && request.mediaType !== "TEXT") {
		throw new Error("gifAttachment can only be used with TEXT media type");
	}

	// Ghost posts can only be TEXT and cannot be replies
	if (request.isGhostPost) {
		if (request.mediaType !== "TEXT") {
			throw new Error("isGhostPost can only be used with TEXT media type");
		}
		if (request.replyToId) {
			throw new Error("isGhostPost cannot be used together with replyToId");
		}
	}

	// Text attachment can only be used with TEXT posts and not with polls
	if (request.textAttachment) {
		if (request.mediaType !== "TEXT") {
			throw new Error("textAttachment can only be used with TEXT media type");
		}
		if (request.pollAttachment) {
			throw new Error(
				"textAttachment cannot be used together with pollAttachment",
			);
		}
	}

	// Text entities limited to 10
	if (request.textEntities && request.textEntities.length > 10) {
		throw new Error("textEntities cannot have more than 10 entries");
	}

	// If combinations are valid, do media-specific validations
	if (request.mediaType === "IMAGE" && request.imageUrl) {
		await validateImageSpecs(request.imageUrl);
	}
	if (request.mediaType === "VIDEO" && request.videoUrl) {
		await validateVideoSpecs(request.videoUrl);
	}
	if (request.mediaType === "TEXT" && request.linkAttachment) {
		validateLinkUrl(request.linkAttachment);
	}
	if (
		request.mediaType === "CAROUSEL" &&
		(!request.children || request.children.length < 2)
	) {
		throw new Error("CAROUSEL media type requires at least 2 children");
	}
}

async function validateImageSpecs(imageUrl: string): Promise<void> {
	let response: Response;
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);
		response = await fetch(imageUrl, {
			method: "HEAD",
			signal: controller.signal,
		});
		clearTimeout(timeoutId);
	} catch (_error) {
		// HEAD not supported or network error — skip validation
		return;
	}

	if (response.status === 405) return;

	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.statusText}`);
	}

	const contentType = response.headers.get("content-type")?.split(";")[0]
		.trim();
	if (!contentType || !["image/jpeg", "image/png"].includes(contentType)) {
		throw new Error("Image format must be JPEG or PNG");
	}

	const contentLength = response.headers.get("content-length");
	if (contentLength && parseInt(contentLength, 10) > 8 * 1024 * 1024) {
		throw new Error("Image file size must not exceed 8 MB");
	}
}

async function validateVideoSpecs(videoUrl: string): Promise<void> {
	let response: Response;
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);
		response = await fetch(videoUrl, {
			method: "HEAD",
			signal: controller.signal,
		});
		clearTimeout(timeoutId);
	} catch (_error) {
		// HEAD not supported or network error — skip validation
		return;
	}

	if (response.status === 405) return;

	if (!response.ok) {
		throw new Error(`Failed to fetch video: ${response.statusText}`);
	}

	const contentType = response.headers.get("content-type")?.split(";")[0]
		.trim();
	if (!contentType || !["video/quicktime", "video/mp4"].includes(contentType)) {
		throw new Error("Video format must be MOV or MP4");
	}

	const contentLength = response.headers.get("content-length");
	if (contentLength && parseInt(contentLength, 10) > 1024 * 1024 * 1024) {
		throw new Error("Video file size must not exceed 1 GB");
	}
}

function validateLinkUrl(url: string): void {
	// Pattern to ensure URL starts with http:// or https:// and has a valid domain
	const urlPattern = /^https?:\/\/[\w.-]+\.[a-zA-Z]{2,}/;

	if (!urlPattern.test(url)) {
		throw new Error(
			"Invalid URL format for linkAttachment. URL must start with http:// or https:// and contain a valid domain",
		);
	}
}
