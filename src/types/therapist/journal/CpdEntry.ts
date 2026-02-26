export interface CpdEntry {
  id: string;
  therapistId: string;
  title: string;
  description: string;
  link?: string;
  startDate?: Date;
  completedDate?: Date;
  createdAt: Date;
}
