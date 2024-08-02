// examples/edge-function.ts

import {
  createThreadsContainer,
  publishThreadsContainer,
  type ThreadsPostRequest,
} from "../mod.ts";

async function postToThreads(request: ThreadsPostRequest): Promise<string> {
  try {
    if (request.mediaType === "VIDEO" && request.videoUrl) {
      delete request.imageUrl;
    }

    const containerId = await createThreadsContainer(request);
    console.log(`Container created with ID: ${containerId}`);

    const publishedId = await publishThreadsContainer(
      request.userId,
      request.accessToken,
      containerId
    );
    console.log(`Post published with ID: ${publishedId}`);

    return publishedId;
  } catch (error) {
    console.error("Error posting to Threads:", error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  // Health check endpoint
  if (req.method === "GET" && new URL(req.url).pathname === "/health") {
    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Log incoming request (without sensitive data)
  console.log(`Received ${req.method} request to ${new URL(req.url).pathname}`);

  try {
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON in request body",
          details: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!body.userId || !body.accessToken || !body.mediaType) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const postRequest: ThreadsPostRequest = {
      userId: body.userId,
      accessToken: body.accessToken,
      mediaType: body.mediaType,
      text: body.text,
      imageUrl: body.imageUrl,
      videoUrl: body.videoUrl,
    };

    const publishedId = await postToThreads(postRequest);

    return new Response(JSON.stringify({ success: true, publishedId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

/*
  To use this example:
  
  1. Deploy this file to your serverless platform that supports Deno.
  
  2. Send POST requests to <YOUR_FUNCTION_URI> with JSON body containing:
     - YOUR_AUTH_KEY: Your custom authorization key (if used, otherwise remove the header)
     - userId: Your Threads user ID
     - accessToken: Your Threads API access token
     - mediaType: "TEXT", "IMAGE", or "VIDEO"
     - text: The text content of your post
     - imageUrl: URL of the image (for IMAGE posts)
     - videoUrl: URL of the video (for VIDEO posts)
  
  Example curl commands:
  
  # Post a text-only Thread
  curl -X POST <YOUR_FUNCTION_URI> \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_AUTH_KEY" \
    -d '{
      "userId": "YOUR_USER_ID",
      "accessToken": "YOUR_ACCESS_TOKEN",
      "mediaType": "TEXT",
      "text": "Hello from Denim!"
    }'
  
  # Post an image Thread
  curl -X POST <YOUR_FUNCTION_URI> \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_AUTH_KEY" \
    -d '{
      "userId": "YOUR_USER_ID",
      "accessToken": "YOUR_ACCESS_TOKEN",
      "mediaType": "IMAGE",
      "text": "Check out this image I posted with Denim!",
      "imageUrl": "https://example.com/image.jpg"
    }'
  
  # Post a video Thread
  curl -X POST <YOUR_FUNCTION_URI> \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_AUTH_KEY" \
    -d '{
      "userId": "YOUR_USER_ID",
      "accessToken": "YOUR_ACCESS_TOKEN",
      "mediaType": "VIDEO",
      "text": "Watch this video I posted with Denim!",
      "videoUrl": "https://example.com/video.mp4"
    }'
  
  Note: If both videoUrl and imageUrl are provided in a request with mediaType "VIDEO",
  the imageUrl will be ignored, and only the video will be posted.
  
  Security Note: Ensure that your function is deployed with appropriate access controls
  and authentication mechanisms to protect sensitive data like access tokens.
  */
