export interface SupervisionConnection {
  id: string;
  superviseeId: string; // therapist seeking supervision
  supervisorId: string; // therapist offering supervision
  status: "pending" | "accepted" | "rejected";
  message?: string;
  createdAt: Date;
}
