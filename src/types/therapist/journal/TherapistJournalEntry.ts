export interface TherapistJournalEntry {
  id: string;
  therapistId: string;
  date: Date;
  mood: number; // 1-10
  thoughtsAndFeelings: string;
  sharedWithSupervisor: boolean;
  createdAt: Date;
}
