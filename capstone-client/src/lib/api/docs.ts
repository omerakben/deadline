import { http } from "./http";

/**
 * Documentation link interface (DOC_LINK artifacts)
 */
export interface DocLink {
  id: number;
  workspace: number;
  kind: "DOC_LINK";
  environment: "DEV" | "STAGING" | "PROD";
  title: string;
  url: string;
  description?: string;
  label?: string;
  created_at: string;
  updated_at: string;
}

/**
 * List all documentation links globally across all user's workspaces
 *
 * Endpoint: GET /api/v1/docs/
 * Auth: Required (Bearer token)
 *
 * @returns Array of all DOC_LINK artifacts from user's workspaces
 */
export async function listDocLinksGlobalServer(): Promise<DocLink[]> {
  try {
    const response = await http.get<{ results: DocLink[] }>("/docs/");
    // Backend uses DRF pagination, so extract results array
    return response.data.results || [];
  } catch (error) {
    console.error("Failed to list documentation links:", error);
    throw error;
  }
}
