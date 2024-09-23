// mod.ts
import type {
  ThreadsPostRequest,
  PublishingLimit,
  ThreadsPost,
  ThreadsListResponse,
  MockThreadsAPI,
} from "./types.ts";
export type {
  ThreadsPostRequest,
  PublishingLimit,
  ThreadsPost,
  ThreadsListResponse,
};

/**
 * Retrieves the mock API instance if available.
 *
 * @returns The mock API instance or null if not available
 */
function getAPI(): MockThreadsAPI | null {
  return (globalThis as { threadsAPI?: MockThreadsAPI }).threadsAPI || null;
}

/**
 * @module
 *
 * This module provides functions to interact with the Threads API,
 * allowing users to create and publish posts on Threads.
 */

/** The base URL for the Threads API */
export const THREADS_API_BASE_URL = "https://graph.threads.net/v1.0";

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
  request: ThreadsPostRequest
): Promise<string | { id: string; permalink: string }> {
  const api = getAPI();
  if (api) {
    // Use mock API
    return api.createThreadsContainer(request);
  }
  try {
    // Input validation
    validateRequest(request);

    const url = `${THREADS_API_BASE_URL}/${request.userId}/threads`;
    const body = new URLSearchParams({
      access_token: request.accessToken,
      media_type: request.mediaType,
    });

    // Add common optional parameters
    if (request.text) body.append("text", request.text);
    if (request.altText) body.append("alt_text", request.altText);
    if (request.replyControl)
      body.append("reply_control", request.replyControl);
    if (request.allowlistedCountryCodes) {
      body.append(
        "allowlisted_country_codes",
        request.allowlistedCountryCodes.join(",")
      );
    }

    // Handle media type specific parameters
    if (request.mediaType === "VIDEO" && request.videoUrl) {
      const videoItemId = await createVideoItemContainer(request);
      body.set("media_type", "CAROUSEL");
      body.append("children", videoItemId);
    } else if (request.mediaType === "IMAGE" && request.imageUrl) {
      body.append("image_url", request.imageUrl);
    } else if (request.mediaType === "TEXT" && request.linkAttachment) {
      body.append("link_attachment", request.linkAttachment);
    } else if (request.mediaType === "CAROUSEL" && request.children) {
      body.append("children", request.children.join(","));
    }

    console.log(`Sending request to: ${url}`);
    console.log(`Request body: ${body.toString()}`);

    const response = await fetch(url, {
      method: "POST",
      body: body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const responseText = await response.text();

    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log(`Response body: ${responseText}`);

    if (!response.ok) {
      throw new Error(`Internal Server Error. Details: ${responseText}`);
    }

    const data = JSON.parse(responseText);

    // If getPermalink is true, fetch the permalink
    if (request.getPermalink) {
      const threadData = await getSingleThread(data.id, request.accessToken);
      return {
        id: data.id,
        permalink: threadData.permalink || "",
      };
    } else {
      return data.id;
    }
  } catch (error) {
    // Access error message safely
    const errorMessage =
      error instanceof Error ? error.message : "Unknown Error";
    throw new Error(`Failed to create Threads container: ${errorMessage}`);
  }
}

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
 * validateRequest(request); // This will not throw an error
 *
 * const invalidRequest: ThreadsPostRequest = {
 *   userId: "123456",
 *   accessToken: "your_access_token",
 *   mediaType: "TEXT",
 *   imageUrl: "https://example.com/image.jpg"
 * };
 * validateRequest(invalidRequest); // This will throw an error
 * ```
 */
function validateRequest(request: ThreadsPostRequest): void {
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
}

/**
 * Creates a video item container for Threads.
 *
 * @param request - The ThreadsPostRequest object containing video post details
 * @returns A Promise that resolves to the video item container ID
 * @throws Will throw an error if the API request fails
 */
async function createVideoItemContainer(
  request: ThreadsPostRequest
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
      `Failed to create video item container: ${response.statusText}. Details: ${responseText}`
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
 * const itemId = await createCarouselItem(itemRequest);
 * ```
 */
export async function createCarouselItem(
  request: Omit<ThreadsPostRequest, "mediaType"> & {
    mediaType: "IMAGE" | "VIDEO";
  }
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
 * Checks the status of a Threads container.
 *
 * @param containerId - The ID of the container to check
 * @param accessToken - The access token for authentication
 * @returns A Promise that resolves to the container status
 * @throws Will throw an error if the API request fails
 */
async function checkContainerStatus(
  containerId: string,
  accessToken: string
): Promise<string> {
  const url = `${THREADS_API_BASE_URL}/${containerId}?fields=status,error_message&access_token=${accessToken}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to check container status: ${response.statusText}`);
  }

  const data = await response.json();
  return data.status;
}

/**
 * Publishes a Threads media container.
 *
 * @param userId - The user ID of the Threads account
 * @param accessToken - The access token for authentication
 * @param containerId - The ID of the container to publish
 * @returns A Promise that resolves to the published container ID
 * @throws Will throw an error if the API request fails or if publishing times out
 *
 * @example
 * ```typescript
 * const publishedId = await publishThreadsContainer("123456", "your_access_token", "container_id");
 * ```
 */
export async function publishThreadsContainer(
  userId: string,
  accessToken: string,
  containerId: string,
  getPermalink: boolean = false
): Promise<string | { id: string; permalink: string }> {
  const api = getAPI();
  if (api) {
    // Use mock API
    return api.publishThreadsContainer(
      userId,
      accessToken,
      containerId,
      getPermalink
    );
  }
  try {
    const publishUrl = `${THREADS_API_BASE_URL}/${userId}/threads_publish`;
    const publishBody = new URLSearchParams({
      access_token: accessToken,
      creation_id: containerId,
    });

    const publishResponse = await fetch(publishUrl, {
      method: "POST",
      body: publishBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!publishResponse.ok) {
      throw new Error(
        `Failed to publish Threads container: ${publishResponse.statusText}`
      );
    }

    const publishData = await publishResponse.json();

    if (getPermalink) {
      const mediaId = publishData.id;
      const permalinkUrl = `${THREADS_API_BASE_URL}/${mediaId}?fields=permalink&access_token=${accessToken}`;
      const permalinkResponse = await fetch(permalinkUrl);

      if (permalinkResponse.ok) {
        const permalinkData = await permalinkResponse.json();
        return {
          id: mediaId,
          permalink: permalinkData.permalink,
        };
      } else {
        throw new Error("Failed to fetch permalink");
      }
    }

    // Check container status
    let status = await checkContainerStatus(containerId, accessToken);
    let attempts = 0;
    const maxAttempts = 5;

    while (
      status !== "PUBLISHED" &&
      status !== "FINISHED" &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
      status = await checkContainerStatus(containerId, accessToken);
      attempts++;
    }

    if (status === "ERROR") {
      throw new Error(`Failed to publish container. Error: ${status}`);
    }

    if (status !== "PUBLISHED" && status !== "FINISHED") {
      throw new Error(
        `Container not published after ${maxAttempts} attempts. Current status: ${status}`
      );
    }

    return publishData.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to publish Threads container: ${error.message}`);
    }
    throw error;
  }
}
/**
 * Serves HTTP requests to create and publish Threads posts.
 *
 * This function sets up a server that listens for POST requests
 * containing ThreadsPostRequest data. It creates a container and
 * immediately publishes it.
 *
 * @throws Will throw an error if the request is invalid or if there's an error during processing
 *
 * @example
 * ```typescript
 * // Start the server
 * serveRequests();
 * ```
 */
export function serveRequests() {
  const api = getAPI();

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

      let containerResult;
      let publishResult;

      if (api) {
        // Use mock API
        containerResult = await api.createThreadsContainer(requestData);
        publishResult = await api.publishThreadsContainer(
          requestData.userId,
          requestData.accessToken,
          typeof containerResult === "string"
            ? containerResult
            : containerResult.id,
          requestData.getPermalink
        );
      } else {
        // Use real API calls
        containerResult = await createThreadsContainer(requestData);
        if (typeof containerResult === "string") {
          publishResult = await publishThreadsContainer(
            requestData.userId,
            requestData.accessToken,
            containerResult,
            requestData.getPermalink
          );
        } else {
          publishResult = containerResult;
        }
      }

      let responseData;
      if (typeof publishResult === "string") {
        responseData = { success: true, publishedId: publishResult };
      } else {
        responseData = {
          success: true,
          publishedId: publishResult.id,
          permalink: publishResult.permalink,
        };
      }

      return new Response(JSON.stringify(responseData), {
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
 * @throws Will throw an error if the API request fails
 * @example
 * ```typescript
 * const rateLimit = await getPublishingLimit("123456", "your_access_token");
 * console.log(`Current usage: ${rateLimit.quota_usage}`);
 * ```
 */
export async function getPublishingLimit(
  userId: string,
  accessToken: string
): Promise<PublishingLimit> {
  const api = getAPI();
  if (api) {
    // Use mock API
    return api.getPublishingLimit(userId, accessToken);
  }
  const url = `${THREADS_API_BASE_URL}/${userId}/threads_publishing_limit`;
  const params = new URLSearchParams({
    access_token: accessToken,
    fields: "quota_usage,config",
  });

  const response = await fetch(`${url}?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to get publishing limit: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0];
}

/**
 * Retrieves a list of all threads created by a user.
 *
 * @param userId - The user ID of the Threads account
 * @param accessToken - The access token for authentication
 * @param options - Optional parameters for the request
 * @param options.since - Start date for fetching threads (ISO 8601 format)
 * @param options.until - End date for fetching threads (ISO 8601 format)
 * @param options.limit - Maximum number of threads to return
 * @param options.after - Cursor for pagination (next page)
 * @param options.before - Cursor for pagination (previous page)
 * @returns A Promise that resolves to the ThreadsListResponse
 * @throws Will throw an error if the API request fails
 */
export async function getThreadsList(
  userId: string,
  accessToken: string,
  options?: {
    since?: string;
    until?: string;
    limit?: number;
    after?: string;
    before?: string;
  }
): Promise<ThreadsListResponse> {
  const api = getAPI();
  if (api) {
    // Use mock API
    return api.getThreadsList(userId, accessToken, options);
  }
  const fields =
    "id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,shortcode,thumbnail_url,children,is_quote_post";
  const url = new URL(`${THREADS_API_BASE_URL}/${userId}/threads`);
  url.searchParams.append("fields", fields);
  url.searchParams.append("access_token", accessToken);

  if (options) {
    if (options.since) url.searchParams.append("since", options.since);
    if (options.until) url.searchParams.append("until", options.until);
    if (options.limit)
      url.searchParams.append("limit", options.limit.toString());
    if (options.after) url.searchParams.append("after", options.after);
    if (options.before) url.searchParams.append("before", options.before);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to retrieve threads list: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Retrieves a single Threads media object.
 *
 * @param mediaId - The ID of the Threads media object
 * @param accessToken - The access token for authentication
 * @returns A Promise that resolves to the ThreadsPost object
 * @throws Will throw an error if the API request fails
 */
export async function getSingleThread(
  mediaId: string,
  accessToken: string
): Promise<ThreadsPost> {
  const api = getAPI();
  if (api) {
    // Use mock API
    return api.getSingleThread(mediaId, accessToken);
  }
  const fields =
    "id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,shortcode,thumbnail_url,children,is_quote_post";
  const url = new URL(`${THREADS_API_BASE_URL}/${mediaId}`);
  url.searchParams.append("fields", fields);
  url.searchParams.append("access_token", accessToken);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to retrieve thread: ${response.statusText}`);
  }

  return await response.json();
}
