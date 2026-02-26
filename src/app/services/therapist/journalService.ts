// ============================================================
// Therapist Journal & CPD Service
// ============================================================
// GET    /therapist-journal              -> list journal entries
// GET    /therapist-journal/:id          -> get entry by ID
// POST   /therapist-journal              -> create journal entry
// PUT    /therapist-journal/:id          -> update journal entry
// DELETE /therapist-journal/:id          -> delete journal entry
//
// GET    /cpd                            -> list CPD entries
// GET    /cpd/:id                        -> get CPD entry by ID
// POST   /cpd                            -> create CPD entry
// PUT    /cpd/:id                        -> update CPD entry
// DELETE /cpd/:id                        -> delete CPD entry
// ============================================================

import type { ApiResponse, PaginatedResponse } from '../shared/apiClient';
import { success, created, deleted, notFound, paginated, delay, uid } from '../shared/apiClient';
import type {
  CreateTherapistJournalEntryRequest,
  UpdateTherapistJournalEntryRequest,
  ListTherapistJournalEntriesParams,
  CreateCpdEntryRequest,
  UpdateCpdEntryRequest,
  ListCpdEntriesParams,
} from './types';
import {
  mockTherapistJournalEntries,
  mockCpdEntries,
  type TherapistJournalEntry,
  type CpdEntry,
} from '../../data/mockData';

// ============================================================
// THERAPIST JOURNAL
// ============================================================

// ---- GET list ---------------------------------------------------------------

export async function listTherapistJournalEntries(
  params: ListTherapistJournalEntriesParams,
): Promise<PaginatedResponse<TherapistJournalEntry>> {
  await delay();

  let results = mockTherapistJournalEntries.filter(
    j => j.therapistId === params.therapistId,
  );

  if (params.from) {
    results = results.filter(j => j.date >= params.from!);
  }
  if (params.to) {
    results = results.filter(j => j.date <= params.to!);
  }
  if (params.sharedWithSupervisor !== undefined) {
    results = results.filter(j => j.sharedWithSupervisor === params.sharedWithSupervisor);
  }

  const sortOrder = params.sortOrder ?? 'desc';
  results.sort((a, b) =>
    sortOrder === 'desc'
      ? b.createdAt.getTime() - a.createdAt.getTime()
      : a.createdAt.getTime() - b.createdAt.getTime(),
  );

  const total = results.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const slice = results.slice(start, start + pageSize);

  return paginated(slice, total, page, pageSize);
}

// ---- GET by ID --------------------------------------------------------------

export async function getTherapistJournalEntryById(
  id: string,
): Promise<ApiResponse<TherapistJournalEntry | null>> {
  await delay();
  const entry = mockTherapistJournalEntries.find(j => j.id === id);
  if (!entry) return notFound('TherapistJournalEntry');
  return success(entry);
}

// ---- POST create ------------------------------------------------------------

export async function createTherapistJournalEntry(
  data: CreateTherapistJournalEntryRequest,
): Promise<ApiResponse<TherapistJournalEntry>> {
  await delay();
  const now = new Date();
  const entry: TherapistJournalEntry = {
    id: uid('tj'),
    therapistId: data.therapistId,
    date: now,
    mood: data.mood,
    thoughtsAndFeelings: data.thoughtsAndFeelings,
    sharedWithSupervisor: data.sharedWithSupervisor,
    createdAt: now,
  };
  mockTherapistJournalEntries.unshift(entry);
  return created(entry);
}

// ---- PUT update -------------------------------------------------------------

export async function updateTherapistJournalEntry(
  id: string,
  data: UpdateTherapistJournalEntryRequest,
): Promise<ApiResponse<TherapistJournalEntry | null>> {
  await delay();
  const entry = mockTherapistJournalEntries.find(j => j.id === id);
  if (!entry) return notFound('TherapistJournalEntry');
  if (data.mood !== undefined) entry.mood = data.mood;
  if (data.thoughtsAndFeelings !== undefined) entry.thoughtsAndFeelings = data.thoughtsAndFeelings;
  if (data.sharedWithSupervisor !== undefined) entry.sharedWithSupervisor = data.sharedWithSupervisor;
  return success(entry);
}

// ---- DELETE -----------------------------------------------------------------

export async function deleteTherapistJournalEntry(
  id: string,
): Promise<ApiResponse<null>> {
  await delay();
  const idx = mockTherapistJournalEntries.findIndex(j => j.id === id);
  if (idx === -1) return notFound('TherapistJournalEntry');
  mockTherapistJournalEntries.splice(idx, 1);
  return deleted();
}

// ============================================================
// CPD (Continuing Professional Development)
// ============================================================

// ---- GET list ---------------------------------------------------------------

export async function listCpdEntries(
  params: ListCpdEntriesParams,
): Promise<PaginatedResponse<CpdEntry>> {
  await delay();

  let results = mockCpdEntries.filter(c => c.therapistId === params.therapistId);

  results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = results.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const slice = results.slice(start, start + pageSize);

  return paginated(slice, total, page, pageSize);
}

// ---- GET by ID --------------------------------------------------------------

export async function getCpdEntryById(
  id: string,
): Promise<ApiResponse<CpdEntry | null>> {
  await delay();
  const entry = mockCpdEntries.find(c => c.id === id);
  if (!entry) return notFound('CpdEntry');
  return success(entry);
}

// ---- POST create ------------------------------------------------------------

export async function createCpdEntry(
  data: CreateCpdEntryRequest,
): Promise<ApiResponse<CpdEntry>> {
  await delay();
  const now = new Date();
  const entry: CpdEntry = {
    id: uid('cpd'),
    therapistId: data.therapistId,
    title: data.title,
    description: data.description,
    link: data.link,
    startDate: data.startDate,
    completedDate: data.completedDate,
    createdAt: now,
  };
  mockCpdEntries.push(entry);
  return created(entry);
}

// ---- PUT update -------------------------------------------------------------

export async function updateCpdEntry(
  id: string,
  data: UpdateCpdEntryRequest,
): Promise<ApiResponse<CpdEntry | null>> {
  await delay();
  const entry = mockCpdEntries.find(c => c.id === id);
  if (!entry) return notFound('CpdEntry');
  Object.assign(entry, data);
  return success(entry);
}

// ---- DELETE -----------------------------------------------------------------

export async function deleteCpdEntry(
  id: string,
): Promise<ApiResponse<null>> {
  await delay();
  const idx = mockCpdEntries.findIndex(c => c.id === id);
  if (idx === -1) return notFound('CpdEntry');
  mockCpdEntries.splice(idx, 1);
  return deleted();
}
