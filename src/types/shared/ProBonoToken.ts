export interface ProBonoToken {
  id: string;
  therapistId: string;
  clientId: string;
  sessionRateId: string;
  sessionRateTitle: string; // denormalised for display
  createdAt: Date;
  usedAt?: Date;
  status: "available" | "used" | "expired";
}
