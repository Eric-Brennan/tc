// ============================================================
// Journal Service
// ============================================================
// GET    /journal                 → list journal entries for a client
// GET    /journal/:id             → get entry by ID
// POST   /journal                 → create journal entry
// PUT    /journal/:id/privacy     → toggle privacy (therapist visibility)
// Note: Journal entries are immutable (no general update/delete)
// ============================================================

import type { ApiResponse, PaginatedResponse } from './apiClient';
import { success, created, notFound, paginated, delay, uid } from './apiClient';
import type {
  CreateJournalEntryRequest,
  ListJournalEntriesParams,
  UpdateJournalSharingRequest,
} from './types';
import {
  mockJournalEntries,
  type JournalEntry,
} from '../data/mockData';

// ---- GET list ---------------------------------------------------------------

export async function listJournalEntries(
  params: ListJournalEntriesParams,
): Promise<PaginatedResponse<JournalEntry>> {
  await delay();

  let results = mockJournalEntries.filter(j => j.clientId === params.clientId);

  if (params.from) {
    results = results.filter(j => j.date >= params.from!);
  }
  if (params.to) {
    results = results.filter(j => j.date <= params.to!);
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

export async function getJournalEntryById(
  id: string,
): Promise<ApiResponse<JournalEntry | null>> {
  await delay();
  const entry = mockJournalEntries.find(j => j.id === id);
  if (!entry) return notFound('JournalEntry');
  return success(entry);
}

// ---- POST create ------------------------------------------------------------

export async function createJournalEntry(
  data: CreateJournalEntryRequest,
): Promise<ApiResponse<JournalEntry>> {
  await delay();
  const now = new Date();
  const entry: JournalEntry = {
    id: uid('j'),
    clientId: data.clientId,
    date: now,
    moodRating: data.moodRating,
    physicalRating: data.physicalRating,
    sleepQuality: data.sleepQuality,
    sleepHours: data.sleepHours,
    anxietyLevel: data.anxietyLevel,
    stressLevel: data.stressLevel,
    gratitude: data.gratitude,
    accomplishments: data.accomplishments,
    challenges: data.challenges,
    activities: data.activities,
    goals: data.goals,
    thoughts: data.thoughts,
    sharedWithTherapistIds: data.sharedWithTherapistIds,
    createdAt: now,
    updatedAt: now,
  };
  mockJournalEntries.unshift(entry);
  return created(entry);
}

// ---- PUT update sharing -----------------------------------------------------

export async function updateJournalSharing(
  id: string,
  data: UpdateJournalSharingRequest,
): Promise<ApiResponse<JournalEntry | null>> {
  await delay();
  const entry = mockJournalEntries.find(j => j.id === id);
  if (!entry) return notFound('JournalEntry');
  entry.sharedWithTherapistIds = data.sharedWithTherapistIds;
  entry.updatedAt = new Date();
  return success(entry);
}