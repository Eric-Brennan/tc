// ============================================================
// Therapist Session Rate Service
// ============================================================
// POST   /therapists/me/rates     -> create session rate
// PUT    /therapists/me/rates/:id -> update session rate
// DELETE /therapists/me/rates/:id -> delete session rate
// GET    /therapists/me/rates     -> list session rates
// ============================================================

import type { ApiResponse } from '../shared/apiClient';
import { success, created, deleted, notFound, delay, uid } from '../shared/apiClient';
import type {
  CreateSessionRateRequest,
  UpdateSessionRateRequest,
} from './types';
import {
  mockCurrentTherapist,
  type SessionRate,
} from '../../data/mockData';

// ---- GET list (current therapist's rates) -----------------------------------

export async function listSessionRates(): Promise<ApiResponse<SessionRate[]>> {
  await delay();
  return success(mockCurrentTherapist.sessionRates ?? []);
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
