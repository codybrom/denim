# Threads API

The Threads API enables developers to build their own unique integrations, and helps creators and brands manage their Threads presence at scale and easily share inspiring content with their communities.

## Overview

Brief overview of the Threads API limitations.

You may use the Threads API to enable people to create and publish content on a person’s behalf on Threads, and to display those posts within your app solely to the person who created it.

### Rate Limiting

Calls to the Threads API are counted against the calling app's call count. An app's call count is unique for each app and app user pair and is the number of calls the app has made in a rolling 24-hour window. It is calculated as follows:

`Calls within 24 hours = 4800 * Number of Impressions`

The Number of Impressions is the number of times any content from the app user's Threads account has entered a person's screen within the last 24 hours. Rate limiting may also be subject to total CPU time per day:

`720000 * number_of_impressions for total_cputime   2880000 * Number of Impressions for total_time`

**Note:** The minimum value for impressions is 10 (so if the impressions is less than 10 we default to 10).

#### Posts

Threads profiles are limited to 250 API-published posts within a 24-hour moving period. Carousels count as a single post. This limit is enforced on the `POST /{threads-user-id}/threads_publish` endpoint when attempting to publish a media container. We recommend that your app also enforces the publishing rate limit, especially if your app allows app users to schedule posts to be published in the future.

To check a profile's current Threads API rate limit usage, query the [`GET /{threads-user-id}/threads_publishing_limit` endpoint](https://developers.facebook.com/docs/threads/reference/user#get---threads-user-id--threads-publishing-limit).

**Note:** This endpoint requires the `threads_basic` and `threads_content_publish` permissions.

##### Fields

|Name|Description|
|---|---|
|`quota_usage`|Threads publishing count over the last 24 hours.|
|`config`|Threads publishing rate limit config object, which contains the `quota_total` and `quota_duration` fields.|

##### Example Request

curl -s -X GET \
  "https:graph.threads.net/v1.0/<THREADS_USER_ID>/threads_publishing_limit?fields=quota_usage,config&access_token=<ACCESS_TOKEN>"

##### Example Response

{
  "data": [
    {
      "quota_usage": 4,
      "config": {
        "quota_total": 250,
        "quota_duration": 86400
      }
    }
  ]
}

#### Replies

Threads profiles are limited to 1,000 replies within a 24-hour moving period.

To check a profile's current Threads replies rate limit usage, query the [`GET /{threads-user-id}/threads_publishing_limit` endpoint](https://developers.facebook.com/docs/threads/reference/user#get---threads-user-id--threads-publishing-limit). See the [Reply Management](https://developers.facebook.com/docs/threads/reply-management) documentation for more information.

**Note:** This endpoint requires the `threads_basic`, `threads_content_publish`, and `threads_manage_replies` permissions.

##### Fields

|Name|Description|
|---|---|
|`reply_quota_usage`|Threads reply publishing count over the last 24 hours.|
|`reply_config`|Threads reply publishing rate limit config object, which contains the `quota_total` and `quota_duration` fields.|

##### Example Request

```bash
curl -s -X GET \
  "https://graph.threads.net/v1.0/<THREADS_USER_ID>/threads_publishing_limit?fields=reply_quota_usage,reply_config&access_token=<ACCESS_TOKEN>"
```

##### Example Response

```json
{
  "data": [
    {
      "reply_quota_usage": 1,
      "reply_config": {
        "quota_total": 1000,
        "quota_duration": 86400
      }
    }
  ]
}
```

### Limitations

#### Image Specifications

- **Format:** JPEG and PNG image types are the officially supported formats for image posts.
- **File Size:** 8 MB maximum.
- **Aspect Ratio Limit:** 10:1
- **Minimum Width:** 320 (will be scaled up to the minimum if necessary)
- **Maximum Width:** 1440 (will be scaled down to the maximum if necessary)
- **Height:** Varies (depending on width and aspect ratio)
- **Color Space:** sRGB. Images using other color spaces will have their color spaces converted to sRGB.

#### Video Specifications

- **Container:** MOV or MP4 (MPEG-4 Part 14), no edit lists, moov atom at the front of the file.
- **Audio Codec:** AAC, 48khz sample rate maximum, 1 or 2 channels (mono or stereo).
- **Video Codec:** HEVC or H264, progressive scan, closed GOP, 4:2:0 chroma subsampling.
- **Frame Rate:** 23-60 FPS
- **Picture Size:**
  - Maximum Columns (horizontal pixels): 1920
  - Required aspect ratio is between 0.01:1 and 10:1 but we recommend 9:16 to avoid cropping or blank space.
- **Video Bitrate:** VBR, 25 Mbps maximum.
- **Audio Bitrate:** 128 kbps.
- **Duration:** 300 seconds (5 minutes) maximum, minimum longer than 0 seconds.
- **File Size:** 1 GB maximum.

#### Other Limitations

- Text posts are limited to 500 characters.
- Carousel posts must have a maximum of 10 children and a minimum of 2 children.
- For additional limitations, refer to each endpoint's reference.

## Get Started

Learn about the requirements for using the Threads API.

How to create and customize a Meta app with the Threads API use case in the App Dashboard.

To access the Threads API, create an app and pick the [Threads Use Case](https://developers.facebook.com/docs/development/create-an-app/threads-use-case).

This guide provides information on what you need to get started using the Threads API.

### Before You Start

You need the following:

#### Meta App

A [Meta app](https://developers.facebook.com/apps) created with the [Threads use case](https://developers.facebook.com/docs/development/create-an-app/threads-use-case).

#### Public Server

We download media used in publishing attempts so the media must be hosted on a publicly accessible server at the time of the attempt.

#### Authorization

Data access authorization is controlled by your app users through the use of the permissions listed below. Users must grant your app these permissions through the [Authorization Window](https://developers.facebook.com/docs/threads/get-started#authorization-window) before your app can access their data. For more details, refer to our [Permissions guide](https://developers.facebook.com/docs/permissions#t).

- `threads_basic` — Required for all Threads endpoints.
- `threads_content_publish` — Required for Threads publishing endpoints only.
- `threads_manage_replies` — Required for making `POST` calls to reply endpoints.
- `threads_read_replies` — Required for making `GET` calls to reply endpoints.
- `threads_manage_insights` — Required for making `GET` calls to insights endpoints.

[Threads testers](https://developers.facebook.com/docs/threads/get-started#threads-testers) can grant your app these permissions at any time. In order for app users without a role on your app to be able to grant your app these permissions, each permission must first be approved through the [App Review](https://developers.facebook.com/docs/resp-plat-initiatives/app-review) process, and your app must be published.

Permission grants made by app users with public profiles are valid for 90 days. [Refreshing](https://developers.facebook.com/docs/threads/get-started/long-lived-tokens#refresh-a-long-lived-token) an app user's long-lived access token will extend the permission grant for another 90 days if the app user who granted the token has a public profile. If the app user's profile is [private](https://l.facebook.com/l.php?u=https%3A%2F%2Fhelp.instagram.com%2F225222310104065%3Ffbclid%3DIwZXh0bgNhZW0CMTEAAR3OJfQGo1fYY5Zryqr9y-0Hu9mhDo7_YCoK8BrOMxy8-X94_eElrJHtdOw_aem_w_96vkbNqR4OZbt3OEYjUQ&h=AT3tUnPiJB_ZDtiqW_TyNek7YOCI6H6cYZuWki6ESbzQUuUTtuq66lzqFxcr4iKX1ymB6fZST5OKMnVRr5HA8xa0RELTc0a24ShBYUyFmo7I853SvQP6oy9Jcds1_oqPPXX1Bi_VIbg), however, the permission grant cannot be extended and the app user must grant the expired permission to your app again.

#### Threads User Access Tokens

API authentication is handled by Threads user access tokens that conform to the OAuth 2.0 protocol. Access tokens are app-scoped (unique to the app and user pair) and can be short-lived or long-lived. API requests that query Threads users or publish Threads media must include a Threads user access token. Use the [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/) to debug your Threads User Access Token.

##### Short-Lived Access Tokens

Short-lived access tokens are valid for 1 hour, but can be exchanged for [long-lived tokens](https://developers.facebook.com/docs/threads/get-started/long-lived-tokens). To get a short-lived access token, implement the [Authorization Window](https://developers.facebook.com/docs/threads/get-started#authorization-window) into your app. After the app user authenticates their identity through the window, we will redirect the user back to your app and include an [authorization code](https://developers.facebook.com/docs/threads/get-started#authorization-codes), which you can then [exchange for a short-lived access token](https://developers.facebook.com/docs/threads/get-started/get-access-tokens-and-permissions).

##### Long-Lived Access Tokens

Short-lived tokens that have not expired can be [exchanged for long-lived access tokens](https://developers.facebook.com/docs/threads/get-started/long-lived-tokens), which are valid for 60 days. Long-lived tokens can be [refreshed](https://developers.facebook.com/docs/threads/get-started/long-lived-tokens#refresh-a-long-lived-token) before they expire by querying the `GET /refresh_access_token` endpoint.

#### Authorization Window

The Authorization Window allows your app to get [authorization codes](https://developers.facebook.com/docs/threads/get-started#authorization-codes) and [permissions](https://developers.facebook.com/docs/threads/get-started#permissions) from app users. Authorization codes can be exchanged for [Threads user access tokens](https://developers.facebook.com/docs/threads/get-started#threads-user-access-tokens), which must be included when fetching an app user's profile, retrieving Threads media, publishing posts, reading replies, managing replies, or viewing insights.

![](https://scontent-dfw5-1.xx.fbcdn.net/v/t39.8562-6/448400385_1192671258431902_561156009842405502_n.png?_nc_cat=103&ccb=1-7&_nc_sid=f537c7&_nc_ohc=VjSWy68S8iUQ7kNvgGXVnpx&_nc_ht=scontent-dfw5-1.xx&_nc_gid=ARsOjEXUAAIwOc4nlgG-Yj2&oh=00_AYBkX0ZyBB08WkxU4JfYts5RyG2SrdlWy_Vacui5bWj8Gg&oe=66EA2CCF)

To implement the Authorization Window, refer to the [Getting Access Tokens](https://developers.facebook.com/docs/threads/get-started/get-access-tokens-and-permissions) guide.

#### Authorization Codes

Authorization codes can be exchanged for short-lived [Threads user access tokens](https://developers.facebook.com/docs/threads/get-started#threads-user-access-tokens). To get an authorization code, implement the [Authorization Window](https://developers.facebook.com/docs/threads/get-started#authorization-window) into your app. After an app user authenticates their identity through the window and grants your app any permissions it needs, we will redirect the user to your app and include an authorization code. You can then use the API to exchange the code for the app user's short-lived Threads user access token.

**Note:** Authorization codes are short-lived and are only valid for 1 hour.

#### Threads Testers

In order to test your app with a Threads user, you must first send an invitation to the Threads user's profile and accept the invitation. Invitations can be sent by clicking on the **Add People** button and selecting **Threads Tester** in the **App Dashboard** > **App roles** > **Roles** tab.

![](https://scontent-dfw5-2.xx.fbcdn.net/v/t39.8562-6/448437743_497641552720473_834837554385422272_n.png?_nc_cat=102&ccb=1-7&_nc_sid=f537c7&_nc_ohc=kgHSGKFpYT0Q7kNvgHWcDnc&_nc_ht=scontent-dfw5-2.xx&_nc_gid=ARsOjEXUAAIwOc4nlgG-Yj2&oh=00_AYBA29k_FaeFOAc9MuPJ7Ye9c0yehnvo_eWVZy3XSjRQ-A&oe=66EA32D6)

Invitations can be accepted by the Threads user in the **Website permissions** section under [**Account Settings**](https://www.threads.net/settings/account?fbclid=IwZXh0bgNhZW0CMTEAAR0JSHHNS64W6uIUf1xZaT0In7KOOfwTdIVdzuIIXdm4pI2gTMcUR1cixKg_aem_m4qINfi8EaLc3fk22VSJmA) of the Threads website or mobile app after signing into their account.

![](https://scontent-dfw5-1.xx.fbcdn.net/v/t39.8562-6/448398889_856199966351807_1368075304931297357_n.png?_nc_cat=101&ccb=1-7&_nc_sid=f537c7&_nc_ohc=0Jl55JNE_xkQ7kNvgHryYLf&_nc_ht=scontent-dfw5-1.xx&_nc_gid=ARsOjEXUAAIwOc4nlgG-Yj2&oh=00_AYAXqQq1GdnOcCKuPvU5-OHaOuGUEN_nhBYa9Y0duM42cA&oe=66EA281C)

### Sample App

Our open-source [Threads API sample app](https://l.facebook.com/l.php?u=https%3A%2F%2Fgithub.com%2Ffbsamples%2Fthreads_api%3Ffbclid%3DIwZXh0bgNhZW0CMTEAAR2TkZNX37G5P8BKrvnlcKT7_LUJTZ44kWqK38RE1UCqRkZsMIg-a-mGOek_aem_8brxVsjNaypGOenLdCrK_A&h=AT2982AdyK5WDmQKkLXJHRadFqlkhN_9zc7dYeczCOc_L0P9O8NhbQ5mW_XF9i9FgNB_6UMIX9m8BnCJ6N1j9Sn7dpjK_aFiZhrIA4kxpMhchPYR9wPoFm7BVQp1qV70wlKYhPJ3Gso) serves as a practical guide, enabling you to better understand the API and troubleshoot any issues by referencing a working implementation. This can simplify the integration process, accelerate development time, and ensure a smoother implementation experience.

### Get Access Tokens and Permissions

This guide explains how to use the Authorization Window to get short-lived Threads user access tokens and permissions from Threads users.

#### Step 1: Get Authorization

The Authorization Window allows app users to grant your app permissions and short-lived Threads user access tokens. After a user logs in and chooses which data to allow your app to access, we will redirect the user to your app and include an authorization code, which you can then exchange for a short-lived access token.

To begin the process, get the Authorization Window and present it to the user:

```php
https://threads.net/oauth/authorize
  ?client_id=<THREADS_APP_ID>
  &redirect_uri=<REDIRECT_URI>
  &scope=<SCOPE>
  &response_type=code
  &state=<STATE> // Optional
```

``
If accessing the Authorization Window from an Android mobile system, make sure to open the URL in the native webview or browser and not the native app.

An example of how you can achieve this with JavaScript:

```js
window.open(url, '_system');
```

##### Parameters

**Note:** All parameters except `state` are required.

| Name                                                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client_id`numeric string                      | **Required.**  Your Threads App ID displayed in **App Dashboard** > **App settings** > **Basic** > **Threads App ID**.  **Example:** `990602627938098`                                                                                                                                                                                                                                                                                                                                       |
| `redirect_uri`string                           | **Required.**  A URI where we will redirect users after they allow or deny permission requests. Make sure this exactly matches one of the base URIs in your list of [valid OAuth URIs](https://developers.facebook.com/docs/development/create-an-app/threads-use-case#step-7--add-settings). Keep in mind that the App Dashboard may have added a trailing slash to your URIs, so we recommend that you verify by checking the list.  **Example:** <https://socialsizzle.herokuapp.com/auth/> |
| `response_type`string                          | **Required.**  Set this value to `code`.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `scope`comma-separated or space-separated list | **Required.**  A comma-separated list, or URL-encoded space-separated list, of permissions to request from the app user.  **Note:** `threads_basic` is required.  **Values:** `threads_basic`, `threads_content_publish`, `threads_read_replies`, `threads_manage_replies`, `threads_manage_insights`                                                                                                                                                                                    |
| `state`string                                  | An optional value indicating a server-specific state. For example, you can use this to protect against CSRF issues. We will include this parameter and value when redirecting the user back to you.  **Example:** `1`                                                                                                                                                                                                                                                                            |

##### Sample Authorization Window URL

```php
https://threads.net/oauth/authorize
  ?client_id=990602627938098
  &redirect_uri=https://socialsizzle.herokuapp.com/auth/
  &scope=threads_basic,threads_content_publish
  &response_type=code
```

##### Successful Authorization

If authorization is successful, we will redirect the user to your redirect_uri and pass you an authorization code through the code query string parameter. Capture the code so your app can exchange if for a short-lived Threads User Access Token.

Authorization codes are valid for 1 hour and can only be used once.

###### Sample Successful Authentication Redirect

<https://socialsizzle.herokuapp.com/auth/?code=AQBx-hBsH3...#>_

**Note:** `#_` will be appended to the end of the redirect URI, but it is not part of the code itself, so strip it out.

##### Canceled Authorization

If the user cancels the authorization flow, we will redirect the user to your `redirect_uri` and append the following error parameters.

**Note:** It is your responsibility to fail gracefully in these situations and display an appropriate message to your users.

|Error Parameter|Description|
|---|---|
|`error`|`acceess_denied`|
|`error_reason`|`user_denied`|
|`error_description`|`The+user+denied+your+request`|

###### Sample Canceled Authorization Redirect

```php
https://socialsizzle.herokuapp.com/auth/?error=access_denied
  &error_reason=user_denied
  &error_description=The+user+denied+your+request
```

#### Step 2: Exchange the Code For a Token

Once you receive a code, exchange it for a short-lived access token by sending a `POST` request to the following endpoint:

```php
POST https://graph.threads.net/oauth/access_token
```

##### Parameters

Include the following parameters in your `POST` request body.

|Name|Description|
|---|---|
|`client_id`numeric string|**Required.**  Your Threads App ID displayed in **App Dashboard** > **App settings** > **Basic** > **Threads App ID**.  **Example:** `990602627938098`|
|`client_secret`string|**Required.**  Your Threads App Secret displayed in **App Dashboard** > **App settings** > **Basic** > **Threads App secret**.  **Example:** `a1b2C3D4`|
|`code`string|**Required.**  The authorization code we passed you in the `code` parameter when redirecting the user to your `redirect_uri`.  **Example:** `AQBx-hBsH3...`|
|`grant_type`string|**Required.**  Set this value to `authorization_code`.|
|`redirect_uri`string|**Required.**  The redirect URI you passed us when you directed the user to our Authorization Window. This must be the same URI or we will reject the request.  **Example:** <https://socialsizzle.heroku.com/auth/>|

##### Sample Request

```bash
curl -X POST \
  https://graph.threads.net/oauth/access_token \
  -F client_id=990602627938098 \
  -F client_secret=eb8c7... \
  -F grant_type=authorization_code \
  -F redirect_uri=https://socialsizzle.herokuapp.com/auth/ \
  -F code=AQBx-hBsH3...
```

##### Sample Success Response

If successful, the API will return a JSON payload containing the app user's short-lived access token and User ID.

```json
{
  "access_token": "THQVJ...",
  "user_id": 17841405793187218
}
```

Capture the `access_token` value. This is the user’s short-lived Threads user access token, which your app can use to access Threads API endpoints.

##### Sample Rejected Response

If the request is malformed in some way, the API will return an error.

```json
{
  "error_type": "OAuthException",
  "code": 400,
  "error_message": "Matching code was not found or was already used"
}
```

### Long-Lived Access Tokens

By default, Threads user access tokens are short-lived and are valid for one hour. However, short-lived tokens can be exchanged for long-lived tokens.

Long-lived tokens are valid for 60 days and can be refreshed as long as they are at least 24 hours old but have not expired, and the app user has granted your app the `threads_basic` permission. Refreshed tokens are valid for 60 days from the date at which they are refreshed. Tokens that have not been refreshed in 60 days will expire and can no longer be refreshed.

Long-lived access tokens for private Threads profiles can now be refreshed. In addition, permissions granted to apps by app users with private profiles are now valid for 90 days.

#### Limitations

- Expired short-lived tokens cannot be exchanged for long-lived tokens. If the user’s token has expired, get a new one before exchanging it for a long-lived token.
- Requests for long-lived tokens include your app secret so should only be made in server-side code, never in client-side code or in an app binary that could be decompiled. Do not share your app secret with anyone, expose it in code, send it to a client, or store it in a device.

#### Get a Long-Lived Token

Use the [`GET /access_token` endpoint](https://developers.facebook.com/docs/instagram-basic-display-api/reference/access_token#reading) to exchange a short-lived Threads user access token for a long-lived token. Once you have a long-lived token, you can use it in server-side requests or send it to the client for use there.

Your request must be made server-side and include:

- A valid (unexpired) short-lived Threads user access token
- Your Threads app secret (**App Dashboard** > **App settings** > **Basic** > **Threads App secret**)

##### Parameters

Include the following query string parameters to augment the request.

|Name|Description|
|---|---|
|`client_secret`string|**Required.**  Your Threads app's secret, displayed in the **App Dashboard** > **App settings** > **Basic** > **Threads App secret** field.|
|`grant_type`string|**Required.**  Set this to `th_exchange_token`.|
|`access_token`string|**Required.**  The valid (unexpired) short-lived Threads user access token that you want to exchange for a long-lived token.|

##### Sample Request

```bash
curl -i -X GET "https://graph.threads.net/access_token
  ?grant_type=th_exchange_token
  &client_secret=<THREADS_APP_SECRET>
  &access_token=<SHORT_LIVED_ACCESS_TOKEN>"
```

##### Sample Response

```json
{
  "access_token": "<LONG_LIVED_USER_ACCESS_TOKEN>",
  "token_type": "bearer",
  "expires_in": 5183944  // number of seconds until token expires
}
```

#### Refresh a Long-Lived Token

Use the [`GET /refresh_access_token` endpoint] to refresh unexpired long-lived Threads user access tokens. Refreshing a long-lived token makes it valid for 60 days again. Long-lived tokens that have not been refreshed in 60 days will expire.

Your request must include:

- A valid (unexpired) long-lived Threads user access token

##### Parameters

|Name|Description|
|---|---|
|`grant_type`string|**Required.**  Set this to `th_refresh_token`.|
|`access_token`string|**Required.**  The valid (unexpired) long-lived Threads user access token that you want to refresh.|

##### Sample Request

```bash
curl -i -X GET "https://graph.threads.net/refresh_access_token
  ?grant_type=th_refresh_token
  &access_token=<LONG_LIVED_ACCESS_TOKEN>"
```

##### Sample Response

```json
{
  "access_token": "<LONG_LIVED_USER_ACCESS_TOKEN>",
  "token_type": "bearer",
  "expires_in": 5183944 // number of seconds until token expires
}
```

## Post to Threads

You can use the Threads API to publish image, video, text, or carousel posts.

### Single Thread Posts

Publishing a single image, video, or text post is a two-step process:

1. Use the `POST /{threads-user-id}/threads` endpoint to create a media container using an image or video hosted on your public server and optional text. Alternatively, use this endpoint to create a media container with text only.
2. Use the `POST /{threads-user-id}/threads_publish` endpoint to publish the container.

#### Step 1: Create a Threads Media Container

Use the `POST /{threads-user-id}/threads` endpoint to create a Threads media container.

##### Parameters

The following parameters are **required**. Refer to the `POST /{threads-user-id}/threads` endpoint reference for additional supported parameters.

- `is_carousel_item` — Default value is `false` for single thread posts. Indicates an image or video that will appear in a carousel.
- `image_url` — (**For images only.**) The path to the image. We will cURL your image using the URL provided so it must be on a public server.
- `media_type` — Set to either `TEXT`, `IMAGE`, or `VIDEO`. Indicates the current media type. **Note:** Type `CAROUSEL` is not available for single thread posts.
- `video_url` — (**For videos only.**) Path to the video. We will cURL your video using the URL provided so it must be on a public server.
- `text` — The text associated with the post. The first URL included in the `text` field will be used as the link preview for the post. **For text-only posts, this parameter is required.**

##### Example Request

```bash
curl -i -X POST \
"https://graph.threads.net/v1.0/<THREADS_USER_ID>/threads?media_type=IMAGE&image_url=https://www.example.com/images/bronz-fonz.jpg&text=#BronzFonz&access_token=<ACCESS_TOKEN>"
```

##### Example Response

```json
{
  "id": "1234567" // Threads Media Container ID
}
```

#### Step 2: Publish a Threads Media Container

Use the `POST /{threads-user-id}/threads_publish` endpoint to publish the container ID returned in the previous step. It is recommended to wait on average 30 seconds before publishing a Threads media container to give our server enough time to fully process the upload. See the [media container status endpoint](https://developers.facebook.com/docs/threads/troubleshooting#publishing-does-not-return-a-media-id) for more details.

##### Parameters

- `creation_id` — Identifier of the Threads media container created from the `/threads` endpoint.

##### Example Request

```bash
curl -i -X POST \
"https://graph.threads.net/v1.0/<THREADS_USER_ID>/threads_publish?creation_id=<MEDIA_CONTAINER_ID>&access_token=<ACCESS_TOKEN>"
```

##### Example Response

```json
{
  "id": "1234567" // Threads Media ID
}
```

### Carousel Posts

You may publish up to 10 images, videos, or a mix of the two in a carousel post. Publishing carousels is a three-step process:

1. Use the `POST /{threads-user-id}/threads` endpoint to create individual item containers for each image and video that will appear in the carousel.
2. Use the `POST /{threads-user-id}/threads` endpoint again to create a single carousel container for the items.
3. Use the `POST /{threads-user-id}/threads_publish` endpoint to publish the carousel container.

Carousel posts count as a single post against the profile's [rate limit](https://developers.facebook.com/docs/threads/overview#rate-limiting).

#### Limitations

- Carousels are limited to 10 images, videos, or a mix of the two.
- Carousels require a minimum of two children.

#### Step 1: Create an Item Container

Use the `POST /{threads-user-id}/threads` endpoint to create an item container for the image or video that will appear in a carousel.

##### Parameters

The following parameters are **required**. Refer to the `POST /{threads-user-id}/threads` endpoint reference for additional supported parameters.

- `is_carousel_item` — Set to `true`. Indicates that the image or video will appear in a carousel.
- `image_url` — (**For images only.**) The path to the image. We will cURL your image using the passed in URL so it must be on a public server.
- `media_type` — Set to `IMAGE` or `VIDEO`. Indicates that the media is an image or a video.
- `video_url` — (**For videos only.**) Path to the video. We will cURL your video using the passed in URL so it must be on a public server.

**Note:** While the `text` field is optional for carousel posts, the first URL included in the `text` field will be used as the link preview for the post.

If the operation is successful, the API will return an item container ID, which can be used when creating the carousel container.

Repeat this process for each image or video that should appear in the carousel.

##### Example Request

```bash
curl -i -X POST \
"https://graph.threads.net/v1.0/<THREADS_USER_ID>/threads?image_url=https%3A%2F%2Fsol...&is_carousel_item=true&access_token=<ACCESS_TOKEN>"
```

##### Example Response

```json
{
  "id": "1234567"
}
```

#### Step 2: Create a Carousel Container

Use the `POST /{threads-user-id}/threads` endpoint to create a carousel container.

##### Parameters

The following parameters are **required**. Refer to the `POST /{threads-user-id}/threads` endpoint reference for additional supported parameters.

- `media_type` — Set to `CAROUSEL`. Indicates that the container is for a carousel.
- `children` — A comma-separated list of up to 10 container IDs of each image and/or video that should appear in the published carousel. Carousels can have at least 2 and up to 10 total images or videos or a mix of the two.
- `text`— (_Optional._) The text associated with the post.

##### Example Request

```bash
curl -i -X POST \
"https://graph.threads.net/v1.0/<THREADS_USER_ID>/threads?media_type=CAROUSEL&children=<MEDIA_ID_1>,<MEDIA_ID_2>,<MEDIA_ID_3>&access_token=<ACCESS_TOKEN>"
```

##### Example Response

```json
{
  "id": "1234567"
}
```

#### Step 3: Publish the Carousel Container

Use the `POST /{threads-user-id}/threads_publish` endpoint to publish a carousel post. Profiles are limited to 250 published posts within a 24-hour period. Publishing a carousel counts as a single post.

##### Parameters

The following parameters are **required**.

- `creation_id` — The carousel container ID.

If the operation is successful, the API will return a carousel album's Threads Media ID.

##### Example Request

```bash
curl -i -X POST \
"https://graph.threads.net/v1.0/<THREADS_USER_ID>/threads_publish?creation_id=<MEDIA_CONTAINER_ID>&access_token=<ACCESS_TOKEN>"
```

##### Example Response

```json
{
  "id": "1234567" // Threads Media ID
}
```

### Tags and Links in Posts

Tags and links appear in posts in such a way as to encourage engagement.

#### Tags

Tags make posts more social by allowing central topics of discussion. Only one tag is allowed per post, so the first valid tag included in a post of any type (text-only, image, video, carousel) via the API is treated as the tag for that post.

Information to keep in mind when adding a tag to a post:

- Valid tags start with a hash sign (#).
- Periods (.), ampersands (&), and spaces are not allowed in tags, so any tag that starts with a hash sign will end just before the period, ampersand, or blank space.
- The text is also configured in the app without the hash sign.

#### Links

To attach a link to your post, use the `link_attachment` parameter when creating a media object. If no `link_attachment` parameter is provided, then the first link made in a text-only post via the API is configured as the link attachment, which displays as a preview card, to make it easier to engage with and click on.

##### Limitations

- This feature is only available for text-only posts. It won't work on image, video, and carousel posts.

##### Publishing

Links can be attached when making a request to the `POST /threads` endpoint to [create a media object](https://developers.facebook.com/docs/threads/posts#step-1--create-a-threads-media-container). Make sure to include the following parameter with your API request:

- `link_attachment` — (For text posts only.) The URL that should be attached to a Threads post and displayed as a link preview. This must be a valid, publicly accessible URL.

###### Example Request

```bash
curl -i -X POST \
  "https://graph.threads.net/v1.0/<THREADS_USER_ID>/threads?media_type=TEXT&text=Link&access_token=<ACCESS_TOKEN>"
  -d link_attachment=https://developers.facebook.com/
```

###### Example Response

```json
{
  "id": "1234567" // Threads Media Container ID
}
```

The request above creates a Threads post container that, once [published](https://developers.facebook.com/docs/threads/posts#step-2--publish-a-threads-media-container), will attach a link preview to your media.

##### Media Retrieval

The value for the link attachment URL can be retrieved when making a request to the `GET /threads` or `GET /{threads_media_id}` endpoint to [retrieve media object(s)](https://developers.facebook.com/docs/threads/threads-media). Make sure to include the following field with your API request:

- `link_attachment_url` — The URL attached to a Threads post.

###### Example Request

```bash
curl -s -X GET \ "https://graph.threads.net/v1.0/<THREADS_MEDIA_ID>?fields=id,link_attachment_url&access_token=<ACCESS_TOKEN>"
```

###### Example Response

```json
{
   "id": "12312312312123",
   "link_attachment_url": "https://developers.facebook.com/",
}
```

### Fediverse

For Threads users who have [enabled sharing to the fediverse](https://l.facebook.com/l.php?u=https%3A%2F%2Fhelp.instagram.com%2F760878905943039%3Ffbclid%3DIwZXh0bgNhZW0CMTEAAR3Dbj0K55G1eVzfBGILXTL9G_qvDb0GixRTXSreo1SBOqEOLPuWbd75mXk_aem_0HjMYrstCxVTeG3kODVggQ&h=AT1HPS8IB6Nco6GEvJ3ZZs6k9J-XJFZ99nT-aNc23YOIqx0OZwHI__eJ-ssUlKSfVIsurFwz9-kjebTAubu2ZC9sftjjynZ3MUiIPKr1zClQWpGICV7BsrEsYueh1bOGpRH-xyNLU7Y), eligible posts made to Threads via the Threads API will also be shared to the fediverse starting August 28, 2024.

### Geo-Gated Content

You can use the Threads API to create geo-gated content restricted to one or more specific countries. Content marked in this way will only be shown to Threads profiles in those countries.

#### Limitations

Only users with access to this feature on threads.net can use this feature via Threads API.

#### User Eligibility

A user's eligibility for the geo-gating feature can be retrieved when making a request to the `GET /me` or `GET /{threads-user-id}` endpoints to [retrieve profile information](https://developers.facebook.com/docs/threads/threads-profiles#retrieve-a-threads-user-s-profile-information). To retrieve this value, include the following parameter with your API request:

- `is_eligible_for_geo_gating` - A boolean value which represents whether a user is eligible for the geo-gating feature.

##### Example Request

```bash
curl -s -X GET \
  "https://graph.threads.net/v1.0/me?fields=id,is_eligible_for_geo_gating&access_token=<ACCESS_TOKEN>"
```

##### Example Response

```json
{
   "id": "12312312312123",
   "is_eligible_for_geo_gating": true
}
```

This means that this user has access to the geo-gating feature.

#### Publish Geo-Gated Content

Geo-gating can be used when making a request to the `POST /threads` endpoint to [create a media object](https://developers.facebook.com/docs/threads/posts#step-1--create-a-threads-media-container). To use geo-gating, include the following parameter with your API request:

- `allowlisted_country_codes` - A string list of valid [ISO 3166-1 alpha-2 country codes](https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.iso.org%2Fobp%2Fui%2F%3Ffbclid%3DIwZXh0bgNhZW0CMTEAAR03aktIa4cn_jH-8C9MlKNCmoyCmfiiz8MJ6O9DGoqQ9xUON9KG8K5DDxk_aem_cjdYGKvpirGCtJdF8UfpJg%23search&h=AT3-QYPsuRNkhoqZeyiGJdX55IFEArWHOw8Nk59-EZ6eu6WnQ46r0BmpH5cPjlyxBjbcKUc3UgmgOLrD2Zw9JLqRYqVyc0HZECLgIObWEx8lc_DsJtERHF3upVpUJuQabGmNXJcg-xpWSHBg3S-CIuod) that represents the countries where this media should be shown. If this parameter is passed in, the media will not be shown to Threads profiles in countries outside of this list.

##### Example Request

```bash
curl -i -X POST \
  "https://graph.threads.net/v1.0/<THREADS_USER_ID>/threads?media_type=IMAGE&image_url=https://www.example.com/images/bronz-fonz.jpg&text=#BronzFonz&allowlisted_country_codes=US,CA&access_token=<ACCESS_TOKEN>"
```

This request would create a Threads post container that, once published, is only visible in the United States and Canada.

**Note:** The creator of a Threads post is always able to see their content, regardless of geo-gating settings.

#### Media Retrieval

Allowlisted country codes for geo-gating can be retrieved when making a request to the `GET /threads` or `GET /{threads_media_id}` endpoint to [retrieve media object(s)](https://developers.facebook.com/docs/threads/threads-media). To retrieve the geo-gating allowlist, include the following parameter with your API request:

- `allowlisted_country_codes` - A string list of valid [ISO 3166-1 alpha-2 country codes](https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.iso.org%2Fobp%2Fui%2F%3Ffbclid%3DIwZXh0bgNhZW0CMTEAAR1dBZsRMD2gF__ZxrB0n2NttfUfoo_9jTGxvj1QBwrcS0kaq1eZolz9IqA_aem_l1CG9HJSlI7GSETUrNFkFg%23search&h=AT0qSW9dTiEDrwHxkYv93AHCR_-W3oNuhSbeaK8Vet73V8FHopPLXYjhxhuonqybU1aTSi9sshNuSqVygbKEROUVjOBzQB7_cqfHv-4oLO2IgkPdApZP86NSg6OyBwsA4b17YILM3lk) that represents the countries where this media is shown.

##### Example Request

```bash
curl -s -X GET \
  "https://graph.threads.net/v1.0/me/threads?fields=id,allowlisted_country_codes&limit=1&access_token=<ACCESS_TOKEN>"
```

##### Example Response

```json
{
   "id": "12312312312123",
   "allowlisted_country_codes": [
      "US"
   ]
}
```

This means this media is only shown to users in the United States.

#### Error Codes

|Error|Description|
|---|---|
|`ErrorCode::THREADS_API__FEATURE_NOT_AVAILABLE`|This user does not have access to this Threads API feature.|
|`ErrorCode::THREADS_API__GEO_GATING_INVALID_COUNTRY_CODES`|Some of the specified country code(s) are not supported for geo-gating.|

### Accessibility

To aid users who are visually impaired, you can use Threads API to set the accessibility label or alt text for each image or video that is attached to your post.

#### Limitations

This feature isn't available for text-only posts. It will only work on image, video, and carousel posts.

#### Publishing

Alt text can be configured when making a request to the `POST /threads` endpoint to [create a media object](https://developers.facebook.com/docs/threads/posts#step-1--create-a-threads-media-container). Make sure to include the following parameter with your API request:

- `alt_text` — (For images and videos only.) The accessibility text label or description for an image or video in a Threads post.

##### Example Request

```bash
curl -i -X POST \
  "https://graph.threads.net/v1.0/<THREADS_USER_ID>/threads?media_type=IMAGE&image_url=https://www.example.com/images/bronz-fonz.jpg&text=BronzFonz&access_token=<ACCESS_TOKEN>"
  -d alt_text="Photograph of Bronze Fonz Statue"
```

##### Example Response

```json
{
  "id": "1234567" // Threads Media Container ID
}
```

The request above creates a Threads post container that, [once published](https://developers.facebook.com/docs/threads/posts#step-2--publish-a-threads-media-container), will add a custom accessibility label to your media.

#### Media Retrieval

The value for alt text can be retrieved when making a request to the `GET /threads` or `GET /{threads_media_id}` endpoint to retrieve media object(s). Make sure to include the following field with your API request:

- `alt_text` — The accessibility text label or description for an image or video in a Threads post.

##### Example Request

```bash
curl -s -X GET \
  "https://graph.threads.net/v1.0/<THREADS_MEDIA_ID>?fields=id,alt_text&access_token=<ACCESS_TOKEN>"
```

##### Example Response

```json
{
   "id": "12312312312123",
   "alt_text": "Photograph of Bronze Fonz Statue",
}
```

## Retrieve Threads Media Objects

### Retrieve a List of All a User's Threads

Use the `GET /{threads-user-id}/threads` endpoint to return a paginated list of all threads created by a user.

#### Fields

Here's a list of fields that can be returned for each Thread.

|Name|Description|
|---|---|
|`id` (default)|The media's ID.|
|`media_product_type`|Surface where the media is published. In the case of Threads, the value is `THREADS`.|
|`media_type`|The media type for a Threads post will be one of these values: `TEXT_POST`, `IMAGE`, `VIDEO`, `CAROUSEL_ALBUM`, `AUDIO`, or `REPOST_FACADE`.|
|`media_url`|The post’s media URL.|
|`permalink`|Permanent link to the post. Will be omitted if the media contains copyrighted material or has been flagged for a copyright violation.|
|`owner`|Threads user ID who created the post.|
|`username`|Threads username who created the post.|
|`text`|Represents text for a Threads post.|
|`timestamp`|Post time. The publish date in ISO 8601 format.|
|`shortcode`|Shortcode of the media.|
|`thumbnail_url`|URL of thumbnail. This only shows up for Threads media with video.|
|`children`|List of child posts. This only shows up for carousel posts.|
|`is_quote_post`|Indicates if the media is a quoted post made by another user.|

#### Example Request

```bash
curl -s -X GET \
"https://graph.threads.net/v1.0/me/threads?fields=id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,shortcode,thumbnail_url,children,is_quote_post&since=2023-10-15&until=2023-11-18&limit=1&access_token=$THREADS_ACCESS_TOKEN"
```

#### Example Response

```json
{
  "data": [
    {
      "id": "1234567",
      "media_product_type": "THREADS",
      "media_type": "TEXT_POST",
      "permalink": "https://www.threads.net/@threadsapitestuser/post/abcdefg",
      "owner": {
        "id": "1234567"
      },
      "username": "threadsapitestuser",
      "text": "Today Is Monday",
      "timestamp": "2023-10-17T05:42:03+0000",
      "shortcode": "abcdefg",
      "is_quote_post": false
    },
  ],
  "paging": {
    "cursors": {
      "before": "BEFORE_CURSOR",
      "after": "AFTER_CURSOR"
    }
  }
}
```

### Retrieve a Single Threads Media Object

You can also use the `GET /{threads-media-id}` endpoint to return an individual Threads media object.

#### Example Request

```bash
curl -s -X GET \
"https://graph.threads.net/v1.0/<THREADS_MEDIA_ID>?fields=id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,shortcode,thumbnail_url,children,is_quote_post&access_token=<THREADS_ACCESS_TOKEN>"
```

#### Example Response

```json
{
  "id": "1234567",
  "media_product_type": "THREADS",
  "media_type": "TEXT_POST",
  "permalink": "https://www.threads.net/@threadsapitestuser/post/abcdefg",
  "owner": {
    "id": "1234567"
  },
  "username": "threadsapitestuser",
  "text": "Hello World",
  "timestamp": "2023-10-09T23:18:27+0000",
  "shortcode": "abcdefg",
  "is_quote_post": false
}
```

## Retrieve a Threads User's Profile Information

Use the `GET /{threads-user-id}?fields=id,username,...` endpoint to return profile information about a Threads user.

### Fields

|Name|Description|
|---|---|
|`id`|Threads user ID. This is returned by default.|
|`username`|Handle or unique username on Threads.|
|`name`|Display name of the user on Threads.|
|`threads_profile_picture_url`|URL of the user's profile picture on Threads.|
|`threads_biography`|Biography text on Threads profile.|

#### Example Request

```bash
curl -s -X GET \
"https://graph.threads.net/v1.0/me?ields=id,username,name,threads_profile_picture_url,threads_biography&access_token=$THREADS_ACCESS_TOKEN"
```

#### Example Response

```json
{
  "id": "1234567",
  "username": "threadsapitestuser",
  "name": "Threads API Test User",
  "threads_profile_picture_url": "https://scontent-sjc3-1.cdninstagram.com/link/to/profile/picture/on/threads/",
  "threads_biography": "This is my Threads bio."
}
```

## Threads Reply Management API

The Threads Reply Management API allows you to read and manage replies to users' own Threads.

### Permissions

The Threads Reply Management API requires an appropriate access token and permissions based on the node you are targeting. While you are testing, you can easily generate tokens and grant your app permissions by using the Graph API Explorer.

- `threads_basic` — Required for making any calls to all Threads API endpoints.
- `threads_manage_replies` — Required for making `POST` calls to reply endpoints.
- `threads_read_replies` — Required for making `GET` calls to reply endpoints.

#### Rate Limits

Threads profiles are limited to 1,000 API-published replies within a 24-hour moving period. You can retrieve a profile's current Threads replies rate limit usage with the `GET /{threads-user-id}/threads_publishing_limit` endpoint.

**Note:** This endpoint requires the `threads_basic`, `threads_content_publish`, and `threads_manage_replies` permissions.

##### Fields

|Name|Description|
|---|---|
|`reply_quota_usage`|Threads reply publishing count over the last 24 hours.|
|`reply_config`|Threads reply publishing rate limit config object, which contains the `quota_total` and `quota_duration` fields.|

##### Example Request

```bash
curl -s -X GET \
  "https://graph.threads.net/v1.0/<THREADS_USER_ID>/threads_publishing_limit?fields=reply_quota_usage,reply_config&access_token=<ACCESS_TOKEN>"
```

##### Example Response

```json
{
  "data": [
    {
      "reply_quota_usage": 1,
      "reply_config": {
        "quota_total": 1000,
        "quota_duration": 86400
      }
    }
  ]
}
```

### Retrieve the Replies to a Thread

There are two ways of retrieving a thread's replies: `GET {media-id}/replies` and `GET {media-id}/conversation`.

`GET {media-id}/replies` only returns the top-level replies under the Threads ID provided in the request, while `GET {media-id}/conversation` returns all replies, regardless of the depth, either in chronological or reverse chronological order.

#### Parameters

These parameters are for both `GET {media-id}/replies` and `GET {media-id}/conversation`.

|Name|Description|
|---|---|
|`reverse`|`true` if replies should be sorted in reverse chronological order. `false` if replies should be sorted in chronological order.  **Default:** `true`|

#### Fields

These fields are for both `GET {media-id}/replies` and `GET {media-id}/conversation`.

|Name|Description|
|---|---|
|`id` _(default)_|The media's ID.|
|`text`|Represents text for a Threads reply. This is optional on image, video, and carousel replies.|
|`username`|Threads username who created the post.  **Note:** This only works for public users, your own user, and users that you follow.|
|`permalink`|Permanent link to the post. Will be omitted if the media contains copyrighted material or has been flagged for a copyright violation.  **Note:** This only works for public users, your own user, and users that you follow.|
|`timestamp`|The publish date and time of the post in ISO 8601 format.|
|`media_product_type`|Surface where the media is published. In the case of Threads, the value is `THREADS`.|
|`media_type`|The media type for a Threads reply will be one of these values: `TEXT_POST`, `IMAGE`, `VIDEO`, `CAROUSEL_ALBUM`, or `AUDIO`.|
|`media_url`|The post’s media URL. This only shows for image, video, and carousel replies.|
|`shortcode`|Shortcode of the media.|
|`thumbnail_url`|URL of thumbnail. This only shows for Threads replies with video.|
|`children`|List of child posts. This only shows for carousel replies.|
|`is_quote_post`|Indicates if the media is a quoted reply made by another user.|
|`has_replies`|`true` if the Threads post or reply has replies that you can see.|
|`root_post`|Media ID of the top-level post or original thread in the reply tree.  **Note:** This only appears on replies.|
|`replied_to`|Media ID of the immediate parent of the reply.  **Note:** This only appears on replies.|
|`is_reply`|`true` if the Threads media is a reply. `false` if the Threads media is a top-level post.|
|`is_reply_owned_by_me`|`true` if your user is the owner of the Threads reply. `false` if another user is the owner of the Threads reply.  **Note:** This only appears on replies.|
|`hide_status`|Whether or not the reply is hidden.  **Values:** `NOT_HUSHED`, `UNHUSHED`, `HIDDEN`, `COVERED`, `BLOCKED`, `RESTRICTED`  **Note:** This only appears on replies.|
|`reply_audience`|Who can reply to your post.  **Values:** `EVERYONE`, `ACCOUNTS_YOU_FOLLOW`, `MENTIONED_ONLY`  **Note:** This only appears on top-level posts and replies that you own.|

#### A Thread's Replies

Use `{media-id}/replies` to fetch a paginated list of all top-level replies.

This endpoint is applicable to the use cases that focus on the depth level of the replies. The endpoint returns the immediate replies of the requested Threads ID. `has_replies` indicates whether a Thread has nested replies or not and the field can be used to decide to chain further subsequent GET calls to retrieve replies located in the deeper levels.

##### Example Request

```bash
curl -s -X GET \
  "https://graph.threads.net/v1.0/<MEDIA_ID>/replies?fields=id,text,timestamp,media_product_type,media_type,media_url,shortcode,thumbnail_url,children,has_replies,root_post,replied_to,is_reply,hide_status&reverse=false&access_token=<ACCESS_TOKEN>"
```

##### Example Response

```json
{
  "data": [
    {
      "id": "1234567890",
      "text": "First Reply",
      "timestamp": "2024-01-01T18:20:00+0000",
      "media_product_type": "THREADS",
      "media_type": "TEXT_POST",
      "shortcode": "abcdefg",
      "has_replies": true,
      "root_post": {
        "id": "1234567890"
      },
      "replied_to": {
        "id": "1234567890"
      },
      "is_reply": true,
      "hide_status": "NOT_HUSHED"
    },
    {
      "id": "1234567890",
      "text": "Second Reply",
      "timestamp": "2024-01-01T18:20:00+0000",
      "media_product_type": "THREADS",
      "media_type": "TEXT_POST",
      "shortcode": "abcdefg",
      "has_replies": false,
      "root_post": {
        "id": "1234567890"
      },
      "replied_to": {
        "id": "1234567890"
      },
      "is_reply": true,
      "hide_status": "HIDDEN"
    },
    {
      "id": "1234567890",
      "text": "Third Reply",
      "timestamp": "2024-01-01T18:20:00+0000",
      "media_product_type": "THREADS",
      "media_type": "TEXT_POST",
      "shortcode": "abcdefg",
      "has_replies": false,
      "root_post": {
        "id": "1234567890"
      },
      "replied_to": {
        "id": "1234567890"
      },
      "is_reply": true,
      "hide_status": "UNHUSHED"
    }
  ],
  "paging": {
    "cursors": {
      "before": "BEFORE_CURSOR",
      "after": "AFTER_CURSOR"
    }
  }
}
```

#### A Thread's Conversations

Use `{media-id}/conversation` to fetch a paginated and flattened list of all top-level and nested replies.

This endpoint is applicable to specific use cases that do not focus on the knowledge of the depthness of the replies. **Note:** This endpoint is only intended to be used on the root-level threads with replies.

##### Example Request

```bash
curl -s -X GET \
  "https://graph.threads.net/v1.0/<MEDIA_ID>/conversation?fields=id,text,timestamp,media_product_type,media_type,media_url,shortcode,thumbnail_url,children,has_replies,root_post,replied_to,is_reply,hide_status&reverse=false&access_token=<ACCESS_TOKEN>"
```

##### Example Response

```json
{
  "data": [
    {
      "id": "1234567890",
      "text": "First Reply",
      "timestamp": "2024-01-01T18:20:00+0000",
      "media_product_type": "THREADS",
      "media_type": "TEXT_POST",
      "shortcode": "abcdefg",
      "has_replies": true,
      "root_post": {
        "id": "1234567890"
      },
      "replied_to": {
        "id": "1234567890"
      },
      "is_reply": true,
      "hide_status": "NOT_HUSHED"
    },
    {
      "id": "1234567890",
      "text": "Second Reply",
      "timestamp": "2024-01-01T18:20:00+0000",
      "media_product_type": "THREADS",
      "media_type": "TEXT_POST",
      "shortcode": "abcdefg",
      "has_replies": false,
      "root_post": {
        "id": "1234567890"
      },
      "replied_to": {
        "id": "1234567890"
      },
      "is_reply": true,
      "hide_status": "HIDDEN"
    },
    {
      "id": "1234567890",
      "text": "Third Reply",
      "timestamp": "2024-01-01T18:20:00+0000",
      "media_product_type": "THREADS",
      "media_type": "TEXT_POST",
      "shortcode": "abcdefg",
      "has_replies": false,
      "root_post": {
        "id": "1234567890"
      },
      "replied_to": {
        "id": "1234567890"
      },
      "is_reply": true,
      "hide_status": "UNHUSHED"
    },
    {
      "id": "1234567890",
      "text": "Nested Reply",
      "timestamp": "2024-01-01T18:20:00+0000",
      "media_product_type": "THREADS",
      "media_type": "TEXT_POST",
      "shortcode": "abcdefg",
      "has_replies": false,
      "root_post": {
        "id": "1234567890"
      },
      "replied_to": {
        "id": "1234567890"
      },
      "is_reply": true,
      "hide_status": "NOT_HUSHED"
    }
  ],
  "paging": {
    "cursors": {
      "before": "BEFORE_CURSOR",
      "after": "AFTER_CURSOR"
    }
  }
}
```

### Retrieve a List of All a User's Replies

Use the `GET /{threads-user-id}/replies` endpoint to return a paginated list of all replies created by a user.

#### Fields

Here's a list of fields that can be returned for each reply.

|Name|Description|
|---|---|
|`id` _(default)_|The media's ID.|
|`text`|Represents text for a Threads reply. This is optional on image, video, and carousel replies.|
|`username`|Threads username who created the post.  **Note:** This only works for public users, your own user, and users that you follow.|
|`permalink`|Permanent link to the post. Will be omitted if the media contains copyrighted material or has been flagged for a copyright violation.  **Note:** This only works for public users, your own user, and users that you follow.|
|`timestamp`|The publish date and time of the post in ISO 8601 format.|
|`media_product_type`|Surface where the media is published. In the case of Threads, the value is `THREADS`.|
|`media_type`|The media type for a Threads reply will be one of these values: `TEXT_POST`, `IMAGE`, `VIDEO`, `CAROUSEL_ALBUM`, or `AUDIO`.|
|`media_url`|The post’s media URL. This only shows for image, video, and carousel replies.|
|`shortcode`|Shortcode of the media.|
|`thumbnail_url`|URL of thumbnail. This only shows for Threads replies with video.|
|`children`|List of child posts. This only shows for carousel replies.|
|`is_quote_post`|Indicates if the media is a quoted reply made by another user.|
|`has_replies`|`true` if the Threads post or reply has replies that you can see.|
|`root_post`|Media ID of the top-level post or original thread in the reply tree.  **Note:** This only appears on replies.|
|`replied_to`|Media ID of the immediate parent of the reply.  **Note:** This only appears on replies.|
|`is_reply`|`true` if the Threads media is a reply. `false` if the Threads media is a top-level post.|
|`is_reply_owned_by_me`|`true` if your user is the owner of the Threads reply. `false` if another user is the owner of the Threads reply.  **Note:** This only appears on replies.|
|`reply_audience`|Who can reply to your post.  **Values:** `EVERYONE`, `ACCOUNTS_YOU_FOLLOW`, `MENTIONED_ONLY`  **Note:** This only appears on top-level posts and replies that you own.|

##### Example Request

```bash
curl -s -X GET \
  "https://graph.threads.net/v1.0/me/replies?fields=id,media_product_type,media_type,media_url,permalink,username,text,timestamp,shortcode,thumbnail_url,children,is_quote_post,has_replies,root_post,replied_to,is_reply,is_reply_owned_by_me,reply_audience&since=2023-10-15&until=2023-11-18&limit=1&access_token=<ACCESS_TOKEN>"
```

##### Examples Response

```json
{
  "data": [
    {
      "id": "1234567",
      "media_product_type": "THREADS",
      "media_type": "TEXT_POST",
      "permalink": "https://www.threads.net/@threadsapitestuser/post/abcdefg",
      "username": "threadsapitestuser",
      "text": "Reply Text",
      "timestamp": "2023-10-17T05:42:03+0000",
      "shortcode": "abcdefg",
      "is_quote_post": false,
      "has_replies": false,
      "root_post": {
        "id": "1234567890"
      },
      "replied_to": {
        "id": "1234567890"
      },
      "is_reply": true,
      "is_reply_owned_by_me": true,
      "reply_audience": "EVERYONE"
    },
  ],
  "paging": {
    "cursors": {
      "before": "BEFORE_CURSOR",
      "after": "AFTER_CURSOR"
    }
  }
}
```

### Hide Replies

Use the `/manage_reply` endpoint to hide/unhide any top-level replies. This will automatically hide/unhide all the nested replies. **Note:** Replies nested deeper than the top-level reply cannot be targeted in isolation to be hidden/unhidden.

#### Example Request

```bash
curl -X POST \
  -F "hide={true | false}" \
  -F "access_token=<ACCESS_TOKEN>" \
"https://graph.threads.net/v1.0/<THREADS_REPLY_ID>/manage_reply"
```

#### Example Response

```json
{
 "success": true
}
```

### Respond to Replies

Use the `reply_to_id` parameter to reply to a specific reply under the root post. The caller should be the owner of the root post.

#### Example Request

```bash
curl -X POST \
  -F "media_type=<MEDIA_TYPE>" \
  -F "text=<TEXT>" \
  -F "reply_to_id=<THREADS_ID>" \
  -F "access_token=<ACCESS_TOKEN>" \
"https://graph.threads.net/v1.0/me/threads"
```

#### Example Response

```json
{
 "id": "1234567890"
}
```

Use the `POST /{threads-user-id}/threads_publish` endpoint to publish the reply container ID returned in the previous step. It is recommended to wait on average 30 seconds before publishing a Threads media container to give our server enough time to fully process the upload. See the [media container status endpoint](https://developers.facebook.com/docs/threads/troubleshooting#publishing-does-not-return-a-media-id) for more details.

#### Parameters

- `creation_id` — Identifier of the Threads media container created from the `/threads` endpoint.

#### Example Request

```bash
curl -i -X POST \
"https://graph.threads.net/v1.0/<THREADS_USER_ID>/threads_publish?creation_id=<MEDIA_CONTAINER_ID>&access_token=<ACCESS_TOKEN>"
```

##### Example Response

```json
{
  "id": "1234567" // Threads Reply Media ID
}
```

### Control Who Can Reply

Use the `reply_control` parameter to specify who can reply to a post being created for publishing. This parameter accepts one of the 3 options: `everyone`, `accounts_you_follow`, and `mentioned_only`.

### Example Request

```bash
curl -X POST \
  -F "media_type=<MEDIA_TYPE>" \
  -F "text=<TEXT>" \
  -F "reply_control=accounts_you_follow" \
  -F "access_token=<ACCESS_TOKEN>" \
"https://graph.threads.net/v1.0/me/threads"
```

#### Example Response

```json
{
 "id": "1234567890"
}
```

Use the `POST /{threads-user-id}/threads_publish` endpoint to publish the media container ID returned in the previous step. It is recommended to wait on average 30 seconds before publishing a Threads media container to give our server enough time to fully process the upload. See the [media container status endpoint](https://developers.facebook.com/docs/threads/troubleshooting#publishing-does-not-return-a-media-id) for more details.

##### Parameters

- `creation_id` — Identifier of the Threads media container created from the `/threads` endpoint.

##### Example Request

```bash
curl -i -X POST \
"https://graph.threads.net/v1.0/<THREADS_USER_ID>/threads_publish?creation_id=<MEDIA_CONTAINER_ID>&access_token=<ACCESS_TOKEN>"
```

##### Example Response

```json
{
  "id": "1234567" // Threads Media ID
}
```

## Threads Insights API

The Threads Insights API allows you to read the insights from users' own Threads.

### Permissions

The Threads Insights API requires an appropriate access token and permissions based on the node you are targeting. While you are testing, you can easily generate tokens and grant your app permissions by using the Graph API Explorer.

- `threads_basic` — Required for making any calls to all Threads API endpoints.
- `threads_manage_insights` — Required for making `GET` calls to insights endpoints.

### Limitations

- The user insights `since` and `until` parameters do not work for dates before April 13, 2024 (Unix timestamp `1712991600`).

### Media Insights

To retrieve the available insights metrics, send a `GET` request to the `/{threads-media-id}/insights` endpoint with the `metric` parameter containing a comma-separated list of metrics to be returned.

**Note:**

- Returned metrics do not capture nested replies' metrics.
- An empty array will be returned for `REPOST_FACADE` posts because they are posts made by other users.

#### Available Metrics

|Name|Description|
|---|---|
|`views`|The number of times the post was viewed.**Note:** This metric is [in development](https://www.facebook.com/business/help/metrics-labeling).|
|`likes`|The number of likes on the post.|
|`replies`|The number of replies on the post.**Note:** When the requested media is a root post, this number includes total replies. If the media is itself a reply, this number includes only **direct** replies.|
|`reposts`|The number of times the post was reposted.|
|`quotes`|The number of times the post was quoted.|

#### Example Request

```bash
curl -s -X GET \
  -F "metric=likes,replies" \
 -F "access_token=<THREADS_ACCESS_TOKEN>"
"https://graph.threads.net/v1.0/<THREADS_MEDIA_ID>/insights"
```

#### Example Response

```json
{
  "data": [
    {
      "name": "likes",
      "period": "lifetime",
      "values": [
        {
          "value": 100
        }
      ],
      "title": "Likes",
      "description": "The number of likes on your post.",
      "id": "<media_id>/insights/likes/lifetime"
    },
    {
      "name": "replies",
      "period": "lifetime",
      "values": [
        {
          "value": 10
        }
      ],
      "title": "Replies",
      "description": "The number of replies on your post.",
      "id": "<media_id>/insights/replies/lifetime"
    }
  ]
}
```

### User Insights

To retrieve the available user insights metrics, send a `GET` request to the `/{threads-user-id}/threads_insights` endpoint with the `metric` parameter, and optionally, the `since` and `until` parameters.

User insights are not guaranteed to work before June 1, 2024.

#### Parameters

|Name|Description|
|---|---|
|`since`|**Optional.**  Used in conjunction with the `until` parameter to define a range. If you omit `since` and `until`, it defaults to a 2-day range: yesterday through today.  **Note:** The earliest Unix timestamp that can be used is `1712991600`, any timestamp before that will be rejected.**Format:** Unix Timestamp|
|`until`|**Optional.**  Used in conjunction with the `since` parameter to define a range. If you omit `since` and `until`, it defaults to a 2-day range: yesterday through today.  **Note:** The earliest Unix timestamp that can be used is `1712991600`, any timestamp before that will be rejected.**Format:** Unix Timestamp|
|`metric`|**Required.**  A comma-separated list of the metrics to be returned. Must be at least one of the user metrics values.|

#### User Metrics

|Name|Response Type|Description|
|---|---|---|
|`views`|Time Series|The number of times your profile was viewed.|
|`likes`|Total Value|The number of likes on your posts.|
|`replies`|Total Value|The number of replies on your posts.**Note:** This number includes only top-level replies.|
|`reposts`|Total Value|The number of times your posts were reposted.|
|`quotes`|Total Value|The number of times your posts were quoted.|
|`followers_count`|Total Value|Your total number of followers on Threads.**Note:**- This metric does not support the `since` and `until` parameters.|
|`follower_demographics`|Total Value|The demographic characteristics of followers, including countries, cities, and gender distribution.**Note:**- This metric does not support the `since` and `until` parameters.- A Threads profile must have at least 100 followers to fetch this metric.- **Must** contain a `breakdown` parameter equal to one of the following values: `country`, `city`, `age`, or `gender`.|

#### Example Request

```bash
curl -s -X GET \
  -F "metric=views" \
  -F "access_token=<ACCESS_TOKEN>" \
"https://graph.threads.net/v1.0/<THREADS_USER_ID>/threads_insights"
```

#### Example Time Series Metric Response

```json
{
  "data": [
    {
      "name": "views",
      "period": "day",
      "values": [
        {
          "value": 10,
          "end_time": "2024-07-12T08:00:00+0000"
        },
        {
          "value": 20,
          "end_time": "2024-07-15T08:00:00+0000"
        },
        {
          "value": 30,
          "end_time": "2024-07-16T08:00:00+0000"
        }
      ],
      "title": "views",
      "description": "The number of times your profile was viewed.",
      "id": "37602215421583/insights/views/day"
    }
  ]
}
```

#### Example Total Value Metric Response

```json
{
  "data": [
    {
      "name": "views",
      "period": "day",
      "total_value" : {
        “value”: 1
      }
      "title": "views",
      "description": "The number of times your profile was viewed.",
      "id": "37602215421583/insights/views/day"
    }
  ]
}
```

## Set Up Webhooks for Threads

Webhooks for Threads allow you to receive real-time notifications for the subscribed topics and fields.

### Receive Live Webhook Notifications

To receive live Webhook notifications, the following conditions must be satisfied:

- Your app must have Threads Webhooks added as a sub-use case and appropriate fields subscribed to in the App Dashboard.
- For non-tech providers, the apps must be in Live Mode.
- For tech providers, the apps must have permissions with an Advanced Access level. You can request Advanced Access for permissions as shown here:

![](https://scontent-dfw5-1.xx.fbcdn.net/v/t39.8562-6/455181209_1741127809754943_1379334190332074633_n.png?_nc_cat=110&ccb=1-7&_nc_sid=f537c7&_nc_ohc=6c6mvUDfXFkQ7kNvgH6slWw&_nc_ht=scontent-dfw5-1.xx&_nc_gid=AjGbOGcaqyXBI-yDsDSOvXU&oh=00_AYBFsOO9-6IpKCkOOYXkOJlkiQqctfv104Knd-k75yQVTA&oe=66EA379D)

If the app permissions don't have an access level of Advanced Access, the app won't receive Webhook notifications.

- The app user must have granted your app appropriate permissions (`threads_basic`, `threads_read_replies`).
- The business connected to the app must be verified.
- The owner of the media object upon which the reply appears must not have set their account to private.

#### Limitations

- Apps don't receive Webhook notifications if the Media where the reply appears was created by a private account.
- Your app must have successfully completed App Review (Advanced Access) to receive Webhooks notifications for the replies Webhooks field.

#### Step 0: \[Optional] Use the sample app to test your integration

Download the [Webhooks sample app](https://l.facebook.com/l.php?u=https%3A%2F%2Fgithub.com%2Ffbsamples%2Fgraph-api-webhooks-samples%2F%3Ffbclid%3DIwZXh0bgNhZW0CMTEAAR0Q5-kQ7MA2xCGv4JOe3LBnMMJ3KMxujGmIneoh_qFJNLI1PLZ0y7S7Wtc_aem_ie9SFi3M0GeaiwmDNTTG7g&h=AT2vEazU2nPpvYS9PiK7iDmbnksvLScq8voWOND27Xp5nrfc-lhopJ_Pa7h91ni0qSTeXrlyUtuQ-2OBdP5RdZ-zlKUdbGgTSu78nmRah5EZ_FuNuW1g-8vq45nJCveahWEiXoLdpdA) to test your integration.

#### Step 1: Add the Webhooks sub-use case to the main Threads API use case

Under **Use Cases** > **Customize** > **Settings**, add the **Get real-time notifications with Threads Webhooks** sub-use case.

![](https://scontent-dfw5-2.xx.fbcdn.net/v/t39.8562-6/455346079_537570761938135_6409017095734127455_n.png?_nc_cat=102&ccb=1-7&_nc_sid=f537c7&_nc_ohc=PuxT-DzJ6M0Q7kNvgF2jALt&_nc_ht=scontent-dfw5-2.xx&_nc_gid=AjGbOGcaqyXBI-yDsDSOvXU&oh=00_AYDVa6le4eZChOX6n_IHWaIh2J1zvgF_NbysL95ZdoNs8g&oe=66EA2579)

#### Step 2: Create an endpoint and configure Threads webhooks

[Create an endpoint](https://developers.facebook.com/docs/graph-api/webhooks/getting-started) that accepts and processes Webhooks. To add the configuration

1. Select **Moderate Topic** and click **Subscribe to this object**.
2. Set the callback URL and token.

The token here is passed to your server defined in the callback URL to allow verification that the call originates from Meta servers.

![](https://scontent-dfw5-1.xx.fbcdn.net/v/t39.8562-6/455665597_1033258174862602_5255665146262670986_n.png?_nc_cat=109&ccb=1-7&_nc_sid=f537c7&_nc_ohc=HPx5-25ZuOIQ7kNvgFfyg_Z&_nc_ht=scontent-dfw5-1.xx&_nc_gid=AjGbOGcaqyXBI-yDsDSOvXU&oh=00_AYBU4qJ0Z0sxtzR-cyvG0sLZ69r-rJwwIXCXskE-vRSIUg&oe=66EA3E15)

##### Fields

|Name|Description|
|---|---|
|`replies`|[Replies](https://developers.facebook.com/docs/threads/reply-management#reply-retrieval) on a [Threads Media](https://developers.facebook.com/docs/threads/threads-media) owned by the Threads install user.  **Required permissions:** [`threads_basic`](https://developers.facebook.com/docs/permissions#threads_basic), [`threads_read_replies`](https://developers.facebook.com/docs/permissions#threads_read_replies)|

### Common Uses

#### Realtime reply notifications

If you subscribe to the `replies` field, we send your endpoint a Webhook notification containing the reply object.

##### Sample Replies Payload

```json
{
    "app_id": "123456",
    "topic": "moderate",
    "target_id": "78901",
    "time": 1723226877,
    "subscription_id": "234567",
    "has_uid_field": false,
    "values": {
        "value": {
            "id": "8901234",
            "username": "test_username",
            "text": "Reply",
            "media_type": "TEXT_POST",
            "permalink": "https:\/\/www.threads.net\/@test_username\/post\/Pp",
            "replied_to": {
                "id": "567890"
            },
           "root_post": {
               "id": "123456"
           },
            "shortcode": "Pp",
            "timestamp": "2024-08-07T10:33:16+0000"
        },
        "field": "replies"
    }
}
```

## Threads API Troubleshooting

### Publishing Does Not Return a Media ID

If you are able to create a container for a video but the `POST /{threads-user-id}/threads_publish` endpoint does not return the published media ID, then you can get the container's publishing status by querying the `GET /{threads-container-id}` endpoint. This endpoint will return one of the following:

- `EXPIRED` — The container was not published within 24 hours and has expired.
- `ERROR` — The container failed to complete the publishing process.
- `FINISHED` — The container and its media object are ready to be published.
- `IN_PROGRESS` — The container is still in the publishing process.
- `PUBLISHED` — The container's media object has been published.

In case of error the endpoint will return one of the following error messages:

- `FAILED_DOWNLOADING_VIDEO`
- `FAILED_PROCESSING_AUDIO`
- `FAILED_PROCESSING_VIDEO`
- `INVALID_ASPEC_RATIO`
- `INVALID_BIT_RATE`
- `INVALID_DURATION`
- `INVALID_FRAME_RATE`
- `INVALID_AUDIO_CHANNELS`
- `INVALID_AUDIO_CHANNEL_LAYOUT`
- `UNKNOWN`

We recommend querying a container's status once per minute, for no more than 5 minutes.

#### Example Request

```bash
curl -s -X GET \
"https://graph.threads.net/v1.0/<MEDIA_CONTAINER_ID>?fields=status,error_message&access_token=<THREADS_ACCESS_TOKEN>"
```

#### Example Response

```json
{
  "status": "FINISHED",
  "id": "17889615691921648"
}
```

##### Example Response in case of error

```json
{
  "status": "ERROR",
  "id": "17889615691921648",
  "error_message": "FAILED_DOWNLOADING_VIDEO",
}
```

### Retrieve Publishing Quota Limit

To validate that a user has not exhausted their publishing API quota limit, they can make a call to the `GET /{ig-user-id}/threads_publishing_limit` endpoint. This will return a user's current Threads API usage total.

#### Example Request

```bash
curl -s -X GET
"https://graph.threads.net/v1.0/<THREADS_USER_ID>/threads_publishing_limit?fields=quota_usage,config&access_token=<THREADS_ACCESS_TOKEN>"
```

#### Example Response

```json
{
  "data": [
    {
      "quota_usage": 0,
      "config": {
        "quota_total": 250,
        "quota_duration": 86400
      }
    }
  ]
}
```

## Web Intents

Web intents offer a simple way for people to interact with Threads directly from your website, starting with the ability to quickly create posts and follow profiles.

When clicking on a Web intent URL, a new window opens and users are directed to Threads to complete the intended action. On mobile (iOS and Android), web intents will open the Threads app whenever it is installed. If they are not already logged-in, they will have the opportunity to sign in or create a Threads account.

When linking intents to an image, we recommend using the Threads logo available in our [Threads Brand Resources](https://about.meta.com/brand/resources/instagram/threads/?fbclid=IwZXh0bgNhZW0CMTEAAR2E0BZgO9FJj4HohiS6XTNz3LdWP8_H8TVDMvzRp4ZrB12BJ3nOACgj5b4_aem__EipJb3QYNy22JE8zAUVlw).

### Post Intent

Post intents allow people to easily share their favorite content from your website directly to Threads, in order to increase your reach, spark conversations and drive traffic.

#### URL Format

The URL format is [https://www.threads.net/intent/post](https://www.threads.net/intent/post?fbclid=IwZXh0bgNhZW0CMTEAAR2-ekCch7bF6I6PwIweJAjKFc2zfmDQ9Tm9hiTbVy6-Z4Tyonv8VbpV8RE_aem_za2SoAFxX5Kj7jY5d7a0Tw).

#### Supported Parameters

The post intent flow supports the following query string parameters.

|Name|Description|
|---|---|
|`text`|**Optional.**  The text that the post dialog should be prefilled with.|
|`url`|**Optional.**  The URL for an optional link attachment.|

All parameter values should be encoded using [percent-encoding](https://l.facebook.com/l.php?u=https%3A%2F%2Fdatatracker.ietf.org%2Fdoc%2Fhtml%2Frfc3986%3Ffbclid%3DIwZXh0bgNhZW0CMTEAAR1Iw1etvV3xtMv9AKbYGLJqf2TtL8XwvO6D03vcoWbVgTxE0xTpMVLv56s_aem_x8e3yJVmUvIO0HENfZunFQ%23section-2.1&h=AT1FYX5CaVZyALd4_BvZHA7ckBKegv0vvZi8lBsMUapGBnydINBMs8oH2-XdZTyd2UDtHN9f8WxvuZ6H_vq6dt6Es5Pd9UM_4sx5N8KGGsKVuukg7J_Oc6uuq3niV4q_f5FhjmdgmbE) ("URL encoding") so that the values can safely be passed via the URL.

#### Examples

|Example|URL|
|---|---|
|Only text|[https://www.threads.net/intent/post?text=Say+more+with+Threads+%E2%80%94+Instagram%27s+new+text+app](https://www.threads.net/intent/post?text=Say+more+with+Threads+%E2%80%94+Instagram%27s+new+text+app&fbclid=IwZXh0bgNhZW0CMTEAAR3uNpNT-fzIXMmmWDHT8mJEY6azi_NCOK30eTZ5jM-ns2yUqsKoJY3C6EY_aem_OlfVtXt4ZcTYLHcrQY1puw)|
|Only link attachment|[https://www.threads.net/intent/post?url=https%3A%2F%2Fabout.fb.com%2Fnews%2F2023%2F07%2Fintroducing-threads-new-app-text-sharing%2F](https://www.threads.net/intent/post?url=https%3A%2F%2Fabout.fb.com%2Fnews%2F2023%2F07%2Fintroducing-threads-new-app-text-sharing%2F&fbclid=IwZXh0bgNhZW0CMTEAAR3Ww-MmMBgqPNu6q_Na6T1OEoFJkyCI8VskCivp7zbEQwQhpt9N4PcrTk0_aem_3TrzSST-h49-a9mYgQnfOQ)|
|Text and link attachment|[https://www.threads.net/intent/post?url=https%3A%2F%2Fabout.fb.com%2Fnews%2F2023%2F07%2Fintroducing-threads-new-app-text-sharing%2F&text=Introducing+Threads%3A+A+New+Way+to+Share+With+Text](https://www.threads.net/intent/post?url=https%3A%2F%2Fabout.fb.com%2Fnews%2F2023%2F07%2Fintroducing-threads-new-app-text-sharing%2F&text=Introducing+Threads%3A+A+New+Way+to+Share+With+Text&fbclid=IwZXh0bgNhZW0CMTEAAR27dhheFlVbakQNuX7ZLREkfXyBU3VlRD28pPAB95KgyddYV_Nebs0hKJA_aem_xeOX8tIoSeAIjL82dPTL7w)|

### Follow Intent

Follow intents allow people to easily follow a Threads account directly from your website.

#### URL Format

The URL format is [https://www.threads.net/intent/follow](https://www.threads.net/intent/follow?fbclid=IwZXh0bgNhZW0CMTEAAR3dApF-qtssQ0zxudM5Jn16zhJg0-U1t4wD_feWzk0p2yDrTLsMbL_s8KM_aem_t60xJAiAjuvV0RTvE3ZHww).

#### Supported Parameters

|Name|Description|
|---|---|
|`username`|**Required.**  The username of the user to follow.|

#### Examples

|Example|URL|
|---|---|
|The official @threads account|[https://www.threads.net/intent/follow?username=threads](https://www.threads.net/intent/follow?username=threads&fbclid=IwZXh0bgNhZW0CMTEAAR2mVqbGgxFVTGqUFDv9FyvuTi-_k0dUaMdJWP20kNTHEBStNVXf4S8LKzc_aem_HVQTkxSNxtI_dOHuhYBMEg)|

## Threads API Reference

The Threads API consists of the following endpoints. Refer to each endpoint's reference document for usage requirements.

### Publishing

The Threads publishing endpoints allow you to upload and publish Threads media objects and check their status. See [Post to Threads](https://developers.facebook.com/docs/threads/posts) for more information.

#### `POST /{threads-user-id}/threads`

Upload media and create media containers. See [Posts](https://developers.facebook.com/docs/threads/posts) for more information.

##### Parameters

|Name|Description|
|---|---|
|`access_token`string|**Required.**  Threads Graph API user access token.|
|`threads-user-id`string|**Required.**  The path parameter of the Threads user identifier.|
|`media_type`string|**Required.**  **Values:** `TEXT`, `IMAGE`, `VIDEO`, `CAROUSEL`|
|`text`string|**Optional.**  The text associated with the post. Uses [UTF-8 encoding](https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fgrapheme-splitter%3Ffbclid%3DIwZXh0bgNhZW0CMTEAAR2hShbmYo45sUziKugXSsNWveHmCjPZKVQPvwD4O7SYpMPufhNOG-v1dbs_aem_vbVkuXFzdmLTGeMja_p-sA&h=AT3peKhS29XjAXtc_bpyqG6fAUTpRfyZwf0XesxCdHrYgX6HbNWVJeZZnzp02DnJdkedcQaBqqMIu8Y2zKSvZlnymrAsK-EYdeqFOwgdoGq6mkX8BSdbECipzoaSTJYWw2W0tqsnx8w). For text-only posts, this parameter is **required**.|
|`image_url`string|**Optional.**  Required if `media_type=IMAGE`.|
|`video_url`string|**Optional.**  Required if `media_type=VIDEO`.|
|`is_carousel_item`Boolean|**Optional.**  **Values:** `true`, `false` (default)|
|`children`array|**Optional.**  Required if `media_type=CAROUSEL`.|
|`reply_to_id`string|**Optional.**  Required if replying to a specific reply under the root post. The caller should be the owner of the root post.|
|`reply_control`string|**Optional.**  Can be used to specify who can reply to a post.  **Values:** `everyone`, `accounts_you_follow`, `mentioned_only`|
|`allowlisted_country_codes``list<string>`|**Optional.**  A string list of valid [ISO 3166-1 alpha-2 country codes](https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.iso.org%2Fobp%2Fui%2F%3Ffbclid%3DIwZXh0bgNhZW0CMTEAAR1g8cijLMw-2MDz4an62A_ogFXuWAEjLQ07UpzdF6NiP44-IG0lfvmaIXs_aem_8jeWshH9hnaMRO4Zps1lAA%23search&h=AT2EN2VWxwDaTEyFaDv-mZQO_BtUSWM9Qot9cOGxXA068EiPbkvAcNthEgGsLO6_PED0IIEhHsR8_TT1Q39Y6vpLis4CTuuvI6HGRY8YRdEN2F0znkJrItGVdVhy1g2Z_D0IGlamI1c) that represents the countries where this media should be shown. If this parameter is passed in, the media will not be shown to Threads profiles in countries outside of this list.|
|`alt_text`string|**Optional.**  The accessibility text label or description for an image or video in a Threads post.  **Note:** The maximum length of `alt_text` is 1,000 characters.|
|`link_attachment`string|**Optional.**  The URL attached to a Threads post.|

---

#### `POST /{threads-user-id}/threads_publish`

Publish uploaded media using their media containers. See [Posts](https://developers.facebook.com/docs/threads/posts) for more information.

##### Parameters

|Name|Description|
|---|---|
|`access_token`string|**Required.**  Threads Graph API user access token.|
|`threads-user-id`string|**Required.**  The path parameter of the Threads user identifier.|
|`creation_id`string|**Required.**  Identifier of the Threads media container.|

---

#### `GET /{threads-container-id}?fields=status`

Check the Threads media container publishing eligibility and status.

##### Parameters

|Name|Description|
|---|---|
|`access_token`string|**Required.**  Threads Graph API user access token.|
|`threads-container-id`string|**Required.**  The path parameter of the Threads media container identifier.|
|`fields`string|**Optional.**  A comma-separated list of the fields to be returned.  **Values:** `id` _(default)_, `status` _(default)_, `error_message`|

### Media Retrieval

The Threads media retrieval endpoint allows you to retrieve Threads media objects. See [Retrieve Threads Media Objects](https://developers.facebook.com/docs/threads/threads-media) for more information.

#### `GET /{threads-media-id}`

Retrieve a Threads media object. See [Retrieve a Single Threads Media Object](https://developers.facebook.com/docs/threads/threads-media#retrieve-a-single-threads-media-object) for more information.

##### Parameters

|Name|Description|
|---|---|
|`access_token`string|**Required.**  Threads Graph API user access token.|
|`threads-media-id`string|**Required.**  The path parameter of the Threads media identifier.|
|`fields`string|**Optional.**  A comma-separated list of the fields to be returned.  **Values:** `id` _(default)_, `media_product_type`, `media_type`, `media_url`, `permalink`, `owner`, `username`, `text`, `timestamp`, `shortcode`, `thumbnail_url`, `children`, `is_quote_post`, `alt_text`, `link_attachment_url`, `has_replies`, `is_reply`, `is_reply_owned_by_me`, `root_post`, `replied_to`, `hide_status`, `reply_audience`|

### Reply Management

The Threads reply management endpoints allow you to retrieve replies and conversations and hide/unhide replies. See [Threads Reply Management API](https://developers.facebook.com/docs/threads/reply-management) for more information.

#### `GET /{threads-media-id}/replies`

Retrieve a paginated list of all top-level replies for a Threads media object. See [Replies](https://developers.facebook.com/docs/threads/reply-moderation#replies) for more information.

##### Parameters

|Name|Description|
|---|---|
|`access_token`string|**Required.**  Threads Graph API user access token.|
|`threads-media-id`string|**Required.**  The path parameter of the Threads media identifier.|
|`fields`string|**Optional.**  A comma-separated list of the fields to be returned.  **Values:** `id` _(default)_, `media_product_type`, `media_type`, `media_url`, `permalink`, `username`, `text`, `timestamp`, `shortcode`, `thumbnail_url`, `children`, `is_quote_post`, `has_replies`, `root_post`, `replied_to`, `is_reply`, `is_reply_owned_by_me`, `hide_status`, `reply_audience`|
|`reverse`Boolean|**Optional.**  Whether or not replies should be sorted in reverse chronological order.  **Values:** `true` _(default)_, `false`|
|`before`|**Optional.**  Query string parameter representing a cursor that can be used for pagination, both `before` and `after` parameters cannot be passed at the same time.|
|`after`|**Optional.**  Query string parameter representing a cursor that can be used for pagination, both `before` and `after` parameters cannot be passed at the same time.|

---

#### `GET /{threads-media-id}/conversation`

Retrieve a paginated and flattened list of all top-level and nested replies for a Threads media object. See [Conversations](https://developers.facebook.com/docs/threads/reply-moderation#conversations) for more information.

##### Parameters

|Name|Description|
|---|---|
|`access_token`string|**Required.**  Threads Graph API user access token.|
|`threads-media-id`string|**Required.**  The path parameter of the Threads media identifier.|
|`fields`string|**Optional.**  A comma-separated list of the fields to be returned.  **Values:** `id` _(default)_, `media_product_type`, `media_type`, `media_url`, `permalink`, `username`, `text`, `timestamp`, `shortcode`, `thumbnail_url`, `children`, `is_quote_post`, `has_replies`, `root_post`, `replied_to`, `is_reply`, `is_reply_owned_by_me`, `hide_status`, `reply_audience`|
|`reverse`Boolean|**Optional.**  Whether or not replies should be sorted in reverse chronological order.  **Values:** `true` _(default)_, `false`|
|`before`|**Optional.**  Query string parameter representing a cursor that can be used for pagination, both `before` and `after` parameters cannot be passed at the same time.|
|`after`|**Optional.**  Query string parameter representing a cursor that can be used for pagination, both `before` and `after` parameters cannot be passed at the same time.|

#### `POST /{threads-reply-id}/manage_reply`

Hide or unhide a top-level reply on your Threads post. See [Hide Replies](https://developers.facebook.com/docs/threads/reply-moderation#hide-replies) for more information.

##### Parameters

|Name|Description|
|---|---|
|`access_token`string|**Required.**  Threads Graph API user access token.|
|`threads-reply-id`string|**Required.**  The path parameter of the Threads reply media identifier.|
|`hide`Boolean|**Required.**  Set to `true` to hide a reply and set to `false` to unhide a reply.  **Values:** `true`, `false`|

### User

The Threads user endpoints allow you to retrieve a Threads user's posts, publishing limit, and profile. See [Retrieve Threads Profiles](https://developers.facebook.com/docs/threads/threads-profiles) for more information.

#### `GET /{threads-user-id}/threads`

Retrieve a paginated list of all Threads posts created by a user. See [Retrieve a List of All a User's Threads](https://developers.facebook.com/docs/threads/threads-media#retrieve-a-list-of-all-a-user-s-threads) for more information.

##### Parameters

|Name|Description|
|---|---|
|`access_token`string|**Required.**  Threads Graph API user access token.|
|`threads-user-id`string|**Required.**  The path parameter of the Threads user identifier.|
|`fields`string|**Optional.**  A comma-separated list of the fields to be returned.  **Values:** `id` _(default)_, `media_product_type`, `media_type`, `media_url`, `permalink`, `owner`, `username`, `text`, `timestamp`, `shortcode`, `thumbnail_url`, `children`, `is_quote_post`, `alt_text`, `link_attachment_url`, `has_replies`, `reply_audience`|
|`since`|**Optional.**  Query string parameter representing the start date for retrieval (must be a Unix timestamp or a date/time representation parseable by `strtotime();`, the timestamp must be greater than or equal to `1688540400` and less than the `until` parameter).|
|`until`|**Optional.**  Query string parameter representing the end date for retrieval (must be a Unix timestamp or a date/time representation parseable by `strtotime();`, the timestamp must be less than or equal to the current timestamp and greater than the `since` parameter).|
|`limit`|**Optional.**  Query string parameter representing the maximum number of media objects or records requested to return, default is **25** and maximum is **100** (only non-negative numbers are allowed).|
|`before`|**Optional.** Query string parameter representing a cursor that can be used for pagination, both `before` and `after` parameters cannot be passed at the same time.|
|`after`|**Optional.**  Query string parameter representing a cursor that can be used for pagination, both `before` and `after` parameters cannot be passed at the same time.|

---

#### `GET /{threads-user-id}/threads_publishing_limit`

Check the app user's current publishing rate limit usage. See [Rate Limiting](https://developers.facebook.com/docs/threads/overview#rate-limiting) for more information.

##### Parameters

|Name|Description|
|---|---|
|`access_token`string|**Required.**  Threads Graph API user access token.|
|`threads-user-id`string|**Required.**  The path parameter of the Threads user identifier.|
|`fields`string|**Optional.**  A comma-separated list of the fields to be returned.  **Values:** `quota_usage` _(default)_, `config`, `reply_quota_usage`, `reply_config`|

---

#### `GET /{threads-user-id}?fields=id,username,...`

Retrieve profile information about a user on Threads. See [Retrieve Threads Profiles](https://developers.facebook.com/docs/threads/threads-profiles) for more information.

##### Parameters

|Name|Description|
|---|---|
|`access_token`string|**Required.**  Threads Graph API user access token.|
|`threads-user-id`string|**Required.**  The path parameter of the Threads user identifier.|
|`fields`string|**Optional.**  A comma-separated list of the fields to be returned.  **Values:** `id` _(default)_, `username`, `name`, `threads_profile_picture_url`, `threads_biography`|

---

#### `GET /{threads-user-id}/replies`

Retrieve a paginated list of all Threads replies created by a user. See [Retrieve a List of All a User's Replies](https://developers.facebook.com/docs/threads/reply-management#retrieve-a-list-of-all-a-user-s-replies) for more information.

##### Parameters

|Name|Description|
|---|---|
|`access_token`string|**Required.**  Threads Graph API user access token.|
|`threads-user-id`string|**Required.**  The path parameter of the Threads user identifier.|
|`fields`string|**Optional.**  A comma-separated list of the fields to be returned.  **Values:** `id` _(default)_, `media_product_type`, `media_type`, `media_url`, `permalink`, `username`, `text`, `timestamp`, `shortcode`, `thumbnail_url`, `children`, `is_quote_post`, `has_replies`, `root_post`, `replied_to`, `is_reply`, `is_reply_owned_by_me`, `reply_audience`|
|`since`|**Optional.**  Query string parameter representing the start date for retrieval (must be a Unix timestamp or a date/time representation parseable by `strtotime();`, the timestamp must be greater than or equal to `1688540400` and less than the `until` parameter).|
|`until`|**Optional.**  Query string parameter representing the end date for retrieval (must be a Unix timestamp or a date/time representation parseable by `strtotime();`, the timestamp must be less than or equal to the current timestamp and greater than the `since` parameter).|
|`limit`|**Optional.**  Query string parameter representing the maximum number of media objects or records requested to return, default is **25** and maximum is **100** (only non-negative numbers are allowed).|
|`before`|**Optional.** Query string parameter representing a cursor that can be used for pagination, both `before` and `after` parameters cannot be passed at the same time.|
|`after`|**Optional.**  Query string parameter representing a cursor that can be used for pagination, both `before` and `after` parameters cannot be passed at the same time.|

### Insights

The Threads insights endpoints allow you to retrieve insights for Threads media objects and users. See [Threads Insights API](https://developers.facebook.com/docs/threads/insights) for more information.

#### `GET /{threads-media-id}/insights`

Retrieve insights for a Threads media object. See [Media Insights](https://developers.facebook.com/docs/threads/insights#media-insights) for more information.

##### Parameters

|Name|Description|
|---|---|
|`access_token`string|**Required.**  Threads Graph API user access token.|
|`threads-media-id`string|**Required.**  The path parameter of the Threads media identifier.|
|`metric`string|**Required.**  A comma-separated list of the metrics to be returned. Must be at least one of the metric values.  **Values:** `views`, `likes`, `replies`, `reposts`, `quotes`|

---

#### `GET /{threads-user-id}/threads_insights`

Retrieve insights for a Threads user object. See [User Insights](https://developers.facebook.com/docs/threads/insights#user-insights) for more information.

##### Parameters

|Name|Description|
|---|---|
|`access_token`string|**Required.**  Threads Graph API user access token.|
|`threads-user-id`string|**Required.**  The path parameter of the Threads user identifier.|
|`since`|**Optional.**  Used in conjunction with the `until` parameter to define a range. If you omit `since` and `until`, it defaults to a 2-day range: yesterday through today.  **Format:** Unix Timestamp|
|`until`|**Optional.**  Used in conjunction with the `since` parameter to define a range. If you omit `since` and `until`, it defaults to a 2-day range: yesterday through today.  **Format:** Unix Timestamp|
|`metric`string|**Required.**  A comma-separated list of the metrics to be returned. Must be at least one of the metric values.  **Values:** `views`, `likes`, `replies`, `reposts`, `quotes`, `followers_count`, `follower_demographics`  **Note:** `follower_demographics` is not compatible with the `since` and `until` parameters.|

## Changelog

### September 12, 2024

- We made it easier to attach links with Threads API. See [Links](https://developers.facebook.com/docs/threads/posts#tags-and-links-in-posts) for more details.

### August 21, 2024

- Support for alt text has been added. See [Accessibility](https://developers.facebook.com/docs/threads/posts/accessibility) for more details.

### August 15, 2024

- For Threads users who have [enabled sharing to the fediverse](https://l.facebook.com/l.php?u=https%3A%2F%2Fhelp.instagram.com%2F760878905943039%3Ffbclid%3DIwZXh0bgNhZW0CMTEAAR2ikbj7lGtC5uSBnDJdDuASRhZj4iFkg-MR5VOqoERX_uZMn5e94pfLNSA_aem_tDkyhowCHJoL3Wcm53PZkA&h=AT2H12sAAe28rWSgmUKrxIz4YmCgR2TEk0FptwTmv-mtf7ZPa1PbdDHcs0SBPtbCMkg_eALb3NKYsEwuc1hNMfVaHpy53mTA0sgKA542sFjIKLsaTDvgEMtF3d7u73gB03ofC-3KGJU), eligible posts made to Threads via the Threads API will also be shared to the fediverse starting August 28, 2024.

### August 13, 2024

- [Webhooks for Threads](https://developers.facebook.com/docs/threads/webhooks) allow you to receive real-time notifications for the subscribed topics and fields.

### August 5, 2024

- The `name` field was added to the [User Profile endpoint](https://developers.facebook.com/docs/threads/reference/user#get---threads-user-id--fields-id-username----).
- Use `graph.threads.net/me/replies` to fetch all replies for your user. See [Retrieve a List of All a User's Replies](https://developers.facebook.com/docs/threads/reply-management#retrieve-a-list-of-all-a-user-s-replies) for more information.

### July 23, 2024

- Posts made via the Threads API can be [geo-gated](https://developers.facebook.com/docs/threads/geo-gating) to one or more specific countries.

### July 12, 2024

- Threads [Web Intents](https://developers.facebook.com/docs/threads/threads-web-intents) for posts and follows are now available.

### June 25, 2024

- When fetching media insights on reposts, an empty array is returned.

### June 18, 2024

- Threads API is open to all developers, see [blog post](https://developers.facebook.com/blog/post/2024/06/18/the-threads-api-is-finally-here/) for more details.
- Docs have been updated to clarify that the `since` and `until` parameters are not supported when fetching the `followers_count` metric on the `/{threads-user-id}/threads_insights` endpoint.

### June 17, 2024

- Authorization, Permissions, and Threads User Access Tokens sections updated for `threads.net` domain and Threads Tester section added to [Get Started](https://developers.facebook.com/docs/threads/get-started).
- [Get Access Tokens and Permissions](https://developers.facebook.com/docs/threads/get-started/get-access-tokens-and-permissions) and [Long-Lived Tokens](https://developers.facebook.com/docs/threads/get-started/long-lived-tokens) docs added.
- To access the Threads API, create an app and pick the [Threads Use Case](https://developers.facebook.com/docs/development/create-an-app/threads-use-case).

### June 12, 2024

- With the `threads_basic` and `threads_read_replies` permissions, users can query the `reply_audience` field to see who can reply to their previously published posts.

### June 7, 2024

- The domain for API calls is now `graph.threads.net`. All API calls to `graph.threads.net` should use `v1.0`. In order to use `graph.threads.net`, you will need to obtain a Threads access token.
- Reply Management and Insights have been added to the [Reference](https://developers.facebook.com/docs/threads/reference) page.

### May 21, 2024

- The `since` and `until` parameters on the user insights endpoint do not work for dates before April 13, 2024 (Unix timestamp 1712991600).
- A Threads profile must have at least 100 followers in order to fetch values for the `follower_demographics` metric.
- When requesting follower demographics, the `breakdown` parameter must be provided and must be set equal to one of the following values: `country`, `city`, `age`, or `gender`.
- Updated the possible values of the `hide_status` field on replies: `NOT_HUSHED`, `UNHUSHED`, `HIDDEN`, `COVERED`, `BLOCKED`, `RESTRICTED`.

### May 15, 2024

- Removed `REPOST_FACADE` as one of the possible values for the `media_type` field on replies.

### May 2, 2024

- Deprecated status code on media builder endpoint.

### May 1, 2024

- Users can query the `is_reply_owned_by_me` field to determine which replies are owned by their user and which replies are owned by other users.

### April 26, 2024

- Launch of User Level Insights.

### April 18, 2024

- The `permalink` and `username` fields can now be fetched on replies made by public users, your own user, and users that you follow.

### April 8, 2024

- Threads API documentation was made publicly available. See the [blog post](https://developers.facebook.com/blog/post/2024/04/08/the-threads-api-is-coming-soon) for more details.
