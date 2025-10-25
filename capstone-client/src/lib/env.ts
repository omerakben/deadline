/**
 * Environment variable validation utilities
 */

/**
 * Get the API base URL from environment
 *
 * Defaults:
 * - Production (vercel.app domain): Railway production API
 * - Development (localhost): Local development API
 */
export function getApiUrl(): string {
  // If explicitly set, use that
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // Smart default based on environment
  // In browser, check if we're on a production domain
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // If on Vercel or any production domain, use Railway production API
    if (hostname.includes("vercel.app") || hostname.includes("deadline-demo")) {
      return "https://deadline-production.up.railway.app/api/v1";
    }
  }

  // Default to localhost for development
  return "http://localhost:8000/api/v1";
}
