// ============================================================
// Therapist Supervision Service
// ============================================================
// GET    /supervision/connections              -> list supervision connections
// GET    /supervision/connections/:id          -> get connection by ID
// POST   /supervision/connections              -> request supervision
// PUT    /supervision/connections/:id          -> accept / reject
// DELETE /supervision/connections/:id          -> remove supervision connection
//
// GET    /supervision/sessions                 -> list supervision sessions
// GET    /supervision/sessions/:id             -> get session by ID
// POST   /supervision/sessions                 -> book supervision session
// PUT    /supervision/sessions/:id             -> update session
// DELETE /supervision/sessions/:id             -> cancel session
// ============================================================

import type { ApiResponse, PaginatedResponse } from '../shared/apiClient';
import { success, created, deleted, notFound, paginated, delay, uid } from '../shared/apiClient';
import type {
  CreateSupervisionConnectionRequest,
  UpdateSupervisionConnectionRequest,
  ListSupervisionConnectionsParams,
  CreateSupervisionSessionRequest,
  UpdateSupervisionSessionRequest,
  ListSupervisionSessionsParams,
} from './types';
import {
  mockSupervisionConnections,
  mockSupervisionSessions,
  type SupervisionConnection,
  type SupervisionSession,
} from '../../data/mockData';

// ============================================================
// SUPERVISION CONNECTIONS
// ============================================================

// ---- GET list ---------------------------------------------------------------

export async function listSupervisionConnections(
  params: ListSupervisionConnectionsParams,
): Promise<PaginatedResponse<SupervisionConnection>> {
  await delay();

  let results = [...mockSupervisionConnections];

  if (params.role === 'supervisor') {
    results = results.filter(c => c.supervisorId === params.therapistId);
  } else if (params.role === 'supervisee') {
    results = results.filter(c => c.superviseeId === params.therapistId);
  } else {
    results = results.filter(
      c => c.supervisorId === params.therapistId || c.superviseeId === params.therapistId,
    );
  }

  if (params.status) {
    results = results.filter(c => c.status === params.status);
  }

  results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = results.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const slice = results.slice(start, start + pageSize);

  return paginated(slice, total, page, pageSize);
}

// ---- GET by ID --------------------------------------------------------------

export async function getSupervisionConnectionById(
  id: string,
): Promise<ApiResponse<SupervisionConnection | null>> {
  await delay();
  const conn = mockSupervisionConnections.find(c => c.id === id);
  if (!conn) return notFound('SupervisionConnection');
  return success(conn);
}

// ---- POST create (request supervision) --------------------------------------

export async function createSupervisionConnection(
  data: CreateSupervisionConnectionRequest,
): Promise<ApiResponse<SupervisionConnection>> {
  await delay();
  const conn: SupervisionConnection = {
    id: uid('sc'),
    superviseeId: data.superviseeId,
    supervisorId: data.supervisorId,
    status: 'pending',
    message: data.message,
    createdAt: new Date(),
  };
  mockSupervisionConnections.push(conn);
  return created(conn);
}

// ---- PUT accept / reject ----------------------------------------------------

export async function updateSupervisionConnection(
  id: string,
  data: UpdateSupervisionConnectionRequest,
): Promise<ApiResponse<SupervisionConnection | null>> {
  await delay();
  const conn = mockSupervisionConnections.find(c => c.id === id);
  if (!conn) return notFound('SupervisionConnection');
  conn.status = data.status;
  return success(conn);
}

// ---- DELETE -----------------------------------------------------------------

export async function deleteSupervisionConnection(
  id: string,
): Promise<ApiResponse<null>> {
  await delay();
  const idx = mockSupervisionConnections.findIndex(c => c.id === id);
  if (idx === -1) return notFound('SupervisionConnection');
  mockSupervisionConnections.splice(idx, 1);
  return deleted();
}

// ============================================================
// SUPERVISION SESSIONS
// ============================================================

// ---- GET list ---------------------------------------------------------------

export async function listSupervisionSessions(
  params: ListSupervisionSessionsParams = {},
): Promise<PaginatedResponse<SupervisionSession>> {
  await delay();

  let results = [...mockSupervisionSessions];

  if (params.supervisorId) {
    results = results.filter(s => s.supervisorId === params.supervisorId);
  }
  if (params.superviseeId) {
    results = results.filter(s => s.superviseeId === params.superviseeId);
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

export async function getSupervisionSessionById(
  id: string,
): Promise<ApiResponse<SupervisionSession | null>> {
  await delay();
  const session = mockSupervisionSessions.find(s => s.id === id);
  if (!session) return notFound('SupervisionSession');
  return success(session);
}

// ---- POST create (book) -----------------------------------------------------

export async function createSupervisionSession(
  data: CreateSupervisionSessionRequest,
): Promise<ApiResponse<SupervisionSession>> {
  await delay();
  const session: SupervisionSession = {
    id: uid('ss'),
    supervisorId: data.supervisorId,
    superviseeId: data.superviseeId,
    scheduledTime: data.scheduledTime,
    duration: data.duration,
    status: 'scheduled',
    modality: data.modality ?? 'video',
    price: data.price,
  };
  mockSupervisionSessions.push(session);
  return created(session);
}

// ---- PUT update -------------------------------------------------------------

export async function updateSupervisionSession(
  id: string,
  data: UpdateSupervisionSessionRequest,
): Promise<ApiResponse<SupervisionSession | null>> {
  await delay();
  const session = mockSupervisionSessions.find(s => s.id === id);
  if (!session) return notFound('SupervisionSession');
  Object.assign(session, data);
  return success(session);
}

// ---- DELETE (cancel) --------------------------------------------------------

export async function deleteSupervisionSession(
  id: string,
): Promise<ApiResponse<null>> {
  await delay();
  const idx = mockSupervisionSessions.findIndex(s => s.id === id);
  if (idx === -1) return notFound('SupervisionSession');
  mockSupervisionSessions.splice(idx, 1);
  return deleted();
}
