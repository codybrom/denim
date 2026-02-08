/** The base URL for the Threads API */
export const THREADS_API_BASE_URL = "https://graph.threads.net/v1.0";

/** The base URL for OAuth/token endpoints (no version prefix) */
export const THREADS_OAUTH_BASE_URL = "https://graph.threads.net";

/** Fields common to all media post endpoints */
const MEDIA_BASE_FIELDS = [
	"id",
	"media_product_type",
	"media_type",
	"media_url",
	"permalink",
	"username",
	"text",
	"timestamp",
	"shortcode",
	"thumbnail_url",
	"children",
	"is_quote_post",
	"has_replies",
	"is_verified",
	"profile_picture_url",
] as const;

/** Fields for own-post retrieval (GET /{user-id}/threads) */
export const USER_THREADS_FIELDS = [
	...MEDIA_BASE_FIELDS,
	"owner",
	"alt_text",
	"link_attachment_url",
	"reply_audience",
	"quoted_post",
	"reposted_post",
	"gif_url",
	"poll_attachment",
	"topic_tag",
	"is_spoiler_media",
	"text_entities",
	"text_attachment",
	"ghost_post_status",
	"ghost_post_expiration_timestamp",
	"location_id",
	"location",
];

/** Fields for single thread retrieval (GET /{media-id}) */
export const SINGLE_THREAD_FIELDS = [
	...USER_THREADS_FIELDS,
	"is_reply",
	"is_reply_owned_by_me",
	"root_post",
	"replied_to",
	"hide_status",
];

/** Fields for reply/conversation endpoints */
export const REPLY_FIELDS = [
	...MEDIA_BASE_FIELDS,
	"root_post",
	"replied_to",
	"is_reply",
	"is_reply_owned_by_me",
	"hide_status",
	"reply_audience",
	"quoted_post",
	"reposted_post",
	"gif_url",
	"poll_attachment",
	"topic_tag",
];

/** Fields for location endpoints */
export const LOCATION_FIELDS = [
	"id",
	"name",
	"address",
	"city",
	"country",
	"latitude",
	"longitude",
	"postal_code",
];
