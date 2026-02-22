// ============================================================
// Connection Service
// ============================================================
// GET    /connections              → list connections for a user
// GET    /connections/:id          → get connection by ID
// POST   /connections              → create connection request
// PUT    /connections/:id          → accept / reject
// DELETE /connections/:id          → remove connection
// ============================================================

import type { ApiResponse, PaginatedResponse } from './apiClient';
import { success, created, deleted, notFound, paginated, delay, uid } from './apiClient';
import type {
  CreateConnectionRequest,
  UpdateConnectionRequest,
  ListConnectionsParams,
} from './types';
import {
  mockConnections,
  type ConnectionRequest,
} from '../data/mockData';

// ---- GET list ---------------------------------------------------------------

export async function listConnections(
  params: ListConnectionsParams,
): Promise<PaginatedResponse<ConnectionRequest>> {
  await delay();

  let results = mockConnections.filter(
    c => c.clientId === params.userId || c.therapistId === params.userId,
  );

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

export async function getConnectionById(
  id: string,
): Promise<ApiResponse<ConnectionRequest | null>> {
  await delay();
  const conn = mockConnections.find(c => c.id === id);
  if (!conn) return notFound('Connection');
  return success(conn);
}

// ---- POST create ------------------------------------------------------------

export async function createConnection(
  data: CreateConnectionRequest,
): Promise<ApiResponse<ConnectionRequest>> {
  await delay();
  const conn: ConnectionRequest = {
    id: uid('conn'),
    clientId: data.clientId,
    therapistId: data.therapistId,
    status: 'pending',
    message: data.message,
    createdAt: new Date(),
  };
  mockConnections.push(conn);
  return created(conn);
}

// ---- PUT update (accept / reject) -------------------------------------------

export async function updateConnection(
  id: string,
  data: UpdateConnectionRequest,
): Promise<ApiResponse<ConnectionRequest | null>> {
  await delay();
  const conn = mockConnections.find(c => c.id === id);
  if (!conn) return notFound('Connection');
  conn.status = data.status;
  return success(conn);
}

// ---- DELETE -----------------------------------------------------------------

export async function deleteConnection(
  id: string,
): Promise<ApiResponse<null>> {
  await delay();
  const idx = mockConnections.findIndex(c => c.id === id);
  if (idx === -1) return notFound('Connection');
  mockConnections.splice(idx, 1);
  return deleted();
}
