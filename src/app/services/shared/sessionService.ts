// ============================================================
// Video Session Service (Shared)
// ============================================================
// GET    /sessions              -> list video sessions
// GET    /sessions/:id          -> get session by ID
// POST   /sessions              -> book / create session
// PUT    /sessions/:id          -> update session (status, reschedule)
// DELETE /sessions/:id          -> cancel / delete session
// ============================================================

import type { ApiResponse, PaginatedResponse } from './apiClient';
import { success, created, deleted, notFound, paginated, delay, uid } from './apiClient';
import type {
  CreateVideoSessionRequest,
  UpdateVideoSessionRequest,
  ListVideoSessionsParams,
} from './types';
import {
  mockVideoSessions,
  type VideoSession,
} from '../../data/mockData';

// ---- GET list ---------------------------------------------------------------

export async function listVideoSessions(
  params: ListVideoSessionsParams = {},
): Promise<PaginatedResponse<VideoSession>> {
  await delay();

  let results = [...mockVideoSessions];

  if (params.therapistId) {
    results = results.filter(s => s.therapistId === params.therapistId);
  }
  if (params.clientId) {
    results = results.filter(s => s.clientId === params.clientId);
  }
  if (params.status) {
    results = results.filter(s => s.status === params.status);
  }
  if (params.from) {
    results = results.filter(s => s.scheduledTime >= params.from!);
  }
  if (params.to) {
    results = results.filter(s => s.scheduledTime <= params.to!);
  }

  const sortOrder = params.sortOrder ?? 'asc';
  results.sort((a, b) =>
    sortOrder === 'asc'
      ? a.scheduledTime.getTime() - b.scheduledTime.getTime()
      : b.scheduledTime.getTime() - a.scheduledTime.getTime(),
  );

  const total = results.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const start = (page - 1) * pageSize;
  const slice = results.slice(start, start + pageSize);

  return paginated(slice, total, page, pageSize);
}

// ---- GET by ID --------------------------------------------------------------

export async function getVideoSessionById(
  id: string,
): Promise<ApiResponse<VideoSession | null>> {
  await delay();
  const session = mockVideoSessions.find(s => s.id === id);
  if (!session) return notFound('VideoSession');
  return success(session);
}

// ---- POST create (book) -----------------------------------------------------

export async function createVideoSession(
  data: CreateVideoSessionRequest,
): Promise<ApiResponse<VideoSession>> {
  await delay();
  const session: VideoSession = {
    id: uid('vs'),
    therapistId: data.therapistId,
    clientId: data.clientId,
    scheduledTime: data.scheduledTime,
    duration: data.duration,
    status: 'scheduled',
    sessionRateId: data.sessionRateId,
    modality: data.modality ?? 'video',
    azureRoomId: `room-${uid('')}`,
    isPaid: false,
    price: data.price,
  };
  mockVideoSessions.push(session);
  return created(session);
}

// ---- PUT update -------------------------------------------------------------

export async function updateVideoSession(
  id: string,
  data: UpdateVideoSessionRequest,
): Promise<ApiResponse<VideoSession | null>> {
  await delay();
  const session = mockVideoSessions.find(s => s.id === id);
  if (!session) return notFound('VideoSession');
  Object.assign(session, data);
  return success(session);
}

// ---- DELETE -----------------------------------------------------------------

export async function deleteVideoSession(
  id: string,
): Promise<ApiResponse<null>> {
  await delay();
  const idx = mockVideoSessions.findIndex(s => s.id === id);
  if (idx === -1) return notFound('VideoSession');
  mockVideoSessions.splice(idx, 1);
  return deleted();
}
