// ============================================================
// Therapist Course Package Service (Block Booking Templates)
// ============================================================
// GET    /course-packages              -> list course packages
// GET    /course-packages/:id          -> get package by ID
// POST   /course-packages              -> create course package
// PUT    /course-packages/:id          -> update course package
// DELETE /course-packages/:id          -> delete course package
// ============================================================

import type { ApiResponse, PaginatedResponse } from '../shared/apiClient';
import { success, created, deleted, notFound, paginated, delay, uid } from '../shared/apiClient';
import type {
  CreateCoursePackageRequest,
  UpdateCoursePackageRequest,
  ListCoursePackagesParams,
} from './types';
import {
  mockCurrentTherapist,
  mockTherapists,
  type CoursePackage,
} from '../../data/mockData';

// ---- GET list ---------------------------------------------------------------

export async function listCoursePackages(
  params: ListCoursePackagesParams,
): Promise<PaginatedResponse<CoursePackage>> {
  await delay();

  const therapist = mockTherapists.find(t => t.id === params.therapistId) ?? mockCurrentTherapist;
  let results = [...(therapist.coursePackages ?? [])];

  if (params.isActive !== undefined) {
    results = results.filter(p => p.isActive === params.isActive);
  }

  const total = results.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const slice = results.slice(start, start + pageSize);

  return paginated(slice, total, page, pageSize);
}

// ---- GET by ID --------------------------------------------------------------

export async function getCoursePackageById(
  id: string,
): Promise<ApiResponse<CoursePackage | null>> {
  await delay();
  const pkg = mockCurrentTherapist.coursePackages?.find(p => p.id === id);
  if (!pkg) return notFound('CoursePackage');
  return success(pkg);
}

// ---- POST create ------------------------------------------------------------

export async function createCoursePackage(
  data: CreateCoursePackageRequest,
): Promise<ApiResponse<CoursePackage>> {
  await delay();
  const pkg: CoursePackage = {
    id: uid('cp'),
    therapistId: data.therapistId,
    title: data.title,
    description: data.description,
    sessionRateId: data.sessionRateId,
    totalSessions: data.totalSessions,
    totalPrice: data.totalPrice,
    isActive: true,
  };
  if (!mockCurrentTherapist.coursePackages) {
    mockCurrentTherapist.coursePackages = [];
  }
  mockCurrentTherapist.coursePackages.push(pkg);
  return created(pkg);
}

// ---- PUT update -------------------------------------------------------------

export async function updateCoursePackage(
  id: string,
  data: UpdateCoursePackageRequest,
): Promise<ApiResponse<CoursePackage | null>> {
  await delay();
  const pkg = mockCurrentTherapist.coursePackages?.find(p => p.id === id);
  if (!pkg) return notFound('CoursePackage');
  Object.assign(pkg, data);
  return success(pkg);
}

// ---- DELETE -----------------------------------------------------------------

export async function deleteCoursePackage(
  id: string,
): Promise<ApiResponse<null>> {
  await delay();
  if (!mockCurrentTherapist.coursePackages) return notFound('CoursePackage');
  const idx = mockCurrentTherapist.coursePackages.findIndex(p => p.id === id);
  if (idx === -1) return notFound('CoursePackage');
  mockCurrentTherapist.coursePackages.splice(idx, 1);
  return deleted();
}
