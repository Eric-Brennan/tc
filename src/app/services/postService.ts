// ============================================================
// Post Service
// ============================================================
// GET    /posts                → list posts (feed)
// GET    /posts/:id            → get post by ID
// POST   /posts                → create post (therapist)
// PUT    /posts/:id            → update post
// PUT    /posts/:id/like       → toggle like
// DELETE /posts/:id            → delete post
// ============================================================

import type { ApiResponse, PaginatedResponse } from './apiClient';
import { success, created, deleted, notFound, paginated, delay, uid } from './apiClient';
import type {
  CreatePostRequest,
  UpdatePostRequest,
  ToggleLikeRequest,
  ListPostsParams,
} from './types';
import {
  mockPosts,
  type Post,
} from '../data/mockData';

// ---- GET list / feed --------------------------------------------------------

export async function listPosts(
  params: ListPostsParams = {},
): Promise<PaginatedResponse<Post>> {
  await delay();

  let results = [...mockPosts];

  if (params.therapistId) {
    results = results.filter(p => p.therapistId === params.therapistId);
  }

  results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const total = results.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const slice = results.slice(start, start + pageSize);

  return paginated(slice, total, page, pageSize);
}

// ---- GET by ID --------------------------------------------------------------

export async function getPostById(
  id: string,
): Promise<ApiResponse<Post | null>> {
  await delay();
  const post = mockPosts.find(p => p.id === id);
  if (!post) return notFound('Post');
  return success(post);
}

// ---- POST create ------------------------------------------------------------

export async function createPost(
  data: CreatePostRequest,
): Promise<ApiResponse<Post>> {
  await delay();
  const post: Post = {
    id: uid('p'),
    therapistId: data.therapistId,
    content: data.content,
    link: data.link,
    timestamp: new Date(),
    likes: [],
  };
  mockPosts.unshift(post);
  return created(post);
}

// ---- PUT update -------------------------------------------------------------

export async function updatePost(
  id: string,
  data: UpdatePostRequest,
): Promise<ApiResponse<Post | null>> {
  await delay();
  const post = mockPosts.find(p => p.id === id);
  if (!post) return notFound('Post');
  if (data.content !== undefined) post.content = data.content;
  if (data.link !== undefined) post.link = data.link;
  return success(post);
}

// ---- PUT toggle like --------------------------------------------------------

export async function toggleLike(
  postId: string,
  data: ToggleLikeRequest,
): Promise<ApiResponse<Post | null>> {
  await delay();
  const post = mockPosts.find(p => p.id === postId);
  if (!post) return notFound('Post');

  const idx = post.likes.indexOf(data.userId);
  if (idx >= 0) {
    post.likes.splice(idx, 1); // unlike
  } else {
    post.likes.push(data.userId); // like
  }

  return success(post);
}

// ---- DELETE -----------------------------------------------------------------

export async function deletePost(
  id: string,
): Promise<ApiResponse<null>> {
  await delay();
  const idx = mockPosts.findIndex(p => p.id === id);
  if (idx === -1) return notFound('Post');
  mockPosts.splice(idx, 1);
  return deleted();
}
