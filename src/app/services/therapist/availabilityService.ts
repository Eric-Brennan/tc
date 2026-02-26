// ============================================================
// Therapist Availability Service
// ============================================================
// GET    /therapists/me/availability -> get availability windows
// PUT    /therapists/me/availability -> update availability windows
// GET    /therapists/:id/availability -> get therapist's availability (client view)
// ============================================================

import type { ApiResponse } from '../shared/apiClient';
import { success, notFound, delay } from '../shared/apiClient';
import type { UpdateAvailabilityRequest } from './types';
import {
  mockCurrentTherapist,
  mockTherapists,
  type AvailabilityWindow,
} from '../../data/mockData';

// ---- GET current therapist's availability -----------------------------------

export async function getAvailability(): Promise<ApiResponse<AvailabilityWindow[]>> {
  await delay();
  return success(mockCurrentTherapist.availabilityWindows ?? []);
}

// ---- GET therapist availability by ID (client view) -------------------------

export async function getTherapistAvailability(
  therapistId: string,
): Promise<ApiResponse<AvailabilityWindow[] | null>> {
  await delay();
  const therapist = mockTherapists.find(t => t.id === therapistId);
  if (!therapist) return notFound('Therapist');
  return success(therapist.availabilityWindows ?? []);
}

// ---- PUT update availability ------------------------------------------------

export async function updateAvailability(
  data: UpdateAvailabilityRequest,
): Promise<ApiResponse<AvailabilityWindow[]>> {
  await delay();
  mockCurrentTherapist.availabilityWindows = data.windows as AvailabilityWindow[];
  return success(data.windows as AvailabilityWindow[]);
}
