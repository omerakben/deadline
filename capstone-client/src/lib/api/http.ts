import { getApiUrl } from "@/lib/env";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { User as FirebaseUser } from "firebase/auth";

// Get the API base URL from environment variable (defaults to localhost for dev)
const API_BASE_URL = getApiUrl();

// Create axios instance with default config
const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Store the current Firebase user for token retrieval
let currentUser: FirebaseUser | null = null;

/**
 * Attach Firebase authentication to HTTP client
 * This sets up request interceptors to add the Firebase ID token to all requests
 */
export function attachAuth(user: FirebaseUser | null) {
  currentUser = user;
}

/**
 * Request interceptor to add Firebase auth token to requests
 */
httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (currentUser) {
      try {
        // Get fresh ID token from Firebase
        const token = await currentUser.getIdToken();

        // Add Authorization header
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Failed to get Firebase ID token:", error);
        // Continue with request even if token retrieval fails
        // Backend will return 401 if auth is required
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we have a user, try to refresh token once
    if (
      error.response?.status === 401 &&
      currentUser &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Force token refresh
        const token = await currentUser.getIdToken(true);
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Retry the original request
        return httpClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Let the error propagate - user may need to re-authenticate
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Export the configured HTTP client
export const http = httpClient;

// Export types for request configuration
export type { AxiosInstance, AxiosRequestConfig };
