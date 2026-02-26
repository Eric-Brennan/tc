// ============================================================
// Shared Services — Barrel Export
// ============================================================

// ---- Base types -------------------------------------------------------------
export type { ApiResponse, PaginatedResponse, PaginationParams } from './apiClient';
export { success, created, deleted, notFound, paginated, delay, uid, BASE_URL } from './apiClient';

// ---- Shared DTOs ------------------------------------------------------------
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  CreateConnectionRequest,
  UpdateConnectionRequest,
  ListConnectionsParams,
  SendMessageRequest,
  ListMessagesParams,
  MarkMessagesReadRequest,
  CreateVideoSessionRequest,
  UpdateVideoSessionRequest,
  ListVideoSessionsParams,
  UpdateThemeSettingsRequest,
} from './types';

// ---- Auth Service -----------------------------------------------------------
export {
  login,
  register,
  logout,
  getCurrentUser,
  refreshToken,
  forgotPassword,
  resetPassword,
} from './authService';

// ---- Connection Service -----------------------------------------------------
export {
  listConnections,
  getConnectionById,
  createConnection,
  updateConnection,
  deleteConnection,
} from './connectionService';

// ---- Message Service --------------------------------------------------------
export {
  listConversations,
  listMessages,
  sendMessage,
  markMessagesRead,
  deleteMessage,
} from './messageService';
export type { ConversationSummary } from './messageService';

// ---- Video Session Service --------------------------------------------------
export {
  listVideoSessions,
  getVideoSessionById,
  createVideoSession,
  updateVideoSession,
  deleteVideoSession,
} from './sessionService';

// ---- Theme / Settings Service -----------------------------------------------
export {
  getThemeSettings,
  updateThemeSettings,
  resetThemeSettings,
} from './themeService';
