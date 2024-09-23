// mod_test.ts
import type { ThreadsPostRequest } from "./types.ts";
import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.153.0/testing/asserts.ts";
import {
  createThreadsContainer,
  publishThreadsContainer,
  createCarouselItem,
  getPublishingLimit,
  getThreadsList,
  getSingleThread,
} from "./mod.ts";
import { MockThreadsAPI } from "./mock_threads_api.ts";

Deno.test("Threads API", async (t) => {
  let mockAPI: MockThreadsAPI;

  function setupMockAPI() {
    mockAPI = new MockThreadsAPI();
    (globalThis as { threadsAPI?: MockThreadsAPI }).threadsAPI = mockAPI;
  }

  function teardownMockAPI() {
    delete (globalThis as { threadsAPI?: MockThreadsAPI }).threadsAPI;
  }

  await t.step("createThreadsContainer", async (t) => {
    await t.step("should return container ID for basic text post", async () => {
      setupMockAPI();
      const requestData: ThreadsPostRequest = {
        userId: "12345",
        accessToken: "token",
        mediaType: "TEXT",
        text: "Hello, Threads!",
      };

      const result = await createThreadsContainer(requestData);
      if (typeof result === "string") {
        assertEquals(result.length > 0, true);
      } else {
        assertEquals(typeof result.id, "string");
        assertEquals(result.id.length > 0, true);
      }
      teardownMockAPI();
    });

    await t.step("should handle image post with alt text", async () => {
      setupMockAPI();
      const requestData: ThreadsPostRequest = {
        userId: "12345",
        accessToken: "token",
        mediaType: "IMAGE",
        text: "Check out this image!",
        imageUrl: "https://example.com/image.jpg",
        altText: "A beautiful sunset",
      };

      const containerId = await createThreadsContainer(requestData);
      if (typeof containerId === "string") {
        assertEquals(containerId.length > 0, true);
      } else {
        assertEquals(typeof containerId.id, "string");
        assertEquals(containerId.id.length > 0, true);
      }
      teardownMockAPI();
    });

    await t.step("should handle video post with all features", async () => {
      setupMockAPI();
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
      if (typeof containerId === "string") {
        assertEquals(containerId.length > 0, true);
      } else {
        assertEquals(typeof containerId.id, "string");
        assertEquals(containerId.id.length > 0, true);
      }
      teardownMockAPI();
    });

    await t.step("should throw error on failure", async () => {
      setupMockAPI();
      const requestData: ThreadsPostRequest = {
        userId: "12345",
        accessToken: "invalid_token",
        mediaType: "TEXT",
        text: "Hello, Threads!",
        linkAttachment: "https://example.com",
      };

      // Mock the error in the MockThreadsAPI
      mockAPI.setErrorMode(true);

      await assertRejects(
        () => createThreadsContainer(requestData),
        Error,
        "Failed to create Threads container"
      );
      teardownMockAPI();
    });

    await t.step(
      "should throw error when CAROUSEL type is used without children",
      async () => {
        const requestData: ThreadsPostRequest = {
          userId: "12345",
          accessToken: "token",
          mediaType: "CAROUSEL",
          text: "This carousel has no items",
        };

        await assertRejects(
          async () => await createThreadsContainer(requestData),
          Error,
          "CAROUSEL media type requires at least 2 children"
        );
      }
    );

    await t.step(
      "should throw error when imageUrl is provided for non-IMAGE type",
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

    await t.step(
      "should throw error when videoUrl is provided for non-VIDEO type",
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

    await t.step(
      "should throw error when linkAttachment is provided for non-TEXT type",
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

    await t.step(
      "should throw error when children is provided for non-CAROUSEL type",
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
  });

  await t.step("publishThreadsContainer", async (t) => {
    await t.step("should publish container successfully", async () => {
      setupMockAPI();
      const userId = "12345";
      const accessToken = "token";
      const containerId = await createThreadsContainer({
        userId,
        accessToken,
        mediaType: "TEXT",
        text: "Test post",
      });

      const result = await publishThreadsContainer(
        userId,
        accessToken,
        typeof containerId === "string" ? containerId : containerId.id
      );
      if (typeof result === "string") {
        assertEquals(result.length > 0, true);
      } else {
        assertEquals(typeof result.id, "string");
        assertEquals(result.id.length > 0, true);
      }
      teardownMockAPI();
    });

    await t.step("should throw error on failure", async () => {
      setupMockAPI();
      const userId = "12345";
      const accessToken = "invalid_token";
      const containerId = "invalid_container";

      // Mock the error in the MockThreadsAPI
      mockAPI.setErrorMode(true);

      await assertRejects(
        () => publishThreadsContainer(userId, accessToken, containerId),
        Error,
        "Failed to publish Threads container"
      );
      teardownMockAPI();
    });
  });

  await t.step("createCarouselItem", async (t) => {
    await t.step("should return item ID", async () => {
      setupMockAPI();
      const requestData = {
        userId: "12345",
        accessToken: "token",
        mediaType: "IMAGE" as const,
        imageUrl: "https://example.com/image.jpg",
        altText: "Test image",
      };

      const itemId = await createCarouselItem(requestData);
      if (typeof itemId === "string") {
        assertEquals(itemId.length > 0, true);
      } else {
        assertEquals(typeof itemId.id, "string");
        assertEquals(itemId.id.length > 0, true);
      }
      teardownMockAPI();
    });

    await t.step("should handle video items", async () => {
      setupMockAPI();
      const requestData = {
        userId: "12345",
        accessToken: "token",
        mediaType: "VIDEO" as const,
        videoUrl: "https://example.com/video.mp4",
        altText: "Test video",
      };

      const itemId = await createCarouselItem(requestData);
      if (typeof itemId === "string") {
        assertEquals(itemId.length > 0, true);
      } else {
        assertEquals(typeof itemId.id, "string");
        assertEquals(itemId.id.length > 0, true);
      }
      teardownMockAPI();
    });
  });

  await t.step("getThreadsList", async () => {
    setupMockAPI();
    const userId = "12345";
    const accessToken = "valid_token";

    // Create some test posts
    await createThreadsContainer({
      userId,
      accessToken,
      mediaType: "TEXT",
      text: "Test post 1",
    });
    await createThreadsContainer({
      userId,
      accessToken,
      mediaType: "TEXT",
      text: "Test post 2",
    });

    const result = await getThreadsList(userId, accessToken);
    assertEquals(Array.isArray(result.data), true);
    assertEquals(result.data.length > 0, true);
    assertEquals(result.data[0].text, "Test post 1");
    assertEquals(result.data[1].text, "Test post 2");
    if (result.paging) {
      assertEquals(typeof result.paging.cursors.before, "string");
      assertEquals(typeof result.paging.cursors.after, "string");
    }
    teardownMockAPI();
  });

  await t.step("getSingleThread", async () => {
    setupMockAPI();
    const userId = "12345";
    const accessToken = "valid_token";
    const testText = "Test post for getSingleThread";

    const containerId = await createThreadsContainer({
      userId,
      accessToken,
      mediaType: "TEXT",
      text: testText,
    });
    const mediaId = await publishThreadsContainer(
      userId,
      accessToken,
      typeof containerId === "string" ? containerId : containerId.id
    );

    const result = await getSingleThread(
      typeof mediaId === "string" ? mediaId : mediaId.id,
      accessToken
    );
    assertEquals(typeof result.id, "string");
    assertEquals(result.text, testText);
    teardownMockAPI();
  });

  await t.step("getPublishingLimit", async (t) => {
    await t.step("should return rate limit information", async () => {
      setupMockAPI();
      const userId = "12345";
      const accessToken = "valid_token";

      const result = await getPublishingLimit(userId, accessToken);
      assertEquals(typeof result.quota_usage, "number");
      assertEquals(typeof result.config.quota_total, "number");
      assertEquals(typeof result.config.quota_duration, "number");
      teardownMockAPI();
    });

    await t.step("should throw error on failure", async () => {
      setupMockAPI();
      const userId = "12345";
      const accessToken = "invalid_token";

      // Mock the error in the MockThreadsAPI
      mockAPI.setErrorMode(true);

      await assertRejects(
        () => getPublishingLimit(userId, accessToken),
        Error,
        "Failed to get publishing limit"
      );
      teardownMockAPI();
    });
  });
});
