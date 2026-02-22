// ============================================================
// Client Service
// ============================================================
// GET    /clients                 → list clients (for therapist)
// GET    /clients/:id             → get client by ID
// GET    /clients/me              → get current client profile
// PUT    /clients/me              → update current client profile
// POST   /clients/me/follow       → follow a therapist
// DELETE /clients/me/follow/:tid  → unfollow a therapist
// ============================================================

import type { ApiResponse, PaginatedResponse } from './apiClient';
import { success, deleted, notFound, paginated, delay } from './apiClient';
import type {
  UpdateClientProfileRequest,
  ListClientsParams,
  FollowTherapistRequest,
  UnfollowTherapistRequest,
} from './types';
import {
  mockClients,
  mockCurrentClient,
  mockConnections,
  type Client,
} from '../data/mockData';

// ---- GET all (therapist's connected clients) --------------------------------

export async function listClients(
  params: ListClientsParams = {},
): Promise<PaginatedResponse<Client>> {
  await delay();

  let results = [...mockClients];

  // If therapist ID provided, only return clients connected to that therapist
  if (params.therapistId) {
    const connectedIds = mockConnections
      .filter(c => c.therapistId === params.therapistId && c.status === 'accepted')
      .map(c => c.clientId);
    results = results.filter(c => connectedIds.includes(c.id));
  }

  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.areasOfFocus?.some(a => a.toLowerCase().includes(q)),
    );
  }

  const total = results.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const slice = results.slice(start, start + pageSize);

  return paginated(slice, total, page, pageSize);
}

// ---- GET by ID --------------------------------------------------------------

export async function getClientById(
  id: string,
): Promise<ApiResponse<Client | null>> {
  await delay();
  const client = mockClients.find(c => c.id === id);
  if (!client) return notFound('Client');
  return success(client);
}

// ---- GET current client profile ---------------------------------------------

export async function getCurrentClient(): Promise<ApiResponse<Client>> {
  await delay();
  return success(mockCurrentClient);
}

// ---- PUT update client profile ----------------------------------------------

export async function updateClientProfile(
  data: UpdateClientProfileRequest,
): Promise<ApiResponse<Client>> {
  await delay();
  Object.assign(mockCurrentClient, data);
  return success(mockCurrentClient);
}

// ---- POST follow therapist --------------------------------------------------

export async function followTherapist(
  data: FollowTherapistRequest,
): Promise<ApiResponse<Client>> {
  await delay();
  if (!mockCurrentClient.followedTherapists) {
    mockCurrentClient.followedTherapists = [];
  }
  if (!mockCurrentClient.followedTherapists.includes(data.therapistId)) {
    mockCurrentClient.followedTherapists.push(data.therapistId);
  }
  return success(mockCurrentClient);
}

// ---- DELETE unfollow therapist ----------------------------------------------

export async function unfollowTherapist(
  data: UnfollowTherapistRequest,
): Promise<ApiResponse<Client>> {
  await delay();
  if (mockCurrentClient.followedTherapists) {
    mockCurrentClient.followedTherapists = mockCurrentClient.followedTherapists.filter(
      id => id !== data.therapistId,
    );
  }
  return success(mockCurrentClient);
}
