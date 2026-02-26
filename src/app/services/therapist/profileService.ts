// ============================================================
// Therapist Profile Service
// ============================================================
// GET    /therapists              -> list / search therapists
// GET    /therapists/:id          -> get therapist by ID
// GET    /therapists/me           -> get current therapist profile
// GET    /therapists/me/extended  -> get extended profile
// PUT    /therapists/me           -> update current therapist profile
// PUT    /therapists/me/extended  -> update extended profile
// ============================================================

import type { ApiResponse, PaginatedResponse } from '../shared/apiClient';
import { success, paginated, delay } from '../shared/apiClient';
import type {
  UpdateTherapistProfileRequest,
  UpdateTherapistExtendedProfileRequest,
  ListTherapistsParams,
} from './types';
import {
  mockTherapists,
  mockCurrentTherapist,
  mockCurrentTherapistExtended,
  type Therapist,
} from '../../data/mockData';
import type { TherapistProfile } from '../../../types';
import { notFound } from '../shared/apiClient';

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
