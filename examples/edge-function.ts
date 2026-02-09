// examples/edge-function.ts

import {
	createCarouselItem,
	createThreadsContainer,
	getPublishingLimit,
	publishThreadsContainer,
	type ThreadsPostRequest,
} from "@codybrom/denim";

async function postToThreads(
	request: ThreadsPostRequest,
): Promise<{ id: string; permalink: string }> {
	try {
		// Check rate limit
		const rateLimit = await getPublishingLimit(
			request.userId,
			request.accessToken,
		);
		if (
			(rateLimit.quota_usage ?? 0) >= (rateLimit.config?.quota_total ?? 250)
		) {
			throw new Error("Rate limit exceeded. Please try again later.");
		}

		if (request.mediaType === "VIDEO" && request.videoUrl) {
			delete request.imageUrl;
		}

		const containerId = await createThreadsContainer(request);
		console.log(`Container created with ID: ${containerId}`);

		const publishedResult = await publishThreadsContainer(
			request.userId,
			request.accessToken,
			containerId,
			true, // Get permalink
		);

		console.log(
			`Post published with ID: ${
				typeof publishedResult === "string"
					? publishedResult
					: publishedResult.id
			}`,
		);

		if (typeof publishedResult === "string") {
			return { id: publishedResult, permalink: "" };
		}

		return {
			id: publishedResult.id,
			permalink: publishedResult.permalink,
		};
	} catch (error) {
		console.error("Error posting to Threads:", error);
		throw error;
	}
}

Deno.serve(async (req: Request) => {
	const url = new URL(req.url);
	const paths = url.pathname.split("/").filter((segment) => segment !== "");

	switch (req.method) {
		case "GET": {
			switch (paths[1]) {
				case "rate-limit": {
					const userId = url.searchParams.get("userId");
					const accessToken = url.searchParams.get("accessToken");
					if (!userId || !accessToken) {
						return new Response(
							JSON.stringify({ error: "Missing userId or accessToken" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							},
						);
					}
					try {
						const rateLimit = await getPublishingLimit(userId, accessToken);
						return new Response(JSON.stringify(rateLimit), {
							status: 200,
							headers: { "Content-Type": "application/json" },
						});
					} catch (error: unknown) {
						const message = error instanceof Error
							? error.message
							: String(error);
						return new Response(JSON.stringify({ error: message }), {
							status: 500,
							headers: { "Content-Type": "application/json" },
						});
					}
				}
				default: {
					return new Response("Not Found", { status: 404 });
				}
			}
		}
		case "POST": {
			if (paths[1] === "post") {
				try {
					const body = await req.json();
					if (!body.userId || !body.accessToken || !body.mediaType) {
						return new Response(
							JSON.stringify({
								success: false,
								error: "Missing required fields",
							}),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							},
						);
					}
					const postRequest: ThreadsPostRequest = {
						userId: body.userId,
						accessToken: body.accessToken,
						mediaType: body.mediaType,
						text: body.text,
						imageUrl: body.imageUrl,
						videoUrl: body.videoUrl,
						altText: body.altText,
						linkAttachment: body.linkAttachment,
						replyControl: body.replyControl,
						children: body.children,
					};
					if (postRequest.mediaType === "CAROUSEL" && body.carouselItems) {
						postRequest.children = [];
						for (const item of body.carouselItems) {
							const itemId = await createCarouselItem({
								userId: postRequest.userId,
								accessToken: postRequest.accessToken,
								mediaType: item.mediaType,
								imageUrl: item.imageUrl,
								videoUrl: item.videoUrl,
								altText: item.altText,
							});
							postRequest.children.push(itemId);
						}
					}
					const publishedResult = await postToThreads(postRequest);
					return new Response(
						JSON.stringify({
							success: true,
							id: publishedResult.id,
							permalink: publishedResult.permalink,
						}),
						{
							status: 200,
							headers: { "Content-Type": "application/json" },
						},
					);
				} catch (error: unknown) {
					console.error("Error processing request:", error);
					const message = error instanceof Error
						? error.message
						: String(error);
					return new Response(
						JSON.stringify({ success: false, error: message }),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			}
			return new Response("Not Found", { status: 404 });
		}
		default:
			return new Response("Method Not Allowed", { status: 405 });
	}
});

/*
  To use this example:

  1. Deploy this file to your serverless platform that supports Deno.

  2. Send requests to <YOUR_FUNCTION_URI> with the following endpoints:

     GET /rate-limit?userId=YOUR_USER_ID&accessToken=YOUR_ACCESS_TOKEN - Check rate limit
     POST /post - Create and publish a post (see below for details)

  Example curl commands:

  # Check rate limit
  curl -X GET "<YOUR_FUNCTION_URI>/rate-limit?userId=YOUR_USER_ID&accessToken=YOUR_ACCESS_TOKEN"

  # Post a text-only Thread
  curl -X POST <YOUR_FUNCTION_URI>/post \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "YOUR_USER_ID",
      "accessToken": "YOUR_ACCESS_TOKEN",
      "mediaType": "TEXT",
      "text": "Hello from Denim!",
      "linkAttachment": "https://example.com"
    }'

  # Post an image Thread with alt text
  curl -X POST <YOUR_FUNCTION_URI>/post \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "YOUR_USER_ID",
      "accessToken": "YOUR_ACCESS_TOKEN",
      "mediaType": "IMAGE",
      "text": "Check out this image I posted with Denim!",
      "imageUrl": "https://example.com/image.jpg",
      "altText": "A beautiful sunset over the ocean"
    }'

  # Post a video Thread with reply control
  curl -X POST <YOUR_FUNCTION_URI>/post \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "YOUR_USER_ID",
      "accessToken": "YOUR_ACCESS_TOKEN",
      "mediaType": "VIDEO",
      "text": "Watch this video I posted with Denim!",
      "videoUrl": "https://example.com/video.mp4",
      "replyControl": "mentioned_only"
    }'

  # Post a carousel Thread
  curl -X POST <YOUR_FUNCTION_URI>/post \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "YOUR_USER_ID",
      "accessToken": "YOUR_ACCESS_TOKEN",
      "mediaType": "CAROUSEL",
      "text": "Check out this carousel!",
      "carouselItems": [
        {
          "mediaType": "IMAGE",
          "imageUrl": "https://example.com/image1.jpg",
          "altText": "First image"
        },
        {
          "mediaType": "VIDEO",
          "videoUrl": "https://example.com/video.mp4",
          "altText": "A video"
        }
      ]
    }'

  Note: If both videoUrl and imageUrl are provided in a request with mediaType "VIDEO",
  the imageUrl will be ignored, and only the video will be posted.

  Security Note: Ensure that your function is deployed with appropriate access controls
  and authentication mechanisms to protect sensitive data like access tokens.
  */
