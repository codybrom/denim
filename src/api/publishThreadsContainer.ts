import { THREADS_API_BASE_URL } from "../constants.ts";
import { checkContainerStatus } from "../utils/checkContainerStatus.ts";
import { getAPI } from "../utils/getAPI.ts";
import { getSingleThread } from "./getSingleThread.ts";
/**
 * Publishes a Threads media container.
 *
 * @param userId - The user ID of the Threads account
 * @param accessToken - The access token for authentication
 * @param containerId - The ID of the container to publish
 * @returns A Promise that resolves to the published container ID
 * @throws Will throw an error if the API request fails or if publishing times out
 *
 * @example
 * ```typescript
 * const publishedId = await publishThreadsContainer("123456", "your_access_token", "container_id");
 * ```
 */
export async function publishThreadsContainer(
	userId: string,
	accessToken: string,
	containerId: string,
	getPermalink: boolean = false,
): Promise<string | { id: string; permalink: string }> {
	const api = getAPI();
	if (api) {
		return api.publishThreadsContainer(
			userId,
			accessToken,
			containerId,
			getPermalink,
		);
	}
	try {
		// Wait 30 seconds before first status check (per API docs recommendation)
		await new Promise((resolve) => setTimeout(resolve, 30_000));

		// Poll container status once per minute, for up to 5 minutes (per API docs)
		let result = await checkContainerStatus(containerId, accessToken);
		let attempts = 0;
		const maxAttempts = 5;
		const pollInterval = 60_000; // 1 minute

		while (
			result.status !== "FINISHED" &&
			attempts < maxAttempts
		) {
			if (result.status === "ERROR" || result.status === "EXPIRED") {
				throw new Error(
					`Container cannot be published. Status: ${result.status}${
						result.error_message ? ` - ${result.error_message}` : ""
					}`,
				);
			}
			await new Promise((resolve) => setTimeout(resolve, pollInterval));
			result = await checkContainerStatus(containerId, accessToken);
			attempts++;
		}

		if (result.status !== "FINISHED") {
			throw new Error(
				`Container not ready after ${maxAttempts} attempts. Current status: ${result.status}`,
			);
		}

		// Publish the container
		const publishUrl = `${THREADS_API_BASE_URL}/${userId}/threads_publish`;
		const publishBody = new URLSearchParams({
			access_token: accessToken,
			creation_id: containerId,
		});

		const publishResponse = await fetch(publishUrl, {
			method: "POST",
			body: publishBody,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		if (!publishResponse.ok) {
			const errorBody = await publishResponse.text();
			throw new Error(
				`Failed to publish Threads container (${publishResponse.status}): ${errorBody}`,
			);
		}

		const publishData = await publishResponse.json();

		if (getPermalink) {
			const threadData = await getSingleThread(publishData.id, accessToken);
			return {
				id: publishData.id,
				permalink: threadData.permalink || "",
			};
		}

		return publishData.id;
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error(
			`Failed to publish Threads container: ${String(error)}`,
		);
	}
}
