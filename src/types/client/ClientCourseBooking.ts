export interface ClientCourseBooking {
  id: string;
  clientId: string;
  therapistId: string;
  coursePackageId: string;
  courseTitle: string; // denormalised for display
  sessionRateId: string; // which session rate each session uses
  totalSessions: number;
  sessionsUsed: number;
  totalPrice: number;
  purchaseDate: Date;
  status: "active" | "completed" | "cancelled";
}
