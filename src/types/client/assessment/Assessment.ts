import type { PHQ9Response } from "./PHQ9Response";
import type { GAD7Response } from "./GAD7Response";

export interface Assessment {
  id: string;
  clientId: string;
  therapistId: string;
  date: Date;
  phq9: PHQ9Response;
  gad7: GAD7Response;
  phq9Score: number;
  gad7Score: number;
  createdAt: Date;
}
