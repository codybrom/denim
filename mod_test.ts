// mod_test.ts
import { assertEquals, assertRejects } from "@std/assert";
import {
	createCarouselItem,
	createThreadsContainer,
	debugToken,
	deleteThread,
	exchangeCodeForToken,
	exchangeToken,
	getAppAccessToken,
	getConversation,
	getGhostPosts,
	getLocation,
	getMediaInsights,
	getMentions,
	getOEmbed,
	getProfile,
	getProfilePosts,
	getPublishingLimit,
	getReplies,
	getSingleThread,
	getThreadsList,
	getUserInsights,
	getUserReplies,
	lookupProfile,
	manageReply,
	type MockThreadsAPI,
	publishThreadsContainer,
	refreshToken,
	repost,
	searchKeyword,
	searchLocations,
	type ThreadsPostRequest,
} from "./mod.ts";
import { MockThreadsAPIImpl } from "./src/utils/mock_threads_api.ts";

let mockAPI: MockThreadsAPIImpl;

const validUrl = {
	image:
		"https://file-examples.com/wp-content/storage/2017/10/file_example_PNG_3MB.png",
	video:
		"https://file-examples.com/wp-content/storage/2018/04/file_example_MOV_1280_1_4MB.mov",
	link: "https://example.com",
};

const invalidUrl = {
	link: "invalid_url",
	failedImage: "https://example.com/404.jpg",
	failedMedia: "https://example.com/404.jpg",
	incompatibleFormat:
		"https://svs.gsfc.nasa.gov/vis/a030000/a030800/a030877/frames/5760x3240_16x9_01p/BlackMarble_2016_1200m_africa_s.tif",
	oversizedImage:
		"https://svs.gsfc.nasa.gov/vis/a030000/a030800/a030877/frames/5760x3240_16x9_01p/BlackMarble_2016_1200m_africa_s_labeled.png",
	oversizedVideo: "https://example.com/invalid.mp4",
};

function setupMockAPI() {
	mockAPI = new MockThreadsAPIImpl();
	(globalThis as { threadsAPI?: MockThreadsAPI }).threadsAPI = mockAPI;
}

function teardownMockAPI() {
	delete (globalThis as { threadsAPI?: MockThreadsAPI }).threadsAPI;
}

Deno.test("Denim API Tests", async (t) => {
	setupMockAPI();

	// ─── createThreadsContainer ──────────────────────────────────────────────

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
			assertEquals(typeof result, "string");
			assertEquals(result.length > 0, true);
			teardownMockAPI();
		});

		await t.step("should handle image post with alt text", async () => {
			setupMockAPI();
			const requestData: ThreadsPostRequest = {
				userId: "12345",
				accessToken: "token",
				mediaType: "IMAGE",
				text: "Check out this image!",
				imageUrl: validUrl.image,
				altText: "A beautiful sunset",
			};

			const containerId = await createThreadsContainer(requestData);
			assertEquals(typeof containerId, "string");
			assertEquals(containerId.length > 0, true);
			teardownMockAPI();
		});

		await t.step("should handle video post with all features", async () => {
			setupMockAPI();
			const requestData: ThreadsPostRequest = {
				userId: "12345",
				accessToken: "token",
				mediaType: "VIDEO",
				text: "Watch this video!",
				videoUrl: validUrl.video,
				altText: "A tutorial video",
				replyControl: "mentioned_only",
				allowlistedCountryCodes: ["US", "GB"],
			};

			const containerId = await createThreadsContainer(requestData);
			assertEquals(typeof containerId, "string");
			assertEquals(containerId.length > 0, true);
			teardownMockAPI();
		});

		await t.step("should handle text post with poll attachment", async () => {
			setupMockAPI();
			const requestData: ThreadsPostRequest = {
				userId: "12345",
				accessToken: "token",
				mediaType: "TEXT",
				text: "What do you prefer?",
				pollAttachment: {
					option_a: "Option A",
					option_b: "Option B",
					option_c: "Option C",
				},
			};

			const result = await createThreadsContainer(requestData);
			assertEquals(typeof result, "string");
			assertEquals(result.length > 0, true);
			teardownMockAPI();
		});

		await t.step("should handle text post with GIF attachment", async () => {
			setupMockAPI();
			const requestData: ThreadsPostRequest = {
				userId: "12345",
				accessToken: "token",
				mediaType: "TEXT",
				text: "Check this GIF!",
				gifAttachment: {
					gif_id: "abc123",
					provider: "TENOR",
				},
			};

			const result = await createThreadsContainer(requestData);
			assertEquals(typeof result, "string");
			assertEquals(result.length > 0, true);
			teardownMockAPI();
		});

		await t.step("should handle ghost post", async () => {
			setupMockAPI();
			const requestData: ThreadsPostRequest = {
				userId: "12345",
				accessToken: "token",
				mediaType: "TEXT",
				text: "A ghost post",
				isGhostPost: true,
			};

			const result = await createThreadsContainer(requestData);
			assertEquals(typeof result, "string");
			assertEquals(result.length > 0, true);
			teardownMockAPI();
		});

		await t.step("should handle post with topic tag", async () => {
			setupMockAPI();
			const requestData: ThreadsPostRequest = {
				userId: "12345",
				accessToken: "token",
				mediaType: "TEXT",
				text: "Tagged post",
				topicTag: "technology",
			};

			const result = await createThreadsContainer(requestData);
			assertEquals(typeof result, "string");
			assertEquals(result.length > 0, true);
			teardownMockAPI();
		});

		await t.step("should handle reply to another post", async () => {
			setupMockAPI();
			const requestData: ThreadsPostRequest = {
				userId: "12345",
				accessToken: "token",
				mediaType: "TEXT",
				text: "This is a reply",
				replyToId: "original_post_123",
			};

			const result = await createThreadsContainer(requestData);
			assertEquals(typeof result, "string");
			assertEquals(result.length > 0, true);
			teardownMockAPI();
		});

		await t.step("should handle spoiler media", async () => {
			setupMockAPI();
			const requestData: ThreadsPostRequest = {
				userId: "12345",
				accessToken: "token",
				mediaType: "TEXT",
				text: "Spoiler content",
				isSpoilerMedia: true,
				textEntities: [{ entity_type: "spoiler", offset: 0, length: 7 }],
			};

			const result = await createThreadsContainer(requestData);
			assertEquals(typeof result, "string");
			assertEquals(result.length > 0, true);
			teardownMockAPI();
		});

		await t.step("should throw error on failure", async () => {
			setupMockAPI();
			const requestData: ThreadsPostRequest = {
				userId: "12345",
				accessToken: "invalid_token",
				mediaType: "TEXT",
				text: "Hello, Threads!",
				linkAttachment: validUrl.link,
			};

			mockAPI.setErrorMode(true);

			await assertRejects(
				() => createThreadsContainer(requestData),
				Error,
				"Failed to create Threads container",
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
					"CAROUSEL media type requires at least 2 children",
				);
			},
		);

		await t.step(
			"should throw error when imageUrl is provided for non-IMAGE type",
			async () => {
				const requestData: ThreadsPostRequest = {
					userId: "12345",
					accessToken: "token",
					mediaType: "TEXT",
					text: "This shouldn't work",
					imageUrl: validUrl.image,
				};
				await assertRejects(
					() => createThreadsContainer(requestData),
					Error,
					"imageUrl can only be used with IMAGE media type",
				);
			},
		);

		await t.step(
			"should throw error when videoUrl is provided for non-VIDEO type",
			async () => {
				const requestData: ThreadsPostRequest = {
					userId: "12345",
					accessToken: "token",
					mediaType: "IMAGE",
					imageUrl: validUrl.image,
					videoUrl: validUrl.video,
				};

				await assertRejects(
					() => createThreadsContainer(requestData),
					Error,
					"videoUrl can only be used with VIDEO media type",
				);
			},
		);

		await t.step(
			"should throw error when linkAttachment is provided for non-TEXT type",
			async () => {
				const requestData: ThreadsPostRequest = {
					userId: "12345",
					accessToken: "token",
					mediaType: "IMAGE",
					imageUrl: validUrl.image,
					linkAttachment: validUrl.link,
				};

				await assertRejects(
					() => createThreadsContainer(requestData),
					Error,
					"linkAttachment can only be used with TEXT media type",
				);
			},
		);

		await t.step(
			"should throw error when pollAttachment used with non-TEXT type",
			async () => {
				const requestData: ThreadsPostRequest = {
					userId: "12345",
					accessToken: "token",
					mediaType: "IMAGE",
					imageUrl: validUrl.image,
					pollAttachment: { option_a: "A", option_b: "B" },
				};

				await assertRejects(
					() => createThreadsContainer(requestData),
					Error,
					"pollAttachment can only be used with TEXT media type",
				);
			},
		);

		await t.step(
			"should throw error when ghost post is used as reply",
			async () => {
				const requestData: ThreadsPostRequest = {
					userId: "12345",
					accessToken: "token",
					mediaType: "TEXT",
					text: "Ghost reply",
					isGhostPost: true,
					replyToId: "some_post",
				};

				await assertRejects(
					() => createThreadsContainer(requestData),
					Error,
					"isGhostPost cannot be used together with replyToId",
				);
			},
		);

		await t.step(
			"should throw error when textEntities exceeds 10",
			async () => {
				const requestData: ThreadsPostRequest = {
					userId: "12345",
					accessToken: "token",
					mediaType: "TEXT",
					text: "Too many entities",
					textEntities: Array.from({ length: 11 }, (_, i) => ({
						entity_type: "spoiler",
						offset: i * 5,
						length: 3,
					})),
				};

				await assertRejects(
					() => createThreadsContainer(requestData),
					Error,
					"textEntities cannot have more than 10 entries",
				);
			},
		);

		await t.step("should throw error for invalid link URL", async () => {
			const requestData: ThreadsPostRequest = {
				userId: "12345",
				accessToken: "token",
				mediaType: "TEXT",
				text: "This shouldn't work",
				linkAttachment: invalidUrl.link,
			};
			await assertRejects(
				() => createThreadsContainer(requestData),
				Error,
				"Invalid URL format for linkAttachment",
			);
		});

		await t.step(
			"should throw error when children is provided for non-CAROUSEL type",
			async () => {
				const requestData: ThreadsPostRequest = {
					userId: "12345",
					accessToken: "token",
					mediaType: "IMAGE",
					imageUrl: validUrl.image,
					children: ["item1", "item2"],
				};

				await assertRejects(
					async () => {
						await createThreadsContainer(requestData);
					},
					Error,
					"children can only be used with CAROUSEL media type",
				);
			},
		);
	});

	// ─── publishThreadsContainer ─────────────────────────────────────────────

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
				containerId,
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
			mockAPI.setErrorMode(true);

			await assertRejects(
				() => publishThreadsContainer("12345", "invalid_token", "invalid_id"),
				Error,
				"Failed to publish Threads container",
			);
			teardownMockAPI();
		});

		await t.step("should return permalink when requested", async () => {
			setupMockAPI();
			const userId = "12345";
			const accessToken = "token";
			const containerId = await createThreadsContainer({
				userId,
				accessToken,
				mediaType: "TEXT",
				text: "Test post with permalink",
			});

			const result = await publishThreadsContainer(
				userId,
				accessToken,
				containerId,
				true,
			);

			if (typeof result === "string") {
				throw new Error("Expected an object with permalink, but got a string");
			} else {
				assertEquals(typeof result, "object");
				assertEquals(typeof result.id, "string");
				assertEquals(typeof result.permalink, "string");
				assertEquals(result.permalink.startsWith("https://"), true);
			}
			teardownMockAPI();
		});

		await t.step("should not return permalink when not requested", async () => {
			setupMockAPI();
			const userId = "12345";
			const accessToken = "token";
			const containerId = await createThreadsContainer({
				userId,
				accessToken,
				mediaType: "TEXT",
				text: "Test post without permalink",
			});

			const result = await publishThreadsContainer(
				userId,
				accessToken,
				containerId,
				false,
			);

			assertEquals(typeof result, "string");
			teardownMockAPI();
		});
	});

	// ─── createCarouselItem ──────────────────────────────────────────────────

	await t.step("createCarouselItem", async (t) => {
		await t.step("should return item ID", async () => {
			setupMockAPI();
			const requestData = {
				userId: "12345",
				accessToken: "token",
				mediaType: "IMAGE" as const,
				imageUrl: validUrl.image,
				altText: "Test image",
			};

			const itemId = await createCarouselItem(requestData);
			assertEquals(typeof itemId, "string");
			assertEquals(itemId.length > 0, true);
			teardownMockAPI();
		});

		await t.step("should handle video items", async () => {
			setupMockAPI();
			const requestData = {
				userId: "12345",
				accessToken: "token",
				mediaType: "VIDEO" as const,
				videoUrl: validUrl.video,
				altText: "Test video",
			};

			const itemId = await createCarouselItem(requestData);
			assertEquals(typeof itemId, "string");
			assertEquals(itemId.length > 0, true);
			teardownMockAPI();
		});
	});

	// ─── getThreadsList ──────────────────────────────────────────────────────

	await t.step("getThreadsList", async () => {
		setupMockAPI();
		const userId = "12345";
		const accessToken = "valid_token";

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

	// ─── getSingleThread ─────────────────────────────────────────────────────

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
			containerId,
		);

		const result = await getSingleThread(
			typeof mediaId === "string" ? mediaId : mediaId.id,
			accessToken,
		);
		assertEquals(typeof result.id, "string");
		assertEquals(result.text, testText);
		teardownMockAPI();
	});

	// ─── getPublishingLimit ──────────────────────────────────────────────────

	await t.step("getPublishingLimit", async (t) => {
		await t.step("should return rate limit information", async () => {
			setupMockAPI();
			const result = await getPublishingLimit("12345", "valid_token");
			assertEquals(typeof result.quota_usage, "number");
			assertEquals(typeof result.config?.quota_total, "number");
			assertEquals(typeof result.config?.quota_duration, "number");
			teardownMockAPI();
		});

		await t.step("should return reply quota when available", async () => {
			setupMockAPI();
			const result = await getPublishingLimit("12345", "valid_token");
			assertEquals(typeof result.reply_quota_usage, "number");
			assertEquals(typeof result.reply_config?.quota_total, "number");
			teardownMockAPI();
		});

		await t.step("should throw error on failure", async () => {
			setupMockAPI();
			mockAPI.setErrorMode(true);

			await assertRejects(
				() => getPublishingLimit("12345", "invalid_token"),
				Error,
				"Failed to get publishing limit",
			);
			teardownMockAPI();
		});
	});

	// ─── repost ──────────────────────────────────────────────────────────────

	await t.step("repost", async (t) => {
		await t.step("should repost successfully", async () => {
			setupMockAPI();
			const containerId = await createThreadsContainer({
				userId: "12345",
				accessToken: "token",
				mediaType: "TEXT",
				text: "Post to repost",
			});
			const mediaId = await publishThreadsContainer(
				"12345",
				"token",
				containerId,
			);

			const result = await repost(
				typeof mediaId === "string" ? mediaId : mediaId.id,
				"token",
			);
			assertEquals(typeof result.id, "string");
			teardownMockAPI();
		});

		await t.step("should throw error on failure", async () => {
			setupMockAPI();
			mockAPI.setErrorMode(true);
			await assertRejects(
				() => repost("media_123", "token"),
				Error,
				"Failed to repost",
			);
			teardownMockAPI();
		});
	});

	// ─── deleteThread ────────────────────────────────────────────────────────

	await t.step("deleteThread", async (t) => {
		await t.step("should delete successfully", async () => {
			setupMockAPI();
			const containerId = await createThreadsContainer({
				userId: "12345",
				accessToken: "token",
				mediaType: "TEXT",
				text: "Post to delete",
			});
			const mediaId = await publishThreadsContainer(
				"12345",
				"token",
				containerId,
			);

			const result = await deleteThread(
				typeof mediaId === "string" ? mediaId : mediaId.id,
				"token",
			);
			assertEquals(result.success, true);
			teardownMockAPI();
		});

		await t.step("should throw error on failure", async () => {
			setupMockAPI();
			mockAPI.setErrorMode(true);
			await assertRejects(
				() => deleteThread("media_123", "token"),
				Error,
				"Failed to delete thread",
			);
			teardownMockAPI();
		});
	});

	// ─── getProfile ──────────────────────────────────────────────────────────

	await t.step("getProfile", async (t) => {
		await t.step("should return profile data", async () => {
			setupMockAPI();
			const result = await getProfile("12345", "token");
			assertEquals(result.id, "12345");
			assertEquals(result.username, "testuser");
			assertEquals(result.name, "Test User");
			teardownMockAPI();
		});

		await t.step("should throw error on failure", async () => {
			setupMockAPI();
			mockAPI.setErrorMode(true);
			await assertRejects(
				() => getProfile("12345", "token"),
				Error,
				"Failed to get profile",
			);
			teardownMockAPI();
		});
	});

	// ─── lookupProfile ───────────────────────────────────────────────────────

	await t.step("lookupProfile", async (t) => {
		await t.step("should look up profile by username", async () => {
			setupMockAPI();
			const result = await lookupProfile("token", "testuser");
			assertEquals(result.id, "12345");
			assertEquals(result.username, "testuser");
			teardownMockAPI();
		});

		await t.step("should throw error for unknown user", async () => {
			setupMockAPI();
			await assertRejects(
				() => lookupProfile("token", "nonexistent_user"),
				Error,
				"Profile not found",
			);
			teardownMockAPI();
		});
	});

	// ─── getProfilePosts ─────────────────────────────────────────────────────

	await t.step("getProfilePosts", async () => {
		setupMockAPI();
		await createThreadsContainer({
			userId: "12345",
			accessToken: "token",
			mediaType: "TEXT",
			text: "Profile post",
		});
		const result = await getProfilePosts("token", "testuser");
		assertEquals(Array.isArray(result.data), true);
		teardownMockAPI();
	});

	// ─── getGhostPosts ───────────────────────────────────────────────────────

	await t.step("getGhostPosts", async () => {
		setupMockAPI();
		await createThreadsContainer({
			userId: "12345",
			accessToken: "token",
			mediaType: "TEXT",
			text: "Ghost post",
		});
		const result = await getGhostPosts("12345", "token");
		assertEquals(Array.isArray(result.data), true);
		teardownMockAPI();
	});

	// ─── getUserReplies ──────────────────────────────────────────────────────

	await t.step("getUserReplies", async () => {
		setupMockAPI();
		const result = await getUserReplies("12345", "token");
		assertEquals(Array.isArray(result.data), true);
		teardownMockAPI();
	});

	// ─── getReplies ──────────────────────────────────────────────────────────

	await t.step("getReplies", async () => {
		setupMockAPI();
		const result = await getReplies("media_123", "token");
		assertEquals(Array.isArray(result.data), true);
		teardownMockAPI();
	});

	// ─── getConversation ─────────────────────────────────────────────────────

	await t.step("getConversation", async () => {
		setupMockAPI();
		const result = await getConversation("media_123", "token");
		assertEquals(Array.isArray(result.data), true);
		teardownMockAPI();
	});

	// ─── manageReply ─────────────────────────────────────────────────────────

	await t.step("manageReply", async (t) => {
		await t.step("should hide a reply", async () => {
			setupMockAPI();
			const result = await manageReply("reply_123", "token", true);
			assertEquals(result.success, true);
			teardownMockAPI();
		});

		await t.step("should unhide a reply", async () => {
			setupMockAPI();
			const result = await manageReply("reply_123", "token", false);
			assertEquals(result.success, true);
			teardownMockAPI();
		});
	});

	// ─── getMentions ─────────────────────────────────────────────────────────

	await t.step("getMentions", async () => {
		setupMockAPI();
		const result = await getMentions("12345", "token");
		assertEquals(Array.isArray(result.data), true);
		teardownMockAPI();
	});

	// ─── getMediaInsights ────────────────────────────────────────────────────

	await t.step("getMediaInsights", async (t) => {
		await t.step("should return insight metrics", async () => {
			setupMockAPI();
			const result = await getMediaInsights("media_123", "token", [
				"views",
				"likes",
			]);
			assertEquals(result.data.length, 2);
			assertEquals(result.data[0].name, "views");
			assertEquals(result.data[1].name, "likes");
			teardownMockAPI();
		});

		await t.step("should throw error on failure", async () => {
			setupMockAPI();
			mockAPI.setErrorMode(true);
			await assertRejects(
				() => getMediaInsights("media_123", "token", ["views"]),
				Error,
				"Failed to get media insights",
			);
			teardownMockAPI();
		});
	});

	// ─── getUserInsights ─────────────────────────────────────────────────────

	await t.step("getUserInsights", async (t) => {
		await t.step("should return user metrics", async () => {
			setupMockAPI();
			const result = await getUserInsights("12345", "token", [
				"views",
				"followers_count",
			]);
			assertEquals(result.data.length, 2);
			assertEquals(result.data[0].name, "views");
			teardownMockAPI();
		});

		await t.step("should throw error on failure", async () => {
			setupMockAPI();
			mockAPI.setErrorMode(true);
			await assertRejects(
				() => getUserInsights("12345", "token", ["views"]),
				Error,
				"Failed to get user insights",
			);
			teardownMockAPI();
		});
	});

	// ─── searchKeyword ───────────────────────────────────────────────────────

	await t.step("searchKeyword", async () => {
		setupMockAPI();
		const result = await searchKeyword("token", {
			q: "test query",
			search_type: "TOP",
		});
		assertEquals(Array.isArray(result.data), true);
		teardownMockAPI();
	});

	// ─── searchLocations ─────────────────────────────────────────────────────

	await t.step("searchLocations", async () => {
		setupMockAPI();
		const result = await searchLocations("token", {
			query: "San Francisco",
		});
		assertEquals(Array.isArray(result.data), true);
		assertEquals(result.data.length > 0, true);
		assertEquals(result.data[0].name, "Test Location");
		teardownMockAPI();
	});

	// ─── getLocation ─────────────────────────────────────────────────────────

	await t.step("getLocation", async () => {
		setupMockAPI();
		const result = await getLocation("loc_123", "token");
		assertEquals(result.id, "loc_123");
		assertEquals(result.name, "Test Location");
		assertEquals(typeof result.latitude, "number");
		teardownMockAPI();
	});

	// ─── exchangeCodeForToken ────────────────────────────────────────────────

	await t.step("exchangeCodeForToken", async (t) => {
		await t.step("should return short-lived token and user ID", async () => {
			setupMockAPI();
			const result = await exchangeCodeForToken(
				"app_id",
				"app_secret",
				"auth_code",
				"https://example.com/callback",
			);
			assertEquals(typeof result.access_token, "string");
			assertEquals(typeof result.user_id, "string");
			teardownMockAPI();
		});

		await t.step("should throw error on failure", async () => {
			setupMockAPI();
			mockAPI.setErrorMode(true);
			await assertRejects(
				() =>
					exchangeCodeForToken(
						"id",
						"secret",
						"code",
						"https://example.com",
					),
				Error,
				"Failed to exchange authorization code",
			);
			teardownMockAPI();
		});
	});

	// ─── getAppAccessToken ──────────────────────────────────────────────────

	await t.step("getAppAccessToken", async (t) => {
		await t.step("should return app access token", async () => {
			setupMockAPI();
			const result = await getAppAccessToken("app_id", "app_secret");
			assertEquals(typeof result.access_token, "string");
			assertEquals(result.token_type, "bearer");
			teardownMockAPI();
		});

		await t.step("should throw error on failure", async () => {
			setupMockAPI();
			mockAPI.setErrorMode(true);
			await assertRejects(
				() => getAppAccessToken("id", "secret"),
				Error,
				"Failed to get app access token",
			);
			teardownMockAPI();
		});
	});

	// ─── exchangeToken ───────────────────────────────────────────────────────

	await t.step("exchangeToken", async (t) => {
		await t.step("should return long-lived token", async () => {
			setupMockAPI();
			const result = await exchangeToken("client_secret", "short_token");
			assertEquals(typeof result.access_token, "string");
			assertEquals(result.token_type, "bearer");
			assertEquals(typeof result.expires_in, "number");
			teardownMockAPI();
		});

		await t.step("should throw error on failure", async () => {
			setupMockAPI();
			mockAPI.setErrorMode(true);
			await assertRejects(
				() => exchangeToken("secret", "token"),
				Error,
				"Failed to exchange token",
			);
			teardownMockAPI();
		});
	});

	// ─── refreshToken ────────────────────────────────────────────────────────

	await t.step("refreshToken", async (t) => {
		await t.step("should return refreshed token", async () => {
			setupMockAPI();
			const result = await refreshToken("old_token");
			assertEquals(typeof result.access_token, "string");
			assertEquals(result.token_type, "bearer");
			teardownMockAPI();
		});

		await t.step("should throw error on failure", async () => {
			setupMockAPI();
			mockAPI.setErrorMode(true);
			await assertRejects(
				() => refreshToken("token"),
				Error,
				"Failed to refresh token",
			);
			teardownMockAPI();
		});
	});

	// ─── debugToken ──────────────────────────────────────────────────────────

	await t.step("debugToken", async (t) => {
		await t.step("should return token debug info", async () => {
			setupMockAPI();
			const result = await debugToken("access_token", "input_token");
			assertEquals(result.data.is_valid, true);
			assertEquals(typeof result.data.app_id, "string");
			assertEquals(Array.isArray(result.data.scopes), true);
			teardownMockAPI();
		});

		await t.step("should throw error on failure", async () => {
			setupMockAPI();
			mockAPI.setErrorMode(true);
			await assertRejects(
				() => debugToken("token", "input"),
				Error,
				"Failed to debug token",
			);
			teardownMockAPI();
		});
	});

	// ─── getOEmbed ───────────────────────────────────────────────────────────

	await t.step("getOEmbed", async (t) => {
		await t.step("should return embed HTML", async () => {
			setupMockAPI();
			const result = await getOEmbed(
				"token",
				"https://www.threads.net/@user/post/abc",
			);
			assertEquals(typeof result.html, "string");
			assertEquals(result.provider_name, "Threads");
			teardownMockAPI();
		});

		await t.step("should throw error on failure", async () => {
			setupMockAPI();
			mockAPI.setErrorMode(true);
			await assertRejects(
				() => getOEmbed("token", "https://example.com"),
				Error,
				"Failed to get oEmbed",
			);
			teardownMockAPI();
		});
	});
});
