import type {
	AuthCodeResponse,
	DebugTokenInfo,
	KeywordSearchOptions,
	LocationSearchOptions,
	MediaInsightsResponse,
	MockThreadsAPI,
	OEmbedResponse,
	PaginationOptions,
	PublicProfile,
	PublishingLimit,
	ThreadsContainer,
	ThreadsListResponse,
	ThreadsLocation,
	ThreadsPost,
	ThreadsPostRequest,
	ThreadsProfile,
	TokenResponse,
	UserInsightsOptions,
	UserInsightsResponse,
} from "../types.ts";

export class MockThreadsAPIImpl implements MockThreadsAPI {
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
			threads_profile_picture_url: "https://example.com/profile.jpg",
			threads_biography: "This is a test user",
			is_verified: false,
		});

		this.publishingLimits.set("12345", {
			quota_usage: 10,
			config: {
				quota_total: 250,
				quota_duration: 86400,
			},
			reply_quota_usage: 5,
			reply_config: {
				quota_total: 1000,
				quota_duration: 86400,
			},
		});
	}

	setErrorMode(mode: boolean) {
		this.errorMode = mode;
	}

	createThreadsContainer(
		request: ThreadsPostRequest,
	): Promise<string> {
		if (this.errorMode) {
			return Promise.reject(new Error("Failed to create Threads container"));
		}
		const containerId = `container_${Math.random().toString(36).substring(7)}`;
		const permalink =
			`https://www.threads.net/@${request.userId}/post/${containerId}`;
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
			has_replies: false,
			is_reply: false,
			is_reply_owned_by_me: false,
		};
		this.posts.set(postId, post);

		return Promise.resolve(containerId);
	}

	publishThreadsContainer(
		_userId: string,
		_accessToken: string,
		containerId: string,
		getPermalink: boolean = false,
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
			(post) => post.permalink === container.permalink,
		);

		if (!existingPost) {
			return Promise.reject(
				new Error("Post not found for the given container"),
			);
		}

		return Promise.resolve(
			getPermalink
				? {
					id: existingPost.id,
					permalink: existingPost.permalink || "",
				}
				: existingPost.id,
		);
	}

	createCarouselItem(
		request: Omit<ThreadsPostRequest, "mediaType"> & {
			mediaType: "IMAGE" | "VIDEO";
		},
	): Promise<string> {
		const itemId = `item_${Math.random().toString(36).substring(7)}`;
		const container: ThreadsContainer = {
			id: itemId,
			permalink: `https://www.threads.net/@${request.userId}/post/${itemId}`,
			status: "FINISHED",
		};
		this.containers.set(itemId, container);
		return Promise.resolve(itemId);
	}

	getPublishingLimit(
		userId: string,
		_accessToken: string,
		_fields?: string[],
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
		options?: PaginationOptions,
		_fields?: string[],
	): Promise<ThreadsListResponse> {
		const threads = Array.from(this.posts.values())
			.filter((post) => post.owner?.id === userId)
			.slice(0, options?.limit || 25);

		return Promise.resolve({
			data: threads,
			paging: {
				cursors: {
					before: "BEFORE_CURSOR",
					after: "AFTER_CURSOR",
				},
			},
		});
	}

	getSingleThread(
		mediaId: string,
		_accessToken: string,
		_fields?: string[],
	): Promise<ThreadsPost> {
		const post = this.posts.get(mediaId);
		if (!post) {
			return Promise.reject(new Error("Thread not found"));
		}
		return Promise.resolve(post);
	}

	repost(mediaId: string, _accessToken: string): Promise<{ id: string }> {
		if (this.errorMode) {
			return Promise.reject(new Error("Failed to repost"));
		}
		const repostId = `repost_${Math.random().toString(36).substring(7)}`;
		const originalPost = this.posts.get(mediaId);
		if (!originalPost) {
			return Promise.reject(new Error("Post not found"));
		}
		return Promise.resolve({ id: repostId });
	}

	deleteThread(
		mediaId: string,
		_accessToken: string,
	): Promise<{ success: boolean; deleted_id?: string }> {
		if (this.errorMode) {
			return Promise.reject(new Error("Failed to delete thread"));
		}
		const post = this.posts.get(mediaId);
		if (!post) {
			return Promise.reject(new Error("Thread not found"));
		}
		this.posts.delete(mediaId);
		return Promise.resolve({ success: true, deleted_id: mediaId });
	}

	getProfile(
		userId: string,
		_accessToken: string,
		_fields?: string[],
	): Promise<ThreadsProfile> {
		if (this.errorMode) {
			return Promise.reject(new Error("Failed to get profile"));
		}
		const user = this.users.get(userId);
		if (!user) {
			return Promise.reject(new Error("User not found"));
		}
		return Promise.resolve(user);
	}

	lookupProfile(
		_accessToken: string,
		username: string,
	): Promise<PublicProfile> {
		if (this.errorMode) {
			return Promise.reject(new Error("Failed to look up profile"));
		}
		const user = Array.from(this.users.values()).find(
			(u) => u.username === username,
		);
		if (!user) {
			return Promise.reject(new Error("Profile not found"));
		}
		return Promise.resolve({
			id: user.id,
			username: user.username,
			name: user.name,
			profile_picture_url: user.threads_profile_picture_url,
			biography: user.threads_biography,
			is_verified: user.is_verified,
		});
	}

	getProfilePosts(
		_accessToken: string,
		_username: string,
		options?: PaginationOptions,
		_fields?: string[],
	): Promise<ThreadsListResponse> {
		const posts = Array.from(this.posts.values()).slice(
			0,
			options?.limit || 25,
		);
		return Promise.resolve({
			data: posts,
			paging: {
				cursors: { before: "BEFORE_CURSOR", after: "AFTER_CURSOR" },
			},
		});
	}

	getGhostPosts(
		userId: string,
		_accessToken: string,
		options?: PaginationOptions,
		_fields?: string[],
	): Promise<ThreadsListResponse> {
		const posts = Array.from(this.posts.values())
			.filter((p) => p.owner?.id === userId)
			.slice(0, options?.limit || 25);
		return Promise.resolve({
			data: posts,
			paging: {
				cursors: { before: "BEFORE_CURSOR", after: "AFTER_CURSOR" },
			},
		});
	}

	getUserReplies(
		userId: string,
		_accessToken: string,
		options?: PaginationOptions,
		_fields?: string[],
	): Promise<ThreadsListResponse> {
		const replies = Array.from(this.posts.values())
			.filter((p) => p.owner?.id === userId && p.is_reply)
			.slice(0, options?.limit || 25);
		return Promise.resolve({
			data: replies,
			paging: {
				cursors: { before: "BEFORE_CURSOR", after: "AFTER_CURSOR" },
			},
		});
	}

	getReplies(
		_mediaId: string,
		_accessToken: string,
		options?: PaginationOptions,
		_fields?: string[],
	): Promise<ThreadsListResponse> {
		return Promise.resolve({
			data: Array.from(this.posts.values()).slice(0, options?.limit || 25),
			paging: {
				cursors: { before: "BEFORE_CURSOR", after: "AFTER_CURSOR" },
			},
		});
	}

	getConversation(
		_mediaId: string,
		_accessToken: string,
		options?: PaginationOptions,
		_fields?: string[],
	): Promise<ThreadsListResponse> {
		return Promise.resolve({
			data: Array.from(this.posts.values()).slice(0, options?.limit || 25),
			paging: {
				cursors: { before: "BEFORE_CURSOR", after: "AFTER_CURSOR" },
			},
		});
	}

	manageReply(
		_replyId: string,
		_accessToken: string,
		_hide: boolean,
	): Promise<{ success: boolean }> {
		if (this.errorMode) {
			return Promise.reject(new Error("Failed to manage reply"));
		}
		return Promise.resolve({ success: true });
	}

	getMentions(
		_userId: string,
		_accessToken: string,
		options?: PaginationOptions,
		_fields?: string[],
	): Promise<ThreadsListResponse> {
		return Promise.resolve({
			data: Array.from(this.posts.values()).slice(0, options?.limit || 25),
			paging: {
				cursors: { before: "BEFORE_CURSOR", after: "AFTER_CURSOR" },
			},
		});
	}

	getMediaInsights(
		_mediaId: string,
		_accessToken: string,
		metrics: string[],
	): Promise<MediaInsightsResponse> {
		if (this.errorMode) {
			return Promise.reject(new Error("Failed to get media insights"));
		}
		return Promise.resolve({
			data: metrics.map((m) => ({
				name: m,
				period: "lifetime",
				values: [{ value: 42 }],
				title: m,
				description: `${m} metric`,
				id: `${m}_id`,
			})),
		});
	}

	getUserInsights(
		_userId: string,
		_accessToken: string,
		metrics: string[],
		_options?: UserInsightsOptions,
	): Promise<UserInsightsResponse> {
		if (this.errorMode) {
			return Promise.reject(new Error("Failed to get user insights"));
		}
		return Promise.resolve({
			data: metrics.map((m) => ({
				name: m,
				period: "day",
				values: [{ value: 100 }],
				title: m,
				description: `${m} metric`,
				id: `${m}_id`,
			})),
		});
	}

	searchKeyword(
		_accessToken: string,
		_options: KeywordSearchOptions,
	): Promise<ThreadsListResponse> {
		return Promise.resolve({
			data: Array.from(this.posts.values()),
			paging: {
				cursors: { before: "BEFORE_CURSOR", after: "AFTER_CURSOR" },
			},
		});
	}

	searchLocations(
		_accessToken: string,
		_options: LocationSearchOptions,
	): Promise<{ data: ThreadsLocation[] }> {
		return Promise.resolve({
			data: [
				{
					id: "loc_123",
					name: "Test Location",
					latitude: 37.7749,
					longitude: -122.4194,
				},
			],
		});
	}

	getLocation(
		locationId: string,
		_accessToken: string,
		_fields?: string[],
	): Promise<ThreadsLocation> {
		return Promise.resolve({
			id: locationId,
			name: "Test Location",
			address: "123 Test St",
			city: "Test City",
			country: "US",
			latitude: 37.7749,
			longitude: -122.4194,
		});
	}

	exchangeCodeForToken(
		_clientId: string,
		_clientSecret: string,
		_code: string,
		_redirectUri: string,
	): Promise<AuthCodeResponse> {
		if (this.errorMode) {
			return Promise.reject(
				new Error("Failed to exchange authorization code"),
			);
		}
		return Promise.resolve({
			access_token: "short_lived_token_abc123",
			user_id: "12345",
		});
	}

	getAppAccessToken(
		_clientId: string,
		_clientSecret: string,
	): Promise<TokenResponse> {
		if (this.errorMode) {
			return Promise.reject(new Error("Failed to get app access token"));
		}
		return Promise.resolve({
			access_token: "TH|1234567890|abcd1234",
			token_type: "bearer",
		});
	}

	exchangeToken(
		_clientSecret: string,
		_accessToken: string,
	): Promise<TokenResponse> {
		if (this.errorMode) {
			return Promise.reject(new Error("Failed to exchange token"));
		}
		return Promise.resolve({
			access_token: "long_lived_token_abc123",
			token_type: "bearer",
			expires_in: 5184000,
		});
	}

	refreshToken(_accessToken: string): Promise<TokenResponse> {
		if (this.errorMode) {
			return Promise.reject(new Error("Failed to refresh token"));
		}
		return Promise.resolve({
			access_token: "refreshed_token_abc123",
			token_type: "bearer",
			expires_in: 5184000,
		});
	}

	debugToken(
		_accessToken: string,
		_inputToken: string,
	): Promise<DebugTokenInfo> {
		if (this.errorMode) {
			return Promise.reject(new Error("Failed to debug token"));
		}
		return Promise.resolve({
			data: {
				app_id: "123456",
				type: "USER",
				application: "Test App",
				is_valid: true,
				scopes: ["threads_basic", "threads_content_publish"],
				user_id: "12345",
			},
		});
	}

	getOEmbed(
		_accessToken: string,
		_url: string,
		_maxWidth?: number,
	): Promise<OEmbedResponse> {
		if (this.errorMode) {
			return Promise.reject(new Error("Failed to get oEmbed"));
		}
		return Promise.resolve({
			html: "<blockquote>Embedded Threads post</blockquote>",
			provider_name: "Threads",
			type: "rich",
			version: "1.0",
			width: 550,
		});
	}
}
