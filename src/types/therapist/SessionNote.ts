export interface SessionNote {
  id: string;
  clientId: string;
  therapistId: string;
  sessionId?: string;
  content: string;
  createdAt: Date;
}
