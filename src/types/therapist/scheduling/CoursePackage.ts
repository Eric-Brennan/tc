export interface CoursePackage {
  id: string;
  therapistId: string;
  title: string; // e.g. "EMDR Course"
  description: string; // short description of what the course covers
  sessionRateId: string; // which session rate type each session uses
  totalSessions: number; // e.g. 8
  totalPrice: number; // flat fee for the whole course, e.g. 1150
  isActive: boolean; // whether it's currently offered
}
