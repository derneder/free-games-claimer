/**
 * API Response and Request Type Definitions
 */

/**
 * Standard API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

/**
 * API Error response
 */
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Request validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Validation error response
 */
export interface ValidationErrorResponse extends ApiError {
  errors: ValidationError[];
}
