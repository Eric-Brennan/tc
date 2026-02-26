// Mock data for the therapist-client platform

// ── Enum imports (used by mock data values below) ───────────────
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
  SessionType
} from "../../types/enums";
import type { TherapistProfile as FullTherapistProfile } from "../../types";

// ── Re-export all types from canonical /src/types/ locations ────
// This preserves backward compatibility for existing imports from mockData.
export type { UserType } from "../../types/shared/UserType";
export type { Modality } from "../../types/shared/Modality";
export type { ThemeSettings } from "../../types/shared/ThemeSettings";
export type { User } from "../../types/shared/User";
export type { SessionRate } from "../../types/shared/SessionRate";
export type { ConnectionRequest } from "../../types/shared/ConnectionRequest";
export type { SessionRequestData } from "../../types/shared/SessionRequestData";
export type { Message } from "../../types/shared/Message";
export type { VideoSession } from "../../types/shared/VideoSession";
export type { ProBonoToken } from "../../types/shared/ProBonoToken";
export type { Therapist } from "../../types/therapist/Therapist";
export type { GoverningBodyMembership } from "../../types/therapist/GoverningBodyMembership";
export type { SupervisionConnection } from "../../types/therapist/supervision/SupervisionConnection";
export type { SupervisionSession } from "../../types/therapist/supervision/SupervisionSession";
export type { AvailabilityWindow } from "../../types/therapist/scheduling/AvailabilityWindow";
export type { TherapistBookmark } from "../../types/therapist/TherapistBookmark";
export type { Post } from "../../types/therapist/Post";
export type { Workshop } from "../../types/therapist/scheduling/Workshop";
export type { CoursePackage } from "../../types/therapist/scheduling/CoursePackage";
export type { SessionNote } from "../../types/therapist/SessionNote";
export type { TherapistJournalEntry } from "../../types/therapist/journal/TherapistJournalEntry";
export type { CpdEntry } from "../../types/therapist/journal/CpdEntry";
export type { Client } from "../../types/client/Client";
export type { ClientCourseBooking } from "../../types/client/ClientCourseBooking";
export type { ClientNote } from "../../types/client/ClientNote";
export type { MoodRating, PhysicalRating, SleepQuality, AnxietyLevel, StressLevel } from "../../types/client/journal";
export type { JournalEntry } from "../../types/client/journal/JournalEntry";
export type { AssessmentFrequency } from "../../types/client/assessment/AssessmentFrequency";
export type { PHQ9Response } from "../../types/client/assessment/PHQ9Response";
export type { GAD7Response } from "../../types/client/assessment/GAD7Response";
export type { Assessment } from "../../types/client/assessment/Assessment";

// ── Import types needed for mock data arrays below ──────────────
import type { UserType } from "../../types/shared/UserType";
import type { ThemeSettings } from "../../types/shared/ThemeSettings";
import type { User } from "../../types/shared/User";
import type { SessionRate } from "../../types/shared/SessionRate";
import type { ConnectionRequest } from "../../types/shared/ConnectionRequest";
import type { SessionRequestData } from "../../types/shared/SessionRequestData";
import type { Message } from "../../types/shared/Message";
import type { VideoSession } from "../../types/shared/VideoSession";
import type { ProBonoToken } from "../../types/shared/ProBonoToken";
import type { Therapist } from "../../types/therapist/Therapist";
import type { GoverningBodyMembership } from "../../types/therapist/GoverningBodyMembership";
import type { SupervisionConnection } from "../../types/therapist/supervision/SupervisionConnection";
import type { SupervisionSession } from "../../types/therapist/supervision/SupervisionSession";
import type { AvailabilityWindow } from "../../types/therapist/scheduling/AvailabilityWindow";
import type { TherapistBookmark } from "../../types/therapist/TherapistBookmark";
import type { Post } from "../../types/therapist/Post";
import type { Workshop } from "../../types/therapist/scheduling/Workshop";
import type { CoursePackage } from "../../types/therapist/scheduling/CoursePackage";
import type { SessionNote } from "../../types/therapist/SessionNote";
import type { TherapistJournalEntry } from "../../types/therapist/journal/TherapistJournalEntry";
import type { CpdEntry } from "../../types/therapist/journal/CpdEntry";
import type { Client } from "../../types/client/Client";
import type { ClientCourseBooking } from "../../types/client/ClientCourseBooking";
import type { ClientNote } from "../../types/client/ClientNote";
import type { MoodRating, PhysicalRating, SleepQuality, AnxietyLevel, StressLevel } from "../../types/client/journal";
import type { JournalEntry } from "../../types/client/journal/JournalEntry";
import type { AssessmentFrequency } from "../../types/client/assessment/AssessmentFrequency";
import type { PHQ9Response } from "../../types/client/assessment/PHQ9Response";
import type { GAD7Response } from "../../types/client/assessment/GAD7Response";
import type { Assessment } from "../../types/client/assessment/Assessment";

/** Convenience: does this therapist offer supervision? */
export function therapistOffersSupervision(t: Therapist): boolean {
  return t.sessionTypes?.includes(SessionType.Supervision) ?? false;
}



// Mock therapists
export const mockTherapists: Therapist[] = [
  {
    id: 't1',
    type: 'therapist',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@therapy.com',
    avatar: 'https://images.unsplash.com/photo-1736939678218-bd648b5ef3bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBwc3ljaG9sb2dpc3QlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcxMTY1NjMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    credentials: 'PhD, Licensed Clinical Psychologist',
    specializations: ['Anxiety', 'Depression', 'Trauma', 'PTSD'],
    clinicalApproaches: ['Cognitive Behavioral Therapy (CBT)', 'EMDR', 'Mindfulness-Based Therapy'],
    yearsOfExperience: 12,
    education: ['PhD in Clinical Psychology - Columbia University', 'MA in Counseling Psychology - NYU'],
    bio: 'I specialize in helping individuals navigate anxiety, depression, and trauma. My approach is collaborative and evidence-based, focusing on building resilience and practical coping strategies.',
    hourlyRate: 200,
    availability: 'Mon-Fri, 9 AM - 6 PM',
    bannerImage: 'https://images.unsplash.com/photo-1758274526671-ad18176acb01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGF0aW9uJTIwd2VsbG5lc3MlMjBuYXR1cmV8ZW58MXx8fHwxNzcxMTg5MTIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    sessionRates: [
      { id: 'sr1', title: '50-min Video Session', modality: 'video', duration: 50, price: 175, cooldown: 10 },
      { id: 'sr1b', title: '90-min Video Session', modality: 'video', duration: 90, price: 280, cooldown: 15 },
      { id: 'sr2', title: '50-min In-Person Session', modality: 'inPerson', duration: 50, price: 225, cooldown: 10 },
      { id: 'sr2b', title: '90-min In-Person Session', modality: 'inPerson', duration: 90, price: 350, cooldown: 15 },
      { id: 'sr3', title: 'Text Session (per week)', modality: 'text', duration: 60, price: 150 },
      { id: 'sr4', title: '50-min Phone Session', modality: 'phoneCall', duration: 50, price: 165, cooldown: 10 },
      { id: 'sr-sv1', title: 'Supervision Session (Video)', modality: 'video', duration: 60, price: 150, cooldown: 10, isSupervision: true },
      { id: 'sr-sv2', title: 'Supervision Session (In-Person)', modality: 'inPerson', duration: 60, price: 180, cooldown: 10, isSupervision: true }
    ],
    availabilityWindows: [
      // Week 1
      { date: '2026-02-17', startTime: '09:00', endTime: '12:00', enabledRateIds: ['sr1', 'sr2', 'sr3', 'sr4', 'sr-sv1', 'sr-sv2'] },
      { date: '2026-02-17', startTime: '13:00', endTime: '16:00', enabledRateIds: ['sr1', 'sr2'] },
      { date: '2026-02-18', startTime: '09:00', endTime: '12:00', enabledRateIds: ['sr1', 'sr2', 'sr3', 'sr-sv1'] },
      { date: '2026-02-18', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr1', 'sr4'] },
      { date: '2026-02-19', startTime: '09:00', endTime: '12:00', enabledRateIds: ['sr1', 'sr2', 'sr-sv1', 'sr-sv2'] },
      { date: '2026-02-19', startTime: '14:00', endTime: '16:00', enabledRateIds: ['sr1', 'sr2', 'sr3', 'sr4'] },
      { date: '2026-02-20', startTime: '09:00', endTime: '12:00', enabledRateIds: ['sr1', 'sr2', 'sr3', 'sr-sv1'] },
      { date: '2026-02-20', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr1', 'sr2'] },
      { date: '2026-02-21', startTime: '09:00', endTime: '12:00', enabledRateIds: ['sr1', 'sr-sv1'] },
      { date: '2026-02-21', startTime: '14:00', endTime: '16:00', enabledRateIds: ['sr1', 'sr3'] },
      // Week 2
      { date: '2026-02-23', startTime: '09:00', endTime: '12:00', enabledRateIds: ['sr1', 'sr2', 'sr3', 'sr-sv1'] },
      { date: '2026-02-23', startTime: '13:00', endTime: '16:00', enabledRateIds: ['sr1', 'sr2'] },
      { date: '2026-02-24', startTime: '09:00', endTime: '12:00', enabledRateIds: ['sr1', 'sr2', 'sr3', 'sr-sv1'] },
      { date: '2026-02-24', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr1', 'sr2'] },
      { date: '2026-02-25', startTime: '09:00', endTime: '12:00', enabledRateIds: ['sr1', 'sr2', 'sr-sv1', 'sr-sv2'] },
      { date: '2026-02-25', startTime: '14:00', endTime: '16:00', enabledRateIds: ['sr1', 'sr2', 'sr3', 'sr4'] },
      { date: '2026-02-26', startTime: '09:00', endTime: '17:00', enabledRateIds: ['sr1', 'sr2', 'sr3', 'sr4', 'sr-sv1', 'sr-sv2'], maxOccupancy: 420 },
      { date: '2026-02-27', startTime: '09:00', endTime: '12:00', enabledRateIds: ['sr1', 'sr4'] },
      { date: '2026-02-27', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr1', 'sr2'] },
      // Week 3
      { date: '2026-03-02', startTime: '09:00', endTime: '12:00', enabledRateIds: ['sr1', 'sr2', 'sr3'] },
      { date: '2026-03-02', startTime: '14:00', endTime: '16:00', enabledRateIds: ['sr1', 'sr2'] },
      { date: '2026-03-03', startTime: '09:00', endTime: '12:00', enabledRateIds: ['sr1', 'sr2', 'sr3', 'sr4'] },
      { date: '2026-03-03', startTime: '13:00', endTime: '16:00', enabledRateIds: ['sr1'] },
      { date: '2026-03-04', startTime: '09:00', endTime: '12:00', enabledRateIds: ['sr1', 'sr4'] },
      { date: '2026-03-04', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr1', 'sr2', 'sr3'] },
      { date: '2026-03-05', startTime: '09:00', endTime: '12:00', enabledRateIds: ['sr1', 'sr2'] },
      { date: '2026-03-05', startTime: '14:00', endTime: '16:00', enabledRateIds: ['sr1', 'sr2', 'sr4'] },
      { date: '2026-03-06', startTime: '09:00', endTime: '12:00', enabledRateIds: ['sr1', 'sr2'] },
      { date: '2026-03-06', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr1', 'sr2'] },
    ],
    governingBodyMemberships: [
      { id: 'gm1', governingBody: GoverningBody.APA, membershipLevel: MembershipLevel.APAFellow, membershipNumber: 'APA-123456', yearObtained: 2012 },
      { id: 'gm2', governingBody: GoverningBody.ABPP, membershipLevel: MembershipLevel.Certified, membershipNumber: 'ABPP-789012', yearObtained: 2015 }
    ],
    coursePackages: [
      {
        id: 'cp1',
        therapistId: 't1',
        title: 'EMDR Trauma Processing Course',
        description: '8-session structured EMDR programme for trauma processing. Includes assessment, preparation, desensitisation, and integration phases.',
        sessionRateId: 'sr1b',   // 90-min Video Session
        totalSessions: 8,
        totalPrice: 1150,
        isActive: true
      },
      {
        id: 'cp2',
        therapistId: 't1',
        title: 'CBT Anxiety Management Programme',
        description: '6-session cognitive behavioural therapy course focusing on anxiety management techniques, thought challenging, and exposure work.',
        sessionRateId: 'sr1',    // 50-min Video Session
        totalSessions: 6,
        totalPrice: 750,
        isActive: true
      },
      {
        id: 'cp3',
        therapistId: 't1',
        title: 'Mindfulness-Based Stress Reduction',
        description: '4-session in-person mindfulness course with guided meditation, body scan techniques, and stress management strategies.',
        sessionRateId: 'sr2',    // 50-min In-Person Session
        totalSessions: 4,
        totalPrice: 680,
        isActive: false
      }
    ],
    sessionTypes: [SessionType.Counselling, SessionType.Psychotherapy, SessionType.Supervision],
    supervisionBio: 'I provide clinical supervision for therapists working with anxiety, depression, and trauma. My supervision style is integrative, drawing on CBT, EMDR, and attachment theory frameworks.'
  },
  {
    id: 't2',
    type: 'therapist',
    name: 'Michael Chen',
    email: 'michael.chen@therapy.com',
    avatar: 'https://images.unsplash.com/photo-1748288166624-095426243217?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwdGhlcmFwaXN0JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcxMTg1MTI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    credentials: 'LMFT, Licensed Marriage and Family Therapist',
    specializations: ['Relationship Issues', 'Family Therapy', 'Life Transitions', 'Stress Management'],
    clinicalApproaches: ['Emotionally Focused Therapy (EFT)', 'Solution-Focused Brief Therapy', 'Narrative Therapy'],
    yearsOfExperience: 8,
    education: ['MA in Marriage and Family Therapy - University of San Francisco', 'BA in Psychology - UC Berkeley'],
    bio: 'I work with individuals, couples, and families to improve communication, resolve conflicts, and build stronger relationships. My approach is compassionate and tailored to each client\'s unique needs.',
    hourlyRate: 175,
    availability: 'Tue-Sat, 10 AM - 7 PM',
    bannerImage: 'https://images.unsplash.com/photo-1683248897268-be91f5e53045?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5kZnVsbmVzcyUyMHBlYWNlZnVsJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc3MTE4OTEyMHww&ixlib=rb-4.1.0&q=80&w=1080',
    sessionRates: [
      { id: 'sr5', title: 'Video Session', modality: 'video', duration: 60, price: 175, cooldown: 10 },
      { id: 'sr6', title: 'In-Person Session', modality: 'inPerson', duration: 60, price: 200, cooldown: 10 },
      { id: 'sr7', title: 'Text Session', modality: 'text', duration: 60, price: 125 },
      { id: 'sr8', title: 'Phone Call Session', modality: 'phoneCall', duration: 60, price: 150, cooldown: 10 },
      { id: 'sr-sv3', title: 'Supervision Session (Video)', modality: 'video', duration: 60, price: 120, cooldown: 10, isSupervision: true },
      { id: 'sr-sv4', title: 'Supervision Session (Phone)', modality: 'phoneCall', duration: 60, price: 100, cooldown: 10, isSupervision: true }
    ],
    availabilityWindows: [
      { date: '2026-02-17', startTime: '10:00', endTime: '13:00', enabledRateIds: ['sr5', 'sr6', 'sr7', 'sr8', 'sr-sv3', 'sr-sv4'] },
      { date: '2026-02-17', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr5', 'sr6', 'sr-sv3'] },
      { date: '2026-02-18', startTime: '10:00', endTime: '12:00', enabledRateIds: ['sr5', 'sr6', 'sr-sv3'] },
      { date: '2026-02-18', startTime: '14:00', endTime: '16:00', enabledRateIds: ['sr5', 'sr6'] },
      { date: '2026-02-19', startTime: '10:00', endTime: '13:00', enabledRateIds: ['sr5', 'sr6', 'sr7', 'sr-sv3', 'sr-sv4'] },
      { date: '2026-02-19', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr5', 'sr6'] },
      { date: '2026-02-20', startTime: '10:00', endTime: '13:00', enabledRateIds: ['sr5', 'sr6', 'sr-sv3'] },
      { date: '2026-02-20', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr5', 'sr6', 'sr8', 'sr-sv3'] },
      { date: '2026-02-21', startTime: '10:00', endTime: '13:00', enabledRateIds: ['sr5', 'sr6'] },
      { date: '2026-02-21', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr5', 'sr6', 'sr-sv3', 'sr-sv4'] },
      // Week 2
      { date: '2026-02-24', startTime: '10:00', endTime: '13:00', enabledRateIds: ['sr5', 'sr6', 'sr7', 'sr-sv3', 'sr-sv4'] },
      { date: '2026-02-24', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr5', 'sr6', 'sr-sv3'] },
      { date: '2026-02-25', startTime: '10:00', endTime: '12:00', enabledRateIds: ['sr5', 'sr6', 'sr-sv3'] },
      { date: '2026-02-25', startTime: '14:00', endTime: '16:00', enabledRateIds: ['sr5', 'sr6'] },
      { date: '2026-02-26', startTime: '10:00', endTime: '13:00', enabledRateIds: ['sr5', 'sr6', 'sr7', 'sr-sv3', 'sr-sv4'] },
      { date: '2026-02-26', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr5', 'sr6'] },
      { date: '2026-02-27', startTime: '10:00', endTime: '13:00', enabledRateIds: ['sr5', 'sr6', 'sr-sv3'] },
      { date: '2026-02-27', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr5', 'sr6', 'sr8', 'sr-sv3'] },
      { date: '2026-02-28', startTime: '10:00', endTime: '13:00', enabledRateIds: ['sr5', 'sr6', 'sr-sv3'] },
      { date: '2026-02-28', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr5', 'sr6', 'sr-sv4'] },
      // Week 3
      { date: '2026-03-03', startTime: '10:00', endTime: '13:00', enabledRateIds: ['sr5', 'sr6', 'sr-sv3', 'sr-sv4'] },
      { date: '2026-03-03', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr5', 'sr6', 'sr-sv3'] },
      { date: '2026-03-04', startTime: '10:00', endTime: '13:00', enabledRateIds: ['sr5', 'sr6', 'sr-sv3'] },
      { date: '2026-03-04', startTime: '14:00', endTime: '16:00', enabledRateIds: ['sr5', 'sr6'] },
      { date: '2026-03-05', startTime: '10:00', endTime: '13:00', enabledRateIds: ['sr5', 'sr6', 'sr-sv3', 'sr-sv4'] },
      { date: '2026-03-05', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr5', 'sr6'] },
      { date: '2026-03-06', startTime: '10:00', endTime: '13:00', enabledRateIds: ['sr5', 'sr6', 'sr-sv3'] },
      { date: '2026-03-06', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr5', 'sr6', 'sr8', 'sr-sv3'] },
    ],
    governingBodyMemberships: [
      { id: 'gm3', governingBody: GoverningBody.AAMFT, membershipLevel: MembershipLevel.AAMFTClinical, membershipNumber: 'AAMFT-345678', yearObtained: 2018 }
    ],
    sessionTypes: [SessionType.Counselling, SessionType.Couples, SessionType.Supervision],
    supervisionBio: 'I offer supervision for therapists working with couples, families, and relationship dynamics. I draw on EFT and narrative approaches to help supervisees develop their clinical voice.'
  },
  {
    id: 't3',
    type: 'therapist',
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@therapy.com',
    avatar: 'https://images.unsplash.com/photo-1676222743204-a80ddeeb27eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0aGVyYXBpc3QlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzEwNjgwNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    phone: '+1 (555) 345-6789',
    location: 'Austin, TX',
    credentials: 'PsyD, Licensed Clinical Psychologist',
    specializations: ['OCD', 'Eating Disorders', 'Body Image', 'Self-Esteem'],
    clinicalApproaches: ['Acceptance and Commitment Therapy (ACT)', 'Dialectical Behavior Therapy (DBT)', 'CBT'],
    yearsOfExperience: 10,
    education: ['PsyD in Clinical Psychology - Pepperdine University', 'BS in Neuroscience - UT Austin'],
    bio: 'I am passionate about helping clients overcome OCD and eating disorders through evidence-based treatments. I create a safe, non-judgmental space for healing and growth.',
    hourlyRate: 190,
    availability: 'Mon-Thu, 8 AM - 5 PM',
    bannerImage: 'https://images.unsplash.com/photo-1751563696363-abb675273f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwb2NlYW4lMjBob3Jpem9ufGVufDF8fHx8MTc3MTE4OTEyMHww&ixlib=rb-4.1.0&q=80&w=1080',
    sessionRates: [
      { id: 'sr9', title: 'Video Session', modality: 'video', duration: 60, price: 190, cooldown: 15 },
      { id: 'sr10', title: 'In-Person Session', modality: 'inPerson', duration: 60, price: 220, cooldown: 15 },
      { id: 'sr11', title: 'Text Session', modality: 'text', duration: 60, price: 130 },
      { id: 'sr12', title: 'Phone Call Session', modality: 'phoneCall', duration: 60, price: 160, cooldown: 10 }
    ],
    availabilityWindows: [
      { date: '2026-02-17', startTime: '08:00', endTime: '11:00', enabledRateIds: ['sr9', 'sr10', 'sr11'] },
      { date: '2026-02-17', startTime: '13:00', endTime: '15:00', enabledRateIds: ['sr9', 'sr10'] },
      { date: '2026-02-18', startTime: '08:00', endTime: '11:00', enabledRateIds: ['sr9', 'sr10'] },
      { date: '2026-02-18', startTime: '13:00', endTime: '15:00', enabledRateIds: ['sr9', 'sr10'] },
      { date: '2026-02-19', startTime: '08:00', endTime: '10:00', enabledRateIds: ['sr9', 'sr10', 'sr12'] },
      { date: '2026-02-19', startTime: '13:00', endTime: '15:00', enabledRateIds: ['sr9', 'sr10'] },
      { date: '2026-02-20', startTime: '08:00', endTime: '11:00', enabledRateIds: ['sr9', 'sr10'] },
      { date: '2026-02-20', startTime: '13:00', endTime: '16:00', enabledRateIds: ['sr9', 'sr10', 'sr11'] },
      { date: '2026-02-21', startTime: '08:00', endTime: '10:00', enabledRateIds: ['sr9', 'sr10'] },
      { date: '2026-02-21', startTime: '13:00', endTime: '15:00', enabledRateIds: ['sr9', 'sr10'] },
    ],
    governingBodyMemberships: [
      { id: 'gm4', governingBody: GoverningBody.APA, membershipLevel: MembershipLevel.APAMember, membershipNumber: 'APA-567890', yearObtained: 2016 }
    ],
    sessionTypes: [SessionType.Counselling, SessionType.Psychotherapy]
  },
  {
    id: 't4',
    type: 'therapist',
    name: 'James Patterson',
    email: 'james.patterson@therapy.com',
    avatar: 'https://images.unsplash.com/photo-1758273240631-59d44c8f5b66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBjb3Vuc2Vsb3J8ZW58MXx8fHwxNzcxMTg1MTI4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    phone: '+1 (555) 456-7890',
    location: 'Seattle, WA',
    credentials: 'LCSW, Licensed Clinical Social Worker',
    specializations: ['Substance Abuse', 'Grief and Loss', 'Career Counseling', 'Men\'s Issues'],
    clinicalApproaches: ['Motivational Interviewing', 'Person-Centered Therapy', 'Cognitive Behavioral Therapy (CBT)'],
    yearsOfExperience: 15,
    education: ['MSW - University of Washington', 'BA in Sociology - Seattle University'],
    bio: 'With over 15 years of experience, I help clients navigate life\'s challenges including addiction, grief, and career transitions. I believe in the power of the therapeutic relationship to foster meaningful change.',
    hourlyRate: 165,
    availability: 'Mon-Fri, 11 AM - 8 PM',
    bannerImage: 'https://images.unsplash.com/photo-1700148676800-a12f8a016deb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXJlbmUlMjBtb3VudGFpbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NzExMTM4MzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    sessionRates: [
      { id: 'sr13', title: 'Video Session', modality: 'video', duration: 60, price: 165, cooldown: 10 },
      { id: 'sr14', title: 'In-Person Session', modality: 'inPerson', duration: 60, price: 190, cooldown: 10 },
      { id: 'sr15', title: 'Text Session', modality: 'text', duration: 60, price: 110 },
      { id: 'sr16', title: 'Phone Call Session', modality: 'phoneCall', duration: 60, price: 140, cooldown: 10 },
      { id: 'sr-sv5', title: 'Supervision Session (Video)', modality: 'video', duration: 60, price: 110, cooldown: 10, isSupervision: true }
    ],
    availabilityWindows: [
      { date: '2026-02-17', startTime: '11:00', endTime: '13:00', enabledRateIds: ['sr13', 'sr14', 'sr15', 'sr-sv5'] },
      { date: '2026-02-17', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr13', 'sr14', 'sr-sv5'] },
      { date: '2026-02-18', startTime: '11:00', endTime: '13:00', enabledRateIds: ['sr13', 'sr14'] },
      { date: '2026-02-18', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr13', 'sr14', 'sr16'] },
      { date: '2026-02-19', startTime: '11:00', endTime: '12:00', enabledRateIds: ['sr13', 'sr14'] },
      { date: '2026-02-19', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr13', 'sr14', 'sr-sv5'] },
      { date: '2026-02-20', startTime: '11:00', endTime: '13:00', enabledRateIds: ['sr13', 'sr14'] },
      { date: '2026-02-20', startTime: '14:00', endTime: '18:00', enabledRateIds: ['sr13', 'sr14', 'sr15', 'sr-sv5'] },
      { date: '2026-02-21', startTime: '11:00', endTime: '13:00', enabledRateIds: ['sr13', 'sr14'] },
      { date: '2026-02-21', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr13', 'sr14', 'sr-sv5'] },
      // Week 2
      { date: '2026-02-24', startTime: '11:00', endTime: '13:00', enabledRateIds: ['sr13', 'sr14', 'sr15', 'sr-sv5'] },
      { date: '2026-02-24', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr13', 'sr14', 'sr-sv5'] },
      { date: '2026-02-25', startTime: '11:00', endTime: '13:00', enabledRateIds: ['sr13', 'sr14'] },
      { date: '2026-02-25', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr13', 'sr14', 'sr16'] },
      { date: '2026-02-26', startTime: '11:00', endTime: '13:00', enabledRateIds: ['sr13', 'sr14', 'sr-sv5'] },
      { date: '2026-02-26', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr13', 'sr14', 'sr-sv5'] },
      { date: '2026-02-27', startTime: '11:00', endTime: '13:00', enabledRateIds: ['sr13', 'sr14'] },
      { date: '2026-02-27', startTime: '14:00', endTime: '18:00', enabledRateIds: ['sr13', 'sr14', 'sr15', 'sr-sv5'] },
      { date: '2026-02-28', startTime: '11:00', endTime: '13:00', enabledRateIds: ['sr13', 'sr14', 'sr-sv5'] },
      // Week 3
      { date: '2026-03-03', startTime: '11:00', endTime: '13:00', enabledRateIds: ['sr13', 'sr14', 'sr-sv5'] },
      { date: '2026-03-03', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr13', 'sr14', 'sr-sv5'] },
      { date: '2026-03-04', startTime: '11:00', endTime: '13:00', enabledRateIds: ['sr13', 'sr14'] },
      { date: '2026-03-04', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr13', 'sr14', 'sr16'] },
      { date: '2026-03-05', startTime: '11:00', endTime: '13:00', enabledRateIds: ['sr13', 'sr14', 'sr-sv5'] },
      { date: '2026-03-05', startTime: '14:00', endTime: '17:00', enabledRateIds: ['sr13', 'sr14', 'sr-sv5'] },
      { date: '2026-03-06', startTime: '11:00', endTime: '13:00', enabledRateIds: ['sr13', 'sr14'] },
      { date: '2026-03-06', startTime: '14:00', endTime: '18:00', enabledRateIds: ['sr13', 'sr14', 'sr15', 'sr-sv5'] },
    ],
    governingBodyMemberships: [
      { id: 'gm5', governingBody: GoverningBody.NASW, membershipLevel: MembershipLevel.Member, membershipNumber: 'NASW-901234', yearObtained: 2011 }
    ],
    sessionTypes: [SessionType.Counselling, SessionType.Supervision],
    supervisionBio: 'With 15 years of clinical experience, I supervise therapists specialising in substance abuse, grief, and men\'s issues. My approach is grounded in motivational interviewing and person-centred frameworks.'
  }
];

// ---- Test client switcher (localStorage-backed) ----
const TEST_CLIENT_KEY = 'besthelp_test_client';
const TEST_THERAPIST_KEY = 'besthelp_test_therapist';

const testClientProfiles: Record<string, Client> = {
  c1: {
    id: 'c1',
    type: 'client',
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    location: 'New York, NY',
    areasOfFocus: ['Anxiety', 'Work Stress'],
    areasOfFocusDetails: 'I\'ve been experiencing increasing anxiety around work deadlines and presentations. I often feel overwhelmed by my workload and struggle to manage stress in a healthy way. I\'m looking for strategies to better cope with workplace pressure and reduce my overall anxiety levels.',
    followedTherapists: ['t1', 't2'],
  },
  c6: {
    id: 'c6',
    type: 'client',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    location: 'Jersey City, NJ',
    areasOfFocus: ['Anxiety', 'Self-Esteem', 'Life Transitions'],
    areasOfFocusDetails: 'I\'m going through several life changes at once — career transition, recent move, and adjusting to a new city. I struggle with self-doubt and worry that I\'m not making the right decisions. I\'d like to build confidence and develop healthier ways of managing uncertainty.',
    followedTherapists: ['t1'],
  },
};

function getStoredClientId(): string {
  try { return localStorage.getItem(TEST_CLIENT_KEY) || 'c1'; } catch { return 'c1'; }
}

export function getTestClientIds() {
  return Object.keys(testClientProfiles);
}

export function getTestClientLabel(id: string) {
  const c = testClientProfiles[id];
  return c ? c.name : id;
}

export function getTestClientAvatar(id: string) {
  return testClientProfiles[id]?.avatar ?? '';
}

export function switchTestClient(id: string) {
  localStorage.setItem(TEST_CLIENT_KEY, id);
  window.location.reload();
}

export function getCurrentTestClientId(): string {
  return getStoredClientId();
}

// Current user (for demo purposes, can be toggled via test switcher)
export const mockCurrentClient: Client = testClientProfiles[getStoredClientId()] ?? testClientProfiles['c1'];

// ---- Test therapist switcher (localStorage-backed) ----

function getStoredTherapistId(): string {
  try { return localStorage.getItem(TEST_THERAPIST_KEY) || 't1'; } catch { return 't1'; }
}

export function getTestTherapistIds(): string[] {
  return mockTherapists.map(t => t.id);
}

export function getTestTherapistLabel(id: string): string {
  const t = mockTherapists.find(th => th.id === id);
  return t ? t.name : id;
}

export function getTestTherapistAvatar(id: string): string {
  return mockTherapists.find(th => th.id === id)?.avatar ?? '';
}

export function switchTestTherapist(id: string) {
  localStorage.setItem(TEST_THERAPIST_KEY, id);
  window.location.reload();
}

export function getCurrentTestTherapistId(): string {
  return getStoredTherapistId();
}

export const mockCurrentTherapist: Therapist = mockTherapists.find(t => t.id === getStoredTherapistId()) ?? mockTherapists[0];

// Extended profile data for current therapist with full TherapistProfile structure
export const mockCurrentTherapistExtended: Partial<FullTherapistProfile> = {
  therapistProfileId: 1,
  userId: 1,
  title: Title.Dr,
  firstName: "Sarah",
  middleName: "Marie",
  lastName: "Johnson",
  displayName: "Dr. Sarah Johnson",
  profileImages: [],
  dateOfBirth: new Date("1982-05-15"),
  gender: Gender.Female,
  orientation: Orientation.Straight,
  contactDetails: {
    email: "sarah.johnson@therapy.com",
    mobileNumber: "+1 (555) 123-4567",
    street: "123 Therapy Lane",
    city: "New York",
    postCode: "10001",
    country: "United States"
  },
  profileLinks: [
    { id: "link1", title: "Website", url: "https://drsar ahjohnson.com" },
    { id: "link2", title: "LinkedIn", url: "https://linkedin.com/in/sarahjohnsonphd" }
  ],
  isInPerson: true,
  isVideo: true,
  isPhone: true,
  isLiveChat: false,
  isMessaging: true,
  willDoCouples: false,
  bio: "I specialize in helping individuals navigate anxiety, depression, and trauma. My approach is collaborative and evidence-based, focusing on building resilience and practical coping strategies.",
  yearsOfExperience: 12,
  spokenLanguages: [
    { id: "lang1", languageCode: SpokenLanguageCode.EN, proficiency: LanguageProficiency.Native },
    { id: "lang2", languageCode: SpokenLanguageCode.ES, proficiency: LanguageProficiency.Conversational }
  ],
  educations: [
    {
      id: "edu1",
      institution: "Columbia University",
      degree: "PhD",
      fieldOfStudy: "Clinical Psychology",
      yearCompleted: 2010
    },
    {
      id: "edu2",
      institution: "NYU",
      degree: "MA",
      fieldOfStudy: "Counseling Psychology",
      yearCompleted: 2006
    }
  ],
  therapistTypes: [TherapistType.LIB, TherapistType.NRG],
  sessionTypes: [SessionType.Counselling, SessionType.Psychotherapy, SessionType.Supervision],
  areasOfFocus: [AreaOfFocus.AX, AreaOfFocus.DEP, AreaOfFocus.TRA, AreaOfFocus.PTS],
  clinicalApproaches: [ClinicalApproach.CBT, ClinicalApproach.EMDR, ClinicalApproach.MIT],
  governingBodyMemberships: [
    {
      id: "mem1",
      governingBody: GoverningBody.APA,
      membershipLevel: MembershipLevel.APAFellow,
      membershipNumber: "APA-123456",
      yearObtained: 2012
    },
    {
      id: "mem2",
      governingBody: GoverningBody.ABPP,
      membershipLevel: MembershipLevel.Certified,
      membershipNumber: "ABPP-789012",
      yearObtained: 2015
    }
  ],
  sessionRates: mockTherapists[0].sessionRates || [],
  createdAt: new Date("2020-01-01"),
  updatedAt: new Date()
};

// Mock connection requests
export const mockConnections: ConnectionRequest[] = [
  {
    id: 'conn1',
    clientId: 'c1',
    therapistId: 't1',
    status: 'accepted',
    message: 'Looking forward to working with you on managing my anxiety.',
    createdAt: new Date('2026-01-15')
  },
  {
    id: 'conn1b',
    clientId: 'c1',
    therapistId: 't2',
    status: 'accepted',
    message: 'I\'d like to explore couples counseling and communication skills.',
    createdAt: new Date('2026-02-05')
  },
  {
    id: 'conn2',
    clientId: 'c2',
    therapistId: 't1',
    status: 'accepted',
    message: 'I would like to discuss trauma therapy.',
    createdAt: new Date('2026-02-10')
  },
  {
    id: 'conn3',
    clientId: 'c3',
    therapistId: 't1',
    status: 'accepted',
    message: 'Seeking help with depression and life transitions.',
    createdAt: new Date('2026-01-20')
  },
  {
    id: 'conn4',
    clientId: 'c4',
    therapistId: 't1',
    status: 'accepted',
    message: 'Looking for help with relationship challenges.',
    createdAt: new Date('2026-01-25')
  },
  {
    id: 'conn5',
    clientId: 'c5',
    therapistId: 't1',
    status: 'accepted',
    message: 'Need support managing work stress and burnout.',
    createdAt: new Date('2026-02-01')
  },
  {
    id: 'conn6',
    clientId: 'c1',
    therapistId: 't3',
    status: 'pending',
    message: 'Hi Dr. Rodriguez, I\'ve been struggling with intrusive thoughts and would like to explore OCD-focused therapy.',
    createdAt: new Date('2026-02-19')
  },
  {
    id: 'conn7',
    clientId: 'c6',
    therapistId: 't1',
    status: 'pending',
    message: 'Hello Dr. Johnson, I\'ve been experiencing significant anxiety and low self-esteem during a career transition. I\'d love to discuss how CBT could help me.',
    createdAt: new Date('2026-02-20')
  },
  // ── James Patterson (t4) client connections ──
  {
    id: 'conn8',
    clientId: 'c2',
    therapistId: 't4',
    status: 'accepted',
    message: 'Hi James, I\'m dealing with the loss of a family member and could really use some support.',
    createdAt: new Date('2026-01-22')
  },
  {
    id: 'conn9',
    clientId: 'c3',
    therapistId: 't4',
    status: 'accepted',
    message: 'Hello Mr. Patterson, I\'m going through a career transition and struggling with substance-related coping. I\'d appreciate your help.',
    createdAt: new Date('2026-02-02')
  },
  {
    id: 'conn10',
    clientId: 'c5',
    therapistId: 't4',
    status: 'pending',
    message: 'Hi James, I\'ve been recommended to you for help with work stress and burnout. Would love to connect.',
    createdAt: new Date('2026-02-18')
  }
];

// Mock client course bookings (prepaid block bookings)
export const mockClientCourseBookings: ClientCourseBooking[] = [
  {
    id: 'ccb1',
    clientId: 'c1',
    therapistId: 't1',
    coursePackageId: 'cp1',
    courseTitle: 'EMDR Trauma Processing Course',
    sessionRateId: 'sr1b',  // 90-min Video Session
    totalSessions: 8,
    sessionsUsed: 3,
    totalPrice: 1150,
    purchaseDate: new Date('2026-01-20'),
    status: 'active'
  },
  {
    id: 'ccb2',
    clientId: 'c2',
    therapistId: 't1',
    coursePackageId: 'cp2',
    courseTitle: 'CBT Anxiety Management Programme',
    sessionRateId: 'sr1',   // 50-min Video Session
    totalSessions: 6,
    sessionsUsed: 6,
    totalPrice: 750,
    purchaseDate: new Date('2025-12-01'),
    status: 'completed'
  }
];

// Mock pro bono tokens
export const mockProBonoTokens: ProBonoToken[] = [
  {
    id: 'pbt1',
    therapistId: 't1',
    clientId: 'c1',
    sessionRateId: 'sr1',
    sessionRateTitle: '50-min Video Session',
    createdAt: new Date('2026-02-10'),
    status: 'available',
  },
  {
    id: 'pbt2',
    therapistId: 't1',
    clientId: 'c1',
    sessionRateId: 'sr4',
    sessionRateTitle: '50-min Phone Session',
    createdAt: new Date('2026-02-10'),
    status: 'available',
  },
  {
    id: 'pbt3',
    therapistId: 't1',
    clientId: 'c1',
    sessionRateId: 'sr1',
    sessionRateTitle: '50-min Video Session',
    createdAt: new Date('2026-01-20'),
    usedAt: new Date('2026-01-28'),
    status: 'used',
  },
];

// Mock clients (for therapist view)
export const mockClients: Client[] = [
  {
    id: 'c1',
    type: 'client',
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    location: 'New York, NY',
    areasOfFocus: ['Anxiety', 'Work Stress'],
    followedTherapists: ['t1', 't2']
  },
  {
    id: 'c2',
    type: 'client',
    name: 'Jordan Lee',
    email: 'jordan.lee@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    location: 'Brooklyn, NY',
    areasOfFocus: ['Trauma', 'PTSD']
  },
  {
    id: 'c3',
    type: 'client',
    name: 'Sam Rivera',
    email: 'sam.rivera@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
    location: 'Manhattan, NY',
    areasOfFocus: ['Depression', 'Life Transitions']
  },
  {
    id: 'c4',
    type: 'client',
    name: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    location: 'Queens, NY',
    areasOfFocus: ['Relationship Issues', 'Self-Esteem']
  },
  {
    id: 'c5',
    type: 'client',
    name: 'David Chen',
    email: 'david.chen@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    location: 'Bronx, NY',
    areasOfFocus: ['Work-Life Balance', 'Burnout']
  },
  {
    id: 'c6',
    type: 'client',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    location: 'Jersey City, NJ',
    areasOfFocus: ['Anxiety', 'Self-Esteem', 'Life Transitions'],
    areasOfFocusDetails: 'I\'m going through several life changes at once — career transition, recent move, and adjusting to a new city. I struggle with self-doubt and worry that I\'m not making the right decisions. I\'d like to build confidence and develop healthier ways of managing uncertainty.',
    followedTherapists: ['t1'],
  }
];

// Mock messages
export const mockMessages: Message[] = [
  {
    id: 'm1',
    senderId: 'c1',
    receiverId: 't1',
    content: 'Hi Dr. Johnson, I wanted to discuss our session next week.',
    timestamp: new Date('2026-02-14T10:30:00'),
    read: true
  },
  {
    id: 'm2',
    senderId: 't1',
    receiverId: 'c1',
    content: 'Hello Alex! Of course, what would you like to discuss?',
    timestamp: new Date('2026-02-14T11:00:00'),
    read: true
  },
  {
    id: 'm3',
    senderId: 'c1',
    receiverId: 't1',
    content: 'I\'ve been practicing the breathing exercises you recommended and they\'re really helping.',
    timestamp: new Date('2026-02-14T11:15:00'),
    read: true
  },
  {
    id: 'm4',
    senderId: 't1',
    receiverId: 'c1',
    content: 'That\'s wonderful to hear! Keep up the great work. Let\'s explore this more in our next session.',
    timestamp: new Date('2026-02-14T11:20:00'),
    read: false
  },
  {
    id: 'm5',
    senderId: 'c2',
    receiverId: 't1',
    content: 'Hello, I submitted a connection request. I\'m interested in trauma therapy.',
    timestamp: new Date('2026-02-13T14:00:00'),
    read: false
  },
  {
    id: 'm6',
    senderId: 'c3',
    receiverId: 't1',
    content: 'Hi Dr. Johnson, I wanted to thank you for yesterday\'s session. It really helped me process some difficult emotions.',
    timestamp: new Date('2026-02-15T16:45:00'),
    read: false
  },
  {
    id: 'm7',
    senderId: 'c3',
    receiverId: 't1',
    content: 'Also, I wanted to ask if we could schedule an additional session this week if you have any availability?',
    timestamp: new Date('2026-02-15T16:47:00'),
    read: false
  },
  {
    id: 'm8',
    senderId: 'c1',
    receiverId: 't1',
    content: 'Quick question - should I continue with the same homework exercises this week?',
    timestamp: new Date('2026-02-16T09:15:00'),
    read: false
  },
  {
    id: 'm9',
    senderId: 'c2',
    receiverId: 't1',
    content: 'I\'ve been having some anxiety about our first session. Is it normal to feel nervous?',
    timestamp: new Date('2026-02-15T20:30:00'),
    read: false
  },
  {
    id: 'm10',
    senderId: 't1',
    receiverId: 'c1',
    content: 'Here\'s that article on grounding techniques I mentioned — really worth a read.',
    timestamp: new Date('2026-02-16T10:00:00'),
    read: false,
    bookmark: {
      title: '5-4-3-2-1 Grounding Technique for Anxiety',
      url: 'https://www.therapistaid.com/therapy-article/grounding-techniques'
    }
  },
  // ── James Patterson (t4) messages ──
  {
    id: 'm-t4-1',
    senderId: 'c2',
    receiverId: 't4',
    content: 'Hi James, thank you for accepting my request. I\'m a bit nervous about starting therapy.',
    timestamp: new Date('2026-01-24T10:00:00'),
    read: true
  },
  {
    id: 'm-t4-2',
    senderId: 't4',
    receiverId: 'c2',
    content: 'Hi Jordan, that\'s completely normal. This is a safe space and we\'ll go at your pace. Our first session will be about getting to know each other and understanding what you\'d like to work on.',
    timestamp: new Date('2026-01-24T10:30:00'),
    read: true
  },
  {
    id: 'm-t4-3',
    senderId: 'c2',
    receiverId: 't4',
    content: 'That sounds good. I\'ve been struggling since my father passed. Some days are harder than others.',
    timestamp: new Date('2026-01-24T11:00:00'),
    read: true
  },
  {
    id: 'm-t4-4',
    senderId: 't4',
    receiverId: 'c2',
    content: 'I\'m sorry for your loss. Grief is a deeply personal journey. We\'ll work through it together. I\'d recommend journaling your thoughts before our session — even bullet points can help.',
    timestamp: new Date('2026-01-24T11:15:00'),
    read: true
  },
  {
    id: 'm-t4-5',
    senderId: 'c2',
    receiverId: 't4',
    content: 'I tried the journaling this week. It was harder than I expected but I think it helped a little.',
    timestamp: new Date('2026-02-12T09:30:00'),
    read: true
  },
  {
    id: 'm-t4-6',
    senderId: 't4',
    receiverId: 'c2',
    content: 'That\'s really brave. The fact that it felt hard shows you\'re engaging with the emotions rather than avoiding them. Let\'s talk about what came up in our next session.',
    timestamp: new Date('2026-02-12T10:00:00'),
    read: false
  },
  {
    id: 'm-t4-7',
    senderId: 'c3',
    receiverId: 't4',
    content: 'Hi James, I wanted to check in. I\'ve been thinking a lot about our conversation around motivational interviewing.',
    timestamp: new Date('2026-02-14T14:00:00'),
    read: true
  },
  {
    id: 'm-t4-8',
    senderId: 't4',
    receiverId: 'c3',
    content: 'Hi Sam, glad to hear you\'ve been reflecting on it. What came up for you?',
    timestamp: new Date('2026-02-14T14:30:00'),
    read: true
  },
  {
    id: 'm-t4-9',
    senderId: 'c3',
    receiverId: 't4',
    content: 'I realised I\'ve been telling myself I *should* change rather than exploring whether I actually want to. It was a real lightbulb moment.',
    timestamp: new Date('2026-02-14T15:00:00'),
    read: false
  }
];

// ── Therapist Bookmarks ──────────────────────────────────────────
export const mockTherapistBookmarks: TherapistBookmark[] = [
  { id: 'bk1', therapistId: 't1', title: '5-4-3-2-1 Grounding Technique for Anxiety', url: 'https://www.therapistaid.com/therapy-article/grounding-techniques', createdAt: new Date('2026-01-10T09:00:00') },
  { id: 'bk2', therapistId: 't1', title: 'Understanding the CBT Model', url: 'https://www.apa.org/ptsd-guideline/patients-and-families/cognitive-behavioral', createdAt: new Date('2026-01-15T14:00:00') },
  { id: 'bk3', therapistId: 't1', title: 'Headspace – Guided Meditation App', url: 'https://www.headspace.com', createdAt: new Date('2026-01-20T11:30:00') },
  { id: 'bk4', therapistId: 't1', title: 'Sleep Hygiene Tips – NHS', url: 'https://www.nhs.uk/live-well/sleep-and-tiredness/how-to-get-to-sleep/', createdAt: new Date('2026-02-01T16:00:00') },
  { id: 'bk5', therapistId: 't1', title: 'Brené Brown: The Power of Vulnerability (TED Talk)', url: 'https://www.ted.com/talks/brene_brown_the_power_of_vulnerability', createdAt: new Date('2026-02-05T10:00:00') },
  { id: 'bk6', therapistId: 't1', title: 'Dialectical Behavior Therapy Skills Workbook', url: 'https://www.dbtselfhelp.com', createdAt: new Date('2026-02-08T13:00:00') },
  { id: 'bk9', therapistId: 't1', title: 'Journaling for Mental Health – PsychCentral', url: 'https://psychcentral.com/blog/ready-set-journal-64-journaling-prompts-for-self-discovery', createdAt: new Date('2026-02-09T08:30:00') },
  { id: 'bk10', therapistId: 't1', title: 'How Relationships Affect Your Health', url: 'https://www.gottman.com/blog/how-relationships-affect-health/', createdAt: new Date('2026-02-10T12:00:00') },
  { id: 'bk11', therapistId: 't1', title: 'The Neuroscience of Anxiety – Harvard Health', url: 'https://www.health.harvard.edu/blog/understanding-the-stress-response', createdAt: new Date('2026-02-10T15:00:00') },
  { id: 'bk12', therapistId: 't1', title: 'Nature Therapy: The Mental Health Benefits of Walking Outdoors', url: 'https://www.mind.org.uk/information-support/tips-for-everyday-living/nature-and-mental-health/', createdAt: new Date('2026-02-11T09:00:00') },
  { id: 'bk13', therapistId: 't1', title: 'Yoga and Mental Health – NHS Evidence Review', url: 'https://www.nhs.uk/mental-health/self-help/tips-and-support/mindfulness/', createdAt: new Date('2026-02-12T10:30:00') },
  { id: 'bk14', therapistId: 't1', title: 'Supporting a Child Through Anxiety – Young Minds', url: 'https://www.youngminds.org.uk/parent/parents-a-z-mental-health-guide/anxiety/', createdAt: new Date('2026-02-13T14:00:00') },
  { id: 'bk15', therapistId: 't1', title: 'Understanding Grief: Stages and Coping Strategies', url: 'https://www.cruse.org.uk/understanding-grief/', createdAt: new Date('2026-02-14T11:00:00') },
  { id: 'bk16', therapistId: 't1', title: 'Nutrition and Mental Health – Food & Mood Centre', url: 'https://foodandmoodcentre.com.au/resources/', createdAt: new Date('2026-02-15T09:00:00') },
  { id: 'bk17', therapistId: 't1', title: 'Art Therapy Exercises You Can Try at Home', url: 'https://www.baat.org/About-Art-Therapy', createdAt: new Date('2026-02-16T13:30:00') },
  { id: 'bk18', therapistId: 't1', title: 'Burnout: Signs, Symptoms and Recovery – Mind', url: 'https://www.mind.org.uk/information-support/types-of-mental-health-problems/stress/', createdAt: new Date('2026-02-17T10:00:00') },
  { id: 'bk19', therapistId: 't1', title: 'Building Resilience: A Practical Guide', url: 'https://www.apa.org/topics/resilience/building-your-resilience', createdAt: new Date('2026-02-18T08:00:00') },
  { id: 'bk20', therapistId: 't1', title: 'Social Connection and Loneliness – Mental Health Foundation', url: 'https://www.mentalhealth.org.uk/explore-mental-health/a-z-topics/loneliness', createdAt: new Date('2026-02-19T11:30:00') },
  { id: 'bk21', therapistId: 't1', title: 'Ocean Sounds for Relaxation – Calm', url: 'https://www.calm.com/blog/ocean-meditation', createdAt: new Date('2026-02-19T16:00:00') },
  { id: 'bk22', therapistId: 't1', title: 'Mindful Breathing: A Step-by-Step Guide', url: 'https://www.mindful.org/how-to-meditate/', createdAt: new Date('2026-02-20T09:00:00') },
  { id: 'bk7', therapistId: 't2', title: 'Gottman: Softening Startup', url: 'https://www.gottman.com/blog/softening-startup/', createdAt: new Date('2026-01-12T09:00:00') },
  { id: 'bk8', therapistId: 't2', title: 'The 5 Love Languages Quiz', url: 'https://www.5lovelanguages.com/quizzes/love-language', createdAt: new Date('2026-01-18T11:00:00') },
  // ── James Patterson (t4) bookmarks ──
  { id: 'bk-t4-1', therapistId: 't4', title: 'Understanding the Stages of Grief', url: 'https://www.cruse.org.uk/understanding-grief/', createdAt: new Date('2026-01-20T09:00:00') },
  { id: 'bk-t4-2', therapistId: 't4', title: 'Motivational Interviewing: An Overview', url: 'https://motivationalinterviewing.org/understanding-motivational-interviewing', createdAt: new Date('2026-01-25T14:00:00') },
  { id: 'bk-t4-3', therapistId: 't4', title: 'SMART Recovery Self-Help Network', url: 'https://www.smartrecovery.org', createdAt: new Date('2026-02-01T10:00:00') },
  { id: 'bk-t4-4', therapistId: 't4', title: 'Career Transitions and Mental Health – APA', url: 'https://www.apa.org/topics/career', createdAt: new Date('2026-02-08T11:30:00') },
  { id: 'bk-t4-5', therapistId: 't4', title: 'Coping with Loss: A Guide for Men', url: 'https://www.mind.org.uk/information-support/types-of-mental-health-problems/bereavement/', createdAt: new Date('2026-02-12T09:00:00') },
];

// Mock posts (therapist insights)
export const mockPosts: Post[] = [
  {
    id: 'p1',
    therapistId: 't1',
    content: '5 Simple Grounding Techniques for Anxiety:\n\n1. 5-4-3-2-1 Method: Notice 5 things you see, 4 things you can touch, 3 things you hear, 2 things you smell, 1 thing you taste.\n\n2. Deep Breathing: Breathe in for 4 counts, hold for 4, exhale for 4.\n\n3. Progressive Muscle Relaxation: Tense and release each muscle group.\n\n4. Cold Water: Splash cold water on your face or hold ice cubes.\n\n5. Movement: Take a short walk or do gentle stretches.\n\nRemember, these techniques take practice. Be patient with yourself. 💙',
    timestamp: new Date('2026-02-12T09:00:00'),
    likes: ['c1', 'c3']
  },
  {
    id: 'p2',
    therapistId: 't2',
    content: 'Communication tip for couples: Use "I" statements instead of "You" statements.\n\n❌ "You never listen to me."\n✅ "I feel unheard when I\'m interrupted."\n\nThis simple shift can reduce defensiveness and open up more productive conversations.',
    link: 'https://www.gottman.com/blog/softening-startup/',
    timestamp: new Date('2026-02-11T15:30:00'),
    likes: ['c1']
  },
  {
    id: 'p3',
    therapistId: 't1',
    content: 'Reminder: Healing is not linear. It\'s okay to have setbacks. What matters is that you keep moving forward, even if it\'s just one small step at a time. 🌱',
    timestamp: new Date('2026-02-10T12:00:00'),
    likes: ['c1', 'c2', 'c3']
  },
  {
    id: 'p4',
    therapistId: 't3',
    content: 'Understanding OCD: It\'s not about being neat or organized. OCD involves intrusive thoughts (obsessions) that cause significant anxiety, and repetitive behaviors (compulsions) performed to reduce that anxiety.\n\nIf you\'re struggling with intrusive thoughts, know that you\'re not alone and effective treatments like ERP therapy can help.',
    link: 'https://iocdf.org/about-ocd/',
    timestamp: new Date('2026-02-09T10:00:00'),
    likes: []
  },
  {
    id: 'p5',
    therapistId: 't2',
    content: 'Self-care isn\'t selfish. Taking time for yourself helps you show up better for the people and responsibilities in your life. What\'s one thing you can do today just for you?',
    timestamp: new Date('2026-02-08T14:30:00'),
    likes: ['c1', 'c2']
  },
  {
    id: 'p6',
    therapistId: 't1',
    content: 'Cognitive distortions are patterns of thinking that aren\'t based in reality. Common ones include:\n\n• All-or-nothing thinking\n• Catastrophizing\n• Mind reading\n• Should statements\n\nThe first step in challenging them is learning to recognize when they appear.',
    timestamp: new Date('2026-02-07T10:15:00'),
    likes: ['c1', 'c3']
  }
];

// Mock video sessions
export const mockVideoSessions: VideoSession[] = [
  {
    id: 'vs1',
    therapistId: 't1',
    clientId: 'c1',
    scheduledTime: new Date(Date.now() + 10 * 60 * 1000), // Always 10 min from now (testing)
    duration: 60,
    status: 'scheduled',
    modality: 'video',
    azureRoomId: 'room-abc123',
    isPaid: true,
    price: 200
  },
  {
    id: 'vs2',
    therapistId: 't1',
    clientId: 'c3',
    scheduledTime: new Date(2026, 1, 19, 10, 0, 0), // Feb 19, 2026 at 10:00 AM
    duration: 60,
    status: 'scheduled',
    modality: 'inPerson',
    isPaid: true,
    price: 250
  },
  {
    id: 'vs3',
    therapistId: 't1',
    clientId: 'c1',
    scheduledTime: new Date(2026, 1, 11, 14, 0, 0), // Feb 11, 2026 at 2:00 PM
    duration: 60,
    status: 'completed',
    modality: 'video',
    azureRoomId: 'room-ghi789',
    isPaid: true,
    price: 200
  },
  {
    id: 'vs4',
    therapistId: 't1',
    clientId: 'c1',
    scheduledTime: new Date(2026, 1, 25, 16, 0, 0), // Feb 25, 2026 at 4:00 PM
    duration: 60,
    status: 'scheduled',
    modality: 'phoneCall',
    isPaid: true,
    price: 180
  },
  // Jordan Lee sessions
  {
    id: 'vs5',
    therapistId: 't1',
    clientId: 'c2',
    scheduledTime: new Date(2026, 1, 20, 11, 0, 0), // Feb 20, 2026 at 11:00 AM
    duration: 60,
    status: 'scheduled',
    modality: 'video',
    azureRoomId: 'room-jl001',
    isPaid: true,
    price: 200
  },
  {
    id: 'vs6',
    therapistId: 't1',
    clientId: 'c2',
    scheduledTime: new Date(2026, 1, 6, 11, 0, 0), // Feb 6, 2026 at 11:00 AM
    duration: 60,
    status: 'completed',
    modality: 'video',
    azureRoomId: 'room-jl002',
    isPaid: true,
    price: 200
  },
  {
    id: 'vs7',
    therapistId: 't1',
    clientId: 'c2',
    scheduledTime: new Date(2026, 2, 6, 11, 0, 0), // Mar 6, 2026 at 11:00 AM
    duration: 60,
    status: 'scheduled',
    modality: 'video',
    azureRoomId: 'room-jl003',
    isPaid: true,
    price: 200
  },
  // Sam Rivera sessions
  {
    id: 'vs8',
    therapistId: 't1',
    clientId: 'c3',
    scheduledTime: new Date(2026, 1, 5, 10, 0, 0), // Feb 5, 2026 at 10:00 AM
    duration: 60,
    status: 'completed',
    modality: 'inPerson',
    isPaid: true,
    price: 250
  },
  {
    id: 'vs9',
    therapistId: 't1',
    clientId: 'c3',
    scheduledTime: new Date(2026, 1, 26, 10, 0, 0), // Feb 26, 2026 at 10:00 AM
    duration: 60,
    status: 'scheduled',
    modality: 'inPerson',
    isPaid: true,
    price: 250
  },
  // Maria Garcia sessions
  {
    id: 'vs10',
    therapistId: 't1',
    clientId: 'c4',
    scheduledTime: new Date(2026, 1, 21, 15, 0, 0), // Feb 21, 2026 at 3:00 PM
    duration: 60,
    status: 'scheduled',
    modality: 'video',
    azureRoomId: 'room-mg001',
    isPaid: true,
    price: 200
  },
  {
    id: 'vs11',
    therapistId: 't1',
    clientId: 'c4',
    scheduledTime: new Date(2026, 1, 7, 15, 0, 0), // Feb 7, 2026 at 3:00 PM
    duration: 60,
    status: 'completed',
    modality: 'video',
    azureRoomId: 'room-mg002',
    isPaid: true,
    price: 200
  },
  {
    id: 'vs12',
    therapistId: 't1',
    clientId: 'c4',
    scheduledTime: new Date(2026, 2, 3, 15, 0, 0), // Mar 3, 2026 at 3:00 PM
    duration: 60,
    status: 'scheduled',
    modality: 'video',
    azureRoomId: 'room-mg003',
    isPaid: true,
    price: 200
  },
  // David Chen sessions
  {
    id: 'vs13',
    therapistId: 't1',
    clientId: 'c5',
    scheduledTime: new Date(2026, 1, 22, 9, 0, 0), // Feb 22, 2026 at 9:00 AM
    duration: 60,
    status: 'scheduled',
    modality: 'phoneCall',
    isPaid: true,
    price: 180
  },
  {
    id: 'vs14',
    therapistId: 't1',
    clientId: 'c5',
    scheduledTime: new Date(2026, 1, 8, 9, 0, 0), // Feb 8, 2026 at 9:00 AM
    duration: 60,
    status: 'completed',
    modality: 'phoneCall',
    isPaid: true,
    price: 180
  },
  {
    id: 'vs15',
    therapistId: 't1',
    clientId: 'c5',
    scheduledTime: new Date(2026, 2, 5, 9, 0, 0), // Mar 5, 2026 at 9:00 AM
    duration: 60,
    status: 'scheduled',
    modality: 'phoneCall',
    isPaid: true,
    price: 180
  },
  // Feb 24: some booked sessions for occupancy testing
  {
    id: 'vs16',
    therapistId: 't1',
    clientId: 'c2',
    scheduledTime: new Date(2026, 1, 24, 9, 0, 0), // Feb 24, 2026 at 09:00
    duration: 50,
    status: 'scheduled',
    sessionRateId: 'sr1',
    modality: 'video',
    isPaid: true,
    price: 175
  },
  {
    id: 'vs17',
    therapistId: 't1',
    clientId: 'c3',
    scheduledTime: new Date(2026, 1, 24, 10, 0, 0), // Feb 24, 2026 at 10:00
    duration: 50,
    status: 'scheduled',
    sessionRateId: 'sr2',
    modality: 'inPerson',
    isPaid: true,
    price: 225
  }
];

// Mock workshops
export const mockWorkshops: Workshop[] = [
  {
    id: 'w1',
    therapistId: 't1',
    title: 'Managing Anxiety: Techniques and Strategies',
    description: 'Learn practical techniques to manage anxiety and improve your overall well-being.',
    scheduledTime: new Date(2026, 2, 1, 10, 0, 0), // Mar 1, 2026 at 10:00 AM
    duration: 120,
    maxParticipants: 20,
    currentParticipants: 15,
    price: 50,
    isRegistered: true
  },
  {
    id: 'w2',
    therapistId: 't2',
    title: 'Effective Communication in Relationships',
    description: 'Discover how to communicate more effectively in your relationships and resolve conflicts.',
    scheduledTime: new Date(2026, 2, 5, 14, 0, 0), // Mar 5, 2026 at 2:00 PM
    duration: 90,
    maxParticipants: 15,
    currentParticipants: 10,
    price: 45,
    isRegistered: false
  },
  {
    id: 'w3',
    therapistId: 't3',
    title: 'Overcoming OCD: ERP Therapy',
    description: 'Learn about Exposure and Response Prevention (ERP) therapy and how it can help you overcome OCD.',
    scheduledTime: new Date(2026, 2, 10, 10, 0, 0), // Mar 10, 2026 at 10:00 AM
    duration: 120,
    maxParticipants: 20,
    currentParticipants: 18,
    price: 60,
    isRegistered: true
  },
  {
    id: 'w4',
    therapistId: 't1',
    title: 'Mindfulness for Daily Stress Relief',
    description: 'Join this live video webinar to learn practical mindfulness techniques you can use every day.',
    scheduledTime: new Date(2026, 1, 22, 11, 0, 0), // Feb 22, 2026 at 11:00 AM
    duration: 90,
    maxParticipants: 30,
    currentParticipants: 22,
    price: 35,
    isRegistered: false
  }
];

// Journal & Assessment data

// Helper function to calculate scores
export const calculatePHQ9Score = (responses: PHQ9Response): number => {
  return (
    responses.littleInterest +
    responses.feelingDown +
    responses.sleepProblems +
    responses.feelingTired +
    responses.appetiteProblems +
    responses.feelingBad +
    responses.troubleConcentrating +
    responses.movingSpeaking +
    responses.selfHarmThoughts
  );
};

export const calculateGAD7Score = (responses: GAD7Response): number => {
  return (
    responses.feelingNervous +
    responses.cantStopWorrying +
    responses.worryingTooMuch +
    responses.troubleRelaxing +
    responses.beingRestless +
    responses.easilyAnnoyed +
    responses.feelingAfraid
  );
};

export const getPHQ9Severity = (score: number): string => {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  if (score <= 19) return 'Moderately Severe';
  return 'Severe';
};

export const getGAD7Severity = (score: number): string => {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  return 'Severe';
};

// Session Notes, Therapist Journal & CPD, Client Notes
// (type definitions now in /src/types/therapist/ and /src/types/client/)

export const mockSessionNotes: SessionNote[] = [
  {
    id: 'sn1',
    clientId: 'c1',
    therapistId: 't1',
    sessionId: 'vs2',
    content: 'Alex reported improved sleep after adjusting bedtime routine. Still experiencing anxiety around work deadlines. Discussed coping strategies including box breathing and scheduled worry time.',
    createdAt: new Date('2026-02-10T15:20:00'),
  },
  {
    id: 'sn2',
    clientId: 'c1',
    therapistId: 't1',
    sessionId: 'vs3',
    content: 'Follow-up on workplace anxiety. Alex tried box breathing — found it helpful during a presentation. Appetite has improved. Discussed reframing negative self-talk patterns.',
    createdAt: new Date('2026-02-03T14:45:00'),
  },
  {
    id: 'sn3',
    clientId: 'c2',
    therapistId: 't1',
    sessionId: 'vs7',
    content: 'Sarah mentioned feeling more social this week. Attended a group class at the gym. Mild anxiety remains around new social situations but overall trajectory is positive.',
    createdAt: new Date('2026-02-12T10:30:00'),
  },
  {
    id: 'sn4',
    clientId: 'c3',
    therapistId: 't1',
    sessionId: 'vs9',
    content: 'Michael expressed frustration about lack of progress at work. Explored connection between career dissatisfaction and low mood. Assigned journaling exercise to identify core values.',
    createdAt: new Date('2026-02-08T16:00:00'),
  },
  {
    id: 'sn5',
    clientId: 'c4',
    therapistId: 't1',
    sessionId: 'vs11',
    content: 'Emily discussed recent panic attack at a grocery store. Reviewed grounding techniques (5-4-3-2-1). Identified trigger as crowded spaces. Plan to practice gradual exposure.',
    createdAt: new Date('2026-02-05T11:15:00'),
  },
  {
    id: 'sn6',
    clientId: 'c5',
    therapistId: 't1',
    sessionId: 'vs13',
    content: 'James reports consistent use of mood tracking app. Sleep patterns remain disrupted. Discussed sleep hygiene improvements and reducing screen time before bed.',
    createdAt: new Date('2026-02-01T09:30:00'),
  },
];

// Client-authored session notes (private reflections during sessions)
export const mockClientNotes: ClientNote[] = [
  {
    id: 'cn1',
    clientId: 'c1',
    sessionId: 'vs3',
    content: 'The box breathing technique really helped during my presentation last Tuesday. I want to remember to practice this every morning before work.',
    createdAt: new Date('2026-02-11T14:25:00'),
  },
  {
    id: 'cn2',
    clientId: 'c1',
    sessionId: 'vs3',
    content: 'Dr. Johnson mentioned "scheduled worry time" — set aside 15 min at 6pm to write down worries, then close the notebook. Sounds strange but willing to try.',
    createdAt: new Date('2026-02-11T14:40:00'),
  },
  {
    id: 'cn3',
    clientId: 'c1',
    sessionId: 'vs1',
    content: 'Need to bring up the conflict with my manager next session. I keep avoiding it but it\'s making the anxiety worse.',
    createdAt: new Date('2026-02-03T14:55:00'),
  },
];

// Mock assessments
export const mockAssessments: Assessment[] = [
  {
    id: 'a1',
    clientId: 'c1',
    therapistId: 't1',
    date: new Date('2026-02-03'),
    phq9: {
      littleInterest: 1,
      feelingDown: 2,
      sleepProblems: 2,
      feelingTired: 2,
      appetiteProblems: 1,
      feelingBad: 1,
      troubleConcentrating: 1,
      movingSpeaking: 0,
      selfHarmThoughts: 0,
      functionalImpairment: 'somewhatDifficult'
    },
    gad7: {
      feelingNervous: 2,
      cantStopWorrying: 2,
      worryingTooMuch: 2,
      troubleRelaxing: 1,
      beingRestless: 1,
      easilyAnnoyed: 1,
      feelingAfraid: 1,
      functionalImpairment: 'somewhatDifficult'
    },
    phq9Score: 10,
    gad7Score: 10,
    createdAt: new Date('2026-02-03T14:30:00')
  },
  {
    id: 'a2',
    clientId: 'c1',
    therapistId: 't1',
    date: new Date('2026-01-20'),
    phq9: {
      littleInterest: 2,
      feelingDown: 2,
      sleepProblems: 2,
      feelingTired: 3,
      appetiteProblems: 1,
      feelingBad: 2,
      troubleConcentrating: 2,
      movingSpeaking: 1,
      selfHarmThoughts: 0,
      functionalImpairment: 'veryDifficult'
    },
    gad7: {
      feelingNervous: 2,
      cantStopWorrying: 3,
      worryingTooMuch: 3,
      troubleRelaxing: 2,
      beingRestless: 2,
      easilyAnnoyed: 2,
      feelingAfraid: 2,
      functionalImpairment: 'veryDifficult'
    },
    phq9Score: 15,
    gad7Score: 16,
    createdAt: new Date('2026-01-20T10:15:00')
  },
  {
    id: 'a3',
    clientId: 'c2',
    therapistId: 't1',
    date: new Date('2026-02-10'),
    phq9: {
      littleInterest: 1,
      feelingDown: 1,
      sleepProblems: 1,
      feelingTired: 1,
      appetiteProblems: 0,
      feelingBad: 1,
      troubleConcentrating: 0,
      movingSpeaking: 0,
      selfHarmThoughts: 0,
      functionalImpairment: 'notDifficult'
    },
    gad7: {
      feelingNervous: 1,
      cantStopWorrying: 1,
      worryingTooMuch: 1,
      troubleRelaxing: 1,
      beingRestless: 0,
      easilyAnnoyed: 0,
      feelingAfraid: 1,
      functionalImpairment: 'somewhatDifficult'
    },
    phq9Score: 5,
    gad7Score: 5,
    createdAt: new Date('2026-02-10T16:45:00')
  },
  {
    id: 'a4',
    clientId: 'c2',
    therapistId: 't1',
    date: new Date('2026-01-27'),
    phq9: {
      littleInterest: 2,
      feelingDown: 2,
      sleepProblems: 2,
      feelingTired: 2,
      appetiteProblems: 1,
      feelingBad: 2,
      troubleConcentrating: 1,
      movingSpeaking: 1,
      selfHarmThoughts: 0,
      functionalImpairment: 'veryDifficult'
    },
    gad7: {
      feelingNervous: 2,
      cantStopWorrying: 2,
      worryingTooMuch: 2,
      troubleRelaxing: 2,
      beingRestless: 1,
      easilyAnnoyed: 1,
      feelingAfraid: 2,
      functionalImpairment: 'veryDifficult'
    },
    phq9Score: 13,
    gad7Score: 12,
    createdAt: new Date('2026-01-27T11:20:00')
  }
];

// Mock journal entries
export const mockJournalEntries: JournalEntry[] = [
  {
    id: 'j1',
    clientId: 'c1',
    date: new Date('2026-02-15'),
    moodRating: 6,
    physicalRating: 5,
    sleepQuality: 'good',
    sleepHours: 7.5,
    anxietyLevel: 4,
    stressLevel: 5,
    gratitude: ['My morning coffee', 'A supportive friend', 'Making progress in therapy'],
    accomplishments: ['Completed work presentation', 'Went for a walk'],
    challenges: 'Had a difficult conversation with a colleague that made me anxious.',
    activities: ['Exercise', 'Reading', 'Meditation'],
    goals: ['Practice breathing exercises', 'Reach out to a friend'],
    thoughts: 'Today was mostly good. I felt anxious before my work presentation but used the breathing techniques Dr. Johnson taught me. They really helped! I\'m proud of myself for getting through it. Still struggling with overthinking in the evenings, but I managed to distract myself with reading.',
    sharedWithTherapistIds: ['t1', 't2'],
    createdAt: new Date('2026-02-15T20:30:00'),
    updatedAt: new Date('2026-02-15T20:30:00')
  },
  {
    id: 'j2',
    clientId: 'c1',
    date: new Date('2026-02-14'),
    moodRating: 4,
    physicalRating: 3,
    sleepQuality: 'fair',
    sleepHours: 6,
    anxietyLevel: 6,
    stressLevel: 7,
    gratitude: ['Sunny weather', 'Therapy session'],
    accomplishments: ['Showed up to work despite feeling anxious'],
    challenges: 'Woke up feeling overwhelmed about the week ahead. Had trouble concentrating at work.',
    activities: ['Therapy session', 'Light walk'],
    goals: ['Get better sleep tonight', 'Try journaling before bed'],
    thoughts: 'Not my best day. Anxiety was higher than usual. My therapy session helped put things in perspective. Dr. Johnson reminded me that it\'s okay to have harder days and that progress isn\'t always linear. Going to try to get more sleep tonight.',
    sharedWithTherapistIds: ['t1', 't2'],
    createdAt: new Date('2026-02-14T21:15:00'),
    updatedAt: new Date('2026-02-14T21:15:00')
  },
  {
    id: 'j3',
    clientId: 'c1',
    date: new Date('2026-02-13'),
    moodRating: 8,
    physicalRating: 7,
    sleepQuality: 'excellent',
    sleepHours: 8,
    anxietyLevel: 2,
    stressLevel: 3,
    gratitude: ['Great sleep', 'Family time', 'Feeling motivated'],
    accomplishments: ['Exercised for 30 minutes', 'Organized my workspace', 'Called my mom'],
    challenges: 'Minor worry about upcoming deadlines, but managed it well.',
    activities: ['Exercise', 'Socializing', 'Organizing'],
    goals: ['Keep up the exercise routine', 'Start on project early'],
    thoughts: 'Feeling really good today! Got great sleep and woke up with energy. Exercise in the morning really set a positive tone. I\'m noticing that when I take care of my physical health, my mental health improves too. Want to keep this momentum going.',
    sharedWithTherapistIds: ['t1', 't2'],
    createdAt: new Date('2026-02-13T19:45:00'),
    updatedAt: new Date('2026-02-13T19:45:00')
  },
  {
    id: 'j4',
    clientId: 'c1',
    date: new Date('2026-02-12'),
    moodRating: 3,
    physicalRating: 1,
    sleepQuality: 'poor',
    sleepHours: 4.5,
    anxietyLevel: 8,
    stressLevel: 8,
    gratitude: ['Made it through the day'],
    accomplishments: ['Got out of bed', 'Ate something'],
    challenges: 'Really struggled today. Couldn\'t sleep last night, anxiety spiraling about multiple things.',
    activities: ['Netflix', 'Called therapist'],
    goals: ['Be gentle with myself', 'Try to sleep better tonight'],
    thoughts: 'This was a really hard day. Barely slept and anxiety was through the roof. Everything felt overwhelming. I called Dr. Johnson and we talked through some coping strategies. Trying to remember that bad days are temporary and don\'t erase my progress. Going to try some sleep hygiene techniques tonight.',
    sharedWithTherapistIds: ['t1', 't2'],
    createdAt: new Date('2026-02-12T22:30:00'),
    updatedAt: new Date('2026-02-12T22:30:00')
  },
  {
    id: 'j5',
    clientId: 'c1',
    date: new Date('2026-02-11'),
    moodRating: 6,
    physicalRating: 4,
    sleepQuality: 'good',
    sleepHours: 7,
    anxietyLevel: 4,
    stressLevel: 4,
    gratitude: ['Productive therapy session', 'Nice weather', 'Supportive partner'],
    accomplishments: ['Had therapy session', 'Completed work tasks', 'Practiced mindfulness'],
    challenges: 'Some social anxiety at a work meeting, but used grounding techniques.',
    activities: ['Therapy', 'Work', 'Meditation', 'Cooking'],
    goals: ['Continue mindfulness practice', 'Plan weekend activities'],
    thoughts: 'Had my regular session with Dr. Johnson today. We worked on some cognitive restructuring techniques for my work anxiety. I\'m starting to notice when I\'m catastrophizing and can challenge those thoughts more effectively. Still a work in progress but feeling hopeful.',
    sharedWithTherapistIds: ['t1', 't2'],
    createdAt: new Date('2026-02-11T20:00:00'),
    updatedAt: new Date('2026-02-11T20:00:00')
  },
  // Jordan Lee's entries (c2)
  {
    id: 'j6',
    clientId: 'c2',
    date: new Date('2026-02-16'),
    moodRating: 7,
    physicalRating: 8,
    sleepQuality: 'excellent',
    sleepHours: 8,
    anxietyLevel: 3,
    stressLevel: 3,
    gratitude: ['Morning sunshine', 'Peaceful meditation', 'Supportive therapist'],
    accomplishments: ['Meditated for 20 minutes', 'Took a long walk', 'Cooked a healthy meal'],
    challenges: 'None this morning - felt really centered.',
    activities: ['Meditation', 'Walking', 'Cooking'],
    goals: ['Maintain this positive momentum', 'Practice self-compassion'],
    thoughts: 'Morning entry. Woke up feeling rested and calm. The EMDR work we did in our last session seems to be helping process some of the traumatic memories. I notice they don\'t have the same emotional charge anymore. This gives me so much hope for healing.',
    sharedWithTherapistIds: ['t1'],
    createdAt: new Date('2026-02-16T08:00:00'),
    updatedAt: new Date('2026-02-16T08:00:00')
  },
  {
    id: 'j7',
    clientId: 'c2',
    date: new Date('2026-02-16'),
    moodRating: 6,
    physicalRating: 7,
    sleepQuality: 'excellent',
    sleepHours: 8,
    anxietyLevel: 4,
    stressLevel: 4,
    gratitude: ['Mid-morning energy', 'Progress in healing', 'My support system'],
    accomplishments: ['Stayed present during difficult moment', 'Used coping techniques'],
    challenges: 'Brief trigger from a memory, but managed it well with grounding.',
    activities: ['Journaling', 'Grounding exercises', 'Light housework'],
    goals: ['Keep practicing my tools', 'Stay mindful throughout the day'],
    thoughts: 'Mid-morning check-in. Had a brief moment where a memory surfaced, but I was able to use my grounding techniques right away. Named five things I could see, four I could touch, three I could hear, two I could smell, and one I could taste. It worked! Back to feeling calm.',
    sharedWithTherapistIds: ['t1'],
    createdAt: new Date('2026-02-16T11:30:00'),
    updatedAt: new Date('2026-02-16T11:30:00')
  },
  {
    id: 'j7a',
    clientId: 'c2',
    date: new Date('2026-02-16'),
    moodRating: 6,
    physicalRating: 7,
    sleepQuality: 'good',
    sleepHours: 8,
    anxietyLevel: 4,
    stressLevel: 4,
    gratitude: ['Quiet afternoon', 'Reading a good book', 'Feeling safe'],
    accomplishments: ['Completed some work tasks', 'Practiced breathing exercises'],
    challenges: 'Brief moment of anxiety when thinking about tomorrow, but used coping skills.',
    activities: ['Work', 'Reading', 'Breathing exercises'],
    goals: ['Stay present', 'Keep using my tools'],
    thoughts: 'Afternoon check-in. I noticed some anxiety creeping in about upcoming tasks, but I was able to catch it early and use my breathing techniques. This awareness is something I\'ve worked hard to develop in therapy. Proud of myself for recognizing and responding to it.',
    sharedWithTherapistIds: ['t1'],
    createdAt: new Date('2026-02-16T15:00:00'),
    updatedAt: new Date('2026-02-16T15:00:00')
  },
  {
    id: 'j7b',
    clientId: 'c2',
    date: new Date('2026-02-16'),
    moodRating: 5,
    physicalRating: 6,
    sleepQuality: 'excellent',
    sleepHours: 8,
    anxietyLevel: 5,
    stressLevel: 5,
    gratitude: ['My support group', 'Progress in therapy', 'Grounding tools that work'],
    accomplishments: ['Went to support group meeting', 'Managed a flashback effectively'],
    challenges: 'Had a flashback triggered by a news article at support group. Took time to ground myself.',
    activities: ['Support group', 'Grounding exercises', 'Journaling'],
    goals: ['Continue EMDR exercises', 'Connect with a friend this week'],
    thoughts: 'Evening update. At my support group today, I experienced a trauma trigger when someone mentioned a news article. But I was able to use the grounding techniques we practiced. It took about 20 minutes but I came back to the present. This is progress - a few months ago this would have spiraled into a panic attack. Grateful for the tools I\'m learning.',
    sharedWithTherapistIds: ['t1'],
    createdAt: new Date('2026-02-16T19:30:00'),
    updatedAt: new Date('2026-02-16T19:30:00')
  },
  {
    id: 'j7c',
    clientId: 'c2',
    date: new Date('2026-02-16'),
    moodRating: 7,
    physicalRating: 8,
    sleepQuality: 'excellent',
    sleepHours: 8,
    anxietyLevel: 3,
    stressLevel: 3,
    gratitude: ['Evening calm', 'My resilience', 'The healing process', 'Personal growth', 'Hope for the future'],
    accomplishments: ['Made it through a full day successfully', 'Connected with a friend', 'Journaled multiple times', 'Stayed present all day'],
    challenges: 'Staying consistent with self-care routines, but doing well today.',
    activities: ['Phone call with friend', 'Evening walk', 'Gratitude practice', 'Multiple journaling sessions', 'Reflection'],
    goals: ['Keep building on today\'s success', 'Sleep well tonight', 'Continue this level of self-awareness', 'Share progress with therapist'],
    thoughts: 'End of day reflection. Looking back at this day, I\'m amazed at how far I\'ve come. Fifth journal entry today! I know that might seem like a lot, but Dr. Johnson encouraged me to journal whenever I feel the need. Today I wanted to document my healing journey in real-time - from the peaceful morning meditation to the trigger at support group and back to calm. Each entry captures a different moment and mood. It\'s helping me see patterns and progress. This is what healing looks like.',
    sharedWithTherapistIds: ['t1'],
    createdAt: new Date('2026-02-16T22:45:00'),
    updatedAt: new Date('2026-02-16T22:45:00')
  },
  {
    id: 'j8',
    clientId: 'c2',
    date: new Date('2026-02-15'),
    moodRating: 4,
    physicalRating: 5,
    sleepQuality: 'fair',
    sleepHours: 6.5,
    anxietyLevel: 7,
    stressLevel: 6,
    gratitude: ['My therapy appointment', 'My pet dog'],
    accomplishments: ['Made it to therapy despite feeling anxious', 'Took care of basic needs'],
    challenges: 'Anniversary of a difficult event. Felt emotionally heavy all day.',
    activities: ['Therapy session', 'Time with pet', 'Gentle yoga'],
    goals: ['Be extra kind to myself', 'Reach out if I need support'],
    thoughts: 'Today was the anniversary of my trauma. Dr. Johnson prepared me for this and we had a session scheduled. It helped to talk through the emotions. The pain is still there but I\'m learning it\'s okay to feel it rather than push it away. Processing, not suppressing.',
    sharedWithTherapistIds: ['t1'],
    createdAt: new Date('2026-02-15T19:00:00'),
    updatedAt: new Date('2026-02-15T19:00:00')
  },
  {
    id: 'j9',
    clientId: 'c2',
    date: new Date('2026-02-13'),
    moodRating: 6,
    physicalRating: 7,
    sleepQuality: 'good',
    sleepHours: 7.5,
    anxietyLevel: 4,
    stressLevel: 4,
    gratitude: ['Safe environment', 'Healing journey', 'Creative expression'],
    accomplishments: ['Painted for an hour', 'Reached out to a friend', 'Did breathing exercises'],
    challenges: 'Some intrusive thoughts in the afternoon but managed them.',
    activities: ['Art therapy', 'Socializing', 'Breathing exercises'],
    goals: ['Keep up creative activities', 'Schedule next therapy session'],
    thoughts: 'Art has been such a helpful outlet for processing emotions I can\'t put into words. Today I painted something that represented my healing journey - it started dark but gradually got lighter. It felt symbolic. Therapy is teaching me new ways to express and process trauma.',
    sharedWithTherapistIds: ['t1'],
    createdAt: new Date('2026-02-13T18:30:00'),
    updatedAt: new Date('2026-02-13T18:30:00')
  },
  // Sam Rivera's entries (c3)
  {
    id: 'j10',
    clientId: 'c3',
    date: new Date('2026-02-16'),
    moodRating: 7,
    physicalRating: 7,
    sleepQuality: 'good',
    sleepHours: 7.5,
    anxietyLevel: 3,
    stressLevel: 3,
    gratitude: ['New job opportunity', 'Supportive family', 'Progress in therapy'],
    accomplishments: ['Applied for a job I\'m excited about', 'Had a good conversation with my partner'],
    challenges: 'Some fear about change, but trying to see it as growth.',
    activities: ['Job searching', 'Quality time with partner', 'Exercise'],
    goals: ['Follow up on job application', 'Keep taking small steps forward'],
    thoughts: 'I actually applied for that job I\'ve been thinking about for weeks! A few months ago, my depression would have kept me from even trying. Dr. Johnson helped me challenge the thoughts that I\'m not good enough. Taking this step feels huge, regardless of the outcome.',
    sharedWithTherapistIds: ['t1'],
    createdAt: new Date('2026-02-16T20:15:00'),
    updatedAt: new Date('2026-02-16T20:15:00')
  },
  {
    id: 'j11',
    clientId: 'c3',
    date: new Date('2026-02-15'),
    moodRating: 5,
    physicalRating: 6,
    sleepQuality: 'good',
    sleepHours: 8,
    anxietyLevel: 4,
    stressLevel: 4,
    gratitude: ['Yesterday\'s therapy session was really helpful', 'Feeling more hopeful'],
    accomplishments: ['Got out of bed at a reasonable time', 'Tidied my apartment'],
    challenges: 'Still processing our conversation from therapy about my career transition.',
    activities: ['Therapy reflection', 'Cleaning', 'Cooking'],
    goals: ['Update my resume', 'Research career options'],
    thoughts: 'Dr. Johnson\'s words from yesterday are still with me. She helped me see that this career transition isn\'t a failure - it\'s actually me honoring my needs and growth. The depression had me convinced I was just giving up, but now I can see it differently. This perspective shift is powerful.',
    sharedWithTherapistIds: ['t1'],
    createdAt: new Date('2026-02-15T22:00:00'),
    updatedAt: new Date('2026-02-15T22:00:00')
  },
  {
    id: 'j12',
    clientId: 'c4',
    date: new Date('2026-02-15'),
    moodRating: 6,
    physicalRating: 7,
    sleepQuality: 'good',
    sleepHours: 7,
    anxietyLevel: 5,
    stressLevel: 5,
    gratitude: ['My supportive partner', 'Making progress in couples therapy', 'A peaceful evening'],
    accomplishments: ['Had an honest conversation with my partner', 'Practiced active listening'],
    challenges: 'Opening up about my needs is still difficult, but I\'m trying.',
    activities: ['Couples communication', 'Self-reflection', 'Yoga'],
    goals: ['Continue being vulnerable', 'Set healthy boundaries'],
    thoughts: 'Today I used the communication techniques Dr. Johnson taught us. Instead of bottling up my feelings, I told my partner how I really felt. It was scary, but they listened and we actually connected on a deeper level. This is what healthy communication feels like.',
    sharedWithTherapistIds: ['t1'],
    createdAt: new Date('2026-02-15T21:30:00'),
    updatedAt: new Date('2026-02-15T21:30:00')
  },
  {
    id: 'j13',
    clientId: 'c5',
    date: new Date('2026-02-15'),
    moodRating: 4,
    physicalRating: 4,
    sleepQuality: 'fair',
    sleepHours: 5.5,
    anxietyLevel: 7,
    stressLevel: 8,
    gratitude: ['My health', 'Having a therapist who understands'],
    accomplishments: ['Made it through a tough workday', 'Reached out to Dr. Johnson'],
    challenges: 'Feeling completely burned out. Work is consuming everything.',
    activities: ['Work', 'Brief walk', 'Texted therapist for support'],
    goals: ['Set firmer work boundaries', 'Prioritize sleep tonight'],
    thoughts: 'I\'m running on empty. Today was a wake-up call - I worked 12 hours again and barely ate. Dr. Johnson has been warning me about this pattern. I need to make real changes before I completely break down. Tomorrow I\'m going to talk to my manager about my workload.',
    sharedWithTherapistIds: ['t1'],
    createdAt: new Date('2026-02-15T23:15:00'),
    updatedAt: new Date('2026-02-15T23:15:00')
  },
  {
    id: 'j12',
    clientId: 'c3',
    date: new Date('2026-02-14'),
    moodRating: 3,
    physicalRating: 4,
    sleepQuality: 'poor',
    sleepHours: 5,
    anxietyLevel: 6,
    stressLevel: 7,
    gratitude: ['My therapist', 'A warm shower'],
    accomplishments: ['Made it through the work day'],
    challenges: 'Depressive episode hit hard. Everything felt meaningless and heavy.',
    activities: ['Work', 'Self-care basics'],
    goals: ['Talk to Dr. Johnson about medication again', 'Just get through tomorrow'],
    thoughts: 'The depression was really bad today. That heavy, numb feeling where nothing matters. I know logically that this will pass - we\'ve talked about this in therapy - but in the moment it\'s so hard to believe. Going to bring this up in my next session. Maybe it\'s time to reconsider medication.',
    sharedWithTherapistIds: ['t1'],
    createdAt: new Date('2026-02-14T23:30:00'),
    updatedAt: new Date('2026-02-14T23:30:00')
  },
  {
    id: 'j13',
    clientId: 'c3',
    date: new Date('2026-02-12'),
    moodRating: 6,
    physicalRating: 6,
    sleepQuality: 'good',
    sleepHours: 7,
    anxietyLevel: 4,
    stressLevel: 5,
    gratitude: ['Understanding therapist', 'Small victories', 'My partner\'s patience'],
    accomplishments: ['Went for a walk outside', 'Called a friend I\'ve been avoiding'],
    challenges: 'Felt guilty about all the social invitations I\'ve declined lately.',
    activities: ['Walking', 'Socializing', 'Reading'],
    goals: ['Stop beating myself up for needing time', 'Honor my boundaries'],
    thoughts: 'Working on being compassionate with myself during this transition. Dr. Johnson reminded me that healing isn\'t linear and it\'s okay to need space. I reached out to a friend today and explained I\'ve been going through something - they were so understanding. Why do I always expect the worst?',
    sharedWithTherapistIds: ['t1'],
    createdAt: new Date('2026-02-12T21:45:00'),
    updatedAt: new Date('2026-02-12T21:45:00')
  },
  {
    id: 'j14',
    clientId: 'c3',
    date: new Date('2026-02-11'),
    moodRating: 4,
    physicalRating: 5,
    sleepQuality: 'fair',
    sleepHours: 6,
    anxietyLevel: 5,
    stressLevel: 6,
    gratitude: ['Therapy session', 'Small moments of peace'],
    accomplishments: ['Attended therapy', 'Didn\'t cancel plans despite wanting to'],
    challenges: 'Struggling with feelings of emptiness and uncertainty about the future.',
    activities: ['Therapy', 'Forced social activity', 'Journaling'],
    goals: ['Keep showing up', 'Practice the behavioral activation techniques'],
    thoughts: 'Therapy today focused on behavioral activation - doing things even when I don\'t feel like it. It\'s counterintuitive but Dr. Johnson explained that with depression, sometimes action comes before motivation. I\'m going to try. Even if I don\'t feel better immediately, I\'m going to trust the process.',
    sharedWithTherapistIds: ['t1'],
    createdAt: new Date('2026-02-11T19:30:00'),
    updatedAt: new Date('2026-02-11T19:30:00')
  },
  // More entries for c1 on today
  {
    id: 'j15',
    clientId: 'c1',
    date: new Date('2026-02-16'),
    moodRating: 7,
    physicalRating: 8,
    sleepQuality: 'excellent',
    sleepHours: 8,
    anxietyLevel: 3,
    stressLevel: 3,
    gratitude: ['Great sleep', 'Productive morning', 'Feeling capable'],
    accomplishments: ['Completed my morning routine', 'Hit the gym', 'Tackled a hard work task'],
    challenges: 'Brief moment of worry about next week, but didn\'t spiral.',
    activities: ['Exercise', 'Work', 'Meditation', 'Cooking'],
    goals: ['Maintain healthy sleep schedule', 'Keep using coping skills proactively'],
    thoughts: 'Woke up feeling genuinely good today! Not just okay, but actually energized and optimistic. Used my CBT skills when I started worrying about next week - caught the thought, challenged it, moved on. These tools are becoming more automatic. Feeling proud of how far I\'ve come.',
    sharedWithTherapistIds: ['t1', 't2'],
    createdAt: new Date('2026-02-16T08:30:00'),
    updatedAt: new Date('2026-02-16T08:30:00')
  },
  {
    id: 'j16',
    clientId: 'c1',
    date: new Date('2026-02-16'),
    moodRating: 6,
    physicalRating: 7,
    sleepQuality: 'excellent',
    sleepHours: 8,
    anxietyLevel: 4,
    stressLevel: 4,
    gratitude: ['Supportive therapist', 'My resilience', 'Second chances'],
    accomplishments: ['Practiced mindfulness', 'Set boundaries at work', 'Ate well today'],
    challenges: 'Coworker made a comment that used to trigger me, but I handled it well.',
    activities: ['Mindfulness', 'Work', 'Meal prep', 'Self-reflection'],
    goals: ['Continue boundary-setting', 'Plan something fun for the weekend'],
    thoughts: 'Had an interesting moment at work where a coworker said something that would have normally sent me into an anxiety spiral. But I was able to pause, take a breath, and respond calmly. Later I even talked to them about it constructively. This is the growth Dr. Johnson talks about - responding instead of reacting.',
    sharedWithTherapistIds: ['t1', 't2'],
    createdAt: new Date('2026-02-16T19:45:00'),
    updatedAt: new Date('2026-02-16T19:45:00')
  }
];

// Mock therapist journal entries
export const mockTherapistJournalEntries: TherapistJournalEntry[] = [
  {
    id: 'tj1',
    therapistId: 't1',
    date: new Date('2026-02-20'),
    mood: 7,
    thoughtsAndFeelings: 'Good day overall. Had a breakthrough session with a client working through trauma — felt rewarding but emotionally draining. Need to be mindful of my own boundaries and energy levels. Supervision session tomorrow will be helpful to process.',
    sharedWithSupervisor: true,
    createdAt: new Date('2026-02-20T18:30:00'),
  },
  {
    id: 'tj2',
    therapistId: 't1',
    date: new Date('2026-02-18'),
    mood: 5,
    thoughtsAndFeelings: 'Feeling a bit overwhelmed with caseload. Three back-to-back sessions today left me drained. I noticed some countertransference with a client who reminds me of a family member. Will bring this to supervision.',
    sharedWithSupervisor: true,
    createdAt: new Date('2026-02-18T20:00:00'),
  },
  {
    id: 'tj3',
    therapistId: 't1',
    date: new Date('2026-02-15'),
    mood: 8,
    thoughtsAndFeelings: 'Attended a wonderful peer consultation group today. Discussed complex cases and felt supported by colleagues. Reminded me why I love this work. Feeling recharged and motivated for next week.',
    sharedWithSupervisor: false,
    createdAt: new Date('2026-02-15T17:00:00'),
  },
  {
    id: 'tj4',
    therapistId: 't1',
    date: new Date('2026-02-12'),
    mood: 4,
    thoughtsAndFeelings: 'Difficult day. A long-term client terminated unexpectedly. Feeling a mix of sadness and self-doubt. Rationally I know it\'s their choice, but emotionally it\'s hard not to question myself. Planning to do some self-care this evening.',
    sharedWithSupervisor: true,
    createdAt: new Date('2026-02-12T19:15:00'),
  },
];

// Mock CPD entries
export const mockCpdEntries: CpdEntry[] = [
  {
    id: 'cpd1',
    therapistId: 't1',
    title: 'EMDR Advanced Training — Level 2',
    description: 'Completed the EMDR Europe Level 2 advanced training. Covered complex trauma, dissociative disorders, and recent protocol adaptations. 30 CPD hours awarded.',
    link: 'https://emdr-europe.org/training',
    startDate: new Date('2026-02-10'),
    completedDate: new Date('2026-02-18'),
    createdAt: new Date('2026-02-19T10:00:00'),
  },
  {
    id: 'cpd2',
    therapistId: 't1',
    title: 'Webinar: Ethical Boundaries in Online Therapy',
    description: 'Attended a 2-hour webinar on maintaining ethical boundaries in telehealth settings. Covered informed consent, confidentiality in digital spaces, and managing dual relationships online.',
    link: 'https://example.com/ethics-webinar',
    startDate: new Date('2026-02-14'),
    completedDate: new Date('2026-02-14'),
    createdAt: new Date('2026-02-14T14:00:00'),
  },
  {
    id: 'cpd3',
    therapistId: 't1',
    title: 'Book: "The Body Keeps the Score" — Re-read',
    description: 'Re-read Bessel van der Kolk\'s seminal work on trauma and the body. Took detailed notes on somatic experiencing techniques to integrate into my practice with trauma clients.',
    link: '',
    createdAt: new Date('2026-02-10T09:00:00'),
  },
  {
    id: 'cpd4',
    therapistId: 't1',
    title: 'Peer Supervision Group — February',
    description: 'Monthly peer supervision session with 4 colleagues. Presented a complex case involving co-morbid anxiety and substance use. Received valuable feedback on treatment planning.',
    link: '',
    createdAt: new Date('2026-02-07T16:00:00'),
  },
  {
    id: 'cpd5',
    therapistId: 't1',
    title: 'Conference: BACP Research Conference 2026',
    description: 'Attended the annual BACP research conference. Key takeaways include new evidence on ACT for chronic pain, and the effectiveness of brief interventions in primary care settings. 12 CPD hours.',
    link: 'https://www.bacp.co.uk/events/research-conference',
    startDate: new Date('2026-01-23'),
    completedDate: new Date('2026-01-25'),
    createdAt: new Date('2026-01-25T09:00:00'),
  },
];

// ── Supervision mock data ────────────────────────────────────────

export const mockSupervisionConnections: SupervisionConnection[] = [
  {
    id: 'sc1',
    superviseeId: 't1', // Dr. Sarah Johnson seeks supervision from Michael Chen
    supervisorId: 't2',
    status: 'accepted',
    message: 'Hi Michael, I\'d like to arrange regular supervision. I\'m particularly interested in discussing my work with couples and families.',
    createdAt: new Date('2026-01-10'),
  },
  {
    id: 'sc2',
    superviseeId: 't3', // Dr. Emily Rodriguez is supervised by Dr. Sarah Johnson
    supervisorId: 't1',
    status: 'accepted',
    message: 'Hi Dr. Johnson, I admire your work with trauma and anxiety. I\'d love to have you as my supervisor as I deepen my OCD and eating disorder practice.',
    createdAt: new Date('2026-01-20'),
  },
  // ── James Patterson (t4) supervision connections ──
  {
    id: 'sc3',
    superviseeId: 't2', // Michael Chen supervised by James Patterson
    supervisorId: 't4',
    status: 'accepted',
    message: 'Hi James, I\'d value your perspective on my couples and family work. Your motivational interviewing expertise would complement my practice well.',
    createdAt: new Date('2026-01-08'),
  },
  {
    id: 'sc4',
    superviseeId: 't3', // Emily Rodriguez also requested supervision from James (pending)
    supervisorId: 't4',
    status: 'pending',
    message: 'Hi Mr. Patterson, I\'m looking for additional supervision around substance use issues that come up with my clients. Would you be open to connecting?',
    createdAt: new Date('2026-02-15'),
  },
];

export const mockSupervisionSessions: SupervisionSession[] = [
  {
    id: 'ss1',
    supervisorId: 't2',
    superviseeId: 't1',
    scheduledTime: new Date(2026, 1, 14, 16, 0, 0), // Feb 14
    duration: 60,
    status: 'completed',
    modality: 'video',
    price: 120,
    notes: 'Discussed caseload management and reviewed two complex client presentations. Agreed on next steps for boundary-setting techniques.',
  },
  {
    id: 'ss2',
    supervisorId: 't2',
    superviseeId: 't1',
    scheduledTime: new Date(2026, 1, 23, 16, 0, 0), // Feb 23 (TODAY)
    duration: 60,
    status: 'scheduled',
    modality: 'video',
    price: 120,
  },
  {
    id: 'ss3',
    supervisorId: 't1',
    superviseeId: 't3',
    scheduledTime: new Date(2026, 1, 13, 17, 0, 0), // Feb 13
    duration: 60,
    status: 'completed',
    modality: 'video',
    price: 150,
    notes: 'Explored supervisee\'s experience with trauma-focused CBT cases. Recommended additional CPD in EMDR integration.',
  },
  {
    id: 'ss4',
    supervisorId: 't1',
    superviseeId: 't3',
    scheduledTime: new Date(2026, 1, 27, 17, 0, 0), // Feb 27
    duration: 60,
    status: 'scheduled',
    modality: 'video',
    price: 150,
  },
  // ── James Patterson (t4) supervision sessions with Michael Chen (t2) ──
  {
    id: 'ss5',
    supervisorId: 't4',
    superviseeId: 't2',
    scheduledTime: new Date(2026, 1, 10, 11, 0, 0), // Feb 10
    duration: 60,
    status: 'completed',
    modality: 'video',
    price: 110,
  },
  {
    id: 'ss6',
    supervisorId: 't4',
    superviseeId: 't2',
    scheduledTime: new Date(2026, 1, 24, 11, 0, 0), // Feb 24
    duration: 60,
    status: 'scheduled',
    modality: 'video',
    price: 110,
  },
];

// Therapist journal entries for t3 (Dr. Emily Rodriguez) — visible to her supervisor (t1)
const t3JournalEntries: TherapistJournalEntry[] = [
  {
    id: 'tj-t3-1',
    therapistId: 't3',
    date: new Date('2026-02-19'),
    mood: 6,
    thoughtsAndFeelings: 'Challenging day with a client presenting with severe OCD and co-morbid eating disorder. Struggled with prioritising treatment targets. Need to discuss case formulation with my supervisor Dr. Johnson.',
    sharedWithSupervisor: true,
    createdAt: new Date('2026-02-19T19:00:00'),
  },
  {
    id: 'tj-t3-2',
    therapistId: 't3',
    date: new Date('2026-02-17'),
    mood: 8,
    thoughtsAndFeelings: 'Great progress with ERP work today. A client who couldn\'t enter a supermarket last month managed a full shop. Moments like these remind me why I do this work. Feeling competent and grateful.',
    sharedWithSupervisor: true,
    createdAt: new Date('2026-02-17T18:00:00'),
  },
  {
    id: 'tj-t3-3',
    therapistId: 't3',
    date: new Date('2026-02-14'),
    mood: 4,
    thoughtsAndFeelings: 'Feeling burnt out. Had a difficult conversation with a client\'s parent who questioned the treatment approach. Need to set better boundaries around communications outside sessions. This is personal — not sharing with supervision.',
    sharedWithSupervisor: false,
    createdAt: new Date('2026-02-14T21:00:00'),
  },
  {
    id: 'tj-t3-4',
    therapistId: 't3',
    date: new Date('2026-02-12'),
    mood: 7,
    thoughtsAndFeelings: 'Supervision session with Dr. Johnson was incredibly helpful. We discussed my approach to a complex case and she offered a different perspective on the maintaining factors. I feel more confident in my formulation now.',
    sharedWithSupervisor: true,
    createdAt: new Date('2026-02-12T17:30:00'),
  },
];

// Push t3 entries into the shared array so they persist together
mockTherapistJournalEntries.push(...t3JournalEntries);

// Therapist journal entries for t2 (Michael Chen) — visible to his supervisor (t4 James Patterson)
const t2JournalEntries: TherapistJournalEntry[] = [
  {
    id: 'tj-t2-1',
    therapistId: 't2',
    date: new Date('2026-02-20'),
    mood: 7,
    thoughtsAndFeelings: 'Had a breakthrough with a long-term couples client today. They were able to use the Gottman repair attempts we\'ve been practising. Both partners seemed genuinely surprised at how well it went. Felt really rewarding.',
    sharedWithSupervisor: true,
    createdAt: new Date('2026-02-20T19:00:00'),
  },
  {
    id: 'tj-t2-2',
    therapistId: 't2',
    date: new Date('2026-02-18'),
    mood: 5,
    thoughtsAndFeelings: 'Difficult session with a couple where one partner disclosed infidelity during the session. I managed to hold the space but felt quite shaken afterwards. Need to bring this to supervision with James.',
    sharedWithSupervisor: true,
    createdAt: new Date('2026-02-18T20:30:00'),
  },
  {
    id: 'tj-t2-3',
    therapistId: 't2',
    date: new Date('2026-02-15'),
    mood: 8,
    thoughtsAndFeelings: 'Attended a fantastic EFT training workshop. Picked up some new techniques for working with attachment injuries in couples. Excited to integrate these into my practice.',
    sharedWithSupervisor: false,
    createdAt: new Date('2026-02-15T17:00:00'),
  },
  {
    id: 'tj-t2-4',
    therapistId: 't2',
    date: new Date('2026-02-12'),
    mood: 6,
    thoughtsAndFeelings: 'Supervision session with James was really grounding. We explored my countertransference with a family case where the dynamics mirror some of my own family patterns. His motivational interviewing lens helped me see the ambivalence more clearly.',
    sharedWithSupervisor: true,
    createdAt: new Date('2026-02-12T18:00:00'),
  },
];
mockTherapistJournalEntries.push(...t2JournalEntries);

// Theme settings for therapists
export let mockThemeSettings: ThemeSettings = {
  primaryColor: '#3b82f6', // blue-500
  supervisionColor: '#ec4899', // pink-500
  workshopColor: '#f97316', // orange-500
  // Modality colors
  videoColor: '#8b5cf6', // violet-500
  inPersonColor: '#10b981', // green-500
  textColor: '#06b6d4', // cyan-500
  phoneCallColor: '#f59e0b', // amber-500
  // General colors
  accentColor: '#06b6d4', // cyan-500
  successColor: '#10b981', // green-500
  warningColor: '#f59e0b', // amber-500
  errorColor: '#ef4444', // red-500
  // Dark mode color variants (slightly brighter/lighter for dark backgrounds)
  darkPrimaryColor: '#60a5fa', // blue-400
  darkSupervisionColor: '#f472b6', // pink-400
  darkWorkshopColor: '#fb923c', // orange-400
  darkVideoColor: '#a78bfa', // violet-400
  darkInPersonColor: '#34d399', // emerald-400
  darkTextColor: '#22d3ee', // cyan-400
  darkPhoneCallColor: '#fbbf24', // amber-400
  darkAccentColor: '#22d3ee', // cyan-400
  darkSuccessColor: '#34d399', // emerald-400
  darkWarningColor: '#fbbf24', // amber-400
  darkErrorColor: '#f87171', // red-400
  // Dark mode
  darkMode: false,
};

// ---- DEV-ONLY: hydrate mutable arrays from localStorage ---------------------
// (Remove this block for production — see devPersistence.ts header for full guide)
import { hydrateMockData, hydrateThemeSettings } from "./devPersistence";
hydrateMockData(mockConnections, mockProBonoTokens, mockMessages, mockSessionNotes, mockClientCourseBookings, mockTherapistJournalEntries, mockCpdEntries, mockSupervisionConnections, mockSupervisionSessions, mockTherapistBookmarks, mockVideoSessions, mockTherapists as unknown[]);

// Hydrate theme settings from localStorage
const savedTheme = hydrateThemeSettings();
if (savedTheme) {
  Object.assign(mockThemeSettings, savedTheme);
}