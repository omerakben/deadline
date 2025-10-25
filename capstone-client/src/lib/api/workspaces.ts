import { http } from "./http";

/**
 * TypeScript interfaces matching Django backend models
 */

export interface EnvironmentType {
  id: number;
  name: string;
  slug: string;
}

export interface WorkspaceEnvironment {
  id: number;
  environment_type?: EnvironmentType;
  slug?: string; // Convenience field for direct access to environment slug
  name?: string; // Convenience field for direct access to environment name
}

export interface ArtifactCounts {
  ENV_VAR: number;
  PROMPT: number;
  DOC_LINK: number;
  total: number;
  by_environment?: {
    [key: string]: {
      ENV_VAR: number;
      PROMPT: number;
      DOC_LINK: number;
      total: number;
    };
  };
}

export interface Workspace {
  id: number;
  name: string;
  description?: string;
  owner_uid: string;
  created_at: string;
  updated_at: string;
  enabled_environments?: WorkspaceEnvironment[];
  artifact_counts?: ArtifactCounts;
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
}

/**
 * List all workspaces owned by the current user
 *
 * Endpoint: GET /api/v1/workspaces/
 * Auth: Required (Bearer token)
 */
export async function listWorkspaces(): Promise<Workspace[]> {
  try {
    const response = await http.get<Workspace[]>("/workspaces/");
    return response.data;
  } catch (error) {
    console.error("Failed to list workspaces:", error);
    throw error;
  }
}

/**
 * Get a specific workspace by ID
 *
 * Endpoint: GET /api/v1/workspaces/{id}/
 * Auth: Required (Bearer token)
 */
export async function getWorkspace(id: number): Promise<Workspace> {
  try {
    const response = await http.get<Workspace>(`/workspaces/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get workspace ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new workspace
 *
 * Endpoint: POST /api/v1/workspaces/
 * Auth: Required (Bearer token)
 */
export async function createWorkspace(data: CreateWorkspaceInput): Promise<Workspace> {
  try {
    const response = await http.post<Workspace>("/workspaces/", data);
    return response.data;
  } catch (error) {
    console.error("Failed to create workspace:", error);
    throw error;
  }
}

/**
 * Update an existing workspace
 *
 * Endpoint: PATCH /api/v1/workspaces/{id}/
 * Auth: Required (Bearer token)
 */
export async function updateWorkspace(id: number, data: UpdateWorkspaceInput): Promise<Workspace> {
  try {
    const response = await http.patch<Workspace>(`/workspaces/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update workspace ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a workspace
 *
 * Endpoint: DELETE /api/v1/workspaces/{id}/
 * Auth: Required (Bearer token)
 */
export async function deleteWorkspace(id: number): Promise<void> {
  try {
    await http.delete(`/workspaces/${id}/`);
  } catch (error) {
    console.error(`Failed to delete workspace ${id}:`, error);
    throw error;
  }
}

/**
 * Update enabled environments for a workspace
 *
 * Endpoint: PATCH /api/v1/workspaces/{id}/enabled_environments/
 * Auth: Required (Bearer token)
 *
 * @param id - Workspace ID
 * @param enabled - Array of environment slugs (e.g., ["DEV", "STAGING", "PROD"])
 */
export async function updateEnabledEnvironments(
  id: number,
  enabled: string[]
): Promise<WorkspaceEnvironment[]> {
  try {
    const response = await http.patch<WorkspaceEnvironment[]>(
      `/workspaces/${id}/enabled_environments/`,
      { enabled }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to update enabled environments for workspace ${id}:`, error);
    throw error;
  }
}

/**
 * Apply showcase templates to create demo workspaces
 * This creates sample workspaces with pre-populated artifacts
 *
 * Endpoint: POST /api/v1/workspaces/templates/apply
 * Auth: Required (Bearer token)
 */
export async function applyShowcaseTemplates(): Promise<Workspace[]> {
  try {
    const response = await http.post<Workspace[]>("/workspaces/templates/apply");
    return response.data;
  } catch (error) {
    console.error("Failed to apply showcase templates:", error);
    throw error;
  }
}

/**
 * Export data type for workspace import/export
 */
export interface ExportData {
  workspace: Workspace;
  artifacts?: unknown[];
  // Add other exportable data as needed
}

/**
 * Export a workspace with all its data
 *
 * Note: This is a stub implementation. Export functionality may not be fully
 * implemented in the backend.
 *
 * @param workspaceId - Workspace ID to export
 * @returns Export data
 */
export async function exportWorkspace(workspaceId: number): Promise<ExportData> {
  try {
    // TODO: Implement when backend export API is available
    const workspace = await getWorkspace(workspaceId);
    return {
      workspace,
      artifacts: [],
    };
  } catch (error) {
    console.error(`Failed to export workspace ${workspaceId}:`, error);
    throw error;
  }
}

/**
 * Import a workspace from export data
 *
 * Note: This is a stub implementation. Import functionality may not be fully
 * implemented in the backend.
 *
 * @param data - Export data to import
 * @returns Imported workspace
 */
export async function importWorkspace(data: ExportData): Promise<Workspace> {
  try {
    // TODO: Implement when backend import API is available
    console.warn("Workspace import not yet implemented in backend");
    const workspace = await createWorkspace({
      name: data.workspace.name + " (Imported)",
      description: data.workspace.description,
    });
    return workspace;
  } catch (error) {
    console.error("Failed to import workspace:", error);
    throw error;
  }
}
