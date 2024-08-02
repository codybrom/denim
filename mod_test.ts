// mod_test.ts
import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.153.0/testing/asserts.ts";
import {
  createThreadsContainer,
  publishThreadsContainer,
  type ThreadsPostRequest,
} from "./mod.ts";

// Mock fetch response
globalThis.fetch = (
  input: string | URL | Request,
  _init?: RequestInit
): Promise<Response> => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
      ? input.toString()
      : input.url;

  if (url.includes("threads_publish")) {
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      text: () => Promise.resolve(JSON.stringify({ id: "published123" })),
    } as Response);
  } else if (url.includes("threads")) {
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

Deno.test("createThreadsContainer should return container ID", async () => {
  const requestData: ThreadsPostRequest = {
    userId: "12345",
    accessToken: "token",
    mediaType: "TEXT",
    text: "Hello, Threads!",
  };

  const containerId = await createThreadsContainer(requestData);
  assertEquals(containerId, "container123");
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

Deno.test("createThreadsContainer should throw error on failure", async () => {
  const requestData: ThreadsPostRequest = {
    userId: "12345",
    accessToken: "token",
    mediaType: "TEXT",
    text: "Hello, Threads!",
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
