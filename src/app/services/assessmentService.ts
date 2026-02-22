// ============================================================
// Assessment, Session Notes & Client Notes Service
// ============================================================
// GET    /assessments              → list assessments
// GET    /assessments/:id          → get assessment by ID
// POST   /assessments              → create assessment (PHQ-9 + GAD-7)
//
// GET    /session-notes             → list therapist session notes
// GET    /session-notes/:id         → get note by ID
// POST   /session-notes             → create session note
// PUT    /session-notes/:id         → update session note
// DELETE /session-notes/:id         → delete session note
//
// GET    /client-notes              → list client notes
// POST   /client-notes              → create client note
// Note: Client notes are immutable (no update/delete)
// ============================================================

import type { ApiResponse, PaginatedResponse } from './apiClient';
import { success, created, deleted, notFound, paginated, delay, uid } from './apiClient';
import type {
  CreateAssessmentRequest,
  ListAssessmentsParams,
  CreateSessionNoteRequest,
  UpdateSessionNoteRequest,
  ListSessionNotesParams,
  CreateClientNoteRequest,
  ListClientNotesParams,
} from './types';
import {
  mockAssessments,
  mockSessionNotes,
  mockClientNotes,
  calculatePHQ9Score,
  calculateGAD7Score,
  type Assessment,
  type SessionNote,
  type ClientNote,
} from '../data/mockData';

// ============================================================
// ASSESSMENTS (PHQ-9 + GAD-7)
// ============================================================

// ---- GET list ---------------------------------------------------------------

export async function listAssessments(
  params: ListAssessmentsParams = {},
): Promise<PaginatedResponse<Assessment>> {
  await delay();

  let results = [...mockAssessments];

  if (params.clientId) {
    results = results.filter(a => a.clientId === params.clientId);
  }
  if (params.therapistId) {
    results = results.filter(a => a.therapistId === params.therapistId);
  }
  if (params.from) {
    results = results.filter(a => a.date >= params.from!);
  }
  if (params.to) {
    results = results.filter(a => a.date <= params.to!);
  }

  results.sort((a, b) => b.date.getTime() - a.date.getTime());

  const total = results.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const slice = results.slice(start, start + pageSize);

  return paginated(slice, total, page, pageSize);
}

// ---- GET by ID --------------------------------------------------------------

export async function getAssessmentById(
  id: string,
): Promise<ApiResponse<Assessment | null>> {
  await delay();
  const assessment = mockAssessments.find(a => a.id === id);
  if (!assessment) return notFound('Assessment');
  return success(assessment);
}

// ---- POST create ------------------------------------------------------------

export async function createAssessment(
  data: CreateAssessmentRequest,
): Promise<ApiResponse<Assessment>> {
  await delay();
  const now = new Date();
  const assessment: Assessment = {
    id: uid('a'),
    clientId: data.clientId,
    therapistId: data.therapistId,
    date: now,
    phq9: data.phq9,
    gad7: data.gad7,
    phq9Score: calculatePHQ9Score(data.phq9),
    gad7Score: calculateGAD7Score(data.gad7),
    createdAt: now,
  };
  mockAssessments.push(assessment);
  return created(assessment);
}

// ============================================================
// SESSION NOTES (Therapist-authored)
// ============================================================

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

// ============================================================
// CLIENT NOTES (Client-authored, immutable)
// ============================================================

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
