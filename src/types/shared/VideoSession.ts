import type { Modality } from "./Modality";

export interface VideoSession {
  id: string;
  therapistId: string;
  clientId: string;
  scheduledTime: Date;
  duration: number; // in minutes
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  sessionRateId?: string; // Reference to the session rate used
  modality?: Modality; // Legacy support
  azureRoomId?: string;
  isPaid?: boolean;
  price?: number;
  requiresApproval?: boolean; // true when booked beyond max occupancy
}
