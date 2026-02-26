// ============================================================
// Therapist API Request / Response DTOs
// ============================================================

import type { PaginationParams } from '../shared/apiClient';

// ---- Profile ----------------------------------------------------------------

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
  isSupervision?: boolean; // true = only for supervision bookings
}

export interface UpdateSessionRateRequest {
  title?: string;
  modality?: 'video' | 'inPerson' | 'text' | 'phoneCall';
  duration?: number;
  price?: number;
  cooldown?: number;
  isSupervision?: boolean;
}

// ---- Availability -----------------------------------------------------------

export interface UpdateAvailabilityRequest {
  windows: {
    date: string; // YYYY-MM-DD
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
    enabledRateIds: string[];
    maxOccupancy?: number; // max booked minutes; beyond this = "request only" bookings
  }[];
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
  modality?: 'video' | 'inPerson'; // optional delivery mode
}

export interface UpdateWorkshopRequest {
  title?: string;
  description?: string;
  scheduledTime?: Date;
  duration?: number;
  maxParticipants?: number;
  price?: number;
  modality?: 'video' | 'inPerson';
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

// ---- Session Notes (Therapist-authored) -------------------------------------

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

// ---- Therapist Journal & CPD ------------------------------------------------

export interface CreateTherapistJournalEntryRequest {
  therapistId: string;
  mood: number; // 1-10
  thoughtsAndFeelings: string;
  sharedWithSupervisor: boolean;
}

export interface UpdateTherapistJournalEntryRequest {
  mood?: number;
  thoughtsAndFeelings?: string;
  sharedWithSupervisor?: boolean;
}

export interface ListTherapistJournalEntriesParams extends PaginationParams {
  therapistId: string;
  from?: Date;
  to?: Date;
  sharedWithSupervisor?: boolean;
}

export interface CreateCpdEntryRequest {
  therapistId: string;
  title: string;
  description: string;
  link?: string;
  startDate?: Date;
  completedDate?: Date;
}

export interface UpdateCpdEntryRequest {
  title?: string;
  description?: string;
  link?: string;
  startDate?: Date;
  completedDate?: Date;
}

export interface ListCpdEntriesParams extends PaginationParams {
  therapistId: string;
}

// ---- Supervision ------------------------------------------------------------

export interface CreateSupervisionConnectionRequest {
  superviseeId: string;
  supervisorId: string;
  message?: string;
}

export interface UpdateSupervisionConnectionRequest {
  status: 'accepted' | 'rejected';
}

export interface ListSupervisionConnectionsParams extends PaginationParams {
  therapistId: string;
  role?: 'supervisor' | 'supervisee';
  status?: 'pending' | 'accepted' | 'rejected';
}

export interface CreateSupervisionSessionRequest {
  supervisorId: string;
  superviseeId: string;
  scheduledTime: Date;
  duration: number;
  modality?: 'video' | 'inPerson' | 'phoneCall'; // Note: "text" is NOT valid for supervision
  price?: number;
}

export interface UpdateSupervisionSessionRequest {
  status?: 'scheduled' | 'completed' | 'cancelled';
  scheduledTime?: Date;
  duration?: number;
  notes?: string; // supervisor's session notes
}

export interface ListSupervisionSessionsParams extends PaginationParams {
  supervisorId?: string;
  superviseeId?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  from?: Date;
  to?: Date;
}

// ---- Bookmarks --------------------------------------------------------------

export interface CreateBookmarkRequest {
  therapistId: string;
  title: string;
  url: string;
}

export interface UpdateBookmarkRequest {
  title?: string;
  url?: string;
}

export interface ListBookmarksParams extends PaginationParams {
  therapistId: string;
  search?: string;
}

// ---- Course Packages --------------------------------------------------------

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

export interface ListCoursePackagesParams extends PaginationParams {
  therapistId: string;
  isActive?: boolean;
}

// ---- Pro Bono Tokens --------------------------------------------------------

export interface CreateProBonoTokenRequest {
  therapistId: string;
  clientId: string;
  sessionRateId: string;
  sessionRateTitle: string;
}

export interface ListProBonoTokensParams extends PaginationParams {
  therapistId?: string;
  clientId?: string;
  status?: 'available' | 'used' | 'expired';
}

export interface UseProBonoTokenRequest {
  tokenId: string;
}