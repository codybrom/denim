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
  mediaType: "TEXT" | "IMAGE" | "VIDEO" | "CAROUSEL";
  /** The text content of the post (optional) */
  text?: string;
  /** The URL of the image to be posted (optional, for IMAGE type) */
  imageUrl?: string;
  /** The URL of the video to be posted (optional, for VIDEO type) */
  videoUrl?: string;
  /** The accessibility text for the image or video (optional) */
  altText?: string;
  /** The URL to be attached as a link to the post (optional, for text posts only) */
  linkAttachment?: string;
  /** List of country codes where the post should be visible (optional) */
  allowlistedCountryCodes?: string[];
  /** Controls who can reply to the post (optional) */
  replyControl?: "everyone" | "accounts_you_follow" | "mentioned_only";
  /** Array of carousel item IDs (required for CAROUSEL type, not applicable for other types) */
  children?: string[];
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
 *   mediaType: "CAROUSEL",
 *   text: "Check out this carousel!",
 *   children: ["item1", "item2"],
 *   allowlistedCountryCodes: ["US", "CA"],
 *   replyControl: "everyone"
 * };
 * const containerId = await createThreadsContainer(request);
 * ```
 */
export async function createThreadsContainer(
  request: ThreadsPostRequest
): Promise<string> {
  // Add input validation
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
  if (
    request.mediaType === "CAROUSEL" &&
    (!request.children || request.children.length < 2)
  ) {
    throw new Error("CAROUSEL media type requires at least 2 children");
  }

  const url = `${THREADS_API_BASE_URL}/${request.userId}/threads`;
  const body = new URLSearchParams({
    access_token: request.accessToken,
    media_type: request.mediaType,
    ...(request.text && { text: request.text }),
    ...(request.mediaType === "IMAGE" &&
      request.imageUrl && { image_url: request.imageUrl }),
    ...(request.mediaType === "VIDEO" &&
      request.videoUrl && { video_url: request.videoUrl }),
    ...(request.altText && { alt_text: request.altText }),
    ...(request.mediaType === "TEXT" &&
      request.linkAttachment && { link_attachment: request.linkAttachment }),
    ...(request.allowlistedCountryCodes && {
      allowlisted_country_codes: request.allowlistedCountryCodes.join(","),
    }),
    ...(request.replyControl && { reply_control: request.replyControl }),
    ...(request.mediaType === "CAROUSEL" &&
      request.children && { children: request.children.join(",") }),
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
 * try {
 *   const itemId = await createCarouselItem(itemRequest);
 *   console.log(`Carousel item created with ID: ${itemId}`);
 * } catch (error) {
 *   console.error("Failed to create carousel item:", error);
 * }
 * ```
 */
export async function createCarouselItem(
  request: Omit<ThreadsPostRequest, "mediaType"> & {
    mediaType: "IMAGE" | "VIDEO";
  }
): Promise<string> {
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
      `Failed to create carousel item: ${response.statusText}. Details: ${responseText}`
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

/**
 * Retrieves the current publishing rate limit usage for a user.
 *
 * @param userId - The user ID of the Threads account
 * @param accessToken - The access token for authentication
 * @returns A Promise that resolves to the rate limit usage information
 */
export async function getPublishingLimit(
  userId: string,
  accessToken: string
): Promise<{
  quota_usage: number;
  config: {
    quota_total: number;
    quota_duration: number;
  };
}> {
  const url = `${THREADS_API_BASE_URL}/${userId}/threads_publishing_limit`;
  const params = new URLSearchParams({
    access_token: accessToken,
    fields: "quota_usage,config",
  });

  const response = await fetch(`${url}?${params}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Failed to get publishing limit: ${
        data.error?.message || response.statusText
      }`
    );
  }

  return data.data[0];
}

/**
 * Checks the health status of the Threads API.
 *
 * @returns A Promise that resolves to the health status
 */
export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetch(`${THREADS_API_BASE_URL}/health`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Health check failed: ${data.error?.message || response.statusText}`
    );
  }

  return data;
}
