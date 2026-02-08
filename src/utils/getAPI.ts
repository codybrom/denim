import type { MockThreadsAPI } from "../../mod.ts";
type GlobalWithEnvironment = typeof globalThis & {
	threadsAPI?: MockThreadsAPI;
};

/**
 * Retrieves the mock API instance if available.
 *
 * @returns The mock API instance or null if not available
 */
export function getAPI(): MockThreadsAPI | null {
	return (globalThis as GlobalWithEnvironment).threadsAPI || null;
}
