// mock_threads_api.ts

import type {
  ThreadsContainer,
  ThreadsPost,
  ThreadsProfile,
  PublishingLimit,
  ThreadsPostRequest,
  ThreadsListResponse,
} from "./types.ts";

export class MockThreadsAPI implements MockThreadsAPI {
  private containers: Map<string, ThreadsContainer> = new Map();
  private posts: Map<string, ThreadsPost> = new Map();
  private users: Map<string, ThreadsProfile> = new Map();
  private publishingLimits: Map<string, PublishingLimit> = new Map();
  private errorMode = false;

  constructor() {
    // Initialize with some sample data
    this.users.set("12345", {
      id: "12345",
      username: "testuser",
      name: "Test User",
      threadsProfilePictureUrl: "https://example.com/profile.jpg",
      threadsBiography: "This is a test user",
    });

    this.publishingLimits.set("12345", {
      quota_usage: 10,
      config: {
        quota_total: 250,
        quota_duration: 86400,
      },
    });
  }

  setErrorMode(mode: boolean) {
    this.errorMode = mode;
  }

  createThreadsContainer(
    request: ThreadsPostRequest
  ): Promise<string | { id: string; permalink: string }> {
    if (this.errorMode) {
      return Promise.reject(new Error("Failed to create Threads container"));
    }
    const containerId = `container_${Math.random().toString(36).substring(7)}`;
    const permalink = `https://www.threads.net/@${request.userId}/post/${containerId}`;
    const container: ThreadsContainer = {
      id: containerId,
      permalink,
      status: "FINISHED",
    };
    this.containers.set(containerId, container);

    // Create a post immediately when creating a container
    const postId = `post_${Math.random().toString(36).substring(7)}`;
    const post: ThreadsPost = {
      id: postId,
      media_product_type: "THREADS",
      media_type: request.mediaType,
      permalink,
      owner: { id: request.userId },
      username: "testuser",
      text: request.text || "",
      timestamp: new Date().toISOString(),
      shortcode: postId,
      is_quote_post: false,
      hasReplies: false,
      isReply: false,
      isReplyOwnedByMe: false,
    };
    this.posts.set(postId, post);

    // Always return an object with both id and permalink
    return Promise.resolve({ id: containerId, permalink });
  }

  publishThreadsContainer(
    _userId: string,
    _accessToken: string,
    containerId: string,
    getPermalink: boolean = false
  ): Promise<string | { id: string; permalink: string }> {
    if (this.errorMode) {
      return Promise.reject(new Error("Failed to publish Threads container"));
    }
    const container = this.containers.get(containerId);
    if (!container) {
      return Promise.reject(new Error("Container not found"));
    }

    // Find the post associated with this container
    const existingPost = Array.from(this.posts.values()).find(
      (post) => post.permalink === container.permalink
    );

    if (!existingPost) {
      return Promise.reject(
        new Error("Post not found for the given container")
      );
    }

    return Promise.resolve(
      getPermalink
        ? { id: existingPost.id, permalink: existingPost.permalink || "" }
        : existingPost.id
    );
  }

  createCarouselItem(
    request: Omit<ThreadsPostRequest, "mediaType"> & {
      mediaType: "IMAGE" | "VIDEO";
    }
  ): Promise<string | { id: string }> {
    const itemId = `item_${Math.random().toString(36).substring(7)}`;
    const container: ThreadsContainer = {
      id: itemId,
      permalink: `https://www.threads.net/@${request.userId}/post/${itemId}`,
      status: "FINISHED",
    };
    this.containers.set(itemId, container);
    return Promise.resolve({ id: itemId });
  }

  getPublishingLimit(
    userId: string,
    _accessToken: string
  ): Promise<PublishingLimit> {
    if (this.errorMode) {
      return Promise.reject(new Error("Failed to get publishing limit"));
    }
    const limit = this.publishingLimits.get(userId);
    if (!limit) {
      return Promise.reject(new Error("Publishing limit not found"));
    }
    return Promise.resolve(limit);
  }

  getThreadsList(
    userId: string,
    _accessToken: string,
    options?: {
      since?: string;
      until?: string;
      limit?: number;
      after?: string;
      before?: string;
    }
  ): Promise<ThreadsListResponse> {
    const threads = Array.from(this.posts.values())
      .filter((post) => post.owner.id === userId)
      .slice(0, options?.limit || 25);

    return Promise.resolve({
      data: threads as ThreadsPost[],
      paging: {
        cursors: {
          before: "BEFORE_CURSOR",
          after: "AFTER_CURSOR",
        },
      },
    });
  }

  getSingleThread(mediaId: string, _accessToken: string): Promise<ThreadsPost> {
    const post = this.posts.get(mediaId);
    if (!post) {
      return Promise.reject(new Error("Thread not found"));
    }
    return Promise.resolve(post as ThreadsPost);
  }
}
