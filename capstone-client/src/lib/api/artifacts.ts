import type { Artifact, ArtifactKind, EnvCode } from "@/types/artifacts";
import { http } from "./http";

/**
 * Type aliases for compatibility
 */
export type EnvironmentSlug = EnvCode;
export type { Artifact, ArtifactKind } from "@/types/artifacts";

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

  // Tags (array of tag IDs)
  tags?: number[];
}

export interface ArtifactFilters {
  workspaceId: number;
  kind?: ArtifactKind;
  environment?: EnvironmentSlug;
  search?: string;
}

/**
 * Paginated response from DRF PageNumberPagination
 */
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * List all artifacts for a workspace
 * Optional filters for kind and environment
 *
 * Endpoint: GET /api/v1/workspaces/{workspaceId}/artifacts/
 * Auth: Required (Bearer token)
 */
export async function listArtifacts(
  filters: ArtifactFilters
): Promise<Artifact[]> {
  try {
    const { workspaceId, kind, environment, search } = filters;
    const params = new URLSearchParams();

    if (kind) {
      params.append("kind", kind);
    }

    if (environment) {
      params.append("environment", environment);
    }

    if (search) {
      params.append("search", search);
    }

    const queryString = params.toString();
    const url = queryString
      ? `/workspaces/${workspaceId}/artifacts/?${queryString}`
      : `/workspaces/${workspaceId}/artifacts/`;

    const response = await http.get<PaginatedResponse<Artifact>>(url);
    // Backend uses DRF pagination, so extract the results array
    return response.data.results || [];
  } catch (error) {
    console.error(
      `Failed to list artifacts for workspace ${filters.workspaceId}:`,
      error
    );
    throw error;
  }
}

/**
 * Get a specific artifact
 *
 * Endpoint: GET /api/v1/workspaces/{workspaceId}/artifacts/{artifactId}/
 * Auth: Required (Bearer token)
 */
export async function getArtifact(
  workspaceId: number,
  artifactId: number
): Promise<Artifact> {
  try {
    const response = await http.get<Artifact>(
      `/workspaces/${workspaceId}/artifacts/${artifactId}/`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to get artifact ${artifactId} from workspace ${workspaceId}:`,
      error
    );
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
    const response = await http.post<Artifact>(
      `/workspaces/${workspaceId}/artifacts/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to create artifact in workspace ${workspaceId}:`,
      error
    );
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
    console.error(
      `Failed to update artifact ${artifactId} in workspace ${workspaceId}:`,
      error
    );
    throw error;
  }
}

/**
 * Delete an artifact
 *
 * Endpoint: DELETE /api/v1/workspaces/{workspaceId}/artifacts/{artifactId}/
 * Auth: Required (Bearer token)
 */
export async function deleteArtifact(
  workspaceId: number,
  artifactId: number
): Promise<void> {
  try {
    await http.delete(`/workspaces/${workspaceId}/artifacts/${artifactId}/`);
  } catch (error) {
    console.error(
      `Failed to delete artifact ${artifactId} from workspace ${workspaceId}:`,
      error
    );
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
 * List all tags in a workspace
 *
 * Endpoint: GET /api/v1/workspaces/{workspaceId}/artifacts/tags/
 * Auth: Required (Bearer token)
 * Note: Tags endpoint does NOT use pagination (returns simple array)
 *
 * @param workspaceId - Workspace ID
 * @returns Array of tags with usage counts
 */
export async function listTags(workspaceId: number): Promise<Tag[]> {
  try {
    const response = await http.get<Tag[]>(
      `/workspaces/${workspaceId}/artifacts/tags/`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to list tags for workspace ${workspaceId}:`, error);
    throw error;
  }
}

/**
 * Create a new tag in a workspace
 *
 * Endpoint: POST /api/v1/workspaces/{workspaceId}/artifacts/tags/
 * Auth: Required (Bearer token)
 *
 * @param workspaceId - Workspace ID
 * @param name - Tag name (unique within workspace)
 * @returns Created tag object
 */
export async function createTag(
  workspaceId: number,
  name: string
): Promise<Tag> {
  try {
    const response = await http.post<Tag>(
      `/workspaces/${workspaceId}/artifacts/tags/`,
      {
        name,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to create tag "${name}" in workspace ${workspaceId}:`,
      error
    );
    throw error;
  }
}

/**
 * Delete a tag from a workspace
 *
 * Endpoint: DELETE /api/v1/workspaces/{workspaceId}/artifacts/tags/{tagId}/
 * Auth: Required (Bearer token)
 * Note: Removes tag from all artifacts (cascade delete of ArtifactTag relations)
 *
 * @param workspaceId - Workspace ID
 * @param tagId - Tag ID to delete
 */
export async function deleteTag(
  workspaceId: number,
  tagId: number
): Promise<void> {
  try {
    await http.delete(`/workspaces/${workspaceId}/artifacts/tags/${tagId}/`);
  } catch (error) {
    console.error(
      `Failed to delete tag ${tagId} from workspace ${workspaceId}:`,
      error
    );
    throw error;
  }
}
