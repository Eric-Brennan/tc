import type { User } from "../shared/User";

export interface Client extends User {
  type: "client";
  areasOfFocus?: string[];
  areasOfFocusDetails?: string; // Additional detailed notes about areas of concern
  followedTherapists?: string[]; // Array of therapist IDs that the client follows
}
