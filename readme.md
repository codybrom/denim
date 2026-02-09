# Denim

[![JSR](https://jsr.io/badges/@codybrom/denim)](https://jsr.io/@codybrom/denim)
[![JSR Score](https://jsr.io/badges/@codybrom/denim/score)](https://jsr.io/@codybrom/denim)

A Deno/TypeScript wrapper for the
[Threads API](https://developers.facebook.com/docs/threads). Covers posting,
retrieval, replies, profiles, insights, search, locations, tokens, and oEmbed.

You'll need a Threads app with an access token from
[Meta's developer portal](https://developers.facebook.com/apps/). See the
[Threads API docs](https://developers.facebook.com/docs/threads/get-started) for
setup.

```bash
deno add @codybrom/denim
```

## Publishing

Threads publishing is two steps: create a container, then publish it.

```typescript
import {
	createThreadsContainer,
	publishThreadsContainer,
} from "@codybrom/denim";

const containerId = await createThreadsContainer({
	userId: "YOUR_USER_ID",
	accessToken: "YOUR_ACCESS_TOKEN",
	mediaType: "TEXT",
	text: "Hello from Denim!",
});

await publishThreadsContainer("YOUR_USER_ID", "YOUR_ACCESS_TOKEN", containerId);
```

`createThreadsContainer(request)` takes a `ThreadsPostRequest` and returns the
container ID string. The request requires `userId`, `accessToken`, `mediaType`,
and usually `text`. Optional fields control the post type:

| Field                     | Type       | Purpose                                                                                                       |
| ------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| `imageUrl`                | `string`   | Image URL (for `IMAGE` or `CAROUSEL` items)                                                                   |
| `videoUrl`                | `string`   | Video URL (for `VIDEO` or `CAROUSEL` items)                                                                   |
| `altText`                 | `string`   | Alt text for images and videos                                                                                |
| `linkAttachment`          | `string`   | URL to attach to a `TEXT` post                                                                                |
| `replyControl`            | `string`   | `"everyone"`, `"accounts_you_follow"`, `"mentioned_only"`, `"parent_post_author_only"`, or `"followers_only"` |
| `allowlistedCountryCodes` | `string[]` | ISO country codes to restrict post visibility                                                                 |
| `replyToId`               | `string`   | Post ID to reply to                                                                                           |
| `quotePostId`             | `string`   | Post ID to quote                                                                                              |
| `pollAttachment`          | `object`   | `{ option_a, option_b, option_c?, option_d? }`                                                                |
| `topicTag`                | `string`   | Topic tag for the post                                                                                        |
| `isGhostPost`             | `boolean`  | Make a ghost post (text only, expires in 24h)                                                                 |
| `isSpoilerMedia`          | `boolean`  | Hide media behind a spoiler overlay                                                                           |
| `textEntities`            | `array`    | Text spoiler ranges: `[{ entity_type, offset, length }]`                                                      |
| `textAttachment`          | `object`   | Long-form text: `{ plaintext, link_attachment_url? }`                                                         |
| `gifAttachment`           | `object`   | GIF: `{ gif_id, provider }`                                                                                   |
| `locationId`              | `string`   | Location ID from `searchLocations`                                                                            |
| `children`                | `string[]` | Carousel item IDs from `createCarouselItem`                                                                   |
| `autoPublishText`         | `boolean`  | Skip the publish step for text posts                                                                          |

`publishThreadsContainer(userId, accessToken, containerId, getPermalink?)`
publishes a container. Pass `true` for `getPermalink` to get `{ id, permalink }`
instead of just the ID string.

`createCarouselItem(request)` creates individual items for a carousel post.
Takes the same request shape but `mediaType` must be `"IMAGE"` or `"VIDEO"`.

`repost(mediaId, accessToken)` reposts an existing thread. Returns `{ id }`.

`deleteThread(mediaId, accessToken)` deletes a thread. Returns
`{ success: boolean, deleted_id?: string }`.

## Retrieval

All retrieval functions accept an optional `fields` string array to request
specific fields, and an optional `PaginationOptions` object
(`{ since?, until?, limit?, before?, after? }`).

`getThreadsList(userId, accessToken, options?, fields?)` returns a user's
threads as `{ data: ThreadsPost[], paging }`.

`getSingleThread(mediaId, accessToken, fields?)` returns a single `ThreadsPost`.

`getGhostPosts(userId, accessToken, options?, fields?)` returns a user's ghost
posts.

## Profiles

`getProfile(userId, accessToken, fields?)` returns the authenticated user's
`ThreadsProfile` (username, name, bio, profile picture, verification status).

`lookupProfile(accessToken, username, fields?)` looks up any public profile by
username. Returns a `PublicProfile` with follower counts and engagement stats.
Requires `threads_profile_discovery` permission.

`getProfilePosts(accessToken, username, options?, fields?)` returns a public
profile's posts.

## Replies

`getReplies(mediaId, accessToken, options?, fields?, reverse?)` returns direct
replies to a post. Pass `reverse: false` for chronological order (default is
reverse chronological).

`getConversation(mediaId, accessToken, options?, fields?, reverse?)` returns the
full conversation thread (replies and nested replies). Pass `reverse: false` for
chronological order.

`getUserReplies(userId, accessToken, options?, fields?)` returns all replies
made by a user.

`manageReply(replyId, accessToken, hide)` hides or unhides a reply. Pass `true`
to hide, `false` to unhide.

## Insights

`getMediaInsights(mediaId, accessToken, metrics)` returns metrics for a post.
Pass metric names as a string array: `"views"`, `"likes"`, `"replies"`,
`"reposts"`, `"quotes"`, `"shares"`.

```typescript
const insights = await getMediaInsights(postId, token, ["views", "likes"]);
// insights.data[0].values[0].value => 42
```

`getUserInsights(userId, accessToken, metrics, options?)` returns user-level
metrics. Accepts an options object with `since`/`until` timestamps and
`breakdown` for demographics.

## Search & Locations

`searchKeyword(accessToken, options, fields?)` searches posts by keyword or
topic tag. Options:
`{ q, search_type?, search_mode?, media_type?, author_username?,
...pagination }`.
Requires `threads_keyword_search` permission for searching beyond your own
posts.

`searchLocations(accessToken, options, fields?)` searches for locations by name
or coordinates. Options: `{ query?, latitude?, longitude? }`. Returns location
objects with IDs you can pass to `createThreadsContainer` as `locationId`.

`getLocation(locationId, accessToken, fields?)` returns details for a location
(name, address, city, country, coordinates).

## Tokens

`exchangeCodeForToken(clientId, clientSecret, code, redirectUri)` exchanges an
OAuth authorization code for a short-lived access token. Returns
`{ access_token, user_id }`.

`getAppAccessToken(clientId, clientSecret)` gets an app-level access token via
client credentials. Returns `{ access_token, token_type }`.

`exchangeToken(clientSecret, accessToken)` exchanges a short-lived token for a
long-lived one (60 days). Returns `{ access_token, token_type, expires_in }`.

`refreshToken(accessToken)` refreshes a long-lived token before it expires. Same
return shape.

`debugToken(accessToken, inputToken)` returns metadata about a token: app ID,
scopes, expiry, validity.

## Other

`getPublishingLimit(userId, accessToken, fields?)` returns rate limit info: post
quota, reply quota, and remaining usage.

`getMentions(userId, accessToken, options?, fields?)` returns posts that mention
the authenticated user.

`getOEmbed(accessToken, url, maxWidth?)` returns embeddable HTML for a Threads
post URL. Returns `{ html, provider_name, type, version, width }`.

## Utilities

`validateRequest(request)` checks a `ThreadsPostRequest` for invalid
combinations (wrong media type for polls, too many text entities, etc.) and
throws descriptive errors. Called automatically by `createThreadsContainer`.

`checkContainerStatus(containerId, accessToken)` polls a container's publishing
status. Returns `{ status, error_message? }` where `status` is `"FINISHED"`,
`"IN_PROGRESS"`, `"EXPIRED"`, `"ERROR"`, or `"PUBLISHED"`.

## Testing

Denim ships a `MockThreadsAPI` interface for testing without network requests.
Set an implementation on `globalThis.threadsAPI` and all functions route through
it instead of calling the Threads API:

```typescript
import { MockThreadsAPIImpl } from "@codybrom/denim";

const mock = new MockThreadsAPIImpl();
(globalThis as any).threadsAPI = mock;

// Now all denim functions use the mock
const container = await createThreadsContainer({ ... });

// Enable error mode to test failure paths
mock.setErrorMode(true);
```

See `mod_test.ts` for more examples.

```bash
deno task test
```

## License

[MIT](LICENSE)
