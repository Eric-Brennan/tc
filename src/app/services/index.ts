// ============================================================
// Service Layer — Barrel Export
// ============================================================
// Import any service method from '@/app/services':
//
//   import { listTherapists, sendMessage } from '../services';
//
// Every method returns a typed Promise<ApiResponse<T>> or
// Promise<PaginatedResponse<T>>. Currently backed by mock data;
// swap to real API / Supabase by changing the implementation
// inside each service file.
// ============================================================

// ---- Base types -------------------------------------------------------------
export type { ApiResponse, PaginatedResponse, PaginationParams } from './apiClient';

// ---- Request / Response DTOs ------------------------------------------------
export type {
  // Therapist
  UpdateTherapistProfileRequest,
  UpdateTherapistExtendedProfileRequest,
  ListTherapistsParams,
  CreateSessionRateRequest,
  UpdateSessionRateRequest,
  UpdateAvailabilityRequest,
  // Client
  UpdateClientProfileRequest,
  ListClientsParams,
  FollowTherapistRequest,
  UnfollowTherapistRequest,
  // Connection
  CreateConnectionRequest,
  UpdateConnectionRequest,
  ListConnectionsParams,
  // Message
  SendMessageRequest,
  ListMessagesParams,
  MarkMessagesReadRequest,
  // Post
  CreatePostRequest,
  UpdatePostRequest,
  ToggleLikeRequest,
  ListPostsParams,
  // Session
  CreateVideoSessionRequest,
  UpdateVideoSessionRequest,
  ListVideoSessionsParams,
  // Workshop
  CreateWorkshopRequest,
  UpdateWorkshopRequest,
  RegisterWorkshopRequest,
  ListWorkshopsParams,
  // Journal
  CreateJournalEntryRequest,
  ListJournalEntriesParams,
  UpdateJournalSharingRequest,
  // Assessment
  CreateAssessmentRequest,
  ListAssessmentsParams,
  // Session Notes
  CreateSessionNoteRequest,
  UpdateSessionNoteRequest,
  ListSessionNotesParams,
  // Client Notes
  CreateClientNoteRequest,
  ListClientNotesParams,
} from './types';

// ---- Therapist Service ------------------------------------------------------
export {
  listTherapists,
  getTherapistById,
  getCurrentTherapist,
  getCurrentTherapistExtended,
  updateTherapistProfile,
  updateTherapistExtendedProfile,
  createSessionRate,
  updateSessionRate,
  deleteSessionRate,
  updateAvailability,
  getAvailability,
} from './therapistService';

// ---- Client Service ---------------------------------------------------------
export {
  listClients,
  getClientById,
  getCurrentClient,
  updateClientProfile,
  followTherapist,
  unfollowTherapist,
} from './clientService';

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

// ---- Post Service -----------------------------------------------------------
export {
  listPosts,
  getPostById,
  createPost,
  updatePost,
  toggleLike,
  deletePost,
} from './postService';

// ---- Session & Workshop Service ---------------------------------------------
export {
  // Video Sessions
  listVideoSessions,
  getVideoSessionById,
  createVideoSession,
  updateVideoSession,
  deleteVideoSession,
  // Workshops
  listWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  registerForWorkshop,
  unregisterFromWorkshop,
  deleteWorkshop,
} from './sessionService';

// ---- Journal Service --------------------------------------------------------
export {
  listJournalEntries,
  getJournalEntryById,
  createJournalEntry,
  updateJournalSharing,
} from './journalService';

// ---- Assessment & Notes Service ---------------------------------------------
export {
  // Assessments
  listAssessments,
  getAssessmentById,
  createAssessment,
  // Session Notes (therapist)
  listSessionNotes,
  getSessionNoteById,
  createSessionNote,
  updateSessionNote,
  deleteSessionNote,
  // Client Notes
  listClientNotes,
  createClientNote,
} from './assessmentService';