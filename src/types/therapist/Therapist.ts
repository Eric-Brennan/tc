import type { User } from "../shared/User";
import type { SessionRate } from "../shared/SessionRate";
import type { SessionType } from "../shared/enums/SessionType";
import type { AvailabilityWindow } from "./scheduling/AvailabilityWindow";
import type { GoverningBodyMembership } from "./GoverningBodyMembership";
import type { CoursePackage } from "./scheduling/CoursePackage";

export interface Therapist extends User {
  type: "therapist";
  credentials: string;
  specializations: string[];
  clinicalApproaches: string[];
  yearsOfExperience: number;
  education: string[];
  bio: string;
  hourlyRate: number;
  availability: string;
  bannerImage?: string;
  sessionRates?: SessionRate[];
  availabilityWindows?: AvailabilityWindow[];
  governingBodyMemberships?: GoverningBodyMembership[];
  coursePackages?: CoursePackage[];
  sessionTypes?: SessionType[];
  supervisionBio?: string;
}
