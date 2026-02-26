// ============================================================
// Pro Bono Token Service
// ============================================================
// GET    /pro-bono-tokens              -> list pro bono tokens
// GET    /pro-bono-tokens/:id          -> get token by ID
// POST   /pro-bono-tokens              -> create (award) token
// PUT    /pro-bono-tokens/:id/use      -> mark token as used
// DELETE /pro-bono-tokens/:id          -> revoke token
// ============================================================

import type { ApiResponse, PaginatedResponse } from '../shared/apiClient';
import { success, created, deleted, notFound, paginated, delay, uid } from '../shared/apiClient';
import type {
  CreateProBonoTokenRequest,
  ListProBonoTokensParams,
  UseProBonoTokenRequest,
} from './types';
import {
  mockProBonoTokens,
  type ProBonoToken,
} from '../../data/mockData';

// ---- GET list ---------------------------------------------------------------

export async function listProBonoTokens(
  params: ListProBonoTokensParams = {},
): Promise<PaginatedResponse<ProBonoToken>> {
  await delay();

  let results = [...mockProBonoTokens];

  if (params.therapistId) {
    results = results.filter(t => t.therapistId === params.therapistId);
  }
  if (params.clientId) {
    results = results.filter(t => t.clientId === params.clientId);
  }
  if (params.status) {
    results = results.filter(t => t.status === params.status);
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

export async function getProBonoTokenById(
  id: string,
): Promise<ApiResponse<ProBonoToken | null>> {
  await delay();
  const token = mockProBonoTokens.find(t => t.id === id);
  if (!token) return notFound('ProBonoToken');
  return success(token);
}

// ---- POST create (award token to client) ------------------------------------

export async function createProBonoToken(
  data: CreateProBonoTokenRequest,
): Promise<ApiResponse<ProBonoToken>> {
  await delay();
  const token: ProBonoToken = {
    id: uid('pbt'),
    therapistId: data.therapistId,
    clientId: data.clientId,
    sessionRateId: data.sessionRateId,
    sessionRateTitle: data.sessionRateTitle,
    createdAt: new Date(),
    status: 'available',
  };
  mockProBonoTokens.push(token);
  return created(token);
}

// ---- PUT use token ----------------------------------------------------------

export async function useProBonoToken(
  data: UseProBonoTokenRequest,
): Promise<ApiResponse<ProBonoToken | null>> {
  await delay();
  const token = mockProBonoTokens.find(t => t.id === data.tokenId);
  if (!token) return notFound('ProBonoToken');
  if (token.status !== 'available') {
    return { data: null, error: 'Token is not available', status: 409 };
  }
  token.status = 'used';
  token.usedAt = new Date();
  return success(token);
}

// ---- DELETE (revoke) --------------------------------------------------------

export async function deleteProBonoToken(
  id: string,
): Promise<ApiResponse<null>> {
  await delay();
  const idx = mockProBonoTokens.findIndex(t => t.id === id);
  if (idx === -1) return notFound('ProBonoToken');
  mockProBonoTokens.splice(idx, 1);
  return deleted();
}
