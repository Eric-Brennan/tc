// ============================================================
// API Request / Response DTOs
// ============================================================
// These types decouple the service layer from internal models.
// They mirror what a REST / Supabase API would accept and return.
// ============================================================

import type { PaginationParams } from './apiClient';
import type {
  MoodRating,
  PhysicalRating,
  SleepQuality,
  AnxietyLevel,
  StressLevel,
  PHQ9Response,
  GAD7Response,
} from '../data/mockData';

// ---- Therapist --------------------------------------------------------------

export interface UpdateTherapistProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  credentials?: string;
  specializations?: string[];
  clinicalApproaches?: string[];
  yearsOfExperience?: number;
  education?: string[];
  bio?: string;
  hourlyRate?: number;
  availability?: string;
  bannerImage?: string;
}

export interface UpdateTherapistExtendedProfileRequest {
  title?: number;
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  displayName?: string | null;
  dateOfBirth?: Date | null;
  gender?: number;
  orientation?: number;
  contactDetails?: {
    email: string;
    mobileNumber: string;
    street: string;
    city: string;
    postCode: string;
    country?: string;
  } | null;
  profileLinks?: { id: string; title: string; url: string }[];
  isInPerson?: boolean;
  isVideo?: boolean;
  isPhone?: boolean;
  isLiveChat?: boolean;
  isMessaging?: boolean;
  willDoCouples?: boolean;
  bio?: string | null;
  yearsOfExperience?: number;
  spokenLanguages?: { id: string; languageCode: number; proficiency: number }[];
  educations?: { id: string; institution: string; degree: string; fieldOfStudy: string; yearCompleted: number }[];
  therapistTypes?: number[];
  areasOfFocus?: number[];
  clinicalApproaches?: number[];
  governingBodyMemberships?: {
    id: string;
    governingBody: number;
    membershipLevel: number;
    membershipNumber: string;
    yearObtained?: number;
  }[];
}

export interface ListTherapistsParams extends PaginationParams {
  specialization?: string;
  clinicalApproach?: string;
  location?: string;
  maxRate?: number;
  search?: string;
}

// ---- Session Rates ----------------------------------------------------------

export interface CreateSessionRateRequest {
  title: string;
  modality: 'video' | 'inPerson' | 'text' | 'phoneCall';
  duration: number;
  price: number;
  cooldown?: number;
}

export interface UpdateSessionRateRequest {
  title?: string;
  modality?: 'video' | 'inPerson' | 'text' | 'phoneCall';
  duration?: number;
  price?: number;
  cooldown?: number;
}

// ---- Course / Block Booking -------------------------------------------------

export interface CreateCoursePackageRequest {
  therapistId: string;
  title: string;
  description: string;
  sessionRateId: string;
  totalSessions: number;
  totalPrice: number;
}

export interface UpdateCoursePackageRequest {
  title?: string;
  description?: string;
  sessionRateId?: string;
  totalSessions?: number;
  totalPrice?: number;
  isActive?: boolean;
}

export interface PurchaseCourseRequest {
  clientId: string;
  coursePackageId: string;
}

export interface ListCourseBookingsParams {
  clientId?: string;
  therapistId?: string;
  status?: 'active' | 'completed' | 'cancelled';
}

// ---- Availability -----------------------------------------------------------

export interface UpdateAvailabilityRequest {
  windows: {
    date: string; // YYYY-MM-DD
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
    enabledRateIds: string[];
  }[];
}

// ---- Client -----------------------------------------------------------------

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

// ---- Connections ------------------------------------------------------------

export interface CreateConnectionRequest {
  clientId: string;
  therapistId: string;
  message?: string;
}

export interface UpdateConnectionRequest {
  status: 'accepted' | 'rejected';
}

export interface ListConnectionsParams extends PaginationParams {
  userId: string;
  status?: 'pending' | 'accepted' | 'rejected';
}

// ---- Messages ---------------------------------------------------------------

export interface SendMessageRequest {
  senderId: string;
  receiverId: string;
  content: string;
}

export interface ListMessagesParams extends PaginationParams {
  userId1: string;
  userId2: string;
}

export interface MarkMessagesReadRequest {
  messageIds: string[];
}

// ---- Posts ------------------------------------------------------------------

export interface CreatePostRequest {
  therapistId: string;
  content: string;
  link?: string;
}

export interface UpdatePostRequest {
  content?: string;
  link?: string;
}

export interface ToggleLikeRequest {
  userId: string;
}

export interface ListPostsParams extends PaginationParams {
  therapistId?: string;
}

// ---- Video Sessions ---------------------------------------------------------

export interface CreateVideoSessionRequest {
  therapistId: string;
  clientId: string;
  scheduledTime: Date;
  duration: number;
  sessionRateId?: string;
  modality?: 'video' | 'inPerson' | 'text' | 'phoneCall';
  price?: number;
}

export interface UpdateVideoSessionRequest {
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledTime?: Date;
  duration?: number;
  azureRoomId?: string;
  isPaid?: boolean;
}

export interface ListVideoSessionsParams extends PaginationParams {
  therapistId?: string;
  clientId?: string;
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  from?: Date;
  to?: Date;
}

// ---- Workshops --------------------------------------------------------------

export interface CreateWorkshopRequest {
  therapistId: string;
  title: string;
  description: string;
  scheduledTime: Date;
  duration: number;
  maxParticipants: number;
  price: number;
}

export interface UpdateWorkshopRequest {
  title?: string;
  description?: string;
  scheduledTime?: Date;
  duration?: number;
  maxParticipants?: number;
  price?: number;
}

export interface RegisterWorkshopRequest {
  clientId: string;
  workshopId: string;
}

export interface ListWorkshopsParams extends PaginationParams {
  therapistId?: string;
  from?: Date;
  to?: Date;
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

// ---- Assessments ------------------------------------------------------------

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

// ---- Session Notes (Therapist) ----------------------------------------------

export interface CreateSessionNoteRequest {
  clientId: string;
  therapistId: string;
  sessionId?: string;
  content: string;
}

export interface UpdateSessionNoteRequest {
  content: string;
}

export interface ListSessionNotesParams extends PaginationParams {
  clientId?: string;
  therapistId?: string;
  sessionId?: string;
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

// ---- Followed Therapists (Client) -------------------------------------------

export interface FollowTherapistRequest {
  clientId: string;
  therapistId: string;
}

export interface UnfollowTherapistRequest {
  clientId: string;
  therapistId: string;
}