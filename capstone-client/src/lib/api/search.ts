import { http } from "./http";
import { Artifact } from "./artifacts";

/**
 * Search result interface
 */
export interface SearchResult {
  results: Artifact[];
}

/**
 * Search query parameters
 */
export interface SearchQuery {
  q: string; // Search query string
}

/**
 * Search for artifacts globally across all user's workspaces
 *
 * Endpoint: GET /api/v1/search/artifacts/?q={query}
 * Auth: Required (Bearer token)
 *
 * @param query - Search parameters with query string
 * @returns Search results containing matching artifacts
 */
export async function searchArtifactsGlobal(query: SearchQuery): Promise<SearchResult> {
  try {
    const params = new URLSearchParams();
    params.append("q", query.q);

    const response = await http.get<{ results: Artifact[] }>(
      `/search/artifacts/?${params.toString()}`
    );

    return response.data;
  } catch (error) {
    console.error("Failed to search artifacts:", error);
    throw error;
  }
}

// Export types for convenience
export type { SearchResult, SearchQuery };
