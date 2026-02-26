import type { Modality } from "./Modality";

export interface SessionRate {
  id: string;
  title: string;
  modality: Modality;
  duration: number; // in minutes
  price: number;
  cooldown?: number; // cooldown period in minutes after session (for notes/refresh)
  isSupervision?: boolean; // true if this rate is for supervision sessions only
}
