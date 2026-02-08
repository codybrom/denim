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
		// Use mock API
		return api.publishThreadsContainer(
			userId,
			accessToken,
			containerId,
			getPermalink,
		);
	}
	try {
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
			throw new Error(
				`Failed to publish Threads container: ${publishResponse.statusText}`,
			);
		}

		const publishData = await publishResponse.json();

		// Check container status with exponential backoff
		let status = await checkContainerStatus(containerId, accessToken);
		let attempts = 0;
		const maxAttempts = 5;
		const initialDelay = 500; // 0.5 seconds

		while (
			status !== "PUBLISHED" &&
			status !== "FINISHED" &&
			attempts < maxAttempts
		) {
			const delay = initialDelay * Math.pow(2, attempts);
			await new Promise((resolve) => setTimeout(resolve, delay));
			status = await checkContainerStatus(containerId, accessToken);
			attempts++;
		}

		if (status === "ERROR") {
			throw new Error(`Failed to publish container. Error: ${status}`);
		}

		if (status !== "PUBLISHED" && status !== "FINISHED") {
			throw new Error(
				`Container not published after ${maxAttempts} attempts. Current status: ${status}`,
			);
		}

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
			throw new Error(`Failed to publish Threads container: ${error.message}`);
		}
		throw error;
	}
}
