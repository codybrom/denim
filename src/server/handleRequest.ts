import {
	createThreadsContainer,
	getAPI,
	publishThreadsContainer,
	type ThreadsPostRequest,
} from "../../mod.ts";
export async function handleRequest(req: Request): Promise<Response> {
	const api = getAPI();

	if (req.method !== "POST") {
		return new Response("Method Not Allowed", { status: 405 });
	}

	try {
		const requestData: ThreadsPostRequest = await req.json();
		console.log(`Received request data: ${JSON.stringify(requestData)}`);

		if (
			!requestData.userId ||
			!requestData.accessToken ||
			!requestData.mediaType
		) {
			return new Response(
				JSON.stringify({
					success: false,
					error: "Missing required fields",
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		let containerResult;
		let publishResult;

		if (api) {
			// Use mock API
			containerResult = await api.createThreadsContainer(requestData);
			publishResult = await api.publishThreadsContainer(
				requestData.userId,
				requestData.accessToken,
				typeof containerResult === "string"
					? containerResult
					: containerResult.id,
				requestData.getPermalink,
			);
		} else {
			// Use real API calls
			containerResult = await createThreadsContainer(requestData);
			if (typeof containerResult === "string") {
				publishResult = await publishThreadsContainer(
					requestData.userId,
					requestData.accessToken,
					containerResult,
					requestData.getPermalink,
				);
			} else {
				publishResult = containerResult;
			}
		}

		let responseData;
		if (typeof publishResult === "string") {
			responseData = { success: true, publishedId: publishResult };
		} else {
			responseData = {
				success: true,
				publishedId: publishResult.id,
				permalink: publishResult.permalink,
			};
		}

		return new Response(JSON.stringify(responseData), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (error: unknown) {
		console.error("Error posting to Threads:", error);
		let errorMessage = "An unknown error occurred";
		let errorStack = "";
		if (error instanceof Error) {
			errorMessage = error.message;
			errorStack = error.stack || "";
		}
		return new Response(
			JSON.stringify({
				success: false,
				error: errorMessage,
				stack: errorStack,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
