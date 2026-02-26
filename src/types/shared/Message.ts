import type { SessionRequestData } from "./SessionRequestData";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  bookmark?: {
    title: string;
    url: string;
  };
  sessionRequest?: SessionRequestData;
}
