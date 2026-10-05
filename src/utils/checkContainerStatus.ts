import { THREADS_API_BASE_URL } from "../constants.ts";

interface ContainerStatus {
	status: "EXPIRED" | "ERROR" | "FINISHED" | "IN_PROGRESS" | "PUBLISHED";
	error_message?: string;
}

/**
 * Checks the status of a Threads container.
 *
 * @param containerId - The ID of the container to check
 * @param accessToken - The access token for authentication
 * @returns A Promise that resolves to the container status and optional error message
 * @throws Will throw an error if the API request fails
 */
export async function checkContainerStatus(
	containerId: string,
	accessToken: string,
): Promise<ContainerStatus> {
	const url = new URL(`${THREADS_API_BASE_URL}/${containerId}`);
	url.searchParams.append("fields", "status,error_message");
	url.searchParams.append("access_token", accessToken);

	const response = await fetch(url.toString());
	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(
			`Failed to check container status (${response.status}): ${errorBody}`,
		);
	}

	const data: ContainerStatus = await response.json();
	return {
		status: data.status,
		error_message: data.error_message,
	};
}
