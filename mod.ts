export const THREADS_API_BASE_URL = "https://graph.threads.net/v1.0";

export interface ThreadsPostRequest {
  userId: string;
  accessToken: string;
  mediaType: "TEXT" | "IMAGE" | "VIDEO";
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
}

// Create a Threads media container
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

// Publish a Threads media container
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

// Serve the requests
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
