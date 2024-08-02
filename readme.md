# @codybrom/denim

[![JSR](https://jsr.io/badges/@codybrom/denim)](https://jsr.io/@codybrom/denim>) [![JSR Score](https://jsr.io/badges/@codybrom/denim/score)](https://jsr.io/@codybrom/denim)

**Denim** is a Deno module that provides a simple interface for posting single Threads posts using text, images, or videos.

## Features

- Create and publish posts on Threads
- Support for text-only, image, and video posts
- Easy-to-use API
- Deployable as an edge function

## Installation

### Using with Deno

To add Denim to your Deno project, you can use the following command:

```bash
deno add @codybrom/denim
```

This will add the latest version of Denim to your project's dependencies.

## Usage

To import straight from JSR, 

```typescript
import { ThreadsPostRequest, createThreadsContainer, publishThreadsContainer } from 'jsr:@codybrom/denim@^1.0.2';
```


### Basic Usage

```typescript
import { createThreadsContainer, publishThreadsContainer, ThreadsPostRequest } from "jsr:@codybrom/denim@^1.0.2";

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

#### Image Post

```typescript
const imageRequest: ThreadsPostRequest = {
  userId: "YOUR_USER_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  mediaType: "IMAGE",
  text: "Check out this image!",
  imageUrl: "https://example.com/image.jpg",
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
