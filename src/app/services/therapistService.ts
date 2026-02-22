// ============================================================
// Therapist Service
// ============================================================
// GET    /therapists              → list / search therapists
// GET    /therapists/:id          → get therapist by ID
// GET    /therapists/me           → get current therapist profile
// PUT    /therapists/me           → update current therapist profile
// PUT    /therapists/me/extended  → update extended profile
// POST   /therapists/me/rates     → create session rate
// PUT    /therapists/me/rates/:id → update session rate
// DELETE /therapists/me/rates/:id → delete session rate
// PUT    /therapists/me/availability → update availability slots
// ============================================================

import type { ApiResponse, PaginatedResponse } from './apiClient';
import { success, created, deleted, notFound, paginated, delay, uid } from './apiClient';
import type {
  UpdateTherapistProfileRequest,
  UpdateTherapistExtendedProfileRequest,
  ListTherapistsParams,
  CreateSessionRateRequest,
  UpdateSessionRateRequest,
  UpdateAvailabilityRequest,
} from './types';
import {
  mockTherapists,
  mockCurrentTherapist,
  mockCurrentTherapistExtended,
  type Therapist,
  type SessionRate,
  type AvailabilityWindow,
} from '../data/mockData';
import type { TherapistProfile } from '../../types';

// ---- GET all / search -------------------------------------------------------

export async function listTherapists(
  params: ListTherapistsParams = {},
): Promise<PaginatedResponse<Therapist>> {
  await delay();

  let results = [...mockTherapists];

  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      t =>
        t.name.toLowerCase().includes(q) ||
        t.specializations.some(s => s.toLowerCase().includes(q)) ||
        t.clinicalApproaches.some(a => a.toLowerCase().includes(q)),
    );
  }

  if (params.specialization) {
    results = results.filter(t =>
      t.specializations.some(s => s.toLowerCase() === params.specialization!.toLowerCase()),
    );
  }

  if (params.clinicalApproach) {
    results = results.filter(t =>
      t.clinicalApproaches.some(a => a.toLowerCase() === params.clinicalApproach!.toLowerCase()),
    );
  }

  if (params.location) {
    results = results.filter(t =>
      t.location?.toLowerCase().includes(params.location!.toLowerCase()),
    );
  }

  if (params.maxRate !== undefined) {
    results = results.filter(t => t.hourlyRate <= params.maxRate!);
  }

  const total = results.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const slice = results.slice(start, start + pageSize);

  return paginated(slice, total, page, pageSize);
}

// ---- GET by ID --------------------------------------------------------------

export async function getTherapistById(
  id: string,
): Promise<ApiResponse<Therapist | null>> {
  await delay();
  const therapist = mockTherapists.find(t => t.id === id);
  if (!therapist) return notFound('Therapist');
  return success(therapist);
}

// ---- GET current profile ----------------------------------------------------

export async function getCurrentTherapist(): Promise<ApiResponse<Therapist>> {
  await delay();
  return success(mockCurrentTherapist);
}

// ---- GET current extended profile -------------------------------------------

export async function getCurrentTherapistExtended(): Promise<ApiResponse<Partial<TherapistProfile>>> {
  await delay();
  return success(mockCurrentTherapistExtended);
}

// ---- PUT update profile -----------------------------------------------------

export async function updateTherapistProfile(
  data: UpdateTherapistProfileRequest,
): Promise<ApiResponse<Therapist>> {
  await delay();
  Object.assign(mockCurrentTherapist, data);
  return success(mockCurrentTherapist);
}

// ---- PUT update extended profile --------------------------------------------

export async function updateTherapistExtendedProfile(
  data: UpdateTherapistExtendedProfileRequest,
): Promise<ApiResponse<Partial<TherapistProfile>>> {
  await delay();
  Object.assign(mockCurrentTherapistExtended, data);
  return success(mockCurrentTherapistExtended);
}

// ---- POST create session rate -----------------------------------------------

export async function createSessionRate(
  data: CreateSessionRateRequest,
): Promise<ApiResponse<SessionRate>> {
  await delay();
  const rate: SessionRate = { id: uid('sr'), ...data };
  if (!mockCurrentTherapist.sessionRates) {
    mockCurrentTherapist.sessionRates = [];
  }
  mockCurrentTherapist.sessionRates.push(rate);
  return created(rate);
}

// ---- PUT update session rate ------------------------------------------------

export async function updateSessionRate(
  rateId: string,
  data: UpdateSessionRateRequest,
): Promise<ApiResponse<SessionRate | null>> {
  await delay();
  const rate = mockCurrentTherapist.sessionRates?.find(r => r.id === rateId);
  if (!rate) return notFound('SessionRate');
  Object.assign(rate, data);
  return success(rate);
}

// ---- DELETE session rate ----------------------------------------------------

export async function deleteSessionRate(
  rateId: string,
): Promise<ApiResponse<null>> {
  await delay();
  if (!mockCurrentTherapist.sessionRates) return notFound('SessionRate');
  const idx = mockCurrentTherapist.sessionRates.findIndex(r => r.id === rateId);
  if (idx === -1) return notFound('SessionRate');
  mockCurrentTherapist.sessionRates.splice(idx, 1);
  return deleted();
}

// ---- PUT update availability ------------------------------------------------

export async function updateAvailability(
  data: UpdateAvailabilityRequest,
): Promise<ApiResponse<AvailabilityWindow[]>> {
  await delay();
  mockCurrentTherapist.availabilityWindows = data.windows as AvailabilityWindow[];
  return success(data.windows as AvailabilityWindow[]);
}

// ---- GET availability -------------------------------------------------------

export async function getAvailability(): Promise<ApiResponse<AvailabilityWindow[]>> {
  await delay();
  return success(mockCurrentTherapist.availabilityWindows ?? []);
}