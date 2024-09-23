// types.ts

/**
 * Represents the types of media that can be posted on Threads.
 */
export type MediaType = "TEXT" | "IMAGE" | "VIDEO" | "CAROUSEL";

/**
 * Represents the options for controlling who can reply to a post.
 */
export type ReplyControl =
  | "everyone"
  | "accounts_you_follow"
  | "mentioned_only";

/**
 * Represents a request to post content on Threads.
 */
export interface ThreadsPostRequest {
  /** The user ID of the Threads account */
  userId: string;
  /** The access token for authentication */
  accessToken: string;
  /** The type of media being posted */
  mediaType: MediaType;
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
  /** List of country codes where the post should be visible (optional - requires special API access) */
  allowlistedCountryCodes?: string[];
  /** Controls who can reply to the post (optional) */
  replyControl?: ReplyControl;
  /** Array of carousel item IDs (required for CAROUSEL type, not applicable for other types) */
  children?: string[];
  /** Whether to return the permalink of the post (optional, default: false) */
  getPermalink?: boolean;
}

/**
 * Represents a single Threads media object.
 */
export interface ThreadsPost {
  /** Unique identifier for the media object */
  id: string;
  /** Type of product where the media is published (e.g., "THREADS") */
  media_product_type: string;
  /** Type of media (e.g., "TEXT", "IMAGE", "VIDEO", "CAROUSEL") */
  media_type: MediaType;
  /** URL of the media content (if applicable) */
  media_url?: string;
  /** Permanent link to the post */
  permalink?: string;
  /** Information about the owner of the post */
  owner: { id: string };
  /** Username of the account that created the post */
  username: string;
  /** Text content of the post */
  text?: string;
  /** Timestamp of when the post was created (ISO 8601 format) */
  timestamp: string;
  /** Short code identifier for the media */
  shortcode: string;
  /** URL of the thumbnail image (for video posts) */
  thumbnail_url?: string;
  /** List of child posts (for carousel posts) */
  children?: ThreadsPost[];
  /** Indicates if the post is a quote of another post */
  is_quote_post: boolean;
  /** Accessibility text for the image or video */
  altText?: string;
  /** URL of the attached link */
  linkAttachmentUrl?: string;
  /** Indicates if the post has replies */
  hasReplies: boolean;
  /** Indicates if the post is a reply to another post */
  isReply: boolean;
  /** Indicates if the reply is owned by the current user */
  isReplyOwnedByMe: boolean;
  /** Information about the root post (for replies) */
  rootPost?: { id: string };
  /** Information about the post being replied to */
  repliedTo?: { id: string };
  /** Visibility status of the post */
  hideStatus?: "VISIBLE" | "HIDDEN";
  /** Controls who can reply to the post */
  replyAudience?: ReplyControl;
}

/**
 * Represents the response structure when retrieving a list of Threads.
 */
export interface ThreadsListResponse {
  /** Array of ThreadsPost representing the retrieved posts */
  data: ThreadsPost[];
  /** Pagination information */
  paging?: {
    /** Cursors for navigating through pages of results */
    cursors: {
      /** Cursor for the previous page */
      before: string;
      /** Cursor for the next page */
      after: string;
    };
  };
}

/**
 * Represents the publishing limit information for a user.
 */
export interface PublishingLimit {
  /** Current usage count towards the quota */
  quota_usage: number;
  /** Configuration for the publishing limit */
  config: {
    /** Total allowed quota */
    quota_total: number;
    /** Duration of the quota period in seconds */
    quota_duration: number;
  };
}

/**
 * Represents a Threads media container.
 */
export interface ThreadsContainer {
  /** Unique identifier for the container */
  id: string;
  /** Permanent link to the container */
  permalink: string;
  /** Status of the container */
  status: "FINISHED" | "FAILED";
  /** Error message if the container failed */
  errorMessage?: string;
}

/**
 * Represents a Threads user profile.
 */
export interface ThreadsProfile {
  /** Unique identifier for the user */
  id: string;
  /** Username of the account */
  username: string;
  /** Display name of the user */
  name: string;
  /** URL of the user's profile picture */
  threadsProfilePictureUrl: string;
  /** Biography text of the user */
  threadsBiography: string;
}

/**
 * Represents the mock API for Threads operations.
 */
export interface MockThreadsAPI {
  /**
   * Creates a Threads media container.
   * @param request The request object containing post details
   * @returns A promise that resolves to either a string ID or an object with ID and permalink
   */
  createThreadsContainer(
    request: ThreadsPostRequest
  ): Promise<string | { id: string; permalink: string }>;

  /**
   * Publishes a Threads media container.
   * @param userId The user ID
   * @param accessToken The access token
   * @param containerId The ID of the container to publish
   * @param getPermalink Whether to return the permalink
   * @returns A promise that resolves to either a string ID or an object with ID and permalink
   */
  publishThreadsContainer(
    userId: string,
    accessToken: string,
    containerId: string,
    getPermalink?: boolean
  ): Promise<string | { id: string; permalink: string }>;

  /**
   * Creates a carousel item for a Threads post.
   * @param request The request object containing carousel item details
   * @returns A promise that resolves to either a string ID or an object with ID
   */
  createCarouselItem(
    request: Omit<ThreadsPostRequest, "mediaType"> & {
      mediaType: "IMAGE" | "VIDEO";
    }
  ): Promise<string | { id: string }>;

  /**
   * Retrieves the publishing limit for a user.
   * @param userId The user ID
   * @param accessToken The access token
   * @returns A promise that resolves to the publishing limit information
   */
  getPublishingLimit(
    userId: string,
    accessToken: string
  ): Promise<PublishingLimit>;

  /**
   * Retrieves a list of Threads posts for a user.
   * @param userId The user ID
   * @param accessToken The access token
   * @param options Optional parameters for pagination and date range
   * @returns A promise that resolves to the Threads list response
   */
  getThreadsList(
    userId: string,
    accessToken: string,
    options?: {
      since?: string;
      until?: string;
      limit?: number;
      after?: string;
      before?: string;
    }
  ): Promise<ThreadsListResponse>;

  /**
   * Retrieves a single Thread post.
   * @param mediaId The ID of the media to retrieve
   * @param accessToken The access token
   * @returns A promise that resolves to the Thread post
   */
  getSingleThread(mediaId: string, accessToken: string): Promise<ThreadsPost>;
}
