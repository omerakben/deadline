import { http } from "./http";
import { FirebaseClientConfig } from "@/lib/firebase/client";

/**
 * Custom error for configuration fetch failures
 */
export class ConfigFetchError extends Error {
  public missing: string[];

  constructor(message: string, missing: string[] = [], public cause?: unknown) {
    super(message);
    this.name = "ConfigFetchError";
    this.missing = missing;
  }
}

/**
 * Response type from the backend config endpoint
 */
export interface ConfigResponse {
  firebase: FirebaseClientConfig;
}

/**
 * Fetch Firebase client configuration from the backend
 * This is a public endpoint that returns the Firebase web config
 *
 * Endpoint: GET /api/v1/auth/config/
 */
export async function fetchClientConfig(): Promise<ConfigResponse> {
  try {
    const response = await http.get<FirebaseClientConfig>("/auth/config/");
    // Wrap the response in the expected format
    return {
      firebase: response.data,
    };
  } catch (error) {
    console.error("Failed to fetch Firebase client config:", error);
    throw new ConfigFetchError(
      "Unable to fetch authentication configuration from server",
      [],
      error
    );
  }
}

export type { FirebaseClientConfig };
