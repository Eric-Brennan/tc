// ============================================================
// Therapist Session Note Service
// ============================================================
// GET    /session-notes             -> list therapist session notes
// GET    /session-notes/:id         -> get note by ID
// POST   /session-notes             -> create session note
// PUT    /session-notes/:id         -> update session note
// DELETE /session-notes/:id         -> delete session note
// ============================================================

import type { ApiResponse, PaginatedResponse } from '../shared/apiClient';
import { success, created, deleted, notFound, paginated, delay, uid } from '../shared/apiClient';
import type {
  CreateSessionNoteRequest,
  UpdateSessionNoteRequest,
  ListSessionNotesParams,
} from './types';
import {
  mockSessionNotes,
  type SessionNote,
} from '../../data/mockData';

// ---- GET list ---------------------------------------------------------------

export async function listSessionNotes(
  params: ListSessionNotesParams = {},
): Promise<PaginatedResponse<SessionNote>> {
  await delay();

  let results = [...mockSessionNotes];

  if (params.clientId) {
    results = results.filter(n => n.clientId === params.clientId);
  }
  if (params.therapistId) {
    results = results.filter(n => n.therapistId === params.therapistId);
  }
  if (params.sessionId) {
    results = results.filter(n => n.sessionId === params.sessionId);
  }

  results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = results.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const start = (page - 1) * pageSize;
  const slice = results.slice(start, start + pageSize);

  return paginated(slice, total, page, pageSize);
}

// ---- GET by ID --------------------------------------------------------------

export async function getSessionNoteById(
  id: string,
): Promise<ApiResponse<SessionNote | null>> {
  await delay();
  const note = mockSessionNotes.find(n => n.id === id);
  if (!note) return notFound('SessionNote');
  return success(note);
}

// ---- POST create ------------------------------------------------------------

export async function createSessionNote(
  data: CreateSessionNoteRequest,
): Promise<ApiResponse<SessionNote>> {
  await delay();
  const note: SessionNote = {
    id: uid('sn'),
    clientId: data.clientId,
    therapistId: data.therapistId,
    sessionId: data.sessionId,
    content: data.content,
    createdAt: new Date(),
  };
  mockSessionNotes.push(note);
  return created(note);
}

// ---- PUT update -------------------------------------------------------------

export async function updateSessionNote(
  id: string,
  data: UpdateSessionNoteRequest,
): Promise<ApiResponse<SessionNote | null>> {
  await delay();
  const note = mockSessionNotes.find(n => n.id === id);
  if (!note) return notFound('SessionNote');
  note.content = data.content;
  return success(note);
}

// ---- DELETE -----------------------------------------------------------------

export async function deleteSessionNote(
  id: string,
): Promise<ApiResponse<null>> {
  await delay();
  const idx = mockSessionNotes.findIndex(n => n.id === id);
  if (idx === -1) return notFound('SessionNote');
  mockSessionNotes.splice(idx, 1);
  return deleted();
}
