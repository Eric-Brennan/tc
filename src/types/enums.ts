export enum Title {
  NotSpecified = 0,
  Mr = 1,
  Mrs = 2,
  Miss = 3,
  Ms = 4,
  Mx = 5,
  Dr = 6,
  Prof = 7,
  Rev = 8,
  Sir = 9,
  Lady = 10,
  Lord = 11,
  Dame = 12,
  Other = 13
}

export enum Gender {
  NotSpecified = 0,
  Male = 1,
  Female = 2,
  NonBinary = 3,
  PreferNotToSay = 4,
  Other = 5
}

export enum Orientation {
  NotSpecified = 0,
  Straight = 1,
  Gay = 2,
  Lesbian = 3,
  Bisexual = 4,
  Pansexual = 5,
  Asexual = 6,
  Queer = 7,
  PreferNotToSay = 8,
  Other = 9
}

export enum TherapistType {
  CON = 0, // Conservative
  LIB = 1, // Liberal
  NRG = 2, // Non-Religious
  CHR = 3, // Christian
  MUS = 4, // Muslim
  HIN = 5, // Hindu
  JUD = 6, // Jewish
  BUD = 7, // Buddhist
  POC = 8, // Person of Color
  OLD = 9, // Older Adult
  LGB = 10 // LGBTQ+
}

export enum AreaOfFocus {
  ABD = 0, // Abandonment Issues
  ADD = 1, // Attention Deficit Disorder
  ADH = 2, // ADHD (Attention Deficit Hyperactivity Disorder)
  AFC = 3, // Adoption and Foster Care Issues
  AGI = 4, // Aging Issues
  AGR = 5, // Anger Management
  ASD = 6, // Autism Spectrum Disorder
  ASP = 7, // Antisocial Personality Disorder
  ATC = 8, // Attachment issues
  AVP = 9, // Avoidant Personality Disorder
  AX = 10, // Anxiety
  BDSM = 11, // BDSM and Kink
  BDI = 12, // Body Image
  BFI = 13, // Blended Families Issues
  BIP = 14, // Bipolar Disorder
  BOR = 15, // Borderline Personality Disorder
  BUR = 16, // Burnout
  CAN = 17, // Cancer
  CI = 18, // Commitment Issues
  CIS = 19, // Caregiver Issues
  CMD = 20, // Co-morbidity
  CNT = 21, // Control
  CD = 22, // Codependency
  CP = 23, // Communication Problems
  CPI = 24, // Chronic Pain / Illness
  CWD = 25, // Coping with disaster
  DBT = 26, // Disabilities
  DEP = 27, // Depression
  DIS = 28, // Dissociative Disorders
  DMDD = 29, // Disruptive Mood Dysregulation Disorder
  DP = 30, // Dependant Personality Disorder
  DV = 31, // Domestic Violence
  DVS = 32, // Divorce / Separation
  EFD = 33, // Eating Disorders
  EMP = 34, // Emptiness / Apathy
  EOL = 35, // End of Life Issues
  ESI = 36, // Emergency Services Issues
  FAM = 37, // Family Issues
  FGV = 38, // Forgiveness
  FHD = 39, // Fatherhood Issues
  FRT = 40, // Fertility and Reproductive Issues
  GID = 41, // Gender Identity Disorder
  GRF = 42, // Grief and Loss
  GS = 43, // Guilt / Shame
  HI = 44, // Hearing Impairment
  HIV = 45, // HIV/AIDS
  HRD = 46, // Hoarding Disorder
  IL = 47, // Isolation / Loneliness
  IMG = 48, // Immigration Issues
  IMP = 49, // Impulsivity
  INF = 50, // Infidelity
  INS = 51, // Insomnia / Sleep Disorders
  INT = 52, // Internet/Technology Addiction
  JLY = 53, // Jealousy
  LDI = 54, // Learning Disabilities
  LGB = 55, // LGBTQ+ Issues
  LP = 56, // Life Purpose
  MCC = 57, // Multi Cultural Concerns
  MD = 58, // Mood Disorders
  MFI = 59, // Money / Financial Issues
  MHD = 60, // Motherhood Issues
  MI = 61, // Mens Issues
  MLC = 62, // Mid Life Crisis
  NRC = 63, // Narcissism
  NSA = 64, // Non substance Addiction
  OCD = 65, // Obsessive Compulsive Disorder
  OPD = 66, // Oppositional Defiant Disorder
  PAR = 67, // Parenting Issues
  PCB = 68, // Pregnancy / Childbirth
  PD = 69, // Personality Disorders
  PER = 70, // Perfectionism
  PH = 71, // Phobias
  PNC = 72, // Panic Disorder and Panic Attacks
  PNMR = 73, // Polyamory / Non-Monogamous Relationships
  PPD = 74, // Postpartum Depression
  PRN = 75, // Paranoia
  PTS = 76, // Post-Traumatic Stress Disorder
  REL = 77, // Relationship Issues
  SA = 78, // Substance Abuse / Addiction
  SAD = 79, // Seasonal Affective Disorder
  SCH = 80, // Schizophrenia
  SE = 81, // Self-Esteem
  SEX = 82, // Sexual Issues
  SH = 83, // Self-Harm
  SL = 84, // Self-Love
  SOC = 85, // Social Anxiety
  SOM = 86, // Somatization Disorder
  STR = 87, // Stress Management
  SUP = 88, // Support Groups
  SVC = 89, // Smoking / Vaping Cessation
  SXD = 90, // Sexual Dysfunction
  SXI = 91, // Sexual Identity
  TBI = 92, // Traumatic Brain Injury
  TIC = 93, // Tic Disorders
  TRA = 94, // Trauma (general)
  TRI = 95, // Trichotillomania
  VAI = 96, // Veteran and Armed Forces Issues
  VI = 97, // Visual Impairment
  WOI = 98, // Womens Issues
  WPI = 99, // Work / Professional Issues
  YAI = 100, // Youth and Adolescents
  SPT = 101, // Spiritual Therapy
  RLT = 102, // Religious Therapy
  BEM = 103, // Black and Ethnic Minority
}

export enum SessionType {
  Counselling = 0,
  Psychotherapy = 1,
  Couples = 2,
  Group = 3,
  Family = 4,
  Supervision = 5,
}

export enum ClinicalApproach {
  ABT = 0, // Attachment-Based Therapy
  ACT = 1, // Acceptance and Commitment Therapy
  AT = 2, // Art Therapy
  BT = 3, // Behavioral Therapy
  CBT = 4, // Cognitive Behavioral Therapy
  CCT = 5, // Client-Centered Therapy
  DBT = 6, // Dialectical Behavior Therapy
  EFT = 7, // Emotionally Focused Therapy
  EMDR = 8, // Eye Movement Desensitization and Reprocessing
  EXT = 9, // Existential Therapy
  GMM = 10, // Gottman
  GT = 11, // Gestalt Therapy
  HT = 12, // Humanistic Therapy
  HYP = 13, // Hypnotherapy
  IFST = 14, // Internal Family Systems Therapy
  IPT = 15, // Interpersonal Therapy
  IRT = 16, // Imago Relationship Therapy
  IT = 17, // Integrative Therapy
  JT = 18, // Jungian Therapy
  MIT = 19, // Mindfulness-Based Interventions
  MOI = 20, // Motivational Interviewing
  NAT = 21, // Narrative Therapy
  PDT = 22, // Psychodynamic Therapy
  PSA = 23, // Psychoanalytic Therapy
  PT = 24, // Play Therapy
  RT = 25, // Reality Therapy
  SFT = 26, // Solution-Focused Therapy
  SMT = 27, // Somatic Therapy
  SYT = 28, // Systemic Therapy
  TFT = 29, // Trauma-Focused Therapy
}

export enum GoverningBody {
  // United Kingdom
  BACP = 0, // British Association for Counselling and Psychotherapy
  UKCP = 1, // UK Council for Psychotherapy
  HCPC = 2, // Health and Care Professions Council
  BPS = 3, // British Psychological Society
  NCPS = 4, // National Counselling & Psychotherapy Society
  COSCA = 5, // Counselling & Psychotherapy in Scotland
  
  // United States
  APA = 6, // American Psychological Association
  ACA = 7, // American Counseling Association
  AAMFT = 8, // American Association for Marriage and Family Therapy
  NASW = 9, // National Association of Social Workers
  NBCC = 10, // National Board for Certified Counselors
  ABPP = 11, // American Board of Professional Psychology
  ABCT = 12, // Association for Behavioral and Cognitive Therapies
  ADAA = 13, // Anxiety and Depression Association of America
  
  // Canada
  CPA = 14, // Canadian Psychological Association
  CCPA = 15, // Canadian Counselling and Psychotherapy Association
  CASW = 16, // Canadian Association of Social Workers
  CRPO = 17, // College of Registered Psychotherapists of Ontario
  CPBC = 18, // College of Psychologists of British Columbia
  
  // Australia
  APS = 19, // Australian Psychological Society
  PACFA = 20, // Psychotherapy and Counselling Federation of Australia
  AASW = 21, // Australian Association of Social Workers
  AHPRA = 22, // Australian Health Practitioner Regulation Agency
  
  // New Zealand
  NZPS = 23, // New Zealand Psychological Society
  NZAC = 24, // New Zealand Association of Counsellors
  NZAP = 25, // New Zealand Association of Psychotherapists
  
  // Ireland
  PSI = 26, // Psychological Society of Ireland
  IACP = 27, // Irish Association for Counselling and Psychotherapy
  IAHIP = 28, // Irish Association of Humanistic and Integrative Psychotherapy
  
  // European Union
  EAP = 29, // European Association for Psychotherapy
  EFPA = 30, // European Federation of Psychologists' Associations
  EAC = 31, // European Association for Counselling
  
  // Germany
  BDP = 32, // Berufsverband Deutscher Psychologinnen und Psychologen
  DGTV = 33, // Deutsche Gesellschaft für Tiefenpsychologie und Verhaltenstherapie
  
  // France
  SFP = 34, // Société Française de Psychologie
  SNPPsy = 35, // Syndicat National des Psychologues
  
  // Netherlands
  NIP = 36, // Nederlands Instituut van Psychologen
  VGCt = 37, // Vereniging van Gestalt Contacttherapeuten
  
  // Switzerland
  FSP = 38, // Federation of Swiss Psychologists
  SBAP = 39, // Swiss Board of Applied Psychology
  
  // Italy
  OPL = 40, // Ordine degli Psicologi del Lazio
  CNOP = 41, // Consiglio Nazionale Ordine Psicologi
  
  // Spain
  COP = 42, // Colegio Oficial de Psicólogos
  
  // Nordic Countries
  NPF = 43, // Norsk Psykologforening (Norway)
  SPR = 44, // Sveriges Psykologförbund (Sweden)
  DP = 45, // Dansk Psykolog Forening (Denmark)
  
  // Japan
  JPA = 46, // Japanese Psychological Association
  
  // South Africa
  PsySSA = 47, // Psychological Society of South Africa
  HPCSA = 48, // Health Professions Council of South Africa
  
  // International
  IUPsyS = 49, // International Union of Psychological Science
  WCP = 50, // World Council for Psychotherapy
  IAAP = 51, // International Association of Applied Psychology
  
  // Other/Unspecified
  Other = 99,
  NotApplicable = 100
}

export enum MembershipLevel {
  // BACP (British Association for Counselling and Psychotherapy)
  BACPRegistered = 0,
  BACPAccredited = 1,
  BACPSeniorAccredited = 2,
  
  // UKCP (UK Council for Psychotherapy)
  UKCPRegistered = 3,
  UKCPAccredited = 4,
  UKCPSenior = 5,
  
  // BPS (British Psychological Society)
  BPSStudent = 6,
  BPSGraduate = 7,
  BPSChartered = 8,
  BPSFellow = 9,
  
  // HCPC (Health and Care Professions Council)
  HCPCRegistered = 10,
  
  // NCPS (National Counselling & Psychotherapy Society)
  NCPSMember = 11,
  NCPSAccredited = 12,
  
  // COSCA (Counselling & Psychotherapy in Scotland)
  COSCAMember = 13,
  COSCAAccredited = 14,
  
  // APA (American Psychological Association)
  APAStudent = 15,
  APAMember = 16,
  APAFellow = 17,
  APADiplomate = 18,
  
  // ACA (American Counseling Association)
  ACAStudent = 19,
  ACARegular = 20,
  ACAProfessional = 21,
  
  // AAMFT (American Association for Marriage and Family Therapy)
  AAMFTStudent = 22,
  AAMFTAssociate = 23,
  AAMFTClinical = 24,
  AAMFTApproved = 25,
  
  // NASW (National Association of Social Workers)
  NASWStudent = 26,
  NASWRegular = 27,
  NASWQualified = 28,
  
  // NBCC (National Board for Certified Counselors)
  NBCCCertified = 29,
  
  // CPA (Canadian Psychological Association)
  CPAStudent = 30,
  CPARegular = 31,
  CPAFellow = 32,
  
  // CCPA (Canadian Counselling and Psychotherapy Association)
  CCPAStudent = 33,
  CCPARegular = 34,
  CCPACertified = 35,
  
  // CRPO (College of Registered Psychotherapists of Ontario)
  CRPORegistered = 36,
  
  // APS (Australian Psychological Society)
  APSStudent = 37,
  APSAssociate = 38,
  APSMember = 39,
  APSFellow = 40,
  
  // PACFA (Psychotherapy and Counselling Federation of Australia)
  PACFARegistrar = 41,
  PACFAClinical = 42,
  
  // AHPRA (Australian Health Practitioner Regulation Agency)
  AHPRAGeneral = 43,
  AHPRASpecialist = 44,
  
  // NZPS (New Zealand Psychological Society)
  NZPSStudent = 45,
  NZPSAssociate = 46,
  NZPSMember = 47,
  NZPSFellow = 48,
  
  // NZAC (New Zealand Association of Counsellors)
  NZACProvisional = 49,
  NZACMember = 50,
  
  // PSI (Psychological Society of Ireland)
  PSIStudent = 51,
  PSIAssociate = 52,
  PSIMember = 53,
  PSIFellow = 54,
  
  // IACP (Irish Association for Counselling and Psychotherapy)
  IACPStudent = 55,
  IACPMember = 56,
  IACPAccredited = 57,
  
  // EAP (European Association for Psychotherapy)
  EAPMember = 58,
  EAPCertified = 59,
  
  // Generic levels for other organizations
  Student = 60,
  Trainee = 61,
  Associate = 62,
  Member = 63,
  Regular = 64,
  Professional = 65,
  Senior = 66,
  Fellow = 67,
  Accredited = 68,
  Registered = 69,
  Licensed = 70,
  Certified = 71,
  Chartered = 72,
  
  Other = 99
}

export enum SpokenLanguageCode {
  EN = "en", // English
  ES = "es", // Spanish
  FR = "fr", // French
  DE = "de", // German
  IT = "it", // Italian
  PT = "pt", // Portuguese
  RU = "ru", // Russian
  ZH = "zh", // Chinese (Mandarin)
  JA = "ja", // Japanese
  KO = "ko", // Korean
  AR = "ar", // Arabic
  HI = "hi", // Hindi
  TR = "tr", // Turkish
  PL = "pl", // Polish
  NL = "nl", // Dutch
  SV = "sv", // Swedish
  NO = "no", // Norwegian
  DA = "da", // Danish
  FI = "fi", // Finnish
  EL = "el", // Greek
  HE = "he", // Hebrew
  UR = "ur", // Urdu
  FA = "fa", // Persian (Farsi)
  VI = "vi", // Vietnamese
  TH = "th", // Thai
}

export enum LanguageProficiency {
  NotSpecified = 0,
  Native = 1,
  Fluent = 2,
  Conversational = 3,
  Basic = 4,
  None = 5
}

export enum ImageType {
  ProfilePicture = 0,
  CoverPhoto = 1,
  QualificationDocument = 2,
  MembershipDocument = 3,
  InsuranceDocument = 4,
  Other = 99
}