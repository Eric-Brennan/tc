import type { GoverningBody } from "./enums/GoverningBody";
import type { MembershipLevel } from "./enums/MembershipLevel";

export interface GoverningBodyMembership {
  id: string;
  governingBody: GoverningBody;
  membershipLevel: MembershipLevel;
  membershipNumber: string;
  yearObtained?: number;
}
