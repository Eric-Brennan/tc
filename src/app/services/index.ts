// ============================================================
// Service Layer — Barrel Export
// ============================================================
// Import any service method from '@/app/services':
//
//   import { listTherapists, sendMessage } from '../services';
//
// Or import from a specific domain:
//
//   import { login } from '../services/shared';
//   import { createJournalEntry } from '../services/client';
//   import { listBookmarks } from '../services/therapist';
//
// Every method returns a typed Promise<ApiResponse<T>> or
// Promise<PaginatedResponse<T>>. Currently backed by mock data;
// swap to real API / Azure Functions by changing the implementation
// inside each service file.
// ============================================================

// ---- Shared Services --------------------------------------------------------
export type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from './shared/apiClient';

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
} from './shared/types';

export type { ConversationSummary } from './shared/messageService';

export {
  // Auth
  login,
  register,
  logout,
  getCurrentUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  // Connections
  listConnections,
  getConnectionById,
  createConnection,
  updateConnection,
  deleteConnection,
  // Messages
  listConversations,
  listMessages,
  sendMessage,
  markMessagesRead,
  deleteMessage,
  // Video Sessions
  listVideoSessions,
  getVideoSessionById,
  createVideoSession,
  updateVideoSession,
  deleteVideoSession,
  // Theme / Settings
  getThemeSettings,
  updateThemeSettings,
  resetThemeSettings,
} from './shared';

// ---- Client Services --------------------------------------------------------
export type {
  UpdateClientProfileRequest,
  ListClientsParams,
  FollowTherapistRequest,
  UnfollowTherapistRequest,
  CreateJournalEntryRequest,
  ListJournalEntriesParams,
  UpdateJournalSharingRequest,
  CreateAssessmentRequest,
  ListAssessmentsParams,
  CreateClientNoteRequest,
  ListClientNotesParams,
  PurchaseCourseRequest,
  ListCourseBookingsParams,
} from './client/types';

export {
  // Client Profile
  listClients,
  getClientById,
  getCurrentClient,
  updateClientProfile,
  followTherapist,
  unfollowTherapist,
  // Client Journal
  listJournalEntries,
  getJournalEntryById,
  createJournalEntry,
  updateJournalSharing,
  deleteJournalEntry,
  // Client Assessments
  listAssessments,
  getAssessmentById,
  createAssessment,
  deleteAssessment,
  // Client Notes
  listClientNotes,
  getClientNoteById,
  createClientNote,
  // Course Bookings
  listCourseBookings,
  getCourseBookingById,
  purchaseCourse,
  cancelCourseBooking,
} from './client';

// ---- Therapist Services -----------------------------------------------------
export type {
  UpdateTherapistProfileRequest,
  UpdateTherapistExtendedProfileRequest,
  ListTherapistsParams,
  CreateSessionRateRequest,
  UpdateSessionRateRequest,
  UpdateAvailabilityRequest,
  CreateWorkshopRequest,
  UpdateWorkshopRequest,
  RegisterWorkshopRequest,
  ListWorkshopsParams,
  CreatePostRequest,
  UpdatePostRequest,
  ToggleLikeRequest,
  ListPostsParams,
  CreateSessionNoteRequest,
  UpdateSessionNoteRequest,
  ListSessionNotesParams,
  CreateTherapistJournalEntryRequest,
  UpdateTherapistJournalEntryRequest,
  ListTherapistJournalEntriesParams,
  CreateCpdEntryRequest,
  UpdateCpdEntryRequest,
  ListCpdEntriesParams,
  CreateSupervisionConnectionRequest,
  UpdateSupervisionConnectionRequest,
  ListSupervisionConnectionsParams,
  CreateSupervisionSessionRequest,
  UpdateSupervisionSessionRequest,
  ListSupervisionSessionsParams,
  CreateBookmarkRequest,
  UpdateBookmarkRequest,
  ListBookmarksParams,
  CreateCoursePackageRequest,
  UpdateCoursePackageRequest,
  ListCoursePackagesParams,
  CreateProBonoTokenRequest,
  ListProBonoTokensParams,
  UseProBonoTokenRequest,
} from './therapist/types';

export {
  // Therapist Profile
  listTherapists,
  getTherapistById,
  getCurrentTherapist,
  getCurrentTherapistExtended,
  updateTherapistProfile,
  updateTherapistExtendedProfile,
  // Session Rates
  listSessionRates,
  createSessionRate,
  updateSessionRate,
  deleteSessionRate,
  // Availability
  getAvailability,
  getTherapistAvailability,
  updateAvailability,
  // Posts
  listPosts,
  getPostById,
  createPost,
  updatePost,
  toggleLike,
  deletePost,
  // Workshops
  listWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  registerForWorkshop,
  unregisterFromWorkshop,
  deleteWorkshop,
  // Session Notes
  listSessionNotes,
  getSessionNoteById,
  createSessionNote,
  updateSessionNote,
  deleteSessionNote,
  // Therapist Journal & CPD
  listTherapistJournalEntries,
  getTherapistJournalEntryById,
  createTherapistJournalEntry,
  updateTherapistJournalEntry,
  deleteTherapistJournalEntry,
  listCpdEntries,
  getCpdEntryById,
  createCpdEntry,
  updateCpdEntry,
  deleteCpdEntry,
  // Supervision
  listSupervisionConnections,
  getSupervisionConnectionById,
  createSupervisionConnection,
  updateSupervisionConnection,
  deleteSupervisionConnection,
  listSupervisionSessions,
  getSupervisionSessionById,
  createSupervisionSession,
  updateSupervisionSession,
  deleteSupervisionSession,
  // Bookmarks
  listBookmarks,
  getBookmarkById,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  // Course Packages
  listCoursePackages,
  getCoursePackageById,
  createCoursePackage,
  updateCoursePackage,
  deleteCoursePackage,
  // Pro Bono Tokens
  listProBonoTokens,
  getProBonoTokenById,
  createProBonoToken,
  useProBonoToken,
  deleteProBonoToken,
} from './therapist';
