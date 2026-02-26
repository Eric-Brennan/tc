// ============================================================
// Backward-compat re-export — use './shared/apiClient' directly
// ============================================================
export type { ApiResponse, PaginatedResponse, PaginationParams } from './shared/apiClient';
export { success, created, deleted, notFound, paginated, delay, uid, BASE_URL } from './shared/apiClient';
