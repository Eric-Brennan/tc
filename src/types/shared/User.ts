import type { UserType } from "./UserType";

export interface User {
  id: string;
  type: UserType;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  location?: string;
}
