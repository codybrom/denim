// mod_test.ts
import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.153.0/testing/asserts.ts";
import {
  createThreadsContainer,
  publishThreadsContainer,
  createCarouselItem,
  getPublishingLimit,
  type ThreadsPostRequest,
} from "./mod.ts";

// Mock fetch response
globalThis.fetch = (
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
      ? input.toString()
      : input.url;

  const body =
    init?.body instanceof URLSearchParams ? init.body : new URLSearchParams();

  if (url.includes("threads")) {
    if (url.includes("threads_publish")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        text: () => Promise.resolve(JSON.stringify({ id: "published123" })),
      } as Response);
    }

    if (body.get("is_carousel_item") === "true") {
      if (body.get("access_token") === "invalid_token") {
        return Promise.resolve({
          ok: false,
          status: 400,
          statusText: "Bad Request",
          text: () =>
            Promise.resolve(JSON.stringify({ error: "Invalid access token" })),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        text: () => Promise.resolve(JSON.stringify({ id: "item123" })),
      } as Response);
    }

    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      text: () => Promise.resolve(JSON.stringify({ id: "container123" })),
    } as Response);
  }

  return Promise.resolve({
    ok: false,
    status: 500,
    statusText: "Internal Server Error",
    text: () => Promise.resolve("Error"),
  } as Response);
};

Deno.test(
  "createThreadsContainer should return container ID for basic text post",
  async () => {
    const requestData: ThreadsPostRequest = {
      userId: "12345",
      accessToken: "token",
      mediaType: "TEXT",
      text: "Hello, Threads!",
    };

    const containerId = await createThreadsContainer(requestData);
    assertEquals(containerId, "container123");
  }
);

Deno.test(
  "createThreadsContainer should return container ID with text post with link attachment, reply control, and allowlisted countries",
  async () => {
    const requestData: ThreadsPostRequest = {
      userId: "12345",
      accessToken: "token",
      mediaType: "TEXT",
      text: "Hello, Threads!",
      linkAttachment: "https://example.com",
      replyControl: "everyone",
      allowlistedCountryCodes: ["US", "CA"],
    };

    const containerId = await createThreadsContainer(requestData);
    assertEquals(containerId, "container123");
  }
);

Deno.test(
  "createThreadsContainer should handle image post with alt text",
  async () => {
    const requestData: ThreadsPostRequest = {
      userId: "12345",
      accessToken: "token",
      mediaType: "IMAGE",
      text: "Check out this image!",
      imageUrl: "https://example.com/image.jpg",
      altText: "A beautiful sunset",
    };

    const containerId = await createThreadsContainer(requestData);
    assertEquals(containerId, "container123");
  }
);

Deno.test(
  "createThreadsContainer should handle video post with all features",
  async () => {
    const requestData: ThreadsPostRequest = {
      userId: "12345",
      accessToken: "token",
      mediaType: "VIDEO",
      text: "Watch this video!",
      videoUrl: "https://example.com/video.mp4",
      altText: "A tutorial video",
      replyControl: "mentioned_only",
      allowlistedCountryCodes: ["US", "GB"],
    };

    const containerId = await createThreadsContainer(requestData);
    assertEquals(containerId, "container123");
  }
);

Deno.test("createThreadsContainer should throw error on failure", async () => {
  const requestData: ThreadsPostRequest = {
    userId: "12345",
    accessToken: "token",
    mediaType: "TEXT",
    text: "Hello, Threads!",
    linkAttachment: "https://example.com",
  };

  globalThis.fetch = (): Promise<Response> =>
    Promise.resolve({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: () => Promise.resolve("Error"),
    } as Response);

  await assertRejects(
    async () => {
      await createThreadsContainer(requestData);
    },
    Error,
    "Failed to create Threads container"
  );
});
Deno.test("createCarouselItem should return item ID", async () => {
  const requestData = {
    userId: "12345",
    accessToken: "token",
    mediaType: "IMAGE" as const,
    imageUrl: "https://example.com/image.jpg",
    altText: "Test image",
  };

  globalThis.fetch = (
    _input: string | URL | Request,
    init?: RequestInit
  ): Promise<Response> => {
    const body =
      init?.body instanceof URLSearchParams ? init.body : new URLSearchParams();
    if (body.get("is_carousel_item") === "true") {
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        text: () => Promise.resolve(JSON.stringify({ id: "item123" })),
      } as Response);
    }
    return Promise.resolve({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: () => Promise.resolve("Error"),
    } as Response);
  };

  const itemId = await createCarouselItem(requestData);
  assertEquals(itemId, "item123");
});

Deno.test("createCarouselItem should handle video items", async () => {
  const requestData = {
    userId: "12345",
    accessToken: "token",
    mediaType: "VIDEO" as const,
    videoUrl: "https://example.com/video.mp4",
    altText: "Test video",
  };

  globalThis.fetch = (
    _input: string | URL | Request,
    init?: RequestInit
  ): Promise<Response> => {
    const body =
      init?.body instanceof URLSearchParams ? init.body : new URLSearchParams();
    if (body.get("is_carousel_item") === "true") {
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        text: () => Promise.resolve(JSON.stringify({ id: "item123" })),
      } as Response);
    }
    return Promise.resolve({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: () => Promise.resolve("Error"),
    } as Response);
  };

  const itemId = await createCarouselItem(requestData);
  assertEquals(itemId, "item123");
});

Deno.test("createThreadsContainer should handle carousel post", async () => {
  const requestData: ThreadsPostRequest = {
    userId: "12345",
    accessToken: "token",
    mediaType: "CAROUSEL",
    text: "Check out this carousel!",
    children: ["item123", "item456"],
    replyControl: "everyone",
    allowlistedCountryCodes: ["US", "CA"],
  };

  const containerId = await createThreadsContainer(requestData);
  assertEquals(containerId, "container123");
});

Deno.test("createCarouselItem should throw error on failure", async () => {
  const requestData = {
    userId: "12345",
    accessToken: "invalid_token",
    mediaType: "IMAGE" as const,
    imageUrl: "https://example.com/image.jpg",
  };

  await assertRejects(
    () => createCarouselItem(requestData),
    Error,
    "Failed to create carousel item"
  );
});

Deno.test("publishThreadsContainer should return published ID", async () => {
  const userId = "12345";
  const accessToken = "token";
  const containerId = "container123";

  const publishedId = await publishThreadsContainer(
    userId,
    accessToken,
    containerId
  );
  assertEquals(publishedId, "published123");
});

Deno.test("publishThreadsContainer should throw error on failure", async () => {
  const userId = "12345";
  const accessToken = "token";
  const containerId = "container123";

  globalThis.fetch = (
    _input: string | URL | Request,
    _init?: RequestInit
  ): Promise<Response> =>
    Promise.resolve({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: () => Promise.resolve("Error"),
    } as Response);

  await assertRejects(
    async () => {
      await publishThreadsContainer(userId, accessToken, containerId);
    },
    Error,
    "Failed to publish Threads container"
  );
});

Deno.test(
  "createThreadsContainer should throw error when imageUrl is provided for non-IMAGE type",
  async () => {
    const requestData: ThreadsPostRequest = {
      userId: "12345",
      accessToken: "token",
      mediaType: "TEXT",
      text: "This shouldn't work",
      imageUrl: "https://example.com/image.jpg",
    };

    await assertRejects(
      () => createThreadsContainer(requestData),
      Error,
      "imageUrl can only be used with IMAGE media type"
    );
  }
);

Deno.test(
  "createThreadsContainer should throw error when videoUrl is provided for non-VIDEO type",
  async () => {
    const requestData: ThreadsPostRequest = {
      userId: "12345",
      accessToken: "token",
      mediaType: "IMAGE",
      imageUrl: "https://example.com/image.jpg",
      videoUrl: "https://example.com/video.mp4",
    };

    await assertRejects(
      () => createThreadsContainer(requestData),
      Error,
      "videoUrl can only be used with VIDEO media type"
    );
  }
);

Deno.test(
  "createThreadsContainer should throw error when linkAttachment is provided for non-TEXT type",
  async () => {
    const requestData: ThreadsPostRequest = {
      userId: "12345",
      accessToken: "token",
      mediaType: "IMAGE",
      imageUrl: "https://example.com/image.jpg",
      linkAttachment: "https://example.com",
    };

    await assertRejects(
      () => createThreadsContainer(requestData),
      Error,
      "linkAttachment can only be used with TEXT media type"
    );
  }
);

Deno.test(
  "createThreadsContainer should throw error when children is provided for non-CAROUSEL type",
  async () => {
    const requestData: ThreadsPostRequest = {
      userId: "12345",
      accessToken: "token",
      mediaType: "IMAGE",
      imageUrl: "https://example.com/image.jpg",
      children: ["item1", "item2"],
    };

    await assertRejects(
      async () => {
        await createThreadsContainer(requestData);
      },
      Error,
      "Failed to create Threads container"
    );
  }
);

Deno.test(
  "createThreadsContainer should throw error when CAROUSEL type is used without children",
  async () => {
    const requestData: ThreadsPostRequest = {
      userId: "12345",
      accessToken: "token",
      mediaType: "CAROUSEL",
      text: "This carousel has no items",
    };

    await assertRejects(
      async () => {
        await createThreadsContainer(requestData);
      },
      Error,
      "Failed to create Threads container"
    );
  }
);

Deno.test(
  "createThreadsContainer should not throw error when attributes are used correctly",
  async () => {
    const textRequest: ThreadsPostRequest = {
      userId: "12345",
      accessToken: "token",
      mediaType: "TEXT",
      text: "This is a text post",
      linkAttachment: "https://example.com",
    };

    const imageRequest: ThreadsPostRequest = {
      userId: "12345",
      accessToken: "token",
      mediaType: "IMAGE",
      imageUrl: "https://example.com/image.jpg",
      altText: "An example image",
    };

    const videoRequest: ThreadsPostRequest = {
      userId: "12345",
      accessToken: "token",
      mediaType: "VIDEO",
      videoUrl: "https://example.com/video.mp4",
      altText: "An example video",
    };

    const carouselRequest: ThreadsPostRequest = {
      userId: "12345",
      accessToken: "token",
      mediaType: "CAROUSEL",
      text: "A carousel post",
      children: ["item1", "item2"],
    };

    const textContainerId = await createThreadsContainer(textRequest);
    const imageContainerId = await createThreadsContainer(imageRequest);
    const videoContainerId = await createThreadsContainer(videoRequest);
    const carouselContainerId = await createThreadsContainer(carouselRequest);

    assertEquals(textContainerId, "container123");
    assertEquals(imageContainerId, "container123");
    assertEquals(videoContainerId, "container123");
    assertEquals(carouselContainerId, "container123");
  }
);

Deno.test(
  "getPublishingLimit should return rate limit information",
  async () => {
    const userId = "12345";
    const accessToken = "valid_token";

    globalThis.fetch = (_input: string | URL | Request): Promise<Response> => {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            data: [
              {
                quota_usage: 10,
                config: {
                  quota_total: 250,
                  quota_duration: 86400,
                },
              },
            ],
          }),
      } as Response);
    };

    const result = await getPublishingLimit(userId, accessToken);
    assertEquals(result.quota_usage, 10);
    assertEquals(result.config.quota_total, 250);
    assertEquals(result.config.quota_duration, 86400);
  }
);

Deno.test("getPublishingLimit should throw error on failure", async () => {
  const userId = "12345";
  const accessToken = "invalid_token";

  globalThis.fetch = (_input: string | URL | Request): Promise<Response> => {
    return Promise.resolve({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: () =>
        Promise.resolve({ error: { message: "Invalid access token" } }),
    } as Response);
  };

  await assertRejects(
    () => getPublishingLimit(userId, accessToken),
    Error,
    "Failed to get publishing limit"
  );
});
