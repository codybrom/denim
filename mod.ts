/**
 * @module
 *
 * This module provides functions to interact with the Threads API,
 * allowing users to create and publish posts on Threads.
 */

/** The base URL for the Threads API */
export const THREADS_API_BASE_URL = "https://graph.threads.net/v1.0";

/**
 * Represents a request to post content on Threads.
 */
export interface ThreadsPostRequest {
  /** The user ID of the Threads account */
  userId: string;
  /** The access token for authentication */
  accessToken: string;
  /** The type of media being posted */
  mediaType: "TEXT" | "IMAGE" | "VIDEO";
  /** The text content of the post (optional) */
  text?: string;
  /** The URL of the image to be posted (optional) */
  imageUrl?: string;
  /** The URL of the video to be posted (optional) */
  videoUrl?: string;
}

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
 *   mediaType: "TEXT",
 *   text: "Hello, Threads!"
 * };
 * const containerId = await createThreadsContainer(request);
 * ```
 */
export async function createThreadsContainer(
  request: ThreadsPostRequest
): Promise<string> {
  const url = `${THREADS_API_BASE_URL}/${request.userId}/threads`;
  const body = new URLSearchParams({
    access_token: request.accessToken,
    media_type: request.mediaType,
    ...(request.text && { text: request.text }),
    ...(request.imageUrl && { image_url: request.imageUrl }),
    ...(request.videoUrl && { video_url: request.videoUrl }),
  });

  console.log(`Sending request to: ${url}`);
  console.log(`Request body: ${body.toString()}`);

  const response = await fetch(url, {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const responseText = await response.text();
  console.log(`Response status: ${response.status} ${response.statusText}`);
  console.log(`Response body: ${responseText}`);

  if (!response.ok) {
    throw new Error(
      `Failed to create Threads container: ${response.statusText}. Details: ${responseText}`
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

/**
 * Publishes a Threads media container.
 *
 * @param userId - The user ID of the Threads account
 * @param accessToken - The access token for authentication
 * @param containerId - The ID of the container to publish
 * @returns A Promise that resolves to the published post ID
 * @throws Will throw an error if the API request fails
 *
 * @example
 * ```typescript
 * const publishedId = await publishThreadsContainer("123456", "your_access_token", "container_id");
 * ```
 */
export async function publishThreadsContainer(
  userId: string,
  accessToken: string,
  containerId: string
): Promise<string> {
  const url = `${THREADS_API_BASE_URL}/${userId}/threads_publish`;
  const body = new URLSearchParams({
    access_token: accessToken,
    creation_id: containerId,
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
      `Failed to publish Threads container: ${response.statusText}. Details: ${responseText}`
    );
  }

  try {
    const data = JSON.parse(responseText);
    return data.id;
  } catch (error) {
    console.error(`Failed to parse publish response JSON: ${error}`);
    throw new Error(`Invalid response from Threads API: ${responseText}`);
  }
}

/**
 * Serves HTTP requests to create and publish Threads posts.
 *
 * This function sets up a server that listens for POST requests
 * containing ThreadsPostRequest data. It creates a container and
 * immediately publishes it.
 *
 * @example
 * ```typescript
 * // Start the server
 * serveRequests();
 * ```
 */
export function serveRequests() {
  Deno.serve(async (req) => {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const requestData: ThreadsPostRequest = await req.json();
      console.log(`Received request data: ${JSON.stringify(requestData)}`);

      if (
        !requestData.userId ||
        !requestData.accessToken ||
        !requestData.mediaType
      ) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required fields" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Create the Threads container
      const containerId = await createThreadsContainer(requestData);

      // Immediately attempt to publish the Threads container
      const publishedId = await publishThreadsContainer(
        requestData.userId,
        requestData.accessToken,
        containerId
      );

      return new Response(JSON.stringify({ success: true, publishedId }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error posting to Threads:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          stack: error.stack,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  });
}
