# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - Unreleased

### Changed

- Response types now use snake_case to match the actual API. In v1, fields like
  `hasReplies` on `ThreadsPost` were camelCase but never populated because the
  API returns `has_replies`. Input types still use camelCase.
- `PublishingLimit` fields are optional (the API only returns requested fields)
- `MockThreadsAPI` class renamed to `MockThreadsAPIImpl`
- Updated to Deno 2 conventions and `@std/assert` ^1.0.18

### Added

- 22 new functions covering profiles, replies, insights, search, locations,
  OAuth, token management, oEmbed, repost, and delete (see readme for the full
  list)
- 11 new post options: polls, GIFs, ghost posts, spoilers, text attachments,
  replies, quotes, topic tags, location tags
- Optional `fields` parameter on retrieval functions
- Validation for new post parameters

## [1.3.6] - 2024-09-23

### Fixed

- Permalink retrieval in `publishThreadsContainer`

## [1.3.5] - 2024-09-23

### Added

- `getThreadsList` function for retrieving a user's threads with pagination
- `getSingleThread` function for retrieving a single thread by ID
- `getPermalink` option on `publishThreadsContainer` to return permalink with
  the published post ID
- `MockThreadsAPI` interface and mock implementation for testing
- `ThreadsPost`, `ThreadsListResponse`, and `PublishingLimit` types

### Changed

- Extracted types into dedicated `types.ts` module
- Refactored all API functions to support mock API injection via `getAPI()`
- Updated edge function example

## [1.3.1] - 2024-09-13

### Fixed

- Media item container creation for video posts

## [1.3.0] - 2024-09-13

### Added

- `checkContainerStatus` helper to poll container status after publishing
- Status polling loop in `publishThreadsContainer` — waits for `PUBLISHED` or
  `FINISHED` status before returning

### Changed

- Refactored `createThreadsContainer` to use a switch statement for
  media-type-specific parameter handling
- Videos are now posted directly instead of being wrapped in a carousel

## [1.2.0] - 2024-09-13

### Removed

- `checkHealth` function (unused Threads API endpoint)
- `Threads API.md` reference file

## [1.1.0] - 2024-09-13

### Added

- `CAROUSEL` media type support
- `createCarouselItem` function for building carousel posts
- `getPublishingLimit` function for checking rate limit usage
- `checkHealth` function for Threads API health checks
- Post options: `altText`, `linkAttachment`, `allowlistedCountryCodes`,
  `replyControl`, `children`
- Input validation for media type and property combinations
- `package.json` for npm publishing
- Comprehensive test suite

## [1.0.2] - 2024-08-01

### Changed

- Updated readme with JSR badges and `deno add` install instructions
- Switched import examples from raw GitHub URL to JSR registry

## [1.0.1] - 2024-08-01

### Added

- JSDoc comments on all public exports
- MIT license

## [1.0.0] - 2024-08-01

### Added

- `createThreadsContainer` function for creating media containers (TEXT, IMAGE,
  VIDEO)
- `publishThreadsContainer` function for publishing containers
- `ThreadsPostRequest` type
- `serveRequests` edge function handler
- GitHub Actions workflow for publishing to JSR
