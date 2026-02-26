// ============================================================
// Client Services — Barrel Export
// ============================================================

// ---- DTOs -------------------------------------------------------------------
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
} from './types';

// ---- Profile Service --------------------------------------------------------
export {
  listClients,
  getClientById,
  getCurrentClient,
  updateClientProfile,
  followTherapist,
  unfollowTherapist,
} from './profileService';

// ---- Journal Service --------------------------------------------------------
export {
  listJournalEntries,
  getJournalEntryById,
  createJournalEntry,
  updateJournalSharing,
  deleteJournalEntry,
} from './journalService';

// ---- Assessment Service -----------------------------------------------------
export {
  listAssessments,
  getAssessmentById,
  createAssessment,
  deleteAssessment,
} from './assessmentService';

// ---- Client Note Service ----------------------------------------------------
export {
  listClientNotes,
  getClientNoteById,
  createClientNote,
} from './noteService';

// ---- Course Booking Service -------------------------------------------------
export {
  listCourseBookings,
  getCourseBookingById,
  purchaseCourse,
  cancelCourseBooking,
} from './courseBookingService';
