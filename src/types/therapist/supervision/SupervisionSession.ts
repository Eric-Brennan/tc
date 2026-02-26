export interface SupervisionSession {
  id: string;
  supervisorId: string;
  superviseeId: string;
  scheduledTime: Date;
  duration: number; // in minutes
  status: "scheduled" | "completed" | "cancelled";
  modality: "video" | "inPerson" | "phoneCall";
  price?: number;
  notes?: string; // supervisor's session notes (added post-session)
}