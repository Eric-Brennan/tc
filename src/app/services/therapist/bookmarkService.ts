// ============================================================
// Therapist Bookmark Service (Resource Links)
// ============================================================
// GET    /bookmarks              -> list bookmarks
// GET    /bookmarks/:id          -> get bookmark by ID
// POST   /bookmarks              -> create bookmark
// PUT    /bookmarks/:id          -> update bookmark
// DELETE /bookmarks/:id          -> delete bookmark
// ============================================================

import type { ApiResponse, PaginatedResponse } from '../shared/apiClient';
import { success, created, deleted, notFound, paginated, delay, uid } from '../shared/apiClient';
import type {
  CreateBookmarkRequest,
  UpdateBookmarkRequest,
  ListBookmarksParams,
} from './types';
import {
  mockTherapistBookmarks,
  type TherapistBookmark,
} from '../../data/mockData';

// ---- GET list ---------------------------------------------------------------

export async function listBookmarks(
  params: ListBookmarksParams,
): Promise<PaginatedResponse<TherapistBookmark>> {
  await delay();

  let results = mockTherapistBookmarks.filter(
    b => b.therapistId === params.therapistId,
  );

  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      b =>
        b.title.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q),
    );
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

export async function getBookmarkById(
  id: string,
): Promise<ApiResponse<TherapistBookmark | null>> {
  await delay();
  const bookmark = mockTherapistBookmarks.find(b => b.id === id);
  if (!bookmark) return notFound('Bookmark');
  return success(bookmark);
}

// ---- POST create ------------------------------------------------------------

export async function createBookmark(
  data: CreateBookmarkRequest,
): Promise<ApiResponse<TherapistBookmark>> {
  await delay();
  const bookmark: TherapistBookmark = {
    id: uid('bk'),
    therapistId: data.therapistId,
    title: data.title,
    url: data.url,
    createdAt: new Date(),
  };
  mockTherapistBookmarks.push(bookmark);
  return created(bookmark);
}

// ---- PUT update -------------------------------------------------------------

export async function updateBookmark(
  id: string,
  data: UpdateBookmarkRequest,
): Promise<ApiResponse<TherapistBookmark | null>> {
  await delay();
  const bookmark = mockTherapistBookmarks.find(b => b.id === id);
  if (!bookmark) return notFound('Bookmark');
  if (data.title !== undefined) bookmark.title = data.title;
  if (data.url !== undefined) bookmark.url = data.url;
  return success(bookmark);
}

// ---- DELETE -----------------------------------------------------------------

export async function deleteBookmark(
  id: string,
): Promise<ApiResponse<null>> {
  await delay();
  const idx = mockTherapistBookmarks.findIndex(b => b.id === id);
  if (idx === -1) return notFound('Bookmark');
  mockTherapistBookmarks.splice(idx, 1);
  return deleted();
}
