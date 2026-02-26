export interface Workshop {
  id: string;
  therapistId: string;
  title: string;
  description: string;
  scheduledTime: Date;
  duration: number; // in minutes
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  modality?: "video" | "inPerson";
  isRegistered?: boolean;
}
