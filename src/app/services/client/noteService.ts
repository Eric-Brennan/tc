// ============================================================
// Client Note Service (Client-authored session reflections)
// ============================================================
// GET    /client-notes              -> list client notes
// GET    /client-notes/:id          -> get note by ID
// POST   /client-notes              -> create client note
// Note: Client notes are immutable (no update/delete)
// ============================================================

import type { ApiResponse, PaginatedResponse } from '../shared/apiClient';
import { success, created, notFound, paginated, delay, uid } from '../shared/apiClient';
import type {
  CreateClientNoteRequest,
  ListClientNotesParams,
} from './types';
import {
  mockClientNotes,
  type ClientNote,
} from '../../data/mockData';

// ---- GET list ---------------------------------------------------------------

export async function listClientNotes(
  params: ListClientNotesParams,
): Promise<PaginatedResponse<ClientNote>> {
  await delay();

  let results = mockClientNotes.filter(n => n.clientId === params.clientId);

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

export async function getClientNoteById(
  id: string,
): Promise<ApiResponse<ClientNote | null>> {
  await delay();
  const note = mockClientNotes.find(n => n.id === id);
  if (!note) return notFound('ClientNote');
  return success(note);
}

// ---- POST create ------------------------------------------------------------

export async function createClientNote(
  data: CreateClientNoteRequest,
): Promise<ApiResponse<ClientNote>> {
  await delay();
  const note: ClientNote = {
    id: uid('cn'),
    clientId: data.clientId,
    sessionId: data.sessionId,
    content: data.content,
    createdAt: new Date(),
  };
  mockClientNotes.push(note);
  return created(note);
}
