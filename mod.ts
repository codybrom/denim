/**
 * @module
 *
 * Denim - A Deno/TypeScript library for the Threads API.
 * Provides complete coverage of all Threads API endpoints including
 * posting, retrieval, replies, insights, search, locations, and more.
 */

// ─── Types ───────────────────────────────────────────────────────────────────
import type {
	AuthCodeResponse,
	DebugTokenInfo,
	GifAttachment,
	InsightValue,
	KeywordSearchOptions,
	LocationSearchOptions,
	MediaInsight,
	MediaInsightsResponse,
	MediaType,
	MockThreadsAPI,
	OEmbedResponse,
	PaginationOptions,
	PollAttachment,
	PollAttachmentInput,
	PublicProfile,
	PublishingLimit,
	QuotaConfig,
	ReplyControl,
	TextAttachment,
	TextAttachmentInput,
	TextEntity,
	TextStylingInfo,
	ThreadsContainer,
	ThreadsListResponse,
	ThreadsLocation,
	ThreadsPost,
	ThreadsPostRequest,
	ThreadsProfile,
	TokenResponse,
	UserInsight,
	UserInsightsOptions,
	UserInsightsResponse,
	WebhookDeleteValue,
	WebhookMentionValue,
	WebhookPayload,
	WebhookPublishValue,
	WebhookReplyValue,
} from "./src/types.ts";

export type {
	AuthCodeResponse,
	DebugTokenInfo,
	GifAttachment,
	InsightValue,
	KeywordSearchOptions,
	LocationSearchOptions,
	MediaInsight,
	MediaInsightsResponse,
	MediaType,
	MockThreadsAPI,
	OEmbedResponse,
	PaginationOptions,
	PollAttachment,
	PollAttachmentInput,
	PublicProfile,
	PublishingLimit,
	QuotaConfig,
	ReplyControl,
	TextAttachment,
	TextAttachmentInput,
	TextEntity,
	TextStylingInfo,
	ThreadsContainer,
	ThreadsListResponse,
	ThreadsLocation,
	ThreadsPost,
	ThreadsPostRequest,
	ThreadsProfile,
	TokenResponse,
	UserInsight,
	UserInsightsOptions,
	UserInsightsResponse,
	WebhookDeleteValue,
	WebhookMentionValue,
	WebhookPayload,
	WebhookPublishValue,
	WebhookReplyValue,
};

// ─── Publishing ──────────────────────────────────────────────────────────────
export { createCarouselItem } from "./src/api/createCarouselItem.ts";
export { createThreadsContainer } from "./src/api/createThreadsContainer.ts";
export { deleteThread } from "./src/api/deleteThread.ts";
export { publishThreadsContainer } from "./src/api/publishThreadsContainer.ts";
export { repost } from "./src/api/repost.ts";

// ─── Retrieval ───────────────────────────────────────────────────────────────
export { getGhostPosts } from "./src/api/getGhostPosts.ts";
export { getSingleThread } from "./src/api/getSingleThread.ts";
export { getThreadsList } from "./src/api/getThreadsList.ts";

// ─── Profiles ────────────────────────────────────────────────────────────────
export { getProfile } from "./src/api/getProfile.ts";
export { getProfilePosts } from "./src/api/getProfilePosts.ts";
export { lookupProfile } from "./src/api/lookupProfile.ts";

// ─── Replies ─────────────────────────────────────────────────────────────────
export { getConversation } from "./src/api/getConversation.ts";
export { getReplies } from "./src/api/getReplies.ts";
export { getUserReplies } from "./src/api/getUserReplies.ts";
export { manageReply } from "./src/api/manageReply.ts";

// ─── Mentions ────────────────────────────────────────────────────────────────
export { getMentions } from "./src/api/getMentions.ts";

// ─── Insights ────────────────────────────────────────────────────────────────
export { getMediaInsights } from "./src/api/getMediaInsights.ts";
export { getUserInsights } from "./src/api/getUserInsights.ts";

// ─── Search ──────────────────────────────────────────────────────────────────
export { getLocation } from "./src/api/getLocation.ts";
export { searchKeyword } from "./src/api/searchKeyword.ts";
export { searchLocations } from "./src/api/searchLocations.ts";

// ─── Tokens ──────────────────────────────────────────────────────────────────
export { debugToken } from "./src/api/debugToken.ts";
export { exchangeCodeForToken } from "./src/api/exchangeCodeForToken.ts";
export { exchangeToken } from "./src/api/exchangeToken.ts";
export { getAppAccessToken } from "./src/api/getAppAccessToken.ts";
export { refreshToken } from "./src/api/refreshToken.ts";

// ─── oEmbed ──────────────────────────────────────────────────────────────────
export { getOEmbed } from "./src/api/getOEmbed.ts";

// ─── Rate Limits ─────────────────────────────────────────────────────────────
export { getPublishingLimit } from "./src/api/getPublishingLimit.ts";
