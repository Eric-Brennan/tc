import { 
  Title, 
  Gender, 
  Orientation, 
  TherapistType, 
  AreaOfFocus, 
  ClinicalApproach,
  GoverningBody,
  MembershipLevel,
  SpokenLanguageCode,
  LanguageProficiency,
  ImageType,
  SessionType
} from "./enums";

export interface ContactDetails {
  email: string;
  mobileNumber: string;
  street: string;
  city: string;
  postCode: string;
  country?: string;
}

export interface ProfileLink {
  id: string;
  title: string;
  url: string;
}

export interface SpokenLanguage {
  id: string;
  languageCode: SpokenLanguageCode;
  proficiency: LanguageProficiency;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  yearCompleted: number;
}

export interface GoverningBodyMembership {
  id: string;
  governingBody: GoverningBody;
  membershipLevel: MembershipLevel;
  membershipNumber: string;
  yearObtained?: number;
}

export interface Image {
  id: string;
  imageType: ImageType;
  url: string;
  altText?: string;
}

export interface SessionRate {
  id: string;
  title: string;
  modality: 'video' | 'inPerson' | 'text' | 'phoneCall';
  duration: number;
  price: number;
}

export interface TherapistProfile {
  therapistProfileId: number;
  userId: number;
  title: Title;
  firstName: string;
  middleName: string | null;
  lastName: string;
  displayName: string | null;
  profileImages: Image[];
  dateOfBirth: Date | null;
  gender: Gender;
  orientation: Orientation;
  contactDetails: ContactDetails | null;
  profileLinks: ProfileLink[];
  isInPerson: boolean;
  isVideo: boolean;
  isPhone: boolean;
  isLiveChat: boolean;
  isMessaging: boolean;
  willDoCouples: boolean;
  bio: string | null;
  yearsOfExperience: number;
  spokenLanguages: SpokenLanguage[];
  educations: Education[];
  therapistTypes: TherapistType[];
  sessionTypes: SessionType[];
  areasOfFocus: AreaOfFocus[];
  clinicalApproaches: ClinicalApproach[];
  governingBodyMemberships: GoverningBodyMembership[];
  sessionRates: SessionRate[];
  createdAt: Date;
  updatedAt: Date;
}