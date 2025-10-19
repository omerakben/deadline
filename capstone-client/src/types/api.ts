/**
 * Shared API type definitions
 */

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  error: string;
  detail?: string;
  field_errors?: Record<string, string[]>;
}

export interface ApiSuccess {
  message: string;
  data?: unknown;
}
