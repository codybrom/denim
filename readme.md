# Denim

[![JSR](https://jsr.io/badges/@codybrom/denim)](https://jsr.io/@codybrom/denim) [![JSR Score](https://jsr.io/badges/@codybrom/denim/score)](https://jsr.io/@codybrom/denim)

**Denim** is a Deno module that provides a simple interface for posting single Threads posts using text, images, or videos.

## Features

- Create and publish posts on Threads with an easy-use-API
- Supports text-only, image, video, and carousel posts
- Add alt text to image and video posts
- Attach links to text posts
- Geo-gate content to specific countries
- Control who can reply to posts
- Retrieve publishing rate limit information
- Ready to deploy as an edge function

## Installation

### Using with Deno

To add Denim to your Deno project, you can use the following command:

```bash
deno add @codybrom/denim
```

This will add the latest version of Denim to your project's dependencies.

## Usage

To import straight from JSR:

```typescript
import { ThreadsPostRequest, createThreadsContainer, publishThreadsContainer } from 'jsr:@codybrom/denim@^1.3.0';
```

### Basic Usage

```typescript
import { createThreadsContainer, publishThreadsContainer, ThreadsPostRequest } from "jsr:@codybrom/denim@^1.3.0";

const request: ThreadsPostRequest = {
  userId: "YOUR_USER_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  mediaType: "TEXT",
  text: "Check out Denim on GitHub!",
  linkAttachment: "https://github.com/codybrom/denim",
  replyControl: "everyone",
};

// Create a container
const containerId = await createThreadsContainer(request);

// Publish the container
const publishedId = await publishThreadsContainer(request.userId, request.accessToken, containerId);

console.log(`Post published with ID: ${publishedId}`);
```

#### Retrieving Publishing Rate Limit

```typescript
import { getPublishingLimit } from "jsr:@codybrom/denim@^1.3.0";

const userId = "YOUR_USER_ID";
const accessToken = "YOUR_ACCESS_TOKEN";

try {
  const rateLimit = await getPublishingLimit(userId, accessToken);
  console.log("Current usage:", rateLimit.quota_usage);
  console.log("Total quota:", rateLimit.config.quota_total);
  console.log("Quota duration (seconds):", rateLimit.config.quota_duration);
} catch (error) {
  console.error("Failed to retrieve rate limit information:", error);
}
```

### Posting Different Media Types

#### Text-only Post

```typescript
const textRequest: ThreadsPostRequest = {
  userId: "YOUR_USER_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  mediaType: "TEXT",
  text: "This is a text-only post on Threads!",
};
```

#### Text Post with Link Attachment

```typescript
const textRequest: ThreadsPostRequest = {
  userId: "YOUR_USER_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  mediaType: "TEXT",
  text: "This is a post with an attached link on Threads!",
  linkAttachment: "https://example.com",
};
```

#### Image Post with Alt Text

```typescript
const imageRequest: ThreadsPostRequest = {
  userId: "YOUR_USER_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  mediaType: "IMAGE",
  text: "Check out this image!",
  imageUrl: "https://example.com/image.jpg",
  altText: "A beautiful sunset over the ocean",
};
```

#### Video Post

```typescript
const videoRequest: ThreadsPostRequest = {
  userId: "YOUR_USER_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  mediaType: "VIDEO",
  text: "Watch this video!",
  videoUrl: "https://example.com/video.mp4",
};
```

#### Video Post with Alt Text, Reply Control and Geo-gating* (requires special account permission)

```typescript
const videoRequest: ThreadsPostRequest = {
  userId: "YOUR_USER_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  mediaType: "VIDEO",
  text: "Watch this video!",
  videoUrl: "https://example.com/video.mp4",
  altText: "A tutorial on how to make a chocolate cake",
  allowlistedCountryCodes: ["US", "GB"],
  replyControl: "mentioned_only",
};
```

#### Carousel Post

```typescript
import { createCarouselItem, createThreadsContainer, publishThreadsContainer, ThreadsPostRequest } from "jsr:@codybrom/denim@^1.0.4";

// First, create carousel items
const item1Id = await createCarouselItem({
  userId: "YOUR_USER_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  mediaType: "IMAGE",
  imageUrl: "https://example.com/image1.jpg",
  altText: "First image in the carousel",
});

const item2Id = await createCarouselItem({
  userId: "YOUR_USER_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  mediaType: "VIDEO",
  videoUrl: "https://example.com/video.mp4",
  altText: "Video in the carousel",
});

// Then, create the carousel post
const carouselRequest: ThreadsPostRequest = {
  userId: "YOUR_USER_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  mediaType: "CAROUSEL",
  text: "Check out this carousel post!",
  children: [item1Id, item2Id],
  replyControl: "everyone",
};

const containerId = await createThreadsContainer(carouselRequest);
const publishedId = await publishThreadsContainer(carouselRequest.userId, carouselRequest.accessToken, containerId);

console.log(`Carousel post published with ID: ${publishedId}`);
```

## Deploying as an Edge Function

Denim can be easily deployed as an edge function. An example implementation is provided in `examples/edge-function.ts`.

To deploy:

1. Copy the `examples/edge-function.ts` file to your project.
2. Deploy this file to your serverless platform that supports Deno.
3. Send POST requests to your function's URI with the appropriate JSON body.

### Example cURL Commands

```bash
# Post a text-only Thread
curl -X POST <YOUR_FUNCTION_URI> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_KEY" \
  -d '{
    "userId": "YOUR_USER_ID",
    "accessToken": "YOUR_ACCESS_TOKEN",
    "mediaType": "TEXT",
    "text": "Hello from Denim!"
  }'

# Post an image Thread
curl -X POST <YOUR_FUNCTION_URI> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_KEY" \
  -d '{
    "userId": "YOUR_USER_ID",
    "accessToken": "YOUR_ACCESS_TOKEN",
    "mediaType": "IMAGE",
    "text": "Check out this image I posted with Denim!",
    "imageUrl": "https://example.com/image.jpg"
  }'

# Post a video Thread
curl -X POST <YOUR_FUNCTION_URI> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_KEY" \
  -d '{
    "userId": "YOUR_USER_ID",
    "accessToken": "YOUR_ACCESS_TOKEN",
    "mediaType": "VIDEO",
    "text": "Watch this video I posted with Denim!",
    "videoUrl": "https://example.com/video.mp4"
  }'
```

Note: Replace with your actual authorization headers if your edge function requires them (or remove them).

## Security Note

Ensure that your function is deployed with appropriate access controls and authentication mechanisms to protect sensitive data like access tokens.

## Testing

To run the tests:

```bash
deno test mod_test.ts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)
