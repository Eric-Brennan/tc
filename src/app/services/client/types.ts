// ============================================================
// Client API Request / Response DTOs
// ============================================================

import type { PaginationParams } from '../shared/apiClient';
import type {
  MoodRating,
  PhysicalRating,
  SleepQuality,
  AnxietyLevel,
  StressLevel,
  PHQ9Response,
  GAD7Response,
} from '../../../types';

// ---- Profile ----------------------------------------------------------------

export interface UpdateClientProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  areasOfFocus?: string[];
  areasOfFocusDetails?: string;
}

export interface ListClientsParams extends PaginationParams {
  therapistId?: string;
  search?: string;
}

// ---- Follow / Unfollow Therapist --------------------------------------------

export interface FollowTherapistRequest {
  clientId: string;
  therapistId: string;
}

export interface UnfollowTherapistRequest {
  clientId: string;
  therapistId: string;
}

// ---- Journal ----------------------------------------------------------------

export interface CreateJournalEntryRequest {
  clientId: string;
  moodRating: MoodRating;
  physicalRating: PhysicalRating;
  sleepQuality?: SleepQuality;
  sleepHours?: number;
  anxietyLevel?: AnxietyLevel;
  stressLevel?: StressLevel;
  gratitude?: string[];
  accomplishments?: string[];
  challenges?: string;
  activities?: string[];
  goals?: string[];
  thoughts: string;
  sharedWithTherapistIds: string[];
}

export interface ListJournalEntriesParams extends PaginationParams {
  clientId: string;
  from?: Date;
  to?: Date;
}

export interface UpdateJournalSharingRequest {
  sharedWithTherapistIds: string[];
}

// ---- Assessments (PHQ-9 + GAD-7) --------------------------------------------

export interface CreateAssessmentRequest {
  clientId: string;
  therapistId: string;
  phq9: PHQ9Response;
  gad7: GAD7Response;
}

export interface ListAssessmentsParams extends PaginationParams {
  clientId?: string;
  therapistId?: string;
  from?: Date;
  to?: Date;
}

// ---- Client Notes -----------------------------------------------------------

export interface CreateClientNoteRequest {
  clientId: string;
  sessionId?: string;
  content: string;
}

export interface ListClientNotesParams extends PaginationParams {
  clientId: string;
  sessionId?: string;
}

// ---- Course Bookings --------------------------------------------------------

export interface PurchaseCourseRequest {
  clientId: string;
  coursePackageId: string;
}

export interface ListCourseBookingsParams extends PaginationParams {
  clientId?: string;
  therapistId?: string;
  status?: 'active' | 'completed' | 'cancelled';
}
