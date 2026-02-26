export interface Post {
  id: string;
  therapistId: string;
  content: string;
  link?: string;
  timestamp: Date;
  likes: string[]; // array of user IDs who liked
}
