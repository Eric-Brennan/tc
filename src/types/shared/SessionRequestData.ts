import type { Modality } from "./Modality";

export interface SessionRequestData {
  id: string;        // unique ID for API actions (approve/decline/pay)
  sessionId: string;
  sessionType: string; // e.g. "50-min Video Session"
  date: string; // formatted date "Mon, 24 Feb 2026"
  time: string; // "09:00 - 09:50"
  duration: number; // minutes
  price: number; // in GBP
  modality: Modality;
  status: "pending" | "approved" | "declined" | "paid";
}