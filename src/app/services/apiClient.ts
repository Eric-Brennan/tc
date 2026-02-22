// ============================================================
// Base API Client
// ============================================================
// Typed HTTP wrapper. Currently backs to mock data (in-memory).
// When a real backend (e.g. Supabase / REST API) is connected,
// swap the implementation inside each method without changing
// the call-sites.
// ============================================================

const BASE_URL = '/api'; // Placeholder - will be replaced with real API URL

/** Standard envelope returned by every service method. */
export interface ApiResponse<T> {
  data: T;
  error: string | null;
  status: number;
}

/** Paginated list response. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  error: string | null;
  status: number;
}

/** Common pagination + sort params for list endpoints. */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ---- helpers ---------------------------------------------------------------

function success<T>(data: T): ApiResponse<T> {
  return { data, error: null, status: 200 };
}

function created<T>(data: T): ApiResponse<T> {
  return { data, error: null, status: 201 };
}

function deleted(): ApiResponse<null> {
  return { data: null, error: null, status: 204 };
}

function notFound(entity: string): ApiResponse<null> {
  return { data: null, error: `${entity} not found`, status: 404 };
}

function paginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  return {
    data: items,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
    error: null,
    status: 200,
  };
}

/** Simulate network latency (0 ms in tests, small delay otherwise). */
function delay(ms = 50): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Generate a unique ID. */
function uid(prefix = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export { success, created, deleted, notFound, paginated, delay, uid, BASE_URL };
