// types.ts

// ─── Media & Reply Control ───────────────────────────────────────────────────

/**
 * Represents the types of media that can be posted on Threads.
 */
/**
 * Media types used when creating posts.
 */
export type MediaType = "TEXT" | "IMAGE" | "VIDEO" | "CAROUSEL";

/**
 * All media type values that can appear in API responses.
 * Responses use TEXT_POST (not TEXT) and CAROUSEL_ALBUM (not CAROUSEL).
 */
export type ResponseMediaType =
	| MediaType
	| "GIF"
	| "TEXT_POST"
	| "CAROUSEL_ALBUM"
	| "REPOST_FACADE"
	| "AUDIO";

/**
 * Represents the options for controlling who can reply to a post.
 */
export type ReplyControl =
	| "everyone"
	| "accounts_you_follow"
	| "mentioned_only"
	| "parent_post_author_only"
	| "followers_only";

// ─── Input Types (what callers pass in) ──────────────────────────────────────

/**
 * Options for poll attachments when creating a post.
 */
export interface PollAttachmentInput {
	/** First poll option (required) */
	option_a: string;
	/** Second poll option (required) */
	option_b: string;
	/** Third poll option (optional) */
	option_c?: string;
	/** Fourth poll option (optional) */
	option_d?: string;
}

/**
 * Represents a text entity for spoiler/styling annotations.
 */
export interface TextEntity {
	/** The type of entity (e.g., "spoiler") */
	entity_type: string;
	/** Character offset where the entity starts */
	offset: number;
	/** Length of the entity in characters */
	length: number;
}

/**
 * Input for text attachments (long-form text posts).
 */
export interface TextAttachmentInput {
	/** The plaintext content */
	plaintext: string;
	/** Optional URL to attach */
	link_attachment_url?: string;
	/** Optional styled text with formatting info */
	text_with_styling_info?: Array<{
		offset: number;
		length: number;
		styling_info: string[];
	}>;
}

/**
 * Input for GIF attachments.
 */
export interface GifAttachment {
	/** The GIF ID from the provider */
	gif_id: string;
	/** The GIF provider (e.g., "tenor") */
	provider: string;
}

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
	/** List of country codes where the post should be visible (optional) */
	allowlistedCountryCodes?: string[];
	/** Controls who can reply to the post (optional) */
	replyControl?: ReplyControl;
	/** Array of carousel item IDs (required for CAROUSEL type) */
	children?: string[];
	/** Whether to return the permalink of the post (optional, default: false) */
	getPermalink?: boolean;
	/** ID of the post to reply to (optional) */
	replyToId?: string;
	/** ID of the post to quote (optional) */
	quotePostId?: string;
	/** Poll options (optional, TEXT posts only) */
	pollAttachment?: PollAttachmentInput;
	/** Auto-publish text posts without the separate publish step (optional, TEXT only) */
	autoPublishText?: boolean;
	/** Topic tag for the post (optional, no periods or ampersands) */
	topicTag?: string;
	/** Whether the media is a spoiler (optional) */
	isSpoilerMedia?: boolean;
	/** Text entity annotations for spoilers/styling (optional, max 10) */
	textEntities?: TextEntity[];
	/** Long-form text attachment (optional, TEXT posts only) */
	textAttachment?: TextAttachmentInput;
	/** GIF attachment (optional, TEXT posts only) */
	gifAttachment?: GifAttachment;
	/** Whether the post is a ghost post (optional, TEXT only, cannot be used with replyToId) */
	isGhostPost?: boolean;
	/** Location ID to tag (optional) */
	locationId?: string;
}

/**
 * Pagination options shared across list endpoints.
 */
export interface PaginationOptions {
	/** Start date (Unix timestamp or strtotime-parseable string) */
	since?: string;
	/** End date (Unix timestamp or strtotime-parseable string) */
	until?: string;
	/** Maximum number of results (default 25, max 100) */
	limit?: number;
	/** Cursor for previous page */
	before?: string;
	/** Cursor for next page */
	after?: string;
}

// ─── Response Types (snake_case — matching API reality) ──────────────────────

/**
 * Poll attachment as returned by the API.
 */
export interface PollAttachment {
	/** First poll option text */
	option_a?: string;
	/** Second poll option text */
	option_b?: string;
	/** Third poll option text */
	option_c?: string;
	/** Fourth poll option text */
	option_d?: string;
	/** Percentage of votes for option A (0-1) */
	option_a_votes_percentage?: number;
	/** Percentage of votes for option B (0-1) */
	option_b_votes_percentage?: number;
	/** Percentage of votes for option C (0-1) */
	option_c_votes_percentage?: number;
	/** Percentage of votes for option D (0-1) */
	option_d_votes_percentage?: number;
	/** Total number of votes */
	total_votes?: number;
	/** Timestamp when the poll expires (ISO 8601) */
	expiration_timestamp?: string;
}

/**
 * Text attachment as returned by the API.
 */
export interface TextAttachment {
	/** The plaintext content */
	plaintext?: string;
	/** Attached link URL */
	link_attachment_url?: string;
	/** Styled text with formatting info */
	text_with_styling_info?: TextStylingInfo;
}

/**
 * Text styling information.
 */
export interface TextStylingInfo {
	/** The full text content */
	text?: string;
	/** Styling ranges */
	ranges?: Array<{
		/** Character offset */
		offset: number;
		/** Length of styled range */
		length: number;
		/** Styling type (e.g., "bold", "italic") */
		styling_info: string[];
	}>;
}

/**
 * Location as returned by the API.
 */
export interface ThreadsLocation {
	/** Location ID */
	id: string;
	/** Location name */
	name?: string;
	/** Street address */
	address?: string;
	/** City */
	city?: string;
	/** Country */
	country?: string;
	/** Latitude */
	latitude?: number;
	/** Longitude */
	longitude?: number;
	/** Postal code */
	postal_code?: string;
}

/**
 * Represents a single Threads media object.
 * All fields use snake_case to match the API response format.
 */
export interface ThreadsPost {
	/** Unique identifier for the media object */
	id: string;
	/** Type of product where the media is published (e.g., "THREADS") */
	media_product_type?: string;
	/** Type of media */
	media_type?: ResponseMediaType;
	/** URL of the media content */
	media_url?: string;
	/** Permanent link to the post */
	permalink?: string;
	/** Information about the owner of the post */
	owner?: { id: string };
	/** Username of the account that created the post */
	username?: string;
	/** Text content of the post */
	text?: string;
	/** Timestamp of when the post was created (ISO 8601 format) */
	timestamp?: string;
	/** Short code identifier for the media */
	shortcode?: string;
	/** URL of the thumbnail image (for video posts) */
	thumbnail_url?: string;
	/** List of child posts (for carousel posts) */
	children?: { data: Array<{ id: string }> };
	/** Indicates if the post is a quote of another post */
	is_quote_post?: boolean;
	/** Accessibility text for the image or video */
	alt_text?: string;
	/** URL of the attached link */
	link_attachment_url?: string;
	/** Indicates if the post has replies */
	has_replies?: boolean;
	/** Indicates if the post is a reply to another post */
	is_reply?: boolean;
	/** Indicates if the reply is owned by the current user */
	is_reply_owned_by_me?: boolean;
	/** Information about the root post (for replies) */
	root_post?: { id: string };
	/** Information about the post being replied to */
	replied_to?: { id: string };
	/** Visibility status of the post */
	hide_status?:
		| "NOT_HUSHED"
		| "UNHUSHED"
		| "HIDDEN"
		| "COVERED"
		| "BLOCKED"
		| "RESTRICTED";
	/** Controls who can reply to the post */
	reply_audience?: ReplyControl;
	/** The quoted post (for quote posts) */
	quoted_post?: { id: string };
	/** The reposted post (for reposts) */
	reposted_post?: { id: string };
	/** URL of the GIF */
	gif_url?: string;
	/** Poll attachment data */
	poll_attachment?: PollAttachment;
	/** Topic tag */
	topic_tag?: string;
	/** Whether the media is a spoiler */
	is_spoiler_media?: boolean;
	/** Text entity annotations */
	text_entities?: TextEntity[];
	/** Text attachment for long-form posts */
	text_attachment?: TextAttachment;
	/** Location ID */
	location_id?: string;
	/** Location data */
	location?: ThreadsLocation;
	/** Whether the user is verified */
	is_verified?: boolean;
	/** URL of the user's profile picture */
	profile_picture_url?: string;
	/** Ghost post status */
	ghost_post_status?: "ACTIVE" | "ARCHIVED";
	/** Ghost post expiration timestamp (ISO 8601) */
	ghost_post_expiration_timestamp?: string;
	/** List of country codes where the post is visible */
	allowlisted_country_codes?: string[];
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
 * Quota configuration.
 */
export interface QuotaConfig {
	/** Total allowed quota */
	quota_total: number;
	/** Duration of the quota period in seconds */
	quota_duration: number;
}

/**
 * Represents the publishing limit information for a user.
 */
export interface PublishingLimit {
	/** Current post quota usage */
	quota_usage?: number;
	/** Post quota configuration */
	config?: QuotaConfig;
	/** Current reply quota usage */
	reply_quota_usage?: number;
	/** Reply quota configuration */
	reply_config?: QuotaConfig;
	/** Current delete quota usage */
	delete_quota_usage?: number;
	/** Delete quota configuration */
	delete_config?: QuotaConfig;
	/** Current location search quota usage */
	location_search_quota_usage?: number;
	/** Location search quota configuration */
	location_search_config?: QuotaConfig;
}

/**
 * Represents a Threads media container.
 */
export interface ThreadsContainer {
	/** Unique identifier for the container */
	id: string;
	/** Permanent link to the container */
	permalink?: string;
	/** Status of the container */
	status?: "FINISHED" | "FAILED" | "IN_PROGRESS" | "EXPIRED" | "ERROR";
	/** Error message if the container failed */
	error_message?: string;
}

/**
 * Represents a Threads user profile (own profile via GET /me or GET /{user-id}).
 */
export interface ThreadsProfile {
	/** Unique identifier for the user */
	id: string;
	/** Username of the account */
	username?: string;
	/** Display name of the user */
	name?: string;
	/** URL of the user's profile picture */
	threads_profile_picture_url?: string;
	/** Biography text of the user */
	threads_biography?: string;
	/** Whether the user is verified */
	is_verified?: boolean;
	/** Recently searched keywords */
	recently_searched_keywords?: Array<{ query: string; timestamp: number }>;
	/** Whether the user is eligible for geo-gating */
	is_eligible_for_geo_gating?: boolean;
}

/**
 * Represents a public profile as returned by profile_lookup.
 */
export interface PublicProfile {
	/** Unique identifier */
	id: string;
	/** Username */
	username?: string;
	/** Display name */
	name?: string;
	/** Profile picture URL */
	profile_picture_url?: string;
	/** Biography */
	biography?: string;
	/** Whether the user is verified */
	is_verified?: boolean;
	/** Follower count */
	follower_count?: number;
	/** Likes count (past 7 days) */
	likes_count?: number;
	/** Quotes count (past 7 days) */
	quotes_count?: number;
	/** Reposts count (past 7 days) */
	reposts_count?: number;
	/** Views count (past 7 days) */
	views_count?: number;
	/** Replies count (past 7 days) */
	replies_count?: number;
}

// ─── Insights Types ──────────────────────────────────────────────────────────

/**
 * A single insight metric value.
 */
export interface InsightValue {
	/** The metric value */
	value: number | Record<string, number>;
	/** End time for the period (ISO 8601) */
	end_time?: string;
}

/**
 * Media insight metric.
 */
export interface MediaInsight {
	/** Metric name */
	name: string;
	/** Time period (e.g., "lifetime") */
	period: string;
	/** Metric values */
	values: InsightValue[];
	/** Human-readable title */
	title: string;
	/** Description of the metric */
	description: string;
	/** Unique identifier */
	id: string;
}

/**
 * Response from media insights endpoint.
 */
export interface MediaInsightsResponse {
	/** Array of insight metrics */
	data: MediaInsight[];
}

/**
 * User insight metric (supports both time series and total value formats).
 */
export interface UserInsight {
	/** Metric name */
	name: string;
	/** Time period (e.g., "day", "lifetime") */
	period: string;
	/** Metric values (time series) */
	values: InsightValue[];
	/** Human-readable title */
	title: string;
	/** Description of the metric */
	description: string;
	/** Unique identifier */
	id: string;
	/** Total value (for lifetime metrics) */
	total_value?: { value: number | Record<string, number> };
	/** Link total values (for clicks metric) */
	link_total_values?: Array<{ value: number; link_url: string }>;
}

/**
 * Response from user insights endpoint.
 */
export interface UserInsightsResponse {
	/** Array of insight metrics */
	data: UserInsight[];
}

/**
 * Options for user insights request.
 */
export interface UserInsightsOptions {
	/** Start of the time range (Unix timestamp, required for time series) */
	since?: number;
	/** End of the time range (Unix timestamp, required for time series) */
	until?: number;
	/** Breakdown dimension (e.g., "country", "city", "age", "gender") */
	breakdown?: string;
}

// ─── Search Types ────────────────────────────────────────────────────────────

/**
 * Options for keyword/tag search.
 */
export interface KeywordSearchOptions extends PaginationOptions {
	/** The search query string (required) */
	q: string;
	/** Search behavior: TOP (popular) or RECENT (chronological) */
	search_type?: "TOP" | "RECENT";
	/** Search mode: KEYWORD (default) or TAG (topic tag search) */
	search_mode?: "KEYWORD" | "TAG";
	/** Filter by media type */
	media_type?: "TEXT" | "IMAGE" | "VIDEO" | "CAROUSEL";
	/** Filter by author username */
	author_username?: string;
}

/**
 * Options for location search.
 */
export interface LocationSearchOptions {
	/** Search query for location name */
	query?: string;
	/** Latitude for proximity search (must be used with longitude) */
	latitude?: number;
	/** Longitude for proximity search (must be used with latitude) */
	longitude?: number;
}

// ─── Token Types ─────────────────────────────────────────────────────────────

/**
 * Response from exchanging an OAuth authorization code for a short-lived token.
 */
export interface AuthCodeResponse {
	/** The short-lived access token */
	access_token: string;
	/** The user ID of the authenticated user */
	user_id: string;
}

/**
 * Response from token exchange/refresh endpoints.
 */
export interface TokenResponse {
	/** The access token */
	access_token: string;
	/** Token type (e.g., "bearer") */
	token_type: string;
	/** Expiration time in seconds */
	expires_in?: number;
}

/**
 * Response from debug_token endpoint.
 */
export interface DebugTokenInfo {
	/** Token data */
	data: {
		/** App ID */
		app_id?: string;
		/** Token type (e.g., "USER") */
		type?: string;
		/** Application name */
		application?: string;
		/** Data access expiration timestamp */
		data_access_expires_at?: number;
		/** Token expiration timestamp */
		expires_at?: number;
		/** Whether the token is valid */
		is_valid?: boolean;
		/** Issued timestamp */
		issued_at?: number;
		/** Granted scopes */
		scopes?: string[];
		/** User ID */
		user_id?: string;
	};
}

// ─── oEmbed Types ────────────────────────────────────────────────────────────

/**
 * Response from the oEmbed endpoint.
 */
export interface OEmbedResponse {
	/** HTML embed code */
	html: string;
	/** Provider name (e.g., "Threads") */
	provider_name?: string;
	/** Provider URL */
	provider_url?: string;
	/** oEmbed type (e.g., "rich") */
	type?: string;
	/** oEmbed version */
	version?: string;
	/** Width of the embed */
	width?: number;
	/** Author name */
	author_name?: string;
	/** Author URL */
	author_url?: string;
}

// ─── Webhook Types ───────────────────────────────────────────────────────────

/**
 * Base webhook payload structure.
 */
export interface WebhookPayload {
	/** The Threads App ID */
	app_id: string;
	/** Webhook topic ("moderate" or "interaction") */
	topic: "moderate" | "interaction";
	/** Target ID (media ID or mentioned user ID) */
	target_id: string;
	/** Timestamp when the notification was sent */
	time: number;
	/** Subscription ID */
	subscription_id: string;
	/** Whether the payload has a UID field */
	has_uid_field: boolean;
	/** Webhook values */
	values: {
		/** The webhook data */
		value: Record<string, unknown>;
		/** The subscribed field name */
		field: "replies" | "mentions" | "delete" | "publish";
	};
}

/**
 * Reply webhook payload values.
 */
export interface WebhookReplyValue {
	/** Reply media ID */
	id: string;
	/** Username of the replier */
	username: string;
	/** Reply text content */
	text?: string;
	/** Media type */
	media_type: string;
	/** Permalink to the reply */
	permalink: string;
	/** The post being replied to */
	replied_to?: { id: string };
	/** The root post of the conversation */
	root_post?: {
		id: string;
		owner_id?: string;
		username?: string;
	};
	/** Short code */
	shortcode: string;
	/** Timestamp (ISO 8601) */
	timestamp: string;
	/** Whether the user is verified */
	is_verified?: boolean;
	/** Profile picture URL */
	profile_picture_url?: string;
}

/**
 * Mention webhook payload values.
 */
export interface WebhookMentionValue {
	/** Media ID */
	id: string;
	/** Alt text */
	alt_text?: string;
	/** GIF URL */
	gif_url?: string;
	/** Whether the post has replies */
	has_replies?: boolean;
	/** Whether it's a quote post */
	is_quote_post?: boolean;
	/** Whether it's a reply */
	is_reply?: boolean;
	/** Media product type */
	media_product_type?: string;
	/** Media type */
	media_type: string;
	/** Permalink */
	permalink: string;
	/** Short code */
	shortcode?: string;
	/** Text content */
	text?: string;
	/** Timestamp (ISO 8601) */
	timestamp: string;
	/** Username */
	username: string;
	/** Whether the user is verified */
	is_verified?: boolean;
	/** Profile picture URL */
	profile_picture_url?: string;
}

/**
 * Delete webhook payload values.
 */
export interface WebhookDeleteValue {
	/** Deleted media ID */
	id: string;
	/** Owner information */
	owner?: { owner_id: string };
	/** When the post was deleted (ISO 8601) */
	deleted_at: string;
	/** When the post was originally published (ISO 8601) */
	timestamp: string;
	/** Username */
	username: string;
}

/**
 * Publish webhook payload values.
 */
export interface WebhookPublishValue {
	/** Published media ID */
	id: string;
	/** Media type */
	media_type: string;
	/** Permalink */
	permalink: string;
	/** Timestamp (ISO 8601) */
	timestamp: string;
	/** Username */
	username: string;
}

// ─── Mock API Interface ──────────────────────────────────────────────────────

/**
 * Represents the mock API for Threads operations.
 */
export interface MockThreadsAPI {
	// Existing methods
	createThreadsContainer(
		request: ThreadsPostRequest,
	): Promise<string>;

	publishThreadsContainer(
		userId: string,
		accessToken: string,
		containerId: string,
		getPermalink?: boolean,
	): Promise<string | { id: string; permalink: string }>;

	createCarouselItem(
		request: Omit<ThreadsPostRequest, "mediaType"> & {
			mediaType: "IMAGE" | "VIDEO";
		},
	): Promise<string>;

	getPublishingLimit(
		userId: string,
		accessToken: string,
		fields?: string[],
	): Promise<PublishingLimit>;

	getThreadsList(
		userId: string,
		accessToken: string,
		options?: PaginationOptions,
		fields?: string[],
	): Promise<ThreadsListResponse>;

	getSingleThread(
		mediaId: string,
		accessToken: string,
		fields?: string[],
	): Promise<ThreadsPost>;

	// New methods
	repost(
		mediaId: string,
		accessToken: string,
	): Promise<{ id: string }>;

	deleteThread(
		mediaId: string,
		accessToken: string,
	): Promise<{ success: boolean; deleted_id?: string }>;

	getProfile(
		userId: string,
		accessToken: string,
		fields?: string[],
	): Promise<ThreadsProfile>;

	lookupProfile(
		accessToken: string,
		username: string,
	): Promise<PublicProfile>;

	getProfilePosts(
		accessToken: string,
		username: string,
		options?: PaginationOptions,
		fields?: string[],
	): Promise<ThreadsListResponse>;

	getGhostPosts(
		userId: string,
		accessToken: string,
		options?: PaginationOptions,
		fields?: string[],
	): Promise<ThreadsListResponse>;

	getUserReplies(
		userId: string,
		accessToken: string,
		options?: PaginationOptions,
		fields?: string[],
	): Promise<ThreadsListResponse>;

	getReplies(
		mediaId: string,
		accessToken: string,
		options?: PaginationOptions,
		fields?: string[],
	): Promise<ThreadsListResponse>;

	getConversation(
		mediaId: string,
		accessToken: string,
		options?: PaginationOptions,
		fields?: string[],
	): Promise<ThreadsListResponse>;

	manageReply(
		replyId: string,
		accessToken: string,
		hide: boolean,
	): Promise<{ success: boolean }>;

	getMentions(
		userId: string,
		accessToken: string,
		options?: PaginationOptions,
		fields?: string[],
	): Promise<ThreadsListResponse>;

	getMediaInsights(
		mediaId: string,
		accessToken: string,
		metrics: string[],
	): Promise<MediaInsightsResponse>;

	getUserInsights(
		userId: string,
		accessToken: string,
		metrics: string[],
		options?: UserInsightsOptions,
	): Promise<UserInsightsResponse>;

	searchKeyword(
		accessToken: string,
		options: KeywordSearchOptions,
	): Promise<ThreadsListResponse>;

	searchLocations(
		accessToken: string,
		options: LocationSearchOptions,
	): Promise<{ data: ThreadsLocation[] }>;

	getLocation(
		locationId: string,
		accessToken: string,
		fields?: string[],
	): Promise<ThreadsLocation>;

	exchangeCodeForToken(
		clientId: string,
		clientSecret: string,
		code: string,
		redirectUri: string,
	): Promise<AuthCodeResponse>;

	getAppAccessToken(
		clientId: string,
		clientSecret: string,
	): Promise<TokenResponse>;

	exchangeToken(
		clientSecret: string,
		accessToken: string,
	): Promise<TokenResponse>;

	refreshToken(
		accessToken: string,
	): Promise<TokenResponse>;

	debugToken(
		accessToken: string,
		inputToken: string,
	): Promise<DebugTokenInfo>;

	getOEmbed(
		accessToken: string,
		url: string,
		maxWidth?: number,
	): Promise<OEmbedResponse>;
}
