# Therapy Connect Backend Specification

> **Purpose**: This document provides a Claude agent in a VS Code Azure Functions environment with everything needed to implement the full backend: TypeScript types, SQL schema, stored procedures, repository layer, service layer, and HTTP-triggered Azure Functions. The frontend is a React 18 SPA that currently uses in-memory mock data behind a service abstraction layer; the goal is to swap mock implementations for real Azure Function HTTP calls without changing any component code.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Enums (Lookup Tables)](#4-enums-lookup-tables)
5. [Domain Types (TypeScript Interfaces)](#5-domain-types-typescript-interfaces)
6. [Database Schema (SQL)](#6-database-schema-sql)
7. [API Envelope & Pagination](#7-api-envelope--pagination)
8. [API Endpoints & DTOs](#8-api-endpoints--dtos)
9. [Business Rules & Constraints](#9-business-rules--constraints)
10. [Stored Procedures](#10-stored-procedures)
11. [Repository Layer](#11-repository-layer)
12. [Service Layer](#12-service-layer)
13. [Azure Functions Structure](#13-azure-functions-structure)
14. [Data Relationships Diagram](#14-data-relationships-diagram)
15. [Error Handling & Middleware](#15-error-handling--middleware)

---

## 1. System Overview

**Therapy Connect** is a therapist-client connection platform. The tagline is "Ethical, not corporate". Popular platforms reportedly take 60-75% of session costs; Therapy Connect only takes 10%. Two user roles exist:

| Role | Home Route | Description |
|------|-----------|-------------|
| **Client** | `/c` | Searches therapists, books sessions, writes journal entries, takes wellbeing assessments, writes session reflections, follows therapists for insights, purchases course packages |
| **Therapist** | `/t` | Manages profile & availability, sets session rates, creates posts/insights for client feeds, writes session notes, manages workshops, supervises other therapists, awards pro bono tokens, creates course packages |

> **Public homepage**: The About page lives at `/` (via `PublicHome` wrapper) and redirects authenticated users to `/c` or `/t` based on role. The login page is at `/login`. All client routes are under `/c/...` and all therapist routes under `/t/...`, protected by `AuthGuard` inside `RootLayout`. A global catch-all route redirects any unmatched URL to `/`.

**Currency**: GBP (pounds sterling, symbol `£`). All monetary values are stored in pence (integer) or as decimal with 2dp.

**Key flows**:
- Client-therapist connection requests (pending -> accepted/rejected)
- Session booking against availability windows with rate selection
- Over-capacity "request only" bookings requiring therapist approval (pending -> approved -> paid / declined)
- Messages with optional embedded session request data and bookmark attachments
- Therapist-to-therapist supervision connections and sessions
- Journal sharing: client can share entries with specific therapists; therapist can share with supervisor

---

## 2. Architecture

```
Frontend (React 18 + Vite)
    |
    | HTTPS (JSON)
    v
Azure Functions (Node.js / TypeScript)
    |
    | SQL queries via repository layer
    v
Azure SQL Database (or PostgreSQL)
```

### Layers

```
Azure Function (HTTP trigger)
  -> validates request, extracts auth
  -> calls Service method
     -> calls Repository method(s)
        -> executes SQL / stored procedure
        -> returns typed result
     -> applies business logic
     -> returns typed response
  -> wraps in ApiResponse envelope
  -> returns HTTP response
```

### Project Structure (Azure Functions)

```
/functions
  /src
    /types              # Shared TypeScript interfaces & enums (mirror frontend)
      /shared
      /client
      /therapist
    /repositories       # Data access layer (SQL queries)
      /shared
      /client
      /therapist
    /services           # Business logic layer
      /shared
      /client
      /therapist
    /functions          # Azure Function HTTP triggers
      /auth
      /connections
      /messages
      /sessions
      /session-requests
      /therapists
      /clients
      /posts
      /workshops
      /assessments
      /client-notes
      /journal
      /therapist-journal
      /cpd
      /session-notes
      /supervision
      /bookmarks
      /course-packages
      /course-bookings
      /pro-bono
      /settings
    /middleware          # Auth middleware, error handling
    /utils              # Helpers (pagination, scoring, etc.)
    /db                 # SQL migrations, connection pool
```

---

## 3. Authentication & Authorization

### Model
- **Azure AD B2C** or custom JWT-based auth
- Each request includes `Authorization: Bearer <token>` header
- Token payload contains: `{ sub: string, email: string, role: "client" | "therapist", userId: string }`

### Endpoints

| Method | Path | Body | Response | Notes |
|--------|------|------|----------|-------|
| POST | `/api/auth/login` | `{ email, password }` | `AuthResponse` | Returns JWT |
| POST | `/api/auth/register` | `{ name, email, password, type }` | `AuthResponse` | Creates user + profile |
| POST | `/api/auth/logout` | - | `null` | Invalidates token |
| GET | `/api/auth/me` | - | `AuthResponse` | Validates JWT, returns user |
| POST | `/api/auth/refresh` | - | `{ token }` | Issues new JWT |
| POST | `/api/auth/forgot-password` | `{ email }` | `{ message }` | Sends reset email |
| POST | `/api/auth/reset-password` | `{ token, newPassword }` | `{ message }` | Resets password |

### AuthResponse

```typescript
interface AuthResponse {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: "client" | "therapist";
  token?: string;
}
```

### Authorization Rules

| Resource | Client Access | Therapist Access |
|----------|--------------|-----------------|
| Own profile | Read/Write | Read/Write |
| Other therapist profiles | Read (public fields) | Read (public fields) |
| Other client profiles | None | Read (connected clients only) |
| Messages | Read/Write (own conversations) | Read/Write (own conversations) |
| Journal entries | Read/Write (own) | Read (shared entries from connected clients) |
| Assessments | Read/Write (own) | Read (connected client assessments) |
| Session notes | Read (own sessions, therapist-authored) | Read/Write (own authored) |
| Client notes | Read/Write (own) | None |
| Posts | Read all, Like | Read/Write (own), Read (others) |
| Workshops | Read all, Register | Read/Write (own), Read (others) |
| Availability | Read (connected therapist) | Read/Write (own) |
| Session rates | Read (public) | Read/Write (own) |
| Course packages | Read (public, active) | Read/Write (own) |
| Course bookings | Read/Write (own) | Read (own clients) |
| Pro bono tokens | Read (own tokens) | Read/Write (own issued) |
| Supervision | N/A | Read/Write (own connections/sessions) |
| Bookmarks | N/A | Read/Write (own) |
| CPD entries | N/A | Read/Write (own) |
| Therapist journal | N/A | Read/Write (own); supervisor reads shared |
| Theme settings | Read/Write (own) | Read/Write (own) |

---

## 4. Enums (Lookup Tables)

Each enum should be stored as an integer in the database and mapped to its TypeScript enum on the API boundary. Create SQL lookup tables for each.

### Shared Enums

#### Title
```typescript
enum Title {
  NotSpecified = 0, Mr = 1, Mrs = 2, Miss = 3, Ms = 4, Mx = 5,
  Dr = 6, Prof = 7, Rev = 8, Sir = 9, Lady = 10, Lord = 11,
  Dame = 12, Other = 13
}
```

#### Gender
```typescript
enum Gender {
  NotSpecified = 0, Male = 1, Female = 2, NonBinary = 3,
  PreferNotToSay = 4, Other = 5
}
```

#### Orientation
```typescript
enum Orientation {
  NotSpecified = 0, Straight = 1, Gay = 2, Lesbian = 3, Bisexual = 4,
  Pansexual = 5, Asexual = 6, Queer = 7, PreferNotToSay = 8, Other = 9
}
```

#### SpokenLanguageCode
```typescript
enum SpokenLanguageCode {
  EN = "en", ES = "es", FR = "fr", DE = "de", IT = "it", PT = "pt",
  RU = "ru", ZH = "zh", JA = "ja", KO = "ko", AR = "ar", HI = "hi",
  TR = "tr", PL = "pl", NL = "nl", SV = "sv", NO = "no", DA = "da",
  FI = "fi", EL = "el", HE = "he", UR = "ur", FA = "fa", VI = "vi", TH = "th"
}
```
> Note: This enum uses string values. Store as `VARCHAR(5)` in SQL.

#### LanguageProficiency
```typescript
enum LanguageProficiency {
  NotSpecified = 0, Native = 1, Fluent = 2, Conversational = 3,
  Basic = 4, None = 5
}
```

#### ImageType
```typescript
enum ImageType {
  ProfilePicture = 0, CoverPhoto = 1, QualificationDocument = 2,
  MembershipDocument = 3, InsuranceDocument = 4, Other = 99
}
```

#### SessionType
```typescript
enum SessionType {
  Counselling = 0, Psychotherapy = 1, Couples = 2, Group = 3,
  Family = 4, Supervision = 5
}
```

#### AreaOfFocus
```typescript
// 104 values — see full enum below
enum AreaOfFocus {
  ABD = 0,   // Abandonment Issues
  ADD = 1,   // Attention Deficit Disorder
  ADH = 2,   // ADHD
  AFC = 3,   // Adoption and Foster Care Issues
  AGI = 4,   // Aging Issues
  AGR = 5,   // Anger Management
  ASD = 6,   // Autism Spectrum Disorder
  ASP = 7,   // Antisocial Personality Disorder
  ATC = 8,   // Attachment issues
  AVP = 9,   // Avoidant Personality Disorder
  AX  = 10,  // Anxiety
  BDSM = 11, // BDSM and Kink
  BDI = 12,  // Body Image
  BFI = 13,  // Blended Families Issues
  BIP = 14,  // Bipolar Disorder
  BOR = 15,  // Borderline Personality Disorder
  BUR = 16,  // Burnout
  CAN = 17,  // Cancer
  CI  = 18,  // Commitment Issues
  CIS = 19,  // Caregiver Issues
  CMD = 20,  // Co-morbidity
  CNT = 21,  // Control
  CD  = 22,  // Codependency
  CP  = 23,  // Communication Problems
  CPI = 24,  // Chronic Pain / Illness
  CWD = 25,  // Coping with disaster
  DBT = 26,  // Disabilities
  DEP = 27,  // Depression
  DIS = 28,  // Dissociative Disorders
  DMDD = 29, // Disruptive Mood Dysregulation Disorder
  DP  = 30,  // Dependant Personality Disorder
  DV  = 31,  // Domestic Violence
  DVS = 32,  // Divorce / Separation
  EFD = 33,  // Eating Disorders
  EMP = 34,  // Emptiness / Apathy
  EOL = 35,  // End of Life Issues
  ESI = 36,  // Emergency Services Issues
  FAM = 37,  // Family Issues
  FGV = 38,  // Forgiveness
  FHD = 39,  // Fatherhood Issues
  FRT = 40,  // Fertility and Reproductive Issues
  GID = 41,  // Gender Identity Disorder
  GRF = 42,  // Grief and Loss
  GS  = 43,  // Guilt / Shame
  HI  = 44,  // Hearing Impairment
  HIV = 45,  // HIV/AIDS
  HRD = 46,  // Hoarding Disorder
  IL  = 47,  // Isolation / Loneliness
  IMG = 48,  // Immigration Issues
  IMP = 49,  // Impulsivity
  INF = 50,  // Infidelity
  INS = 51,  // Insomnia / Sleep Disorders
  INT = 52,  // Internet/Technology Addiction
  JLY = 53,  // Jealousy
  LDI = 54,  // Learning Disabilities
  LGB = 55,  // LGBTQ+ Issues
  LP  = 56,  // Life Purpose
  MCC = 57,  // Multi Cultural Concerns
  MD  = 58,  // Mood Disorders
  MFI = 59,  // Money / Financial Issues
  MHD = 60,  // Motherhood Issues
  MI  = 61,  // Mens Issues
  MLC = 62,  // Mid Life Crisis
  NRC = 63,  // Narcissism
  NSA = 64,  // Non substance Addiction
  OCD = 65,  // Obsessive Compulsive Disorder
  OPD = 66,  // Oppositional Defiant Disorder
  PAR = 67,  // Parenting Issues
  PCB = 68,  // Pregnancy / Childbirth
  PD  = 69,  // Personality Disorders
  PER = 70,  // Perfectionism
  PH  = 71,  // Phobias
  PNC = 72,  // Panic Disorder and Panic Attacks
  PNMR = 73, // Polyamory / Non-Monogamous Relationships
  PPD = 74,  // Postpartum Depression
  PRN = 75,  // Paranoia
  PTS = 76,  // Post-Traumatic Stress Disorder
  REL = 77,  // Relationship Issues
  SA  = 78,  // Substance Abuse / Addiction
  SAD = 79,  // Seasonal Affective Disorder
  SCH = 80,  // Schizophrenia
  SE  = 81,  // Self-Esteem
  SEX = 82,  // Sexual Issues
  SH  = 83,  // Self-Harm
  SL  = 84,  // Self-Love
  SOC = 85,  // Social Anxiety
  SOM = 86,  // Somatization Disorder
  STR = 87,  // Stress Management
  SUP = 88,  // Support Groups
  SVC = 89,  // Smoking / Vaping Cessation
  SXD = 90,  // Sexual Dysfunction
  SXI = 91,  // Sexual Identity
  TBI = 92,  // Traumatic Brain Injury
  TIC = 93,  // Tic Disorders
  TRA = 94,  // Trauma (general)
  TRI = 95,  // Trichotillomania
  VAI = 96,  // Veteran and Armed Forces Issues
  VI  = 97,  // Visual Impairment
  WOI = 98,  // Womens Issues
  WPI = 99,  // Work / Professional Issues
  YAI = 100, // Youth and Adolescents
  SPT = 101, // Spiritual Therapy
  RLT = 102, // Religious Therapy
  BEM = 103, // Black and Ethnic Minority
}
```

### Therapist Enums

#### TherapistType
```typescript
enum TherapistType {
  CON = 0, LIB = 1, NRG = 2, CHR = 3, MUS = 4, HIN = 5,
  JUD = 6, BUD = 7, POC = 8, OLD = 9, LGB = 10
}
```

#### ClinicalApproach
```typescript
enum ClinicalApproach {
  ABT = 0,  // Attachment-Based Therapy
  ACT = 1,  // Acceptance and Commitment Therapy
  AT  = 2,  // Art Therapy
  BT  = 3,  // Behavioral Therapy
  CBT = 4,  // Cognitive Behavioral Therapy
  CCT = 5,  // Client-Centered Therapy
  DBT = 6,  // Dialectical Behavior Therapy
  EFT = 7,  // Emotionally Focused Therapy
  EMDR = 8, // Eye Movement Desensitization and Reprocessing
  EXT = 9,  // Existential Therapy
  GMM = 10, // Gottman
  GT  = 11, // Gestalt Therapy
  HT  = 12, // Humanistic Therapy
  HYP = 13, // Hypnotherapy
  IFST = 14,// Internal Family Systems Therapy
  IPT = 15, // Interpersonal Therapy
  IRT = 16, // Imago Relationship Therapy
  IT  = 17, // Integrative Therapy
  JT  = 18, // Jungian Therapy
  MIT = 19, // Mindfulness-Based Interventions
  MOI = 20, // Motivational Interviewing
  NAT = 21, // Narrative Therapy
  PDT = 22, // Psychodynamic Therapy
  PSA = 23, // Psychoanalytic Therapy
  PT  = 24, // Play Therapy
  RT  = 25, // Reality Therapy
  SFT = 26, // Solution-Focused Therapy
  SMT = 27, // Somatic Therapy
  SYT = 28, // Systemic Therapy
  TFT = 29, // Trauma-Focused Therapy
}
```

#### GoverningBody
```typescript
// 52 values — includes UK, US, Canada, Australia, NZ, Ireland, EU, and international bodies
enum GoverningBody {
  BACP = 0, UKCP = 1, HCPC = 2, BPS = 3, NCPS = 4, COSCA = 5,
  APA = 6, ACA = 7, AAMFT = 8, NASW = 9, NBCC = 10, ABPP = 11, ABCT = 12, ADAA = 13,
  CPA = 14, CCPA = 15, CASW = 16, CRPO = 17, CPBC = 18,
  APS = 19, PACFA = 20, AASW = 21, AHPRA = 22,
  NZPS = 23, NZAC = 24, NZAP = 25,
  PSI = 26, IACP = 27, IAHIP = 28,
  EAP = 29, EFPA = 30, EAC = 31,
  BDP = 32, DGTV = 33, SFP = 34, SNPPsy = 35,
  NIP = 36, VGCt = 37, FSP = 38, SBAP = 39,
  OPL = 40, CNOP = 41, COP = 42,
  NPF = 43, SPR = 44, DP = 45,
  JPA = 46, PsySSA = 47, HPCSA = 48,
  IUPsyS = 49, WCP = 50, IAAP = 51,
  Other = 99, NotApplicable = 100
}
```

#### MembershipLevel
```typescript
// 73 values — body-specific levels plus generic levels
enum MembershipLevel {
  // BACP
  BACPRegistered = 0, BACPAccredited = 1, BACPSeniorAccredited = 2,
  // UKCP
  UKCPRegistered = 3, UKCPAccredited = 4, UKCPSenior = 5,
  // BPS
  BPSStudent = 6, BPSGraduate = 7, BPSChartered = 8, BPSFellow = 9,
  // HCPC
  HCPCRegistered = 10,
  // NCPS
  NCPSMember = 11, NCPSAccredited = 12,
  // COSCA
  COSCAMember = 13, COSCAAccredited = 14,
  // APA
  APAStudent = 15, APAMember = 16, APAFellow = 17, APADiplomate = 18,
  // ACA
  ACAStudent = 19, ACARegular = 20, ACAProfessional = 21,
  // AAMFT
  AAMFTStudent = 22, AAMFTAssociate = 23, AAMFTClinical = 24, AAMFTApproved = 25,
  // NASW
  NASWStudent = 26, NASWRegular = 27, NASWQualified = 28,
  // NBCC
  NBCCCertified = 29,
  // CPA
  CPAStudent = 30, CPARegular = 31, CPAFellow = 32,
  // CCPA
  CCPAStudent = 33, CCPARegular = 34, CCPACertified = 35,
  // CRPO
  CRPORegistered = 36,
  // APS
  APSStudent = 37, APSAssociate = 38, APSMember = 39, APSFellow = 40,
  // PACFA
  PACFARegistrar = 41, PACFAClinical = 42,
  // AHPRA
  AHPRAGeneral = 43, AHPRASpecialist = 44,
  // NZPS
  NZPSStudent = 45, NZPSAssociate = 46, NZPSMember = 47, NZPSFellow = 48,
  // NZAC
  NZACProvisional = 49, NZACMember = 50,
  // PSI
  PSIStudent = 51, PSIAssociate = 52, PSIMember = 53, PSIFellow = 54,
  // IACP
  IACPStudent = 55, IACPMember = 56, IACPAccredited = 57,
  // EAP
  EAPMember = 58, EAPCertified = 59,
  // Generic
  Student = 60, Trainee = 61, Associate = 62, Member = 63,
  Regular = 64, Professional = 65, Senior = 66, Fellow = 67,
  Accredited = 68, Registered = 69, Licensed = 70, Certified = 71,
  Chartered = 72, Other = 99
}
```

### Modality (string union, not numeric enum)
```typescript
type Modality = "video" | "inPerson" | "text" | "phoneCall";
```
Store as `VARCHAR(20)` in SQL.

### UserType (string union)
```typescript
type UserType = "client" | "therapist";
```
Store as `VARCHAR(10)` in SQL.

---

## 5. Domain Types (TypeScript Interfaces)

### 5.1 Shared Types

#### User (base)
```typescript
interface User {
  id: string;
  type: UserType;           // "client" | "therapist"
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  location?: string;
}
```

#### ThemeSettings
```typescript
interface ThemeSettings {
  primaryColor: string;      // hex e.g. "#3b82f6"
  supervisionColor: string;
  workshopColor: string;
  videoColor: string;
  inPersonColor: string;
  textColor: string;
  phoneCallColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  // Dark mode variants (all hex)
  darkPrimaryColor: string;
  darkSupervisionColor: string;
  darkWorkshopColor: string;
  darkVideoColor: string;
  darkInPersonColor: string;
  darkTextColor: string;
  darkPhoneCallColor: string;
  darkAccentColor: string;
  darkSuccessColor: string;
  darkWarningColor: string;
  darkErrorColor: string;
  darkMode: boolean;
}
```

#### SessionRate
```typescript
interface SessionRate {
  id: string;
  title: string;             // e.g. "50-min Video Session"
  modality: Modality;
  duration: number;          // minutes
  price: number;             // GBP
  cooldown?: number;         // minutes after session
  isSupervision?: boolean;   // true = only for supervision bookings
}
```

#### ContactDetails
```typescript
interface ContactDetails {
  email: string;
  mobileNumber: string;
  street: string;
  city: string;
  postCode: string;
  country?: string;
}
```

#### ProfileLink
```typescript
interface ProfileLink {
  id: string;
  title: string;
  url: string;
}
```

#### SpokenLanguage
```typescript
interface SpokenLanguage {
  id: string;
  languageCode: SpokenLanguageCode;
  proficiency: LanguageProficiency;
}
```

#### Education
```typescript
interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  yearCompleted: number;
}
```

#### Image
```typescript
interface Image {
  id: string;
  imageType: ImageType;
  url: string;
  altText?: string;
}
```

#### ConnectionRequest
```typescript
interface ConnectionRequest {
  id: string;
  clientId: string;
  therapistId: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  createdAt: Date;
}
```

#### SessionRequestData (embedded in Message)
```typescript
interface SessionRequestData {
  id: string;                    // PK — used in API paths and approve/decline/pay actions
  sessionId: string;           // FK to VideoSession
  sessionType: string;         // display label e.g. "50-min Video Session"
  date: string;                // formatted "Mon, 24 Feb 2026"
  time: string;                // "09:00 - 09:50"
  duration: number;            // minutes
  price: number;               // GBP
  modality: Modality;
  status: "pending" | "approved" | "declined" | "paid";
}
```

#### Message
```typescript
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  bookmark?: {                 // optional link attachment
    title: string;
    url: string;
  };
  sessionRequest?: SessionRequestData;  // optional embedded session request
}
```

#### VideoSession
```typescript
interface VideoSession {
  id: string;
  therapistId: string;
  clientId: string;
  scheduledTime: Date;
  duration: number;            // minutes
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  sessionRateId?: string;
  modality?: Modality;
  azureRoomId?: string;        // Azure Communication Services room
  isPaid?: boolean;
  price?: number;              // GBP
  requiresApproval?: boolean;  // true when booked beyond maxOccupancy
}
```

#### ProBonoToken
```typescript
interface ProBonoToken {
  id: string;
  therapistId: string;
  clientId: string;
  sessionRateId: string;
  sessionRateTitle: string;    // denormalised for display
  createdAt: Date;
  usedAt?: Date;
  status: "available" | "used" | "expired";
}
```

### 5.2 Client Types

#### Client (extends User)
```typescript
interface Client extends User {
  type: "client";
  areasOfFocus?: string[];        // free-text labels
  areasOfFocusDetails?: string;   // narrative text
  followedTherapists?: string[];  // therapist IDs
}
```

#### JournalEntry
```typescript
type MoodRating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type PhysicalRating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type SleepQuality = "excellent" | "good" | "fair" | "poor" | "veryPoor";
type AnxietyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type StressLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

interface JournalEntry {
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
  sharedWithTherapistIds: string[];  // which therapists can see this
  createdAt: Date;
  updatedAt: Date;
}
```

#### Assessment (PHQ-9 + GAD-7)
```typescript
type AssessmentFrequency = 0 | 1 | 2 | 3;
// 0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day

interface PHQ9Response {
  littleInterest: AssessmentFrequency;
  feelingDown: AssessmentFrequency;
  sleepProblems: AssessmentFrequency;
  feelingTired: AssessmentFrequency;
  appetiteProblems: AssessmentFrequency;
  feelingBad: AssessmentFrequency;
  troubleConcentrating: AssessmentFrequency;
  movingSpeaking: AssessmentFrequency;
  selfHarmThoughts: AssessmentFrequency;
  functionalImpairment?: "notDifficult" | "somewhatDifficult" | "veryDifficult" | "extremelyDifficult";
}

interface GAD7Response {
  feelingNervous: AssessmentFrequency;
  cantStopWorrying: AssessmentFrequency;
  worryingTooMuch: AssessmentFrequency;
  troubleRelaxing: AssessmentFrequency;
  beingRestless: AssessmentFrequency;
  easilyAnnoyed: AssessmentFrequency;
  feelingAfraid: AssessmentFrequency;
  functionalImpairment?: "notDifficult" | "somewhatDifficult" | "veryDifficult" | "extremelyDifficult";
}

interface Assessment {
  id: string;
  clientId: string;
  therapistId: string;
  date: Date;
  phq9: PHQ9Response;
  gad7: GAD7Response;
  phq9Score: number;   // server-calculated sum of 9 items (0-27)
  gad7Score: number;   // server-calculated sum of 7 items (0-21)
  createdAt: Date;
}
```

#### ClientNote (client-authored session reflection)
```typescript
interface ClientNote {
  id: string;
  clientId: string;
  sessionId?: string;   // optional FK to VideoSession
  content: string;
  createdAt: Date;
}
```

#### ClientCourseBooking
```typescript
interface ClientCourseBooking {
  id: string;
  clientId: string;
  therapistId: string;
  coursePackageId: string;
  courseTitle: string;          // denormalised
  sessionRateId: string;
  totalSessions: number;
  sessionsUsed: number;
  totalPrice: number;          // GBP
  purchaseDate: Date;
  status: "active" | "completed" | "cancelled";
}
```

### 5.3 Therapist Types

#### Therapist (extends User) — public listing model
```typescript
interface Therapist extends User {
  type: "therapist";
  credentials: string;
  specializations: string[];
  clinicalApproaches: string[];
  yearsOfExperience: number;
  education: string[];
  bio: string;
  hourlyRate: number;
  availability: string;           // display string e.g. "Mon-Fri, 9 AM - 6 PM"
  bannerImage?: string;
  sessionRates?: SessionRate[];
  availabilityWindows?: AvailabilityWindow[];
  governingBodyMemberships?: GoverningBodyMembership[];
  coursePackages?: CoursePackage[];
  sessionTypes?: SessionType[];
  supervisionBio?: string;
}
```

#### TherapistProfile — extended profile (full detail form)
```typescript
interface TherapistProfile {
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
```

#### GoverningBodyMembership
```typescript
interface GoverningBodyMembership {
  id: string;
  governingBody: GoverningBody;
  membershipLevel: MembershipLevel;
  membershipNumber: string;
  yearObtained?: number;
}
```

#### AvailabilityWindow
```typescript
interface AvailabilityWindow {
  date: string;              // "YYYY-MM-DD"
  startTime: string;         // "HH:MM" (24h)
  endTime: string;           // "HH:MM" (24h)
  enabledRateIds: string[];  // which session rates can be booked
  maxOccupancy?: number;     // max booked MINUTES; beyond this = "request only"
}
```

#### Workshop
```typescript
interface Workshop {
  id: string;
  therapistId: string;
  title: string;
  description: string;
  scheduledTime: Date;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  modality?: "video" | "inPerson";
  isRegistered?: boolean;    // client-specific (computed per-request)
}
```

#### Post
```typescript
interface Post {
  id: string;
  therapistId: string;
  content: string;
  link?: string;
  timestamp: Date;
  likes: string[];           // array of user IDs
}
```

#### SessionNote (therapist-authored)
```typescript
interface SessionNote {
  id: string;
  clientId: string;
  therapistId: string;
  sessionId?: string;        // optional FK to VideoSession
  content: string;
  createdAt: Date;
}
```

#### TherapistBookmark
```typescript
interface TherapistBookmark {
  id: string;
  therapistId: string;
  title: string;
  url: string;
  createdAt: Date;
}
```

#### CoursePackage
```typescript
interface CoursePackage {
  id: string;
  therapistId: string;
  title: string;
  description: string;
  sessionRateId: string;     // which session rate type each session uses
  totalSessions: number;
  totalPrice: number;        // flat fee for the whole course
  isActive: boolean;
}
```

#### TherapistJournalEntry
```typescript
interface TherapistJournalEntry {
  id: string;
  therapistId: string;
  date: Date;
  mood: number;              // 1-10
  thoughtsAndFeelings: string;
  sharedWithSupervisor: boolean;
  createdAt: Date;
}
```

#### CpdEntry (Continuing Professional Development)
```typescript
interface CpdEntry {
  id: string;
  therapistId: string;
  title: string;
  description: string;
  link?: string;
  startDate?: Date;
  completedDate?: Date;
  createdAt: Date;
}
```

#### SupervisionConnection
```typescript
interface SupervisionConnection {
  id: string;
  superviseeId: string;     // therapist seeking supervision
  supervisorId: string;     // therapist offering supervision
  status: "pending" | "accepted" | "rejected";
  message?: string;
  createdAt: Date;
}
```

#### SupervisionSession
```typescript
interface SupervisionSession {
  id: string;
  supervisorId: string;
  superviseeId: string;
  scheduledTime: Date;
  duration: number;
  status: "scheduled" | "completed" | "cancelled";
  modality: "video" | "inPerson" | "phoneCall";
  price?: number;
  notes?: string;   // supervisor's session notes (added post-session)
}
```

---

## 6. Database Schema (SQL)

### Conventions
- Primary keys: `Id UNIQUEIDENTIFIER DEFAULT NEWID()` (or `NVARCHAR(50)` if you prefer string IDs matching frontend patterns)
- Timestamps: `DATETIME2` with `DEFAULT GETUTCDATE()`
- Monetary values: `DECIMAL(10,2)`
- All tables include `CreatedAt` and where appropriate `UpdatedAt`
- Enum columns store integer values, with optional lookup tables for display labels
- Array fields (likes, sharedWithTherapistIds, enabledRateIds) use junction tables
- JSON columns can be used for nested objects (PHQ-9/GAD-7 responses, bookmark data in messages) where querying individual fields is not required

### Core Tables

```sql
-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE Users (
    Id              NVARCHAR(50)    PRIMARY KEY,
    UserType        NVARCHAR(10)    NOT NULL CHECK (UserType IN ('client', 'therapist')),
    Name            NVARCHAR(200)   NOT NULL,
    Email           NVARCHAR(320)   NOT NULL UNIQUE,
    PasswordHash    NVARCHAR(500)   NOT NULL,
    Avatar          NVARCHAR(2000)  NULL,
    Phone           NVARCHAR(50)    NULL,
    Location        NVARCHAR(200)   NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================================
-- THEME SETTINGS (per-user)
-- ============================================================
CREATE TABLE ThemeSettings (
    UserId              NVARCHAR(50)    PRIMARY KEY REFERENCES Users(Id),
    PrimaryColor        NVARCHAR(9)     NOT NULL DEFAULT '#3b82f6',
    SupervisionColor    NVARCHAR(9)     NOT NULL DEFAULT '#ec4899',
    WorkshopColor       NVARCHAR(9)     NOT NULL DEFAULT '#f97316',
    VideoColor          NVARCHAR(9)     NOT NULL DEFAULT '#8b5cf6',
    InPersonColor       NVARCHAR(9)     NOT NULL DEFAULT '#10b981',
    TextColor           NVARCHAR(9)     NOT NULL DEFAULT '#06b6d4',
    PhoneCallColor      NVARCHAR(9)     NOT NULL DEFAULT '#f59e0b',
    AccentColor         NVARCHAR(9)     NOT NULL DEFAULT '#06b6d4',
    SuccessColor        NVARCHAR(9)     NOT NULL DEFAULT '#10b981',
    WarningColor        NVARCHAR(9)     NOT NULL DEFAULT '#f59e0b',
    ErrorColor          NVARCHAR(9)     NOT NULL DEFAULT '#ef4444',
    DarkPrimaryColor    NVARCHAR(9)     NOT NULL DEFAULT '#60a5fa',
    DarkSupervisionColor NVARCHAR(9)    NOT NULL DEFAULT '#f472b6',
    DarkWorkshopColor   NVARCHAR(9)     NOT NULL DEFAULT '#fb923c',
    DarkVideoColor      NVARCHAR(9)     NOT NULL DEFAULT '#a78bfa',
    DarkInPersonColor   NVARCHAR(9)     NOT NULL DEFAULT '#34d399',
    DarkTextColor       NVARCHAR(9)     NOT NULL DEFAULT '#22d3ee',
    DarkPhoneCallColor  NVARCHAR(9)     NOT NULL DEFAULT '#fbbf24',
    DarkAccentColor     NVARCHAR(9)     NOT NULL DEFAULT '#22d3ee',
    DarkSuccessColor    NVARCHAR(9)     NOT NULL DEFAULT '#34d399',
    DarkWarningColor    NVARCHAR(9)     NOT NULL DEFAULT '#fbbf24',
    DarkErrorColor      NVARCHAR(9)     NOT NULL DEFAULT '#f87171',
    DarkMode            BIT             NOT NULL DEFAULT 0
);

-- ============================================================
-- CLIENT PROFILE
-- ============================================================
CREATE TABLE ClientProfiles (
    UserId              NVARCHAR(50)    PRIMARY KEY REFERENCES Users(Id),
    AreasOfFocusDetails NVARCHAR(MAX)   NULL,
    CreatedAt           DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- Client areas of focus (free-text tags)
CREATE TABLE ClientAreasOfFocus (
    Id          INT             IDENTITY(1,1) PRIMARY KEY,
    ClientId    NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Label       NVARCHAR(200)   NOT NULL,
    UNIQUE(ClientId, Label)
);

-- Client followed therapists
CREATE TABLE ClientFollowedTherapists (
    ClientId    NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    TherapistId NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    CreatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (ClientId, TherapistId)
);

-- ============================================================
-- THERAPIST PROFILE (simple / listing model)
-- ============================================================
CREATE TABLE TherapistProfiles (
    UserId              NVARCHAR(50)    PRIMARY KEY REFERENCES Users(Id),
    Credentials         NVARCHAR(500)   NULL,
    YearsOfExperience   INT             NOT NULL DEFAULT 0,
    Bio                 NVARCHAR(MAX)   NULL,
    HourlyRate          DECIMAL(10,2)   NOT NULL DEFAULT 0,
    Availability        NVARCHAR(200)   NULL,    -- display string
    BannerImage         NVARCHAR(2000)  NULL,
    SupervisionBio      NVARCHAR(MAX)   NULL,
    CreatedAt           DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- Therapist specializations (free-text)
CREATE TABLE TherapistSpecializations (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Label           NVARCHAR(200)   NOT NULL,
    UNIQUE(TherapistId, Label)
);

-- Therapist clinical approaches (free-text, on simple profile)
CREATE TABLE TherapistClinicalApproachLabels (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Label           NVARCHAR(200)   NOT NULL,
    UNIQUE(TherapistId, Label)
);

-- Therapist education entries (free-text, on simple profile)
CREATE TABLE TherapistEducationLabels (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Label           NVARCHAR(500)   NOT NULL
);

-- ============================================================
-- THERAPIST EXTENDED PROFILE
-- ============================================================
CREATE TABLE TherapistExtendedProfiles (
    Id                  INT             IDENTITY(1,1) PRIMARY KEY,
    UserId              NVARCHAR(50)    NOT NULL UNIQUE REFERENCES Users(Id),
    Title               INT             NOT NULL DEFAULT 0,
    FirstName           NVARCHAR(100)   NOT NULL,
    MiddleName          NVARCHAR(100)   NULL,
    LastName            NVARCHAR(100)   NOT NULL,
    DisplayName         NVARCHAR(200)   NULL,
    DateOfBirth         DATE            NULL,
    Gender              INT             NOT NULL DEFAULT 0,
    Orientation         INT             NOT NULL DEFAULT 0,
    -- Contact details (flattened)
    ContactEmail        NVARCHAR(320)   NULL,
    ContactMobile       NVARCHAR(50)    NULL,
    ContactStreet       NVARCHAR(300)   NULL,
    ContactCity         NVARCHAR(100)   NULL,
    ContactPostCode     NVARCHAR(20)    NULL,
    ContactCountry      NVARCHAR(100)   NULL,
    -- Delivery modes
    IsInPerson          BIT             NOT NULL DEFAULT 0,
    IsVideo             BIT             NOT NULL DEFAULT 0,
    IsPhone             BIT             NOT NULL DEFAULT 0,
    IsLiveChat          BIT             NOT NULL DEFAULT 0,
    IsMessaging         BIT             NOT NULL DEFAULT 0,
    WillDoCouples       BIT             NOT NULL DEFAULT 0,
    -- Profile
    Bio                 NVARCHAR(MAX)   NULL,
    YearsOfExperience   INT             NOT NULL DEFAULT 0,
    CreatedAt           DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- Profile images
CREATE TABLE TherapistProfileImages (
    Id              NVARCHAR(50)    PRIMARY KEY,
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    ImageType       INT             NOT NULL,
    Url             NVARCHAR(2000)  NOT NULL,
    AltText         NVARCHAR(500)   NULL
);

-- Profile links
CREATE TABLE TherapistProfileLinks (
    Id              NVARCHAR(50)    PRIMARY KEY,
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Title           NVARCHAR(200)   NOT NULL,
    Url             NVARCHAR(2000)  NOT NULL
);

-- Spoken languages
CREATE TABLE TherapistSpokenLanguages (
    Id              NVARCHAR(50)    PRIMARY KEY,
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    LanguageCode    NVARCHAR(5)     NOT NULL,
    Proficiency     INT             NOT NULL DEFAULT 0
);

-- Education (structured, on extended profile)
CREATE TABLE TherapistEducations (
    Id              NVARCHAR(50)    PRIMARY KEY,
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Institution     NVARCHAR(300)   NOT NULL,
    Degree          NVARCHAR(200)   NOT NULL,
    FieldOfStudy    NVARCHAR(200)   NOT NULL,
    YearCompleted   INT             NOT NULL
);

-- Therapist types (enum junction)
CREATE TABLE TherapistTypeAssignments (
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    TherapistType   INT             NOT NULL,
    PRIMARY KEY (TherapistId, TherapistType)
);

-- Session types (enum junction)
CREATE TABLE TherapistSessionTypes (
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    SessionType     INT             NOT NULL,
    PRIMARY KEY (TherapistId, SessionType)
);

-- Areas of focus (enum junction, on extended profile)
CREATE TABLE TherapistAreasOfFocus (
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    AreaOfFocus     INT             NOT NULL,
    PRIMARY KEY (TherapistId, AreaOfFocus)
);

-- Clinical approaches (enum junction, on extended profile)
CREATE TABLE TherapistClinicalApproaches (
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    ClinicalApproach INT            NOT NULL,
    PRIMARY KEY (TherapistId, ClinicalApproach)
);

-- Governing body memberships
CREATE TABLE GoverningBodyMemberships (
    Id                  NVARCHAR(50)    PRIMARY KEY,
    TherapistId         NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    GoverningBody       INT             NOT NULL,
    MembershipLevel     INT             NOT NULL,
    MembershipNumber    NVARCHAR(100)   NOT NULL,
    YearObtained        INT             NULL
);

-- ============================================================
-- SESSION RATES
-- ============================================================
CREATE TABLE SessionRates (
    Id              NVARCHAR(50)    PRIMARY KEY,
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Title           NVARCHAR(200)   NOT NULL,
    Modality        NVARCHAR(20)    NOT NULL,
    Duration        INT             NOT NULL,  -- minutes
    Price           DECIMAL(10,2)   NOT NULL,
    Cooldown        INT             NULL,      -- minutes
    IsSupervision   BIT             NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================================
-- AVAILABILITY WINDOWS
-- ============================================================
CREATE TABLE AvailabilityWindows (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Date            DATE            NOT NULL,
    StartTime       TIME            NOT NULL,
    EndTime         TIME            NOT NULL,
    MaxOccupancy    INT             NULL,      -- max booked minutes
    UNIQUE(TherapistId, Date, StartTime)
);

-- Which rates are enabled per window
CREATE TABLE AvailabilityWindowRates (
    WindowId        INT             NOT NULL REFERENCES AvailabilityWindows(Id) ON DELETE CASCADE,
    SessionRateId   NVARCHAR(50)    NOT NULL REFERENCES SessionRates(Id),
    PRIMARY KEY (WindowId, SessionRateId)
);

-- ============================================================
-- CONNECTIONS (client <-> therapist)
-- ============================================================
CREATE TABLE Connections (
    Id              NVARCHAR(50)    PRIMARY KEY,
    ClientId        NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Status          NVARCHAR(10)    NOT NULL CHECK (Status IN ('pending', 'accepted', 'rejected')),
    Message         NVARCHAR(MAX)   NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UNIQUE(ClientId, TherapistId)
);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE Messages (
    Id              NVARCHAR(50)    PRIMARY KEY,
    SenderId        NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    ReceiverId      NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Content         NVARCHAR(MAX)   NOT NULL,
    Timestamp       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    IsRead          BIT             NOT NULL DEFAULT 0,
    -- Optional bookmark attachment (stored as JSON or flattened)
    BookmarkTitle   NVARCHAR(500)   NULL,
    BookmarkUrl     NVARCHAR(2000)  NULL,
    -- Optional session request (FK to dedicated table)
    SessionRequestId NVARCHAR(50)   NULL REFERENCES SessionRequests(Id)
);

-- ============================================================
-- SESSION REQUESTS (dedicated approval-flow tracking)
-- ============================================================
-- NOTE: Messages.SessionRequestId references this table, and this table
-- references VideoSessions. In production DDL, create tables without FKs
-- first, then add FK constraints via ALTER TABLE to resolve ordering.
-- A SessionRequest is created when a client books a session that
-- requires therapist approval (over-capacity) OR as a record of
-- any booking communicated via message. It lives independently
-- from VideoSession so the approval lifecycle, display metadata,
-- and message linkage are cleanly separated.
CREATE TABLE SessionRequests (
    Id              NVARCHAR(50)    PRIMARY KEY,
    SessionId       NVARCHAR(50)    NOT NULL REFERENCES VideoSessions(Id),
    -- Denormalised display fields (snapshot at creation time)
    SessionType     NVARCHAR(200)   NOT NULL,  -- e.g. "50-min Video Session"
    Date            NVARCHAR(50)    NOT NULL,  -- formatted "Mon, 24 Feb 2026"
    Time            NVARCHAR(50)    NOT NULL,  -- "09:00 - 09:50"
    Duration        INT             NOT NULL,  -- minutes
    Price           DECIMAL(10,2)   NOT NULL,  -- GBP
    Modality        NVARCHAR(20)    NOT NULL,  -- video|inPerson|text|phoneCall
    -- Approval lifecycle
    Status          NVARCHAR(10)    NOT NULL DEFAULT 'pending'
                    CHECK (Status IN ('pending','approved','declined','paid')),
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================================
-- VIDEO SESSIONS (bookings)
-- ============================================================
CREATE TABLE VideoSessions (
    Id              NVARCHAR(50)    PRIMARY KEY,
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    ClientId        NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    ScheduledTime   DATETIME2       NOT NULL,
    Duration        INT             NOT NULL,      -- minutes
    Status          NVARCHAR(20)    NOT NULL CHECK (Status IN ('scheduled','in-progress','completed','cancelled')),
    SessionRateId   NVARCHAR(50)    NULL REFERENCES SessionRates(Id),
    Modality        NVARCHAR(20)    NULL,
    AzureRoomId     NVARCHAR(200)   NULL,
    IsPaid          BIT             NOT NULL DEFAULT 0,
    Price           DECIMAL(10,2)   NULL,
    RequiresApproval BIT            NOT NULL DEFAULT 0,
    -- Approval lifecycle is tracked on the dedicated SessionRequests table
    -- (linked via Messages.SessionRequestId -> SessionRequests.SessionId = this row)
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================================
-- POSTS (therapist insights / feed)
-- ============================================================
CREATE TABLE Posts (
    Id              NVARCHAR(50)    PRIMARY KEY,
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Content         NVARCHAR(MAX)   NOT NULL,
    Link            NVARCHAR(2000)  NULL,
    Timestamp       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- Post likes (junction table)
CREATE TABLE PostLikes (
    PostId          NVARCHAR(50)    NOT NULL REFERENCES Posts(Id) ON DELETE CASCADE,
    UserId          NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (PostId, UserId)
);

-- ============================================================
-- WORKSHOPS
-- ============================================================
CREATE TABLE Workshops (
    Id                  NVARCHAR(50)    PRIMARY KEY,
    TherapistId         NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Title               NVARCHAR(300)   NOT NULL,
    Description         NVARCHAR(MAX)   NOT NULL,
    ScheduledTime       DATETIME2       NOT NULL,
    Duration            INT             NOT NULL,
    MaxParticipants     INT             NOT NULL,
    Price               DECIMAL(10,2)   NOT NULL,
    Modality            NVARCHAR(20)    NULL,
    CreatedAt           DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- Workshop registrations (junction table)
CREATE TABLE WorkshopRegistrations (
    WorkshopId      NVARCHAR(50)    NOT NULL REFERENCES Workshops(Id) ON DELETE CASCADE,
    ClientId        NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    RegisteredAt    DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (WorkshopId, ClientId)
);
-- Note: currentParticipants = COUNT from WorkshopRegistrations
-- Note: isRegistered = EXISTS check for current client

-- ============================================================
-- SESSION NOTES (therapist-authored)
-- ============================================================
CREATE TABLE SessionNotes (
    Id              NVARCHAR(50)    PRIMARY KEY,
    ClientId        NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    SessionId       NVARCHAR(50)    NULL REFERENCES VideoSessions(Id),
    Content         NVARCHAR(MAX)   NOT NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================================
-- CLIENT NOTES (client-authored session reflections)
-- ============================================================
CREATE TABLE ClientNotes (
    Id              NVARCHAR(50)    PRIMARY KEY,
    ClientId        NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    SessionId       NVARCHAR(50)    NULL REFERENCES VideoSessions(Id),
    Content         NVARCHAR(MAX)   NOT NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================================
-- JOURNAL ENTRIES (client)
-- ============================================================
CREATE TABLE JournalEntries (
    Id              NVARCHAR(50)    PRIMARY KEY,
    ClientId        NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Date            DATETIME2       NOT NULL,
    MoodRating      INT             NOT NULL CHECK (MoodRating BETWEEN 1 AND 10),
    PhysicalRating  INT             NOT NULL CHECK (PhysicalRating BETWEEN 1 AND 10),
    SleepQuality    NVARCHAR(20)    NULL,  -- excellent|good|fair|poor|veryPoor
    SleepHours      DECIMAL(4,1)    NULL,
    AnxietyLevel    INT             NULL CHECK (AnxietyLevel BETWEEN 1 AND 10),
    StressLevel     INT             NULL CHECK (StressLevel BETWEEN 1 AND 10),
    Challenges      NVARCHAR(MAX)   NULL,
    Thoughts        NVARCHAR(MAX)   NOT NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- Journal array fields (junction tables)
CREATE TABLE JournalGratitude (
    JournalEntryId  NVARCHAR(50)    NOT NULL REFERENCES JournalEntries(Id) ON DELETE CASCADE,
    SortOrder       INT             NOT NULL,
    Value           NVARCHAR(500)   NOT NULL,
    PRIMARY KEY (JournalEntryId, SortOrder)
);

CREATE TABLE JournalAccomplishments (
    JournalEntryId  NVARCHAR(50)    NOT NULL REFERENCES JournalEntries(Id) ON DELETE CASCADE,
    SortOrder       INT             NOT NULL,
    Value           NVARCHAR(500)   NOT NULL,
    PRIMARY KEY (JournalEntryId, SortOrder)
);

CREATE TABLE JournalActivities (
    JournalEntryId  NVARCHAR(50)    NOT NULL REFERENCES JournalEntries(Id) ON DELETE CASCADE,
    SortOrder       INT             NOT NULL,
    Value           NVARCHAR(500)   NOT NULL,
    PRIMARY KEY (JournalEntryId, SortOrder)
);

CREATE TABLE JournalGoals (
    JournalEntryId  NVARCHAR(50)    NOT NULL REFERENCES JournalEntries(Id) ON DELETE CASCADE,
    SortOrder       INT             NOT NULL,
    Value           NVARCHAR(500)   NOT NULL,
    PRIMARY KEY (JournalEntryId, SortOrder)
);

-- Journal sharing (which therapists can see each entry)
CREATE TABLE JournalSharing (
    JournalEntryId  NVARCHAR(50)    NOT NULL REFERENCES JournalEntries(Id) ON DELETE CASCADE,
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    PRIMARY KEY (JournalEntryId, TherapistId)
);

-- ============================================================
-- ASSESSMENTS (PHQ-9 + GAD-7)
-- ============================================================
CREATE TABLE Assessments (
    Id              NVARCHAR(50)    PRIMARY KEY,
    ClientId        NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Date            DATETIME2       NOT NULL,
    -- PHQ-9 responses (each 0-3)
    PHQ9_LittleInterest       INT   NOT NULL,
    PHQ9_FeelingDown          INT   NOT NULL,
    PHQ9_SleepProblems        INT   NOT NULL,
    PHQ9_FeelingTired         INT   NOT NULL,
    PHQ9_AppetiteProblems     INT   NOT NULL,
    PHQ9_FeelingBad           INT   NOT NULL,
    PHQ9_TroubleConcentrating INT   NOT NULL,
    PHQ9_MovingSpeaking       INT   NOT NULL,
    PHQ9_SelfHarmThoughts     INT   NOT NULL,
    PHQ9_FunctionalImpairment NVARCHAR(30) NULL,
    -- GAD-7 responses (each 0-3)
    GAD7_FeelingNervous       INT   NOT NULL,
    GAD7_CantStopWorrying     INT   NOT NULL,
    GAD7_WorryingTooMuch      INT   NOT NULL,
    GAD7_TroubleRelaxing      INT   NOT NULL,
    GAD7_BeingRestless        INT   NOT NULL,
    GAD7_EasilyAnnoyed        INT   NOT NULL,
    GAD7_FeelingAfraid        INT   NOT NULL,
    GAD7_FunctionalImpairment NVARCHAR(30) NULL,
    -- Computed scores
    PHQ9Score       INT             NOT NULL,  -- sum of 9 items (0-27)
    GAD7Score       INT             NOT NULL,  -- sum of 7 items (0-21)
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================================
-- THERAPIST BOOKMARKS
-- ============================================================
CREATE TABLE TherapistBookmarks (
    Id              NVARCHAR(50)    PRIMARY KEY,
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Title           NVARCHAR(500)   NOT NULL,
    Url             NVARCHAR(2000)  NOT NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================================
-- COURSE PACKAGES (therapist-defined templates)
-- ============================================================
CREATE TABLE CoursePackages (
    Id              NVARCHAR(50)    PRIMARY KEY,
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Title           NVARCHAR(300)   NOT NULL,
    Description     NVARCHAR(MAX)   NOT NULL,
    SessionRateId   NVARCHAR(50)    NOT NULL REFERENCES SessionRates(Id),
    TotalSessions   INT             NOT NULL,
    TotalPrice      DECIMAL(10,2)   NOT NULL,
    IsActive        BIT             NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================================
-- CLIENT COURSE BOOKINGS (purchased courses)
-- ============================================================
CREATE TABLE ClientCourseBookings (
    Id              NVARCHAR(50)    PRIMARY KEY,
    ClientId        NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    CoursePackageId NVARCHAR(50)    NOT NULL REFERENCES CoursePackages(Id),
    CourseTitle     NVARCHAR(300)   NOT NULL,  -- denormalised
    SessionRateId   NVARCHAR(50)    NOT NULL REFERENCES SessionRates(Id),
    TotalSessions   INT             NOT NULL,
    SessionsUsed    INT             NOT NULL DEFAULT 0,
    TotalPrice      DECIMAL(10,2)   NOT NULL,
    PurchaseDate    DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    Status          NVARCHAR(15)    NOT NULL CHECK (Status IN ('active','completed','cancelled'))
);

-- ============================================================
-- PRO BONO TOKENS
-- ============================================================
CREATE TABLE ProBonoTokens (
    Id              NVARCHAR(50)    PRIMARY KEY,
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    ClientId        NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    SessionRateId   NVARCHAR(50)    NOT NULL REFERENCES SessionRates(Id),
    SessionRateTitle NVARCHAR(200)  NOT NULL,  -- denormalised
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UsedAt          DATETIME2       NULL,
    Status          NVARCHAR(15)    NOT NULL CHECK (Status IN ('available','used','expired'))
);

-- ============================================================
-- THERAPIST JOURNAL ENTRIES
-- ============================================================
CREATE TABLE TherapistJournalEntries (
    Id                      NVARCHAR(50)    PRIMARY KEY,
    TherapistId             NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Date                    DATETIME2       NOT NULL,
    Mood                    INT             NOT NULL CHECK (Mood BETWEEN 1 AND 10),
    ThoughtsAndFeelings     NVARCHAR(MAX)   NOT NULL,
    SharedWithSupervisor    BIT             NOT NULL DEFAULT 0,
    CreatedAt               DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================================
-- CPD ENTRIES (Continuing Professional Development)
-- ============================================================
CREATE TABLE CpdEntries (
    Id              NVARCHAR(50)    PRIMARY KEY,
    TherapistId     NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Title           NVARCHAR(300)   NOT NULL,
    Description     NVARCHAR(MAX)   NOT NULL,
    Link            NVARCHAR(2000)  NULL,
    StartDate       DATETIME2       NULL,
    CompletedDate   DATETIME2       NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================================
-- SUPERVISION CONNECTIONS (therapist <-> therapist)
-- ============================================================
CREATE TABLE SupervisionConnections (
    Id              NVARCHAR(50)    PRIMARY KEY,
    SuperviseeId    NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    SupervisorId    NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    Status          NVARCHAR(10)    NOT NULL CHECK (Status IN ('pending','accepted','rejected')),
    Message         NVARCHAR(MAX)   NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UNIQUE(SuperviseeId, SupervisorId)
);

-- ============================================================
-- SUPERVISION SESSIONS
-- ============================================================
CREATE TABLE SupervisionSessions (
    Id              NVARCHAR(50)    PRIMARY KEY,
    SupervisorId    NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    SuperviseeId    NVARCHAR(50)    NOT NULL REFERENCES Users(Id),
    ScheduledTime   DATETIME2       NOT NULL,
    Duration        INT             NOT NULL,
    Status          NVARCHAR(15)    NOT NULL CHECK (Status IN ('scheduled','completed','cancelled')),
    Modality        NVARCHAR(20)    NOT NULL,
    Price           DECIMAL(10,2)   NULL,
    Notes           NVARCHAR(MAX)   NULL,   -- supervisor's session notes (added post-session)
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX IX_Messages_SenderId ON Messages(SenderId, Timestamp DESC);
CREATE INDEX IX_Messages_ReceiverId ON Messages(ReceiverId, Timestamp DESC);
CREATE INDEX IX_VideoSessions_TherapistId ON VideoSessions(TherapistId, ScheduledTime);
CREATE INDEX IX_VideoSessions_ClientId ON VideoSessions(ClientId, ScheduledTime);
CREATE INDEX IX_Connections_ClientId ON Connections(ClientId, Status);
CREATE INDEX IX_Connections_TherapistId ON Connections(TherapistId, Status);
CREATE INDEX IX_JournalEntries_ClientId ON JournalEntries(ClientId, Date DESC);
CREATE INDEX IX_Assessments_ClientId ON Assessments(ClientId, Date DESC);
CREATE INDEX IX_Posts_TherapistId ON Posts(TherapistId, Timestamp DESC);
CREATE INDEX IX_Workshops_TherapistId ON Workshops(TherapistId, ScheduledTime);
CREATE INDEX IX_SessionNotes_ClientTherapist ON SessionNotes(ClientId, TherapistId, CreatedAt DESC);
CREATE INDEX IX_AvailabilityWindows_Therapist ON AvailabilityWindows(TherapistId, Date);
CREATE INDEX IX_SupervisionConnections_Supervisee ON SupervisionConnections(SuperviseeId, Status);
CREATE INDEX IX_SupervisionConnections_Supervisor ON SupervisionConnections(SupervisorId, Status);
CREATE INDEX IX_SupervisionSessions_Supervisor ON SupervisionSessions(SupervisorId, ScheduledTime);
CREATE INDEX IX_SupervisionSessions_Supervisee ON SupervisionSessions(SuperviseeId, ScheduledTime);
CREATE INDEX IX_SessionRequests_SessionId ON SessionRequests(SessionId);
CREATE INDEX IX_SessionRequests_Status ON SessionRequests(Status, CreatedAt DESC);
CREATE INDEX IX_Messages_SessionRequestId ON Messages(SessionRequestId) WHERE SessionRequestId IS NOT NULL;
```

---

## 7. API Envelope & Pagination

Every endpoint returns one of these two envelopes.

> **Envelope migration note**: The current frontend mock services use a simpler shape (`error: string | null`). When the real backend is connected, the frontend `apiClient.ts` will be updated to use the production envelope below. The backend **must** implement the production shape — the frontend migration is a one-time change to `apiClient.ts` and `httpClient.ts`. See Section 15.9 for the frontend integration pattern.

### Single-item response
```typescript
interface ApiResponse<T> {
  success: boolean;       // true on 2xx, false on error
  data: T | null;         // payload on success, null on error
  error: {                // null on success, structured on error
    code: string;         // machine-readable (see Section 15.3)
    message: string;      // human-readable, safe for UI display
    details?: unknown;    // optional field-level validation errors
  } | null;
  status: number;         // HTTP status code
}
```

### Paginated list response
```typescript
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
  status: number;
}
```

### Pagination params (query string)
```typescript
interface PaginationParams {
  page?: number;       // default 1
  pageSize?: number;   // default varies by endpoint (20 typical)
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
```

### HTTP Status Codes
| Code | Usage |
|------|-------|
| 200 | Successful read/update |
| 201 | Successful create |
| 204 | Successful delete |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate, workshop full, token already used) |

---

## 8. API Endpoints & DTOs

### 8.1 Authentication

See [Section 3](#3-authentication--authorization).

### 8.2 Connections

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/connections?userId=&status=` | - | `PaginatedResponse<ConnectionRequest>` | Filter by user + optional status |
| GET | `/api/connections/:id` | - | `ApiResponse<ConnectionRequest>` | |
| POST | `/api/connections` | `CreateConnectionRequest` | `ApiResponse<ConnectionRequest>` | 201 |
| PUT | `/api/connections/:id` | `UpdateConnectionRequest` | `ApiResponse<ConnectionRequest>` | Accept/reject |
| DELETE | `/api/connections/:id` | - | `ApiResponse<null>` | 204 |

```typescript
interface CreateConnectionRequest { clientId: string; therapistId: string; message?: string; }
interface UpdateConnectionRequest { status: "accepted" | "rejected"; }
interface ListConnectionsParams extends PaginationParams { userId: string; status?: "pending" | "accepted" | "rejected"; }
```

### 8.3 Messages

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/messages/conversations/:userId` | - | `ApiResponse<ConversationSummary[]>` | Sidebar list |
| GET | `/api/messages?userId1=&userId2=` | - | `PaginatedResponse<Message>` | Thread between two users |
| POST | `/api/messages` | `SendMessageRequest` | `ApiResponse<Message>` | 201 |
| PUT | `/api/messages/read` | `MarkMessagesReadRequest` | `ApiResponse<number>` | Returns count marked |
| DELETE | `/api/messages/:id` | - | `ApiResponse<null>` | 204 |

```typescript
interface SendMessageRequest {
  senderId: string;
  receiverId: string;
  content: string;
  bookmark?: { title: string; url: string; };  // optional link attachment (therapist-sent)
}
interface MarkMessagesReadRequest { messageIds: string[]; }
interface ConversationSummary { contactId: string; lastMessage: Message; unreadCount: number; }
// Note: Both `listConversations` and `listMessages` queries must LEFT JOIN
// Messages → SessionRequests on `Messages.SessionRequestId = SessionRequests.Id`
// to populate `message.sessionRequest` with the full `SessionRequestData` object.
// Similarly, `BookmarkTitle` and `BookmarkUrl` columns should be mapped into
// `message.bookmark: { title, url }` (null when both are NULL).
```

### 8.4 Video Sessions

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/sessions?therapistId=&clientId=&status=&from=&to=` | - | `PaginatedResponse<VideoSession>` | |
| GET | `/api/sessions/:id` | - | `ApiResponse<VideoSession>` | |
| POST | `/api/sessions` | `CreateVideoSessionRequest` | `ApiResponse<VideoSession>` | 201 |
| PUT | `/api/sessions/:id` | `UpdateVideoSessionRequest` | `ApiResponse<VideoSession>` | |
| DELETE | `/api/sessions/:id` | - | `ApiResponse<null>` | 204 |

```typescript
interface CreateVideoSessionRequest {
  therapistId: string; clientId: string; scheduledTime: Date; duration: number;
  sessionRateId?: string; modality?: Modality; price?: number;
}
interface UpdateVideoSessionRequest {
  status?: "scheduled" | "in-progress" | "completed" | "cancelled";
  scheduledTime?: Date; duration?: number; azureRoomId?: string; isPaid?: boolean;
}
interface ListVideoSessionsParams extends PaginationParams {
  therapistId?: string; clientId?: string;
  status?: "scheduled" | "in-progress" | "completed" | "cancelled";
  from?: Date; to?: Date;
}
```

### 8.5 Session Requests (Approval Flow)

The `SessionRequests` table owns the approval lifecycle for bookings that require therapist confirmation (over-capacity slots). A `SessionRequest` is created atomically alongside the `VideoSession` and `Message` when the booking exceeds `maxOccupancy`. It can also be created for any booking where the therapist has opted into an approval-first workflow.

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/session-requests?sessionId=&status=` | - | `PaginatedResponse<SessionRequestData>` | Filter by session or status |
| GET | `/api/session-requests/:id` | - | `ApiResponse<SessionRequestData>` | |
| POST | `/api/session-requests` | `CreateSessionRequestData` | `ApiResponse<SessionRequestData>` | 201; typically called internally during booking |
| PUT | `/api/session-requests/:id/approve` | - | `ApiResponse<SessionRequestData>` | Therapist approves; sets status = approved |
| PUT | `/api/session-requests/:id/decline` | `{ reason?: string }` | `ApiResponse<SessionRequestData>` | Therapist declines; sets status = declined, cancels VideoSession |
| PUT | `/api/session-requests/:id/pay` | - | `ApiResponse<SessionRequestData>` | Client pays; sets status = paid, sets VideoSession.isPaid = true |

```typescript
interface CreateSessionRequestData {
  sessionId: string;        // FK to VideoSession
  sessionType: string;      // display label snapshot e.g. "50-min Video Session"
  date: string;             // formatted "Mon, 24 Feb 2026"
  time: string;             // "09:00 - 09:50"
  duration: number;         // minutes
  price: number;            // GBP
  modality: Modality;
}

interface UpdateSessionRequestStatusRequest {
  status: "approved" | "declined" | "paid";
  reason?: string;          // optional decline reason
}

interface ListSessionRequestsParams extends PaginationParams {
  sessionId?: string;
  status?: "pending" | "approved" | "declined" | "paid";
}
```

**Side effects on status transitions:**

| Transition | Side Effects |
|-----------|-------------|
| `pending -> approved` | None (session stays `scheduled`, awaits payment) |
| `pending -> declined` | `VideoSession.status` set to `cancelled`; auto-message sent to client |
| `approved -> paid` | `VideoSession.isPaid` set to `true`; auto-message confirmation sent |

### 8.6 Therapist Profiles

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/therapists?search=&specialization=&clinicalApproach=&location=&maxRate=` | - | `PaginatedResponse<Therapist>` | Public search |
| GET | `/api/therapists/:id` | - | `ApiResponse<Therapist>` | Public profile |
| GET | `/api/therapists/me` | - | `ApiResponse<Therapist>` | Auth required |
| GET | `/api/therapists/me/extended` | - | `ApiResponse<TherapistProfile>` | Auth required |
| PUT | `/api/therapists/me` | `UpdateTherapistProfileRequest` | `ApiResponse<Therapist>` | |
| PUT | `/api/therapists/me/extended` | `UpdateTherapistExtendedProfileRequest` | `ApiResponse<TherapistProfile>` | |

```typescript
interface UpdateTherapistProfileRequest {
  name?: string; email?: string; phone?: string; location?: string;
  credentials?: string; specializations?: string[]; clinicalApproaches?: string[];
  yearsOfExperience?: number; education?: string[]; bio?: string;
  hourlyRate?: number; availability?: string; bannerImage?: string;
}

interface UpdateTherapistExtendedProfileRequest {
  title?: number; firstName?: string; middleName?: string | null; lastName?: string;
  displayName?: string | null; dateOfBirth?: Date | null; gender?: number; orientation?: number;
  contactDetails?: {
    email: string; mobileNumber: string; street: string; city: string; postCode: string; country?: string;
  } | null;
  profileLinks?: { id: string; title: string; url: string }[];
  isInPerson?: boolean; isVideo?: boolean; isPhone?: boolean; isLiveChat?: boolean;
  isMessaging?: boolean; willDoCouples?: boolean; bio?: string | null; yearsOfExperience?: number;
  spokenLanguages?: { id: string; languageCode: number; proficiency: number }[];
  educations?: { id: string; institution: string; degree: string; fieldOfStudy: string; yearCompleted: number }[];
  therapistTypes?: number[]; areasOfFocus?: number[]; clinicalApproaches?: number[];
  governingBodyMemberships?: {
    id: string; governingBody: number; membershipLevel: number; membershipNumber: string; yearObtained?: number;
  }[];
}

interface ListTherapistsParams extends PaginationParams {
  specialization?: string; clinicalApproach?: string; location?: string; maxRate?: number; search?: string;
}
```

### 8.7 Therapist Session Rates

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/therapists/me/rates` | - | `ApiResponse<SessionRate[]>` | |
| POST | `/api/therapists/me/rates` | `CreateSessionRateRequest` | `ApiResponse<SessionRate>` | 201 |
| PUT | `/api/therapists/me/rates/:id` | `UpdateSessionRateRequest` | `ApiResponse<SessionRate>` | |
| DELETE | `/api/therapists/me/rates/:id` | - | `ApiResponse<null>` | 204 |

```typescript
interface CreateSessionRateRequest {
  title: string;
  modality: Modality;
  duration: number;          // minutes
  price: number;             // GBP
  cooldown?: number;         // minutes
  isSupervision?: boolean;   // true = only for supervision bookings
}

interface UpdateSessionRateRequest {
  title?: string;
  modality?: Modality;
  duration?: number;
  price?: number;
  cooldown?: number;
  isSupervision?: boolean;
}
```

### 8.8 Therapist Availability

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/therapists/me/availability` | - | `ApiResponse<AvailabilityWindow[]>` | Own windows |
| GET | `/api/therapists/:id/availability` | - | `ApiResponse<AvailabilityWindow[]>` | Client-facing (public) |
| PUT | `/api/therapists/me/availability` | `UpdateAvailabilityRequest` | `ApiResponse<AvailabilityWindow[]>` | Replaces all windows |

```typescript
interface UpdateAvailabilityRequest {
  windows: {
    date: string;              // "YYYY-MM-DD"
    startTime: string;         // "HH:MM"
    endTime: string;           // "HH:MM"
    enabledRateIds: string[];  // session rate IDs bookable in this window
    maxOccupancy?: number;     // max booked minutes; beyond this = "request only" bookings
  }[];
}
```

### 8.9 Client Profiles

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/clients?therapistId=&search=` | - | `PaginatedResponse<Client>` | Therapist views connected clients |
| GET | `/api/clients/:id` | - | `ApiResponse<Client>` | |
| GET | `/api/clients/me` | - | `ApiResponse<Client>` | Auth required |
| PUT | `/api/clients/me` | `UpdateClientProfileRequest` | `ApiResponse<Client>` | |
| POST | `/api/clients/me/follow` | `FollowTherapistRequest` | `ApiResponse<Client>` | |
| DELETE | `/api/clients/me/follow/:therapistId` | - | `ApiResponse<Client>` | |

```typescript
interface UpdateClientProfileRequest {
  name?: string; email?: string; phone?: string; location?: string;
  areasOfFocus?: string[]; areasOfFocusDetails?: string;
}
interface FollowTherapistRequest { clientId: string; therapistId: string; }
interface ListClientsParams extends PaginationParams { therapistId?: string; search?: string; }
```

### 8.10 Client Journal

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/journal?clientId=&from=&to=` | - | `PaginatedResponse<JournalEntry>` | |
| GET | `/api/journal/:id` | - | `ApiResponse<JournalEntry>` | |
| POST | `/api/journal` | `CreateJournalEntryRequest` | `ApiResponse<JournalEntry>` | 201 |
| PUT | `/api/journal/:id/sharing` | `UpdateJournalSharingRequest` | `ApiResponse<JournalEntry>` | |
| DELETE | `/api/journal/:id` | - | `ApiResponse<null>` | 204 |

```typescript
interface CreateJournalEntryRequest {
  clientId: string; moodRating: MoodRating; physicalRating: PhysicalRating;
  sleepQuality?: SleepQuality; sleepHours?: number; anxietyLevel?: AnxietyLevel;
  stressLevel?: StressLevel; gratitude?: string[]; accomplishments?: string[];
  challenges?: string; activities?: string[]; goals?: string[]; thoughts: string;
  sharedWithTherapistIds: string[];
}
interface UpdateJournalSharingRequest { sharedWithTherapistIds: string[]; }
```

### 8.11 Client Assessments

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/assessments?clientId=&therapistId=&from=&to=` | - | `PaginatedResponse<Assessment>` | |
| GET | `/api/assessments/:id` | - | `ApiResponse<Assessment>` | |
| POST | `/api/assessments` | `CreateAssessmentRequest` | `ApiResponse<Assessment>` | Server calculates scores |
| DELETE | `/api/assessments/:id` | - | `ApiResponse<null>` | 204 |

```typescript
interface CreateAssessmentRequest {
  clientId: string; therapistId: string; phq9: PHQ9Response; gad7: GAD7Response;
}
```

**Score Calculation (server-side)**:
```typescript
// PHQ-9 score = sum of 9 items (each 0-3), range 0-27
function calculatePHQ9Score(r: PHQ9Response): number {
  return r.littleInterest + r.feelingDown + r.sleepProblems + r.feelingTired +
    r.appetiteProblems + r.feelingBad + r.troubleConcentrating +
    r.movingSpeaking + r.selfHarmThoughts;
}

// GAD-7 score = sum of 7 items (each 0-3), range 0-21
function calculateGAD7Score(r: GAD7Response): number {
  return r.feelingNervous + r.cantStopWorrying + r.worryingTooMuch +
    r.troubleRelaxing + r.beingRestless + r.easilyAnnoyed + r.feelingAfraid;
}
```

### 8.12 Client Notes

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/client-notes?clientId=&sessionId=` | - | `PaginatedResponse<ClientNote>` | |
| GET | `/api/client-notes/:id` | - | `ApiResponse<ClientNote>` | |
| POST | `/api/client-notes` | `CreateClientNoteRequest` | `ApiResponse<ClientNote>` | 201; immutable |

```typescript
interface CreateClientNoteRequest { clientId: string; sessionId?: string; content: string; }
interface ListClientNotesParams extends PaginationParams { clientId: string; sessionId?: string; }
```

### 8.13 Posts

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/posts?therapistId=` | - | `PaginatedResponse<Post>` | |
| GET | `/api/posts/:id` | - | `ApiResponse<Post>` | |
| POST | `/api/posts` | `CreatePostRequest` | `ApiResponse<Post>` | 201 |
| PUT | `/api/posts/:id` | `UpdatePostRequest` | `ApiResponse<Post>` | |
| PUT | `/api/posts/:id/like` | `ToggleLikeRequest` | `ApiResponse<Post>` | Toggles |
| DELETE | `/api/posts/:id` | - | `ApiResponse<null>` | 204 |

```typescript
interface CreatePostRequest { therapistId: string; content: string; link?: string; }
interface UpdatePostRequest { content?: string; link?: string; }
interface ToggleLikeRequest { userId: string; }
interface ListPostsParams extends PaginationParams { therapistId?: string; }
```
Implementation: if user exists in PostLikes, DELETE; otherwise INSERT.

### 8.14 Workshops

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/workshops?therapistId=&from=&to=` | - | `PaginatedResponse<Workshop>` | |
| GET | `/api/workshops/:id` | - | `ApiResponse<Workshop>` | |
| POST | `/api/workshops` | `CreateWorkshopRequest` | `ApiResponse<Workshop>` | 201 |
| PUT | `/api/workshops/:id` | `UpdateWorkshopRequest` | `ApiResponse<Workshop>` | |
| POST | `/api/workshops/:id/register` | `RegisterWorkshopRequest` | `ApiResponse<Workshop>` | 409 if full |
| POST | `/api/workshops/:id/unregister` | - | `ApiResponse<Workshop>` | |
| DELETE | `/api/workshops/:id` | - | `ApiResponse<null>` | 204 |

```typescript
interface CreateWorkshopRequest {
  therapistId: string; title: string; description: string; scheduledTime: Date;
  duration: number; maxParticipants: number; price: number;
  modality?: "video" | "inPerson";  // optional delivery mode
}
interface UpdateWorkshopRequest {
  title?: string; description?: string; scheduledTime?: Date;
  duration?: number; maxParticipants?: number; price?: number;
  modality?: "video" | "inPerson";
}
interface RegisterWorkshopRequest { clientId: string; }
// Note: workshopId comes from the URL path parameter, not the body
interface ListWorkshopsParams extends PaginationParams { therapistId?: string; from?: Date; to?: Date; }
```

**Important**: `currentParticipants` is computed as `COUNT(*)` from `WorkshopRegistrations`. `isRegistered` is computed per-request based on the authenticated client's ID.

### 8.15 Session Notes (therapist-authored)

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/session-notes?clientId=&therapistId=&sessionId=` | - | `PaginatedResponse<SessionNote>` | |
| GET | `/api/session-notes/:id` | - | `ApiResponse<SessionNote>` | |
| POST | `/api/session-notes` | `CreateSessionNoteRequest` | `ApiResponse<SessionNote>` | 201 |
| PUT | `/api/session-notes/:id` | `UpdateSessionNoteRequest` | `ApiResponse<SessionNote>` | |
| DELETE | `/api/session-notes/:id` | - | `ApiResponse<null>` | 204 |

```typescript
interface CreateSessionNoteRequest { clientId: string; therapistId: string; sessionId?: string; content: string; }
interface UpdateSessionNoteRequest { content: string; }
interface ListSessionNotesParams extends PaginationParams { clientId?: string; therapistId?: string; sessionId?: string; }
```

### 8.16 Therapist Journal & CPD

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/therapist-journal?therapistId=&from=&to=&sharedWithSupervisor=` | - | `PaginatedResponse<TherapistJournalEntry>` | |
| GET | `/api/therapist-journal/:id` | - | `ApiResponse<TherapistJournalEntry>` | |
| POST | `/api/therapist-journal` | `CreateTherapistJournalEntryRequest` | `ApiResponse<TherapistJournalEntry>` | 201 |
| PUT | `/api/therapist-journal/:id` | `UpdateTherapistJournalEntryRequest` | `ApiResponse<TherapistJournalEntry>` | |
| DELETE | `/api/therapist-journal/:id` | - | `ApiResponse<null>` | 204 |
| GET | `/api/cpd?therapistId=` | - | `PaginatedResponse<CpdEntry>` | |
| GET | `/api/cpd/:id` | - | `ApiResponse<CpdEntry>` | |
| POST | `/api/cpd` | `CreateCpdEntryRequest` | `ApiResponse<CpdEntry>` | 201 |
| PUT | `/api/cpd/:id` | `UpdateCpdEntryRequest` | `ApiResponse<CpdEntry>` | |
| DELETE | `/api/cpd/:id` | - | `ApiResponse<null>` | 204 |

```typescript
// Therapist Journal
interface CreateTherapistJournalEntryRequest {
  therapistId: string; mood: number; thoughtsAndFeelings: string; sharedWithSupervisor: boolean;
}
interface UpdateTherapistJournalEntryRequest {
  mood?: number; thoughtsAndFeelings?: string; sharedWithSupervisor?: boolean;
}
interface ListTherapistJournalEntriesParams extends PaginationParams {
  therapistId: string; from?: Date; to?: Date; sharedWithSupervisor?: boolean;
}

// CPD
interface CreateCpdEntryRequest {
  therapistId: string; title: string; description: string; link?: string;
  startDate?: Date; completedDate?: Date;
}
interface UpdateCpdEntryRequest {
  title?: string; description?: string; link?: string; startDate?: Date; completedDate?: Date;
}
interface ListCpdEntriesParams extends PaginationParams { therapistId: string; }
```

### 8.17 Supervision

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/supervision/connections?therapistId=&role=&status=` | - | `PaginatedResponse<SupervisionConnection>` | role = supervisor/supervisee |
| GET | `/api/supervision/connections/:id` | - | `ApiResponse<SupervisionConnection>` | |
| POST | `/api/supervision/connections` | `CreateSupervisionConnectionRequest` | `ApiResponse<SupervisionConnection>` | 201 |
| PUT | `/api/supervision/connections/:id` | `UpdateSupervisionConnectionRequest` | `ApiResponse<SupervisionConnection>` | Accept/reject |
| DELETE | `/api/supervision/connections/:id` | - | `ApiResponse<null>` | 204 |
| GET | `/api/supervision/sessions?supervisorId=&superviseeId=&status=&from=&to=` | - | `PaginatedResponse<SupervisionSession>` | |
| GET | `/api/supervision/sessions/:id` | - | `ApiResponse<SupervisionSession>` | |
| POST | `/api/supervision/sessions` | `CreateSupervisionSessionRequest` | `ApiResponse<SupervisionSession>` | 201 |
| PUT | `/api/supervision/sessions/:id` | `UpdateSupervisionSessionRequest` | `ApiResponse<SupervisionSession>` | |
| DELETE | `/api/supervision/sessions/:id` | - | `ApiResponse<null>` | 204 |

```typescript
// Supervision Connections
interface CreateSupervisionConnectionRequest { superviseeId: string; supervisorId: string; message?: string; }
interface UpdateSupervisionConnectionRequest { status: "accepted" | "rejected"; }
interface ListSupervisionConnectionsParams extends PaginationParams {
  therapistId: string; role?: "supervisor" | "supervisee"; status?: "pending" | "accepted" | "rejected";
}

// Supervision Sessions
interface CreateSupervisionSessionRequest {
  supervisorId: string; superviseeId: string; scheduledTime: Date; duration: number;
  modality?: "video" | "inPerson" | "phoneCall";  // Note: "text" is NOT valid for supervision
  price?: number;
}
interface UpdateSupervisionSessionRequest {
  status?: "scheduled" | "completed" | "cancelled"; scheduledTime?: Date; duration?: number;
  notes?: string;  // supervisor's session notes (added post-session)
}
interface ListSupervisionSessionsParams extends PaginationParams {
  supervisorId?: string; superviseeId?: string; status?: "scheduled" | "completed" | "cancelled";
  from?: Date; to?: Date;
}
```

### 8.18 Bookmarks

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/bookmarks?therapistId=&search=` | - | `PaginatedResponse<TherapistBookmark>` | |
| GET | `/api/bookmarks/:id` | - | `ApiResponse<TherapistBookmark>` | |
| POST | `/api/bookmarks` | `CreateBookmarkRequest` | `ApiResponse<TherapistBookmark>` | 201 |
| PUT | `/api/bookmarks/:id` | `UpdateBookmarkRequest` | `ApiResponse<TherapistBookmark>` | |
| DELETE | `/api/bookmarks/:id` | - | `ApiResponse<null>` | 204 |

```typescript
interface CreateBookmarkRequest { therapistId: string; title: string; url: string; }
interface UpdateBookmarkRequest { title?: string; url?: string; }
interface ListBookmarksParams extends PaginationParams { therapistId: string; search?: string; }
```

### 8.19 Course Packages

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/course-packages?therapistId=&isActive=` | - | `PaginatedResponse<CoursePackage>` | |
| GET | `/api/course-packages/:id` | - | `ApiResponse<CoursePackage>` | |
| POST | `/api/course-packages` | `CreateCoursePackageRequest` | `ApiResponse<CoursePackage>` | 201 |
| PUT | `/api/course-packages/:id` | `UpdateCoursePackageRequest` | `ApiResponse<CoursePackage>` | |
| DELETE | `/api/course-packages/:id` | - | `ApiResponse<null>` | 204 |

```typescript
interface CreateCoursePackageRequest {
  therapistId: string; title: string; description: string;
  sessionRateId: string; totalSessions: number; totalPrice: number;
}
interface UpdateCoursePackageRequest {
  title?: string; description?: string; sessionRateId?: string;
  totalSessions?: number; totalPrice?: number; isActive?: boolean;
}
interface ListCoursePackagesParams extends PaginationParams { therapistId: string; isActive?: boolean; }
```

### 8.20 Course Bookings (client purchases)

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/course-bookings?clientId=&therapistId=&status=` | - | `PaginatedResponse<ClientCourseBooking>` | |
| GET | `/api/course-bookings/:id` | - | `ApiResponse<ClientCourseBooking>` | |
| POST | `/api/course-bookings` | `PurchaseCourseRequest` | `ApiResponse<ClientCourseBooking>` | Looks up package, denormalises |
| PUT | `/api/course-bookings/:id/cancel` | - | `ApiResponse<ClientCourseBooking>` | Sets status = cancelled |
| PUT | `/api/course-bookings/:id/use-session` | - | `ApiResponse<ClientCourseBooking>` | Increments `sessionsUsed`; sets status = `completed` when `sessionsUsed == totalSessions` |

```typescript
interface PurchaseCourseRequest { clientId: string; coursePackageId: string; }
interface ListCourseBookingsParams extends PaginationParams {
  clientId?: string; therapistId?: string; status?: "active" | "completed" | "cancelled";
}
```

### 8.21 Pro Bono Tokens

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/pro-bono-tokens?therapistId=&clientId=&status=` | - | `PaginatedResponse<ProBonoToken>` | |
| GET | `/api/pro-bono-tokens/:id` | - | `ApiResponse<ProBonoToken>` | |
| POST | `/api/pro-bono-tokens` | `CreateProBonoTokenRequest` | `ApiResponse<ProBonoToken>` | 201 |
| PUT | `/api/pro-bono-tokens/:id/use` | `UseProBonoTokenRequest` | `ApiResponse<ProBonoToken>` | 409 if not available |
| DELETE | `/api/pro-bono-tokens/:id` | - | `ApiResponse<null>` | 204 (revoke) |

```typescript
interface CreateProBonoTokenRequest {
  therapistId: string; clientId: string; sessionRateId: string; sessionRateTitle: string;
}
interface UseProBonoTokenRequest { tokenId: string; }
interface ListProBonoTokensParams extends PaginationParams {
  therapistId?: string; clientId?: string; status?: "available" | "used" | "expired";
}
```

### 8.22 Theme Settings

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/settings/theme` | - | `ApiResponse<ThemeSettings>` | Per-user |
| PUT | `/api/settings/theme` | `UpdateThemeSettingsRequest` | `ApiResponse<ThemeSettings>` | Partial update |
| POST | `/api/settings/theme/reset` | - | `ApiResponse<ThemeSettings>` | Reset to defaults |

```typescript
interface UpdateThemeSettingsRequest {
  primaryColor?: string; supervisionColor?: string; workshopColor?: string;
  videoColor?: string; inPersonColor?: string; textColor?: string;
  phoneCallColor?: string; accentColor?: string; successColor?: string;
  warningColor?: string; errorColor?: string;
  darkPrimaryColor?: string; darkSupervisionColor?: string; darkWorkshopColor?: string;
  darkVideoColor?: string; darkInPersonColor?: string; darkTextColor?: string;
  darkPhoneCallColor?: string; darkAccentColor?: string; darkSuccessColor?: string;
  darkWarningColor?: string; darkErrorColor?: string;
  darkMode?: boolean;
}
```

---

## 9. Business Rules & Constraints

### 9.1 Session Booking & Approval Flow

This flow involves three tables working together: `VideoSessions`, `SessionRequests`, and `Messages`.

**Booking steps:**

1. Client selects an availability window and a session rate whose ID is in `enabledRateIds`
2. Server checks whether the rate duration fits within the window time range
3. Server calculates total booked minutes for that window (sum of `duration` from all non-cancelled `VideoSessions` within that date/time range)
4. **If `maxOccupancy` is set and total booked minutes would exceed it** (over-capacity):
   - `VideoSession` is created with `requiresApproval = true`, `status = 'scheduled'`, `isPaid = false`
   - `SessionRequest` is created with `status = 'pending'` and display fields snapshotted from the session rate
   - `Message` is created from client to therapist with `content` describing the request and `sessionRequestId` referencing the new `SessionRequest`
   - All three inserts happen in a single transaction (see `usp_CreateBookingWithApproval`)
5. **If no maxOccupancy or within capacity** (normal booking):
   - `VideoSession` is created with `requiresApproval = false`
   - A `SessionRequest` is still created (with `status = 'pending'`) so the message thread has the booking card
   - Message is sent as a booking confirmation

**Approval transitions (therapist action via message UI):**

| Action | SessionRequest.Status | VideoSession Side Effect | Auto-Message |
|--------|----------------------|-------------------------|-------------|
| Approve | `pending` -> `approved` | No change (stays `scheduled`) | Client notified: "Your session has been approved" |
| Decline | `pending` -> `declined` | `status` set to `cancelled` | Client notified: "Your session request was declined" + optional reason |
| Pay | `approved` -> `paid` | `isPaid` set to `true` | Client notified: "Payment confirmed" |

**Key constraints:**
- A `SessionRequest` can only transition forward: `pending -> approved/declined`, `approved -> paid`
- Once `declined`, the linked `VideoSession` is cancelled and cannot be re-approved
- The denormalised display fields on `SessionRequest` (`sessionType`, `date`, `time`, `duration`, `price`, `modality`) are snapshots taken at booking time — they do not change if the therapist later edits their session rates

### 9.2 Workshop Registration

- Cannot register if `COUNT(WorkshopRegistrations) >= MaxParticipants` -> return 409
- `currentParticipants` is always computed, never stored
- `isRegistered` is per-client, computed from `WorkshopRegistrations` existence

### 9.3 Pro Bono Token Usage

- Only tokens with `status = 'available'` can be used -> return 409 otherwise
- Using a token sets `status = 'used'` and `usedAt = NOW()`
- Delete = revoke (hard delete)

### 9.4 Assessment Scoring

- PHQ-9: Sum of 9 frequency items (each 0-3). Range 0-27.
  - 0-4: Minimal, 5-9: Mild, 10-14: Moderate, 15-19: Moderately Severe, 20-27: Severe
- GAD-7: Sum of 7 frequency items (each 0-3). Range 0-21.
  - 0-4: Minimal, 5-9: Mild, 10-14: Moderate, 15-21: Severe
- Scores are **server-calculated** on create and stored in the record

### 9.5 Journal Sharing

- `sharedWithTherapistIds` is a list of therapist user IDs
- Empty array = private (only client can see)
- Therapist can only read journal entries where their ID is in the sharing list
- Update sharing = replace the entire list (DELETE all + INSERT new)

### 9.6 Therapist Journal Sharing with Supervisor

- `sharedWithSupervisor = true` means the entry is visible to any accepted supervisor
- Supervisor queries: filter `WHERE SharedWithSupervisor = 1 AND TherapistId IN (SELECT SuperviseeId FROM SupervisionConnections WHERE SupervisorId = @supervisorId AND Status = 'accepted')`

### 9.7 Connection Required for Data Access

- A therapist can only view a client's assessments, journal entries (shared), and session history if there is an `accepted` Connection between them
- Client can only book sessions with therapists they have an accepted connection with (or via public workshop registration)

### 9.8 Course Booking Purchase

- When a client purchases a course: look up `CoursePackage` by ID, verify `isActive = true`
- Denormalise `courseTitle`, `therapistId`, `sessionRateId`, `totalSessions`, `totalPrice` into the `ClientCourseBooking` row
- `sessionsUsed` starts at 0
- `PUT /api/course-bookings/:id/use-session` increments `sessionsUsed` by 1 (validates `sessionsUsed < totalSessions` and `status = 'active'`, returns 409 otherwise)
- Status transitions: `active` -> `completed` (auto-set when `sessionsUsed == totalSessions` after increment) or `cancelled`

### 9.9 Post Likes

- Toggle behavior: if user already liked, remove like; otherwise add like
- `likes` array in the API response = list of user IDs from `PostLikes` junction table
- Like count = `COUNT(*)` from `PostLikes`

---

## 10. Stored Procedures

### 10.1 usp_GetConversations

Returns conversation summaries for a user's message sidebar.

```sql
CREATE PROCEDURE usp_GetConversations
    @UserId NVARCHAR(50)
AS
BEGIN
    WITH MessageContacts AS (
        SELECT
            CASE WHEN SenderId = @UserId THEN ReceiverId ELSE SenderId END AS ContactId,
            Id, Content, Timestamp, IsRead, SenderId, ReceiverId,
            BookmarkTitle, BookmarkUrl, SessionRequestId,
            ROW_NUMBER() OVER (
                PARTITION BY CASE WHEN SenderId = @UserId THEN ReceiverId ELSE SenderId END
                ORDER BY Timestamp DESC
            ) AS rn
        FROM Messages
        WHERE SenderId = @UserId OR ReceiverId = @UserId
    )
    SELECT
        mc.ContactId,
        mc.Id, mc.Content, mc.Timestamp, mc.IsRead,
        mc.SenderId, mc.ReceiverId,
        mc.BookmarkTitle, mc.BookmarkUrl,
        -- SessionRequest fields (LEFT JOIN — null when no session request)
        sr.Id AS SessionRequestId,
        sr.SessionId AS SR_SessionId,
        sr.SessionType AS SR_SessionType,
        sr.Date AS SR_Date,
        sr.Time AS SR_Time,
        sr.Duration AS SR_Duration,
        sr.Price AS SR_Price,
        sr.Modality AS SR_Modality,
        sr.Status AS SR_Status,
        (
            SELECT COUNT(*)
            FROM Messages m2
            WHERE m2.SenderId = mc.ContactId
              AND m2.ReceiverId = @UserId
              AND m2.IsRead = 0
        ) AS UnreadCount
    FROM MessageContacts mc
    LEFT JOIN SessionRequests sr ON sr.Id = mc.SessionRequestId
    WHERE mc.rn = 1
    ORDER BY mc.Timestamp DESC;
END
```

### 10.2 usp_CalculateWindowOccupancy

Calculates total booked minutes for a therapist's availability window.

```sql
CREATE PROCEDURE usp_CalculateWindowOccupancy
    @TherapistId NVARCHAR(50),
    @Date DATE,
    @StartTime TIME,
    @EndTime TIME
AS
BEGIN
    SELECT ISNULL(SUM(vs.Duration), 0) AS TotalBookedMinutes
    FROM VideoSessions vs
    WHERE vs.TherapistId = @TherapistId
      AND vs.Status NOT IN ('cancelled')
      AND CAST(vs.ScheduledTime AS DATE) = @Date
      AND CAST(vs.ScheduledTime AS TIME) >= @StartTime
      AND CAST(vs.ScheduledTime AS TIME) < @EndTime;
END
```

### 10.3 usp_TogglePostLike

```sql
CREATE PROCEDURE usp_TogglePostLike
    @PostId NVARCHAR(50),
    @UserId NVARCHAR(50)
AS
BEGIN
    IF EXISTS (SELECT 1 FROM PostLikes WHERE PostId = @PostId AND UserId = @UserId)
    BEGIN
        DELETE FROM PostLikes WHERE PostId = @PostId AND UserId = @UserId;
    END
    ELSE
    BEGIN
        INSERT INTO PostLikes (PostId, UserId) VALUES (@PostId, @UserId);
    END

    -- Return updated likes array
    SELECT UserId FROM PostLikes WHERE PostId = @PostId;
END
```

### 10.4 usp_PurchaseCourse

```sql
CREATE PROCEDURE usp_PurchaseCourse
    @BookingId NVARCHAR(50),
    @ClientId NVARCHAR(50),
    @CoursePackageId NVARCHAR(50)
AS
BEGIN
    DECLARE @TherapistId NVARCHAR(50), @Title NVARCHAR(300),
            @SessionRateId NVARCHAR(50), @TotalSessions INT,
            @TotalPrice DECIMAL(10,2), @IsActive BIT;

    SELECT @TherapistId = TherapistId, @Title = Title,
           @SessionRateId = SessionRateId, @TotalSessions = TotalSessions,
           @TotalPrice = TotalPrice, @IsActive = IsActive
    FROM CoursePackages WHERE Id = @CoursePackageId;

    IF @TherapistId IS NULL
        THROW 50404, 'CoursePackage not found', 1;
    IF @IsActive = 0
        THROW 50409, 'CoursePackage is not active', 1;

    INSERT INTO ClientCourseBookings (Id, ClientId, TherapistId, CoursePackageId,
        CourseTitle, SessionRateId, TotalSessions, SessionsUsed, TotalPrice, Status)
    VALUES (@BookingId, @ClientId, @TherapistId, @CoursePackageId,
        @Title, @SessionRateId, @TotalSessions, 0, @TotalPrice, 'active');

    SELECT * FROM ClientCourseBookings WHERE Id = @BookingId;
END
```

### 10.5 usp_CreateBookingWithApproval

Atomically creates a VideoSession + SessionRequest + Message when a booking requires approval. Also used for normal bookings that want a message-linked session request.

```sql
CREATE PROCEDURE usp_CreateBookingWithApproval
    @SessionId       NVARCHAR(50),
    @RequestId       NVARCHAR(50),
    @MessageId       NVARCHAR(50),
    @TherapistId     NVARCHAR(50),
    @ClientId        NVARCHAR(50),
    @ScheduledTime   DATETIME2,
    @Duration        INT,
    @SessionRateId   NVARCHAR(50),
    @Modality        NVARCHAR(20),
    @Price           DECIMAL(10,2),
    @RequiresApproval BIT,
    -- SessionRequest display fields
    @SessionTypeLabel NVARCHAR(200),
    @DateLabel       NVARCHAR(50),
    @TimeLabel       NVARCHAR(50),
    -- Message content
    @MessageContent  NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        -- 1. Create VideoSession
        INSERT INTO VideoSessions (Id, TherapistId, ClientId, ScheduledTime, Duration,
            Status, SessionRateId, Modality, AzureRoomId, IsPaid, Price, RequiresApproval)
        VALUES (@SessionId, @TherapistId, @ClientId, @ScheduledTime, @Duration,
            'scheduled', @SessionRateId, @Modality, 'room-' + REPLACE(NEWID(), '-', ''),
            0, @Price, @RequiresApproval);

        -- 2. Create SessionRequest
        INSERT INTO SessionRequests (Id, SessionId, SessionType, Date, Time,
            Duration, Price, Modality, Status)
        VALUES (@RequestId, @SessionId, @SessionTypeLabel, @DateLabel, @TimeLabel,
            @Duration, @Price, @Modality, 'pending');

        -- 3. Create Message with session request link
        INSERT INTO Messages (Id, SenderId, ReceiverId, Content, IsRead, SessionRequestId)
        VALUES (@MessageId, @ClientId, @TherapistId, @MessageContent, 0, @RequestId);

        COMMIT TRANSACTION;

        -- Return the created session request
        SELECT sr.*, vs.Status AS SessionStatus
        FROM SessionRequests sr
        INNER JOIN VideoSessions vs ON sr.SessionId = vs.Id
        WHERE sr.Id = @RequestId;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

### 10.6 usp_UpdateSessionRequestStatus

Transitions a session request's status and applies side effects to the linked VideoSession.

```sql
CREATE PROCEDURE usp_UpdateSessionRequestStatus
    @RequestId  NVARCHAR(50),
    @NewStatus  NVARCHAR(10),   -- 'approved', 'declined', or 'paid'
    @Reason     NVARCHAR(MAX) = NULL,
    @ActorId    NVARCHAR(50)    -- therapist (approve/decline) or client (pay)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @CurrentStatus NVARCHAR(10), @SessionId NVARCHAR(50),
                @TherapistId NVARCHAR(50), @ClientId NVARCHAR(50);

        SELECT @CurrentStatus = sr.Status, @SessionId = sr.SessionId,
               @TherapistId = vs.TherapistId, @ClientId = vs.ClientId
        FROM SessionRequests sr
        INNER JOIN VideoSessions vs ON sr.SessionId = vs.Id
        WHERE sr.Id = @RequestId;

        IF @CurrentStatus IS NULL
            THROW 50404, 'SessionRequest not found', 1;

        -- Validate transition
        IF @NewStatus = 'approved' AND @CurrentStatus <> 'pending'
            THROW 50409, 'Can only approve a pending request', 1;
        IF @NewStatus = 'declined' AND @CurrentStatus <> 'pending'
            THROW 50409, 'Can only decline a pending request', 1;
        IF @NewStatus = 'paid' AND @CurrentStatus <> 'approved'
            THROW 50409, 'Can only pay an approved request', 1;

        -- Update session request
        UPDATE SessionRequests
        SET Status = @NewStatus, UpdatedAt = GETUTCDATE()
        WHERE Id = @RequestId;

        -- Apply side effects
        IF @NewStatus = 'declined'
        BEGIN
            UPDATE VideoSessions SET Status = 'cancelled' WHERE Id = @SessionId;
        END
        ELSE IF @NewStatus = 'paid'
        BEGIN
            UPDATE VideoSessions SET IsPaid = 1 WHERE Id = @SessionId;
        END

        COMMIT TRANSACTION;

        SELECT * FROM SessionRequests WHERE Id = @RequestId;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

### 10.7 usp_ReplaceAvailabilityWindows

Replaces all availability windows for a therapist (full overwrite).

```sql
CREATE PROCEDURE usp_ReplaceAvailabilityWindows
    @TherapistId NVARCHAR(50),
    @WindowsJson NVARCHAR(MAX)  -- JSON array of windows
AS
BEGIN
    BEGIN TRANSACTION;

    -- Delete existing windows and their rate assignments
    DELETE awr FROM AvailabilityWindowRates awr
    INNER JOIN AvailabilityWindows aw ON awr.WindowId = aw.Id
    WHERE aw.TherapistId = @TherapistId;

    DELETE FROM AvailabilityWindows WHERE TherapistId = @TherapistId;

    -- Insert new windows from JSON (using a temp table to capture generated IDs)
    CREATE TABLE #NewWindows (
        RowIdx INT, WindowId INT, Date DATE, StartTime TIME, EndTime TIME, MaxOccupancy INT
    );

    INSERT INTO AvailabilityWindows (TherapistId, Date, StartTime, EndTime, MaxOccupancy)
    OUTPUT INSERTED.Id, INSERTED.Date, INSERTED.StartTime
    SELECT @TherapistId, Date, StartTime, EndTime, MaxOccupancy
    FROM OPENJSON(@WindowsJson)
    WITH (
        Date DATE '$.date',
        StartTime TIME '$.startTime',
        EndTime TIME '$.endTime',
        MaxOccupancy INT '$.maxOccupancy'
    );

    -- Insert rate assignments by matching windows back to the JSON array.
    -- Each JSON element has an "enabledRateIds" array. We cross-apply to extract
    -- each rate ID and join on (Date, StartTime) to find the generated WindowId.
    INSERT INTO AvailabilityWindowRates (WindowId, SessionRateId)
    SELECT aw.Id, r.value
    FROM OPENJSON(@WindowsJson)
    WITH (
        Date DATE '$.date',
        StartTime TIME '$.startTime',
        EnabledRateIds NVARCHAR(MAX) '$.enabledRateIds' AS JSON
    ) j
    CROSS APPLY OPENJSON(j.EnabledRateIds) r
    INNER JOIN AvailabilityWindows aw
        ON aw.TherapistId = @TherapistId
        AND aw.Date = j.Date
        AND aw.StartTime = j.StartTime;

    COMMIT TRANSACTION;
END
```

---

## 11. Repository Layer

Each repository encapsulates SQL queries for a single entity. Pattern:

```typescript
// Example: ConnectionRepository
export class ConnectionRepository {
  constructor(private db: DatabasePool) {}

  async list(params: ListConnectionsParams): Promise<{ items: ConnectionRequest[]; total: number }> { ... }
  async getById(id: string): Promise<ConnectionRequest | null> { ... }
  async create(data: CreateConnectionRequest): Promise<ConnectionRequest> { ... }
  async update(id: string, data: UpdateConnectionRequest): Promise<ConnectionRequest | null> { ... }
  async delete(id: string): Promise<boolean> { ... }
}
```

### Repository Files

| File | Entity | Tables Accessed |
|------|--------|----------------|
| `shared/userRepository.ts` | User | Users |
| `shared/themeRepository.ts` | ThemeSettings | ThemeSettings |
| `shared/connectionRepository.ts` | ConnectionRequest | Connections |
| `shared/messageRepository.ts` | Message, ConversationSummary | Messages, SessionRequests (LEFT JOIN for embedded request data) |
| `shared/sessionRepository.ts` | VideoSession | VideoSessions, SessionRates |
| `shared/sessionRequestRepository.ts` | SessionRequestData | SessionRequests, VideoSessions |
| `client/profileRepository.ts` | Client | Users, ClientProfiles, ClientAreasOfFocus, ClientFollowedTherapists |
| `client/journalRepository.ts` | JournalEntry | JournalEntries, JournalGratitude, JournalAccomplishments, JournalActivities, JournalGoals, JournalSharing |
| `client/assessmentRepository.ts` | Assessment | Assessments |
| `client/noteRepository.ts` | ClientNote | ClientNotes |
| `client/courseBookingRepository.ts` | ClientCourseBooking | ClientCourseBookings, CoursePackages |
| `therapist/profileRepository.ts` | Therapist, TherapistProfile | Users, TherapistProfiles, TherapistExtendedProfiles, + all junction tables |
| `therapist/sessionRateRepository.ts` | SessionRate | SessionRates |
| `therapist/availabilityRepository.ts` | AvailabilityWindow | AvailabilityWindows, AvailabilityWindowRates |
| `therapist/postRepository.ts` | Post | Posts, PostLikes |
| `therapist/workshopRepository.ts` | Workshop | Workshops, WorkshopRegistrations |
| `therapist/sessionNoteRepository.ts` | SessionNote | SessionNotes |
| `therapist/journalRepository.ts` | TherapistJournalEntry, CpdEntry | TherapistJournalEntries, CpdEntries |
| `therapist/supervisionRepository.ts` | SupervisionConnection, SupervisionSession | SupervisionConnections, SupervisionSessions |
| `therapist/bookmarkRepository.ts` | TherapistBookmark | TherapistBookmarks |
| `therapist/coursePackageRepository.ts` | CoursePackage | CoursePackages |
| `therapist/proBonoRepository.ts` | ProBonoToken | ProBonoTokens |

---

## 12. Service Layer

Services contain business logic and call repositories. They should mirror the frontend service layer signatures exactly so the API contract is consistent.

### Key Responsibilities

| Service | Key Logic |
|---------|-----------|
| `authService` | Password hashing, JWT generation/validation, user creation |
| `connectionService` | Ensures no duplicate connection, validates user types |
| `messageService` | Conversation aggregation, mark-read batch |
| `sessionService` | Occupancy calculation, Azure room creation, delegates approval to `sessionRequestService` |
| `sessionRequestService` | Atomic booking-with-approval (calls stored proc), status transitions with side effects, validation of allowed transitions |
| `therapistProfileService` | Assembles Therapist from multiple tables; extended profile CRUD |
| `clientProfileService` | Follow/unfollow management |
| `journalService` | Sharing array management (delete-all + insert pattern) |
| `assessmentService` | Score calculation on create |
| `workshopService` | Capacity check, registration counting |
| `postService` | Like toggle, likes array assembly |
| `courseBookingService` | Package lookup, denormalization, session usage tracking |
| `proBonoService` | Status validation on use, idempotency |
| `supervisionService` | Role-based filtering (supervisor vs supervisee) |
| `availabilityService` | Full-replace pattern for windows |

---

## 13. Azure Functions Structure

Use the **Azure Functions v4 programming model** for Node.js/TypeScript.

### Function Registration Pattern

```typescript
// functions/sessions/listSessions.ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { sessionService } from "../../services/shared/sessionService";
import { authenticate } from "../../middleware/auth";

app.http("listSessions", {
  methods: ["GET"],
  authLevel: "anonymous", // Auth handled by middleware
  route: "sessions",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const user = await authenticate(request);
    if (!user) return { status: 401, jsonBody: { data: null, error: "Unauthorized", status: 401 } };

    const params = {
      therapistId: request.query.get("therapistId") || undefined,
      clientId: request.query.get("clientId") || undefined,
      status: request.query.get("status") as any || undefined,
      page: parseInt(request.query.get("page") || "1"),
      pageSize: parseInt(request.query.get("pageSize") || "50"),
    };

    const result = await sessionService.list(params);
    return { status: result.status, jsonBody: result };
  },
});
```

### Function Count Summary

| Domain | Functions | Routes |
|--------|-----------|--------|
| Auth | 7 | `/api/auth/*` |
| Connections | 5 | `/api/connections` |
| Messages | 5 | `/api/messages/*` |
| Sessions | 5 | `/api/sessions` |
| Session Requests | 6 | `/api/session-requests` |
| Therapist Profiles | 6 | `/api/therapists/*` |
| Session Rates | 4 | `/api/therapists/me/rates` |
| Availability | 3 | `/api/therapists/*/availability` |
| Client Profiles | 6 | `/api/clients/*` |
| Journal | 5 | `/api/journal` |
| Assessments | 4 | `/api/assessments` |
| Client Notes | 3 | `/api/client-notes` |
| Posts | 6 | `/api/posts` |
| Workshops | 7 | `/api/workshops` |
| Session Notes | 5 | `/api/session-notes` |
| Therapist Journal | 5 | `/api/therapist-journal` |
| CPD | 5 | `/api/cpd` |
| Supervision Connections | 5 | `/api/supervision/connections` |
| Supervision Sessions | 5 | `/api/supervision/sessions` |
| Bookmarks | 5 | `/api/bookmarks` |
| Course Packages | 5 | `/api/course-packages` |
| Course Bookings | 5 | `/api/course-bookings` |
| Pro Bono Tokens | 5 | `/api/pro-bono-tokens` |
| Theme Settings | 3 | `/api/settings/theme` |
| **Total** | **~123** | |

---

## 14. Data Relationships Diagram

```
Users (id, type: client|therapist)
  |
  |-- [type=client] --> ClientProfiles
  |     |-- ClientAreasOfFocus (1:N)
  |     |-- ClientFollowedTherapists (N:M with therapist Users)
  |     |-- JournalEntries (1:N)
  |     |     |-- JournalGratitude, JournalAccomplishments, etc. (1:N each)
  |     |     |-- JournalSharing (N:M with therapist Users)
  |     |-- Assessments (1:N, also FK to therapist)
  |     |-- ClientNotes (1:N, optional FK to VideoSessions)
  |     |-- ClientCourseBookings (1:N, FK to CoursePackages)
  |
  |-- [type=therapist] --> TherapistProfiles
  |     |-- TherapistExtendedProfiles (1:1)
  |     |     |-- TherapistProfileImages (1:N)
  |     |     |-- TherapistProfileLinks (1:N)
  |     |     |-- TherapistSpokenLanguages (1:N)
  |     |     |-- TherapistEducations (1:N)
  |     |     |-- TherapistTypeAssignments (1:N)
  |     |     |-- TherapistSessionTypes (1:N)
  |     |     |-- TherapistAreasOfFocus (1:N)
  |     |     |-- TherapistClinicalApproaches (1:N)
  |     |     |-- GoverningBodyMemberships (1:N)
  |     |-- TherapistSpecializations (1:N, simple profile)
  |     |-- TherapistClinicalApproachLabels (1:N, simple profile)
  |     |-- TherapistEducationLabels (1:N, simple profile)
  |     |-- SessionRates (1:N)
  |     |-- AvailabilityWindows (1:N)
  |     |     |-- AvailabilityWindowRates (N:M with SessionRates)
  |     |-- Posts (1:N)
  |     |     |-- PostLikes (N:M with Users)
  |     |-- Workshops (1:N)
  |     |     |-- WorkshopRegistrations (N:M with client Users)
  |     |-- SessionNotes (1:N, also FK to client, optional FK to VideoSessions)
  |     |-- CoursePackages (1:N)
  |     |-- TherapistBookmarks (1:N)
  |     |-- TherapistJournalEntries (1:N)
  |     |-- CpdEntries (1:N)
  |     |-- ProBonoTokens (1:N, also FK to client, FK to SessionRate)
  |
  |-- ThemeSettings (1:1, per user)
  |-- Connections (client <-> therapist, N:M)
  |-- Messages (any user <-> any user, 1:N both directions)
  |     |-- SessionRequests (0:1 per message, FK Messages.SessionRequestId)
  |           |-- VideoSessions (1:1, FK SessionRequests.SessionId)
  |-- VideoSessions (client + therapist, 1:N)
  |-- SupervisionConnections (therapist <-> therapist, N:M)
  |-- SupervisionSessions (therapist <-> therapist, 1:N)
```

---

## 15. Error Handling & Middleware

### 15.1 Error Response Envelope

All errors must use the same `ApiResponse<null>` envelope defined in Section 7 with `success: false`. The frontend HTTP client checks `response.ok` and `body.success` to distinguish success from failure, so the shape must be consistent across all endpoints.

```typescript
// Error responses are just ApiResponse<null> with success: false
// Example:
{
  success: false,
  data: null,
  error: {
    code: "RESOURCE_NOT_FOUND",     // Machine-readable error code (see table below)
    message: "Session not found",   // Human-readable message safe to display in UI
    details: null                   // Optional structured data (validation errors, etc.)
  },
  status: 404
}
```

### 15.2 HTTP Status Code Mapping

| HTTP Status | When to Use | Example |
|-------------|------------|---------|
| `400 Bad Request` | Malformed body, missing required fields, invalid enum values | Missing `therapistId` on session create |
| `401 Unauthorized` | No token, expired token, invalid token | JWT expired |
| `403 Forbidden` | Valid token but insufficient permissions for the resource | Client trying to approve a session request |
| `404 Not Found` | Resource does not exist or caller has no access to it | GET `/api/sessions/nonexistent-id` |
| `409 Conflict` | Business rule violation, duplicate creation, invalid state transition | Approving an already-declined session request |
| `422 Unprocessable Entity` | Semantically invalid input (well-formed but logically wrong) | Booking a session in the past, rate duration exceeds window |
| `429 Too Many Requests` | Rate limiting triggered | More than 100 requests/min per user |
| `500 Internal Server Error` | Unhandled exception, database connection failure | SQL timeout |

### 15.3 Error Codes

Machine-readable error codes follow a `DOMAIN_ACTION` naming convention:

```typescript
// Authentication & Authorization
const AUTH_ERRORS = {
  AUTH_INVALID_CREDENTIALS:  "Invalid email or password",
  AUTH_TOKEN_EXPIRED:        "Authentication token has expired",
  AUTH_TOKEN_INVALID:        "Authentication token is invalid",
  AUTH_INSUFFICIENT_ROLE:    "You do not have permission to perform this action",
} as const;

// Validation
const VALIDATION_ERRORS = {
  VALIDATION_REQUIRED_FIELD: "A required field is missing",
  VALIDATION_INVALID_FORMAT: "Field format is invalid",
  VALIDATION_INVALID_ENUM:   "Value is not in the allowed set",
  VALIDATION_DATE_IN_PAST:   "Date/time must be in the future",
} as const;

// Resource
const RESOURCE_ERRORS = {
  RESOURCE_NOT_FOUND:        "The requested resource was not found",
  RESOURCE_ALREADY_EXISTS:   "A resource with this identifier already exists",
  RESOURCE_DELETED:          "This resource has been deleted",
} as const;

// Sessions & Booking
const SESSION_ERRORS = {
  SESSION_WINDOW_FULL:       "This availability window has no remaining capacity",
  SESSION_RATE_DISABLED:     "This session rate is not enabled for the selected window",
  SESSION_DURATION_EXCEEDS:  "Session duration exceeds the availability window",
  SESSION_ALREADY_CANCELLED: "This session has already been cancelled",
} as const;

// Session Requests (Approval Flow)
const SESSION_REQUEST_ERRORS = {
  REQUEST_NOT_FOUND:         "Session request not found",
  REQUEST_INVALID_TRANSITION:"This status transition is not allowed",
  REQUEST_ALREADY_RESOLVED:  "This request has already been approved or declined",
  REQUEST_NOT_APPROVED:      "Cannot pay for a request that has not been approved",
} as const;

// Connections
const CONNECTION_ERRORS = {
  CONNECTION_DUPLICATE:      "A connection request already exists between these users",
  CONNECTION_SELF_CONNECT:   "Cannot create a connection to yourself",
  CONNECTION_WRONG_TYPES:    "Connections must be between a client and a therapist",
} as const;

// Workshops
const WORKSHOP_ERRORS = {
  WORKSHOP_FULL:             "This workshop has reached maximum capacity",
  WORKSHOP_ALREADY_REGISTERED:"You are already registered for this workshop",
  WORKSHOP_IN_PAST:          "Cannot register for a workshop that has already occurred",
} as const;
```

### 15.4 Validation Error Details

For `400` and `422` responses with multiple field errors, include structured `details`:

```typescript
// Example: POST /api/sessions with invalid body
{
  success: false,
  error: {
    code: "VALIDATION_REQUIRED_FIELD",
    message: "Request validation failed",
    details: {
      fields: [
        { field: "therapistId", message: "therapistId is required" },
        { field: "scheduledTime", message: "scheduledTime must be a valid ISO 8601 date" },
        { field: "duration", message: "duration must be a positive integer" }
      ]
    }
  }
}
```

### 15.5 Global Error Handler Middleware

All Azure Functions should use a shared error handler that catches exceptions and maps them to the correct envelope. This prevents leaking stack traces or internal details to the client.

```typescript
// src/middleware/errorHandler.ts

import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

/** Custom application error with HTTP status and error code */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Convenience factory functions
export const badRequest = (code: string, message: string, details?: unknown) =>
  new AppError(400, code, message, details);

export const unauthorized = (message = "Authentication required") =>
  new AppError(401, "AUTH_TOKEN_INVALID", message);

export const forbidden = (message = "Insufficient permissions") =>
  new AppError(403, "AUTH_INSUFFICIENT_ROLE", message);

export const notFound = (resource = "Resource") =>
  new AppError(404, "RESOURCE_NOT_FOUND", `${resource} not found`);

export const conflict = (code: string, message: string) =>
  new AppError(409, code, message);

export const unprocessable = (code: string, message: string, details?: unknown) =>
  new AppError(422, code, message, details);

/**
 * Wraps an Azure Function handler with standard error handling.
 * Usage:
 *   app.http("getSession", {
 *     handler: withErrorHandler(async (req, ctx) => { ... })
 *   });
 */
export function withErrorHandler(
  handler: (req: HttpRequest, ctx: InvocationContext) => Promise<HttpResponseInit>
): (req: HttpRequest, ctx: InvocationContext) => Promise<HttpResponseInit> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof AppError) {
        ctx.warn(`AppError [${error.code}]: ${error.message}`);
        return {
          status: error.statusCode,
          jsonBody: {
            success: false,
            data: null,
            error: {
              code: error.code,
              message: error.message,
              details: error.details ?? null,
            },
            status: error.statusCode,
          },
        };
      }

      // SQL Server errors (from mssql package)
      if (isSqlError(error)) {
        ctx.error(`SQL Error [${error.number}]: ${error.message}`);

        // Map specific SQL error numbers from stored procedures
        if (error.number === 50404) {
          return {
            status: 404,
            jsonBody: {
              success: false, data: null, status: 404,
              error: { code: "RESOURCE_NOT_FOUND", message: error.message, details: null },
            },
          };
        }
        if (error.number === 50409) {
          return {
            status: 409,
            jsonBody: {
              success: false, data: null, status: 409,
              error: { code: "REQUEST_INVALID_TRANSITION", message: error.message, details: null },
            },
          };
        }
      }

      // Unhandled errors — log full details, return generic message
      ctx.error("Unhandled error:", error);
      return {
        status: 500,
        jsonBody: {
          success: false, data: null, status: 500,
          error: {
            code: "INTERNAL_ERROR",
            message: "An unexpected error occurred. Please try again later.",
            details: null,
          },
        },
      };
    }
  };
}

function isSqlError(error: unknown): error is { number: number; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "number" in error &&
    typeof (error as any).number === "number"
  );
}
```

### 15.6 Request Validation Middleware

Input validation should happen before business logic, using a schema validation library (e.g., `zod`). Each endpoint defines a schema, and a shared validator converts parse failures into structured `400` responses.

```typescript
// src/middleware/validate.ts

import { HttpRequest } from "@azure/functions";
import { ZodSchema } from "zod";
import { badRequest } from "./errorHandler";

/**
 * Validates request body against a Zod schema.
 * Throws AppError(400) with field-level details on failure.
 */
export async function validateBody<T>(req: HttpRequest, schema: ZodSchema<T>): Promise<T> {
  const body = await req.json().catch(() => null);
  if (!body) {
    throw badRequest("VALIDATION_REQUIRED_FIELD", "Request body is required");
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw badRequest("VALIDATION_REQUIRED_FIELD", "Request validation failed", {
      fields: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  return result.data;
}

/**
 * Validates query parameters against a Zod schema.
 */
export function validateQuery<T>(req: HttpRequest, schema: ZodSchema<T>): T {
  const params = Object.fromEntries(req.query.entries());
  const result = schema.safeParse(params);
  if (!result.success) {
    throw badRequest("VALIDATION_INVALID_FORMAT", "Invalid query parameters", {
      fields: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  return result.data;
}
```

### 15.7 Authentication Middleware

JWT validation runs before the handler. It extracts the user context and attaches it to the request for downstream use.

```typescript
// src/middleware/authenticate.ts

import { HttpRequest, InvocationContext } from "@azure/functions";
import { unauthorized, forbidden } from "./errorHandler";
import { verifyToken } from "../services/authService";

export interface AuthContext {
  userId: string;
  userType: "client" | "therapist";
  email: string;
}

/**
 * Extracts and validates JWT from Authorization header.
 * Returns authenticated user context or throws.
 */
export async function authenticate(req: HttpRequest, ctx: InvocationContext): Promise<AuthContext> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw unauthorized("Missing or malformed Authorization header");
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);
  if (!payload) {
    throw unauthorized("Invalid or expired token");
  }

  return {
    userId: payload.userId,
    userType: payload.userType,
    email: payload.email,
  };
}

/**
 * Authenticate + require specific role.
 */
export async function requireRole(
  req: HttpRequest,
  ctx: InvocationContext,
  role: "client" | "therapist"
): Promise<AuthContext> {
  const auth = await authenticate(req, ctx);
  if (auth.userType !== role) {
    throw forbidden(`This action requires ${role} role`);
  }
  return auth;
}
```

### 15.8 Middleware Composition Example

Putting it all together in an Azure Function handler:

```typescript
// src/functions/sessionRequests/approveSessionRequest.ts

import { app } from "@azure/functions";
import { withErrorHandler, notFound } from "../../middleware/errorHandler";
import { requireRole } from "../../middleware/authenticate";
import { sessionRequestService } from "../../services/sessionRequestService";

app.http("approveSessionRequest", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "session-requests/{requestId}/approve",
  handler: withErrorHandler(async (req, ctx) => {
    // 1. Auth — only therapists can approve
    const auth = await requireRole(req, ctx, "therapist");

    // 2. Extract path param
    const requestId = req.params.requestId;
    if (!requestId) throw notFound("Session request");

    // 3. Business logic (service validates ownership + state transition)
    const updated = await sessionRequestService.approve(requestId, auth.userId);

    // 4. Return standard envelope (matches ApiResponse<T> from Section 7)
    return {
      status: 200,
      jsonBody: { success: true, data: updated, error: null, status: 200 },
    };
  }),
});
```

### 15.9 Frontend Error Handling Contract

The frontend service layer expects the unified `ApiResponse<T>` envelope from Section 7. When the real backend replaces mock services, the frontend HTTP client (`httpClient.ts`) will replace the mock `apiClient.ts` helpers. Here is the pattern:

```typescript
// Frontend: src/app/services/shared/httpClient.ts
// (replaces mock apiClient.ts when backend goes live)

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const body: ApiResponse<T> = await response.json();

  if (!response.ok || !body.success) {
    throw new ApiError(
      body.status,
      body.error?.code ?? "UNKNOWN_ERROR",
      body.error?.message ?? "An unexpected error occurred",
      body.error?.details
    );
  }

  return body; // Returns full ApiResponse<T> — callers access body.data
}
```

Components can then catch `ApiError` and display appropriate UI messages:

```typescript
try {
  await sessionRequestService.approve(requestId);
  // Show success toast
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "REQUEST_ALREADY_RESOLVED":
        toast.error("This request has already been resolved");
        break;
      case "AUTH_INSUFFICIENT_ROLE":
        toast.error("Only therapists can approve session requests");
        break;
      default:
        toast.error(error.message);
    }
  }
}
```

### 15.10 Rate Limiting

Azure Functions should enforce per-user rate limits using an in-memory or Redis-backed counter:

| Scope | Limit | Window | Response |
|-------|-------|--------|----------|
| Per user (authenticated) | 100 requests | 1 minute | `429` with `Retry-After` header |
| Per IP (unauthenticated, e.g., login) | 20 requests | 1 minute | `429` with `Retry-After` header |
| Session request mutations | 10 requests | 1 minute | `429` — prevents rapid approve/decline spam |

```typescript
// Rate limit error response (follows standard ApiResponse<null> envelope)
{
  success: false,
  data: null,
  error: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests. Please try again later.",
    details: { retryAfterSeconds: 30 }
  },
  status: 429
}
```

### 15.11 Logging & Observability

All errors should be logged with structured context for debugging:

```typescript
// Error log structure
ctx.error("Request failed", {
  requestId: ctx.invocationId,
  method: req.method,
  url: req.url,
  userId: auth?.userId,
  errorCode: error.code,
  errorMessage: error.message,
  duration: Date.now() - startTime,
});
```

**Log levels by error type:**
- `ctx.warn()` — Known `AppError` (4xx) — expected business errors
- `ctx.error()` — Unhandled exceptions (5xx) — bugs or infrastructure issues
- `ctx.info()` — Successful operations (optional, for audit trail)

---

## Appendix A: Default Theme Colours

```typescript
const THEME_DEFAULTS: ThemeSettings = {
  primaryColor: "#3b82f6",
  supervisionColor: "#ec4899",
  workshopColor: "#f97316",
  videoColor: "#8b5cf6",
  inPersonColor: "#10b981",
  textColor: "#06b6d4",
  phoneCallColor: "#f59e0b",
  accentColor: "#06b6d4",
  successColor: "#10b981",
  warningColor: "#f59e0b",
  errorColor: "#ef4444",
  darkPrimaryColor: "#60a5fa",
  darkSupervisionColor: "#f472b6",
  darkWorkshopColor: "#fb923c",
  darkVideoColor: "#a78bfa",
  darkInPersonColor: "#34d399",
  darkTextColor: "#22d3ee",
  darkPhoneCallColor: "#fbbf24",
  darkAccentColor: "#22d3ee",
  darkSuccessColor: "#34d399",
  darkWarningColor: "#fbbf24",
  darkErrorColor: "#f87171",
  darkMode: false,
};
```

## Appendix B: Frontend Service -> API Mapping

When replacing mock implementations, each frontend service method maps to a single HTTP call:

```typescript
// Frontend service call:
import { listTherapists } from '../services';
const result = await listTherapists({ search: 'anxiety', maxRate: 200 });

// Becomes:
GET /api/therapists?search=anxiety&maxRate=200&page=1&pageSize=20

// Response shape is identical — PaginatedResponse<Therapist>
```

The `ApiResponse<T>` and `PaginatedResponse<T>` envelopes must be returned from Azure Functions in exactly the same shape as the mock implementations produce. This ensures zero changes to frontend component code.

## Appendix C: ID Generation

The mock frontend uses `{prefix}{timestamp}-{random7chars}` for IDs (e.g., `conn1740000000000-abc1234`). The backend should use `NEWID()` (UUID v4) or a similar strategy. The frontend only requires IDs to be unique strings — the format does not matter as long as it's consistent.

---

*End of specification.*
