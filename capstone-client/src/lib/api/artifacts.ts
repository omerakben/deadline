import { http } from "./http";

/**
 * TypeScript interfaces for Artifacts
 */

export type ArtifactKind = "ENV_VAR" | "PROMPT" | "DOC_LINK";
export type EnvironmentSlug = "DEV" | "STAGING" | "PROD";

/**
 * Tag interface for artifact tagging system
 * Note: Tag functionality may not be fully implemented in backend
 */
export interface Tag {
  id: number;
  name: string;
  workspace?: number;
  usage_count?: number;
}

/**
 * Specific input type for creating ENV_VAR artifacts
 */
export interface CreateEnvVarInput {
  kind: "ENV_VAR";
  environment: EnvironmentSlug;
  key: string;
  value: string;
  notes?: string;
}

export interface Artifact {
  id: number;
  workspace: number;
  kind: ArtifactKind;
  environment: EnvironmentSlug;
  created_at: string;
  updated_at: string;

  // Environment Variable fields
  key?: string;
  value?: string;

  // Prompt fields
  title?: string;
  content?: string;

  // Doc Link fields
  url?: string;
  description?: string;
}

export interface CreateArtifactInput {
  kind: ArtifactKind;
  environment: EnvironmentSlug;

  // Common fields
  notes?: string;

  // ENV_VAR fields
  key?: string;
  value?: string;

  // PROMPT fields
  title?: string;
  content?: string;

  // DOC_LINK fields
  url?: string;
  description?: string;
  label?: string;
}

export interface UpdateArtifactInput {
  environment?: EnvironmentSlug;

  // ENV_VAR fields
  key?: string;
  value?: string;

  // PROMPT fields
  title?: string;
  content?: string;

  // DOC_LINK fields
  url?: string;
  description?: string;
}

export interface ArtifactFilters {
  kind?: ArtifactKind;
  environment?: EnvironmentSlug;
}

/**
 * List all artifacts for a workspace
 * Optional filters for kind and environment
 *
 * Endpoint: GET /api/v1/workspaces/{workspaceId}/artifacts/
 * Auth: Required (Bearer token)
 */
export async function listArtifacts(
  workspaceId: number,
  filters?: ArtifactFilters
): Promise<Artifact[]> {
  try {
    const params = new URLSearchParams();

    if (filters?.kind) {
      params.append("kind", filters.kind);
    }

    if (filters?.environment) {
      params.append("environment", filters.environment);
    }

    const queryString = params.toString();
    const url = queryString
      ? `/workspaces/${workspaceId}/artifacts/?${queryString}`
      : `/workspaces/${workspaceId}/artifacts/`;

    const response = await http.get<Artifact[]>(url);
    return response.data;
  } catch (error) {
    console.error(`Failed to list artifacts for workspace ${workspaceId}:`, error);
    throw error;
  }
}

/**
 * Get a specific artifact
 *
 * Endpoint: GET /api/v1/workspaces/{workspaceId}/artifacts/{artifactId}/
 * Auth: Required (Bearer token)
 */
export async function getArtifact(workspaceId: number, artifactId: number): Promise<Artifact> {
  try {
    const response = await http.get<Artifact>(`/workspaces/${workspaceId}/artifacts/${artifactId}/`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get artifact ${artifactId} from workspace ${workspaceId}:`, error);
    throw error;
  }
}

/**
 * Create a new artifact in a workspace
 *
 * Endpoint: POST /api/v1/workspaces/{workspaceId}/artifacts/
 * Auth: Required (Bearer token)
 */
export async function createArtifact(
  workspaceId: number,
  data: CreateArtifactInput
): Promise<Artifact> {
  try {
    const response = await http.post<Artifact>(`/workspaces/${workspaceId}/artifacts/`, data);
    return response.data;
  } catch (error) {
    console.error(`Failed to create artifact in workspace ${workspaceId}:`, error);
    throw error;
  }
}

/**
 * Update an existing artifact
 *
 * Endpoint: PATCH /api/v1/workspaces/{workspaceId}/artifacts/{artifactId}/
 * Auth: Required (Bearer token)
 */
export async function updateArtifact(
  workspaceId: number,
  artifactId: number,
  data: UpdateArtifactInput
): Promise<Artifact> {
  try {
    const response = await http.patch<Artifact>(
      `/workspaces/${workspaceId}/artifacts/${artifactId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to update artifact ${artifactId} in workspace ${workspaceId}:`, error);
    throw error;
  }
}

/**
 * Delete an artifact
 *
 * Endpoint: DELETE /api/v1/workspaces/{workspaceId}/artifacts/{artifactId}/
 * Auth: Required (Bearer token)
 */
export async function deleteArtifact(workspaceId: number, artifactId: number): Promise<void> {
  try {
    await http.delete(`/workspaces/${workspaceId}/artifacts/${artifactId}/`);
  } catch (error) {
    console.error(`Failed to delete artifact ${artifactId} from workspace ${workspaceId}:`, error);
    throw error;
  }
}

/**
 * Duplicate an artifact to a different environment
 *
 * Endpoint: POST /api/v1/workspaces/{workspaceId}/artifacts/{artifactId}/duplicate/
 * Auth: Required (Bearer token)
 *
 * @param workspaceId - Workspace ID
 * @param artifactId - Artifact ID to duplicate
 * @param targetEnvironment - Target environment (DEV, STAGING, or PROD)
 */
export async function duplicateArtifactToEnvironment(
  workspaceId: number,
  artifactId: number,
  targetEnvironment: EnvironmentSlug
): Promise<Artifact> {
  try {
    const response = await http.post<Artifact>(
      `/workspaces/${workspaceId}/artifacts/${artifactId}/duplicate/`,
      { target_environment: targetEnvironment }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to duplicate artifact ${artifactId} to ${targetEnvironment}:`,
      error
    );
    throw error;
  }
}

/**
 * List all tags for a workspace
 *
 * Note: This is a stub implementation. Tag functionality may not be fully
 * implemented in the backend. Returns empty array for now.
 *
 * @param workspaceId - Workspace ID
 * @returns Empty array (tag feature not implemented in backend)
 */
export async function listTags(workspaceId: number): Promise<Tag[]> {
  // TODO: Implement when backend tag API is available
  console.warn("Tag functionality not yet implemented in backend");
  return [];
}

/**
 * Create a new tag
 *
 * Note: This is a stub implementation. Tag functionality may not be fully
 * implemented in the backend.
 *
 * @param workspaceId - Workspace ID
 * @param name - Tag name
 * @returns Stub tag object
 */
export async function createTag(workspaceId: number, name: string): Promise<Tag> {
  // TODO: Implement when backend tag API is available
  console.warn("Tag functionality not yet implemented in backend");
  return {
    id: Date.now(), // temporary ID
    name,
    workspace: workspaceId,
  };
}

/**
 * Delete a tag
 *
 * Note: This is a stub implementation. Tag functionality may not be fully
 * implemented in the backend.
 *
 * @param workspaceId - Workspace ID
 * @param tagId - Tag ID to delete
 */
export async function deleteTag(workspaceId: number, tagId: number): Promise<void> {
  // TODO: Implement when backend tag API is available
  console.warn("Tag functionality not yet implemented in backend");
  return;
}

