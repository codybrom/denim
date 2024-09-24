# Denim

[![JSR](https://jsr.io/badges/@codybrom/denim)](https://jsr.io/@codybrom/denim) [![JSR Score](https://jsr.io/badges/@codybrom/denim/score)](https://jsr.io/@codybrom/denim)

**Denim** is a TypeScript/Deno module designed to simplify the process of creating and managing posts on Threads. It provides an intuitive API for posting text, images, videos, and carousels, as well as retrieving posts and managing rate limits.

## Features

- **Create and Publish Posts**: Easily create and publish text, image, video, and carousel posts.
- **Media Support**: Add alt text to images and videos, attach links to text posts, and control replies.
- **Monitor Rate Limits**: Retrieve publishing rate limit information.
- **Mock API**: Includes a mock API for testing purposes without hitting real endpoints.
- **Edge Function Ready**: Deployable as a serverless edge function for real-time posting.

## Installation

### Using with Deno

To add Denim to your Deno project, you can use the following command:

```bash
deno add @codybrom/denim
```

This will add the latest version of Denim to your project's dependencies.

## Usage

### Importing

To import Denim directly in your Deno project from JSR:

```typescript
import { ThreadsPostRequest, createThreadsContainer, publishThreadsContainer } from 'jsr:@codybrom/denim';
```

### Basic Usage

Here's a basic example of creating and publishing a text post:

```typescript
import { createThreadsContainer, publishThreadsContainer, ThreadsPostRequest } from "jsr:@codybrom/denim";

const request: ThreadsPostRequest = {
  userId: "YOUR_USER_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  mediaType: "TEXT",
  text: "Hello, Threads!",
};

// Create a container
const containerId = await createThreadsContainer(request);

// Publish the container
const publishedId = await publishThreadsContainer(request.userId, request.accessToken, containerId);

console.log(`Post published with ID: ${publishedId}`);
```

#### Retrieving Publishing Rate Limit

```typescript
import { getPublishingLimit } from "jsr:@codybrom/denim";

const rateLimit = await getPublishingLimit("YOUR_USER_ID", "YOUR_ACCESS_TOKEN");
console.log("Current usage:", rateLimit.quota_usage);
console.log("Total quota:", rateLimit.config.quota_total);
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

#### Video Post with Alt Text and Reply Controls

```typescript
const videoRequest: ThreadsPostRequest = {
  userId: "YOUR_USER_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  mediaType: "VIDEO",
  text: "Watch this video!",
  videoUrl: "https://example.com/video.mp4",
  altText: "A tutorial on how to make a chocolate cake",
  replyControl: "mentioned_only",
};
```

#### Carousel Post

```typescript
import { createCarouselItem, createThreadsContainer, publishThreadsContainer, ThreadsPostRequest } from "jsr:@codybrom/denim";
// First, create carousel items
const item1Id = await createCarouselItem({
  userId: "YOUR_USER_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  mediaType: "IMAGE",
  imageUrl: "https://example.com/image1.jpg",
  altText: "First image",
});

const item2Id = await createCarouselItem({
  userId: "YOUR_USER_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  mediaType: "VIDEO",
  videoUrl: "https://example.com/video.mp4",
  altText: "A video",
});

// Create and publish the carousel post
const carouselRequest: ThreadsPostRequest = {
  userId: "YOUR_USER_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  mediaType: "CAROUSEL",
  text: "Check out this carousel!",
  children: [item1Id, item2Id],
};

const carouselContainerId = await createThreadsContainer(carouselRequest);
const publishedContainerId = await publishThreadsContainer(carouselRequest.userId, carouselRequest.accessToken, carouselContainerId);
```

## Deploying as an Edge Function

Denim can be easily deployed as an edge function on serverless platforms that support Deno. An example implementation is available in `examples/edge-function.ts`.

### Deployment Steps

1. Copy `examples/edge-function.ts` to your project.
2. Deploy the file to your serverless platform.
3. Send requests to your function's URI.

### Example cURL Commands

```bash
# Post a text-only Thread
curl -X POST <YOUR_FUNCTION_URI>/post \
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

Ensure your deployment uses proper access controls and authentication to protect sensitive data like access tokens.

## Testing

Run the tests using:

```bash
deno test mod_test.ts
```

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

This project is licensed under the [MIT License](LICENSE).
