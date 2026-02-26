export interface ClientNote {
  id: string;
  clientId: string;
  sessionId?: string;
  content: string;
  createdAt: Date;
}
