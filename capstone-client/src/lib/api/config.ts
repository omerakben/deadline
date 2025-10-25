import { http } from "./http";
import { FirebaseClientConfig } from "@/lib/firebase/client";

/**
 * Fetch Firebase client configuration from the backend
 * This is a public endpoint that returns the Firebase web config
 *
 * Endpoint: GET /api/v1/auth/config/
 */
export async function fetchClientConfig(): Promise<FirebaseClientConfig> {
  try {
    const response = await http.get<FirebaseClientConfig>("/auth/config/");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch Firebase client config:", error);
    throw new Error("Unable to fetch authentication configuration from server");
  }
}

export type { FirebaseClientConfig };
