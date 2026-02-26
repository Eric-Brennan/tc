import type { MoodRating } from "./MoodRating";
import type { PhysicalRating } from "./PhysicalRating";
import type { SleepQuality } from "./SleepQuality";
import type { AnxietyLevel } from "./AnxietyLevel";
import type { StressLevel } from "./StressLevel";

export interface JournalEntry {
  id: string;
  clientId: string;
  date: Date;
  moodRating: MoodRating;
  physicalRating: PhysicalRating;
  sleepQuality?: SleepQuality;
  sleepHours?: number;
  anxietyLevel?: AnxietyLevel;
  stressLevel?: StressLevel;
  gratitude?: string[];
  accomplishments?: string[];
  challenges?: string;
  activities?: string[];
  goals?: string[];
  thoughts: string;
  sharedWithTherapistIds: string[]; // Which therapists can see this entry (empty = private)
  createdAt: Date;
  updatedAt: Date;
}
