// ============================================================
// Client Course Booking Service (Block Bookings)
// ============================================================
// GET    /course-bookings              -> list course bookings
// GET    /course-bookings/:id          -> get booking by ID
// POST   /course-bookings              -> purchase a course package
// PUT    /course-bookings/:id/cancel   -> cancel a course booking
// ============================================================

import type { ApiResponse, PaginatedResponse } from '../shared/apiClient';
import { success, created, notFound, paginated, delay, uid } from '../shared/apiClient';
import type {
  PurchaseCourseRequest,
  ListCourseBookingsParams,
} from './types';
import {
  mockClientCourseBookings,
  mockCurrentTherapist,
  type ClientCourseBooking,
} from '../../data/mockData';

// ---- GET list ---------------------------------------------------------------

export async function listCourseBookings(
  params: ListCourseBookingsParams = {},
): Promise<PaginatedResponse<ClientCourseBooking>> {
  await delay();

  let results = [...mockClientCourseBookings];

  if (params.clientId) {
    results = results.filter(b => b.clientId === params.clientId);
  }
  if (params.therapistId) {
    results = results.filter(b => b.therapistId === params.therapistId);
  }
  if (params.status) {
    results = results.filter(b => b.status === params.status);
  }

  results.sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime());

  const total = results.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const slice = results.slice(start, start + pageSize);

  return paginated(slice, total, page, pageSize);
}

// ---- GET by ID --------------------------------------------------------------

export async function getCourseBookingById(
  id: string,
): Promise<ApiResponse<ClientCourseBooking | null>> {
  await delay();
  const booking = mockClientCourseBookings.find(b => b.id === id);
  if (!booking) return notFound('CourseBooking');
  return success(booking);
}

// ---- POST purchase ----------------------------------------------------------

export async function purchaseCourse(
  data: PurchaseCourseRequest,
): Promise<ApiResponse<ClientCourseBooking | null>> {
  await delay();
  // Find the course package from the therapist
  const pkg = mockCurrentTherapist.coursePackages?.find(
    p => p.id === data.coursePackageId,
  );
  if (!pkg) return notFound('CoursePackage');

  const booking: ClientCourseBooking = {
    id: uid('ccb'),
    clientId: data.clientId,
    therapistId: pkg.therapistId,
    coursePackageId: pkg.id,
    courseTitle: pkg.title,
    sessionRateId: pkg.sessionRateId,
    totalSessions: pkg.totalSessions,
    sessionsUsed: 0,
    totalPrice: pkg.totalPrice,
    purchaseDate: new Date(),
    status: 'active',
  };
  mockClientCourseBookings.push(booking);
  return created(booking);
}

// ---- PUT cancel booking -----------------------------------------------------

export async function cancelCourseBooking(
  id: string,
): Promise<ApiResponse<ClientCourseBooking | null>> {
  await delay();
  const booking = mockClientCourseBookings.find(b => b.id === id);
  if (!booking) return notFound('CourseBooking');
  booking.status = 'cancelled';
  return success(booking);
}
