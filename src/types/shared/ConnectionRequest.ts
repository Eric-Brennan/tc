export interface ConnectionRequest {
  id: string;
  clientId: string;
  therapistId: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  createdAt: Date;
}
