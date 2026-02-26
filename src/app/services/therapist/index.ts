// ============================================================
// Therapist Services — Barrel Export
// ============================================================

// ---- DTOs -------------------------------------------------------------------
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
} from './types';

// ---- Profile Service --------------------------------------------------------
export {
  listTherapists,
  getTherapistById,
  getCurrentTherapist,
  getCurrentTherapistExtended,
  updateTherapistProfile,
  updateTherapistExtendedProfile,
} from './profileService';

// ---- Session Rate Service ---------------------------------------------------
export {
  listSessionRates,
  createSessionRate,
  updateSessionRate,
  deleteSessionRate,
} from './sessionRateService';

// ---- Availability Service ---------------------------------------------------
export {
  getAvailability,
  getTherapistAvailability,
  updateAvailability,
} from './availabilityService';

// ---- Post Service -----------------------------------------------------------
export {
  listPosts,
  getPostById,
  createPost,
  updatePost,
  toggleLike,
  deletePost,
} from './postService';

// ---- Workshop Service -------------------------------------------------------
export {
  listWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  registerForWorkshop,
  unregisterFromWorkshop,
  deleteWorkshop,
} from './workshopService';

// ---- Session Note Service ---------------------------------------------------
export {
  listSessionNotes,
  getSessionNoteById,
  createSessionNote,
  updateSessionNote,
  deleteSessionNote,
} from './sessionNoteService';

// ---- Therapist Journal & CPD Service ----------------------------------------
export {
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
} from './journalService';

// ---- Supervision Service ----------------------------------------------------
export {
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
} from './supervisionService';

// ---- Bookmark Service -------------------------------------------------------
export {
  listBookmarks,
  getBookmarkById,
  createBookmark,
  updateBookmark,
  deleteBookmark,
} from './bookmarkService';

// ---- Course Package Service -------------------------------------------------
export {
  listCoursePackages,
  getCoursePackageById,
  createCoursePackage,
  updateCoursePackage,
  deleteCoursePackage,
} from './coursePackageService';

// ---- Pro Bono Token Service -------------------------------------------------
export {
  listProBonoTokens,
  getProBonoTokenById,
  createProBonoToken,
  useProBonoToken,
  deleteProBonoToken,
} from './proBonoService';
