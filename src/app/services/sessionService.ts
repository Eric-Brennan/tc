// ============================================================
// Session & Workshop Service
// ============================================================
// GET    /sessions              → list video sessions
// GET    /sessions/:id          → get session by ID
// POST   /sessions              → book / create session
// PUT    /sessions/:id          → update session (status, reschedule)
// DELETE /sessions/:id          → cancel / delete session
//
// GET    /workshops              → list workshops
// GET    /workshops/:id          → get workshop by ID
// POST   /workshops              → create workshop (therapist)
// PUT    /workshops/:id          → update workshop
// POST   /workshops/:id/register → register client for workshop
// POST   /workshops/:id/unregister → unregister client
// DELETE /workshops/:id          → delete workshop
// ============================================================

import type { ApiResponse, PaginatedResponse } from './apiClient';
import { success, created, deleted, notFound, paginated, delay, uid } from './apiClient';
import type {
  CreateVideoSessionRequest,
  UpdateVideoSessionRequest,
  ListVideoSessionsParams,
  CreateWorkshopRequest,
  UpdateWorkshopRequest,
  RegisterWorkshopRequest,
  ListWorkshopsParams,
} from './types';
import {
  mockVideoSessions,
  mockWorkshops,
  type VideoSession,
  type Workshop,
} from '../data/mockData';

// ============================================================
// VIDEO SESSIONS
// ============================================================

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

// ============================================================
// WORKSHOPS
// ============================================================

// ---- GET list ---------------------------------------------------------------

export async function listWorkshops(
  params: ListWorkshopsParams = {},
): Promise<PaginatedResponse<Workshop>> {
  await delay();

  let results = [...mockWorkshops];

  if (params.therapistId) {
    results = results.filter(w => w.therapistId === params.therapistId);
  }
  if (params.from) {
    results = results.filter(w => w.scheduledTime >= params.from!);
  }
  if (params.to) {
    results = results.filter(w => w.scheduledTime <= params.to!);
  }

  results.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());

  const total = results.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const slice = results.slice(start, start + pageSize);

  return paginated(slice, total, page, pageSize);
}

// ---- GET by ID --------------------------------------------------------------

export async function getWorkshopById(
  id: string,
): Promise<ApiResponse<Workshop | null>> {
  await delay();
  const workshop = mockWorkshops.find(w => w.id === id);
  if (!workshop) return notFound('Workshop');
  return success(workshop);
}

// ---- POST create (therapist) ------------------------------------------------

export async function createWorkshop(
  data: CreateWorkshopRequest,
): Promise<ApiResponse<Workshop>> {
  await delay();
  const workshop: Workshop = {
    id: uid('w'),
    therapistId: data.therapistId,
    title: data.title,
    description: data.description,
    scheduledTime: data.scheduledTime,
    duration: data.duration,
    maxParticipants: data.maxParticipants,
    currentParticipants: 0,
    price: data.price,
    isRegistered: false,
  };
  mockWorkshops.push(workshop);
  return created(workshop);
}

// ---- PUT update -------------------------------------------------------------

export async function updateWorkshop(
  id: string,
  data: UpdateWorkshopRequest,
): Promise<ApiResponse<Workshop | null>> {
  await delay();
  const workshop = mockWorkshops.find(w => w.id === id);
  if (!workshop) return notFound('Workshop');
  Object.assign(workshop, data);
  return success(workshop);
}

// ---- POST register client ---------------------------------------------------

export async function registerForWorkshop(
  data: RegisterWorkshopRequest,
): Promise<ApiResponse<Workshop | null>> {
  await delay();
  const workshop = mockWorkshops.find(w => w.id === data.workshopId);
  if (!workshop) return notFound('Workshop');
  if (workshop.currentParticipants >= workshop.maxParticipants) {
    return { data: null, error: 'Workshop is full', status: 409 };
  }
  workshop.currentParticipants += 1;
  workshop.isRegistered = true;
  return success(workshop);
}

// ---- POST unregister client -------------------------------------------------

export async function unregisterFromWorkshop(
  workshopId: string,
): Promise<ApiResponse<Workshop | null>> {
  await delay();
  const workshop = mockWorkshops.find(w => w.id === workshopId);
  if (!workshop) return notFound('Workshop');
  if (workshop.currentParticipants > 0) {
    workshop.currentParticipants -= 1;
  }
  workshop.isRegistered = false;
  return success(workshop);
}

// ---- DELETE -----------------------------------------------------------------

export async function deleteWorkshop(
  id: string,
): Promise<ApiResponse<null>> {
  await delay();
  const idx = mockWorkshops.findIndex(w => w.id === id);
  if (idx === -1) return notFound('Workshop');
  mockWorkshops.splice(idx, 1);
  return deleted();
}
