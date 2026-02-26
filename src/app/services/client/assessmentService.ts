// ============================================================
// Client Assessment Service (PHQ-9 + GAD-7)
// ============================================================
// GET    /assessments              -> list assessments
// GET    /assessments/:id          -> get assessment by ID
// POST   /assessments              -> create assessment
// DELETE /assessments/:id          -> delete assessment
// ============================================================

import type { ApiResponse, PaginatedResponse } from '../shared/apiClient';
import { success, created, deleted, notFound, paginated, delay, uid } from '../shared/apiClient';
import type {
  CreateAssessmentRequest,
  ListAssessmentsParams,
} from './types';
import {
  mockAssessments,
  calculatePHQ9Score,
  calculateGAD7Score,
  type Assessment,
} from '../../data/mockData';

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

// ---- DELETE -----------------------------------------------------------------

export async function deleteAssessment(
  id: string,
): Promise<ApiResponse<null>> {
  await delay();
  const idx = mockAssessments.findIndex(a => a.id === id);
  if (idx === -1) return notFound('Assessment');
  mockAssessments.splice(idx, 1);
  return deleted();
}
