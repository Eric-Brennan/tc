import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
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
import type { TherapistProfile, SpokenLanguage, Education, GoverningBodyMembership, ProfileLink } from "../../types";
import {
  titleLabels,
  genderLabels,
  orientationLabels,
  therapistTypeLabels,
  areaOfFocusLabels,
  clinicalApproachLabels,
  governingBodyLabels,
  membershipLevelLabels,
  languageLabels,
  proficiencyLabels,
  sessionTypeLabels
} from "../../utils/enumLabels";

interface EditTherapistProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Partial<TherapistProfile>;
  onSave: (profile: Partial<TherapistProfile>) => void;
}

export default function EditTherapistProfileDialog({
  open,
  onOpenChange,
  profile,
  onSave
}: EditTherapistProfileDialogProps) {
  // Basic Info
  const [title, setTitle] = useState(profile.title ?? Title.NotSpecified);
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [middleName, setMiddleName] = useState(profile.middleName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(
    profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : ""
  );
  const [gender, setGender] = useState(profile.gender ?? Gender.NotSpecified);
  const [orientation, setOrientation] = useState(profile.orientation ?? Orientation.NotSpecified);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [yearsOfExperience, setYearsOfExperience] = useState(profile.yearsOfExperience ?? 0);

  // Contact Details
  const [email, setEmail] = useState(profile.contactDetails?.email ?? "");
  const [mobileNumber, setMobileNumber] = useState(profile.contactDetails?.mobileNumber ?? "");
  const [street, setStreet] = useState(profile.contactDetails?.street ?? "");
  const [city, setCity] = useState(profile.contactDetails?.city ?? "");
  const [postCode, setPostCode] = useState(profile.contactDetails?.postCode ?? "");
  const [country, setCountry] = useState(profile.contactDetails?.country ?? "");

  // Session Modalities
  const [isInPerson, setIsInPerson] = useState(profile.isInPerson ?? false);
  const [isVideo, setIsVideo] = useState(profile.isVideo ?? false);
  const [isPhone, setIsPhone] = useState(profile.isPhone ?? false);
  const [isLiveChat, setIsLiveChat] = useState(profile.isLiveChat ?? false);
  const [isMessaging, setIsMessaging] = useState(profile.isMessaging ?? false);
  const [willDoCouples, setWillDoCouples] = useState(profile.willDoCouples ?? false);

  // Therapist Types (multi-select)
  const [therapistTypes, setTherapistTypes] = useState<TherapistType[]>(profile.therapistTypes ?? []);

  // Session Types (multi-select)
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>(profile.sessionTypes ?? []);

  // Areas of Focus (multi-select)
  const [areasOfFocus, setAreasOfFocus] = useState<AreaOfFocus[]>(profile.areasOfFocus ?? []);

  // Clinical Approaches (multi-select)
  const [clinicalApproaches, setClinicalApproaches] = useState<ClinicalApproach[]>(
    profile.clinicalApproaches ?? []
  );

  // Languages
  const [spokenLanguages, setSpokenLanguages] = useState<SpokenLanguage[]>(
    profile.spokenLanguages ?? []
  );

  // Education
  const [educations, setEducations] = useState<Education[]>(profile.educations ?? []);

  // Memberships
  const [memberships, setMemberships] = useState<GoverningBodyMembership[]>(
    profile.governingBodyMemberships ?? []
  );

  // Profile Links
  const [profileLinks, setProfileLinks] = useState<ProfileLink[]>(profile.profileLinks ?? []);

  const toggleTherapistType = (type: TherapistType) => {
    setTherapistTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleSessionType = (type: SessionType) => {
    setSessionTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleAreaOfFocus = (area: AreaOfFocus) => {
    setAreasOfFocus(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const toggleClinicalApproach = (approach: ClinicalApproach) => {
    setClinicalApproaches(prev =>
      prev.includes(approach) ? prev.filter(a => a !== approach) : [...prev, approach]
    );
  };

  const addLanguage = () => {
    const newLang: SpokenLanguage = {
      id: `lang_${Date.now()}`,
      languageCode: SpokenLanguageCode.EN,
      proficiency: LanguageProficiency.NotSpecified
    };
    setSpokenLanguages([...spokenLanguages, newLang]);
  };

  const updateLanguage = (id: string, field: keyof SpokenLanguage, value: any) => {
    setSpokenLanguages(prev =>
      prev.map(lang => (lang.id === id ? { ...lang, [field]: value } : lang))
    );
  };

  const removeLanguage = (id: string) => {
    setSpokenLanguages(prev => prev.filter(lang => lang.id !== id));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: `edu_${Date.now()}`,
      institution: "",
      degree: "",
      fieldOfStudy: "",
      yearCompleted: new Date().getFullYear()
    };
    setEducations([...educations, newEdu]);
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setEducations(prev =>
      prev.map(edu => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const removeEducation = (id: string) => {
    setEducations(prev => prev.filter(edu => edu.id !== id));
  };

  const addMembership = () => {
    const newMem: GoverningBodyMembership = {
      id: `mem_${Date.now()}`,
      governingBody: GoverningBody.NotApplicable,
      membershipLevel: MembershipLevel.Member,
      membershipNumber: "",
      yearObtained: new Date().getFullYear()
    };
    setMemberships([...memberships, newMem]);
  };

  const updateMembership = (id: string, field: keyof GoverningBodyMembership, value: any) => {
    setMemberships(prev =>
      prev.map(mem => (mem.id === id ? { ...mem, [field]: value } : mem))
    );
  };

  const removeMembership = (id: string) => {
    setMemberships(prev => prev.filter(mem => mem.id !== id));
  };

  const addProfileLink = () => {
    const newLink: ProfileLink = {
      id: `link_${Date.now()}`,
      title: "",
      url: ""
    };
    setProfileLinks([...profileLinks, newLink]);
  };

  const updateProfileLink = (id: string, field: keyof ProfileLink, value: string) => {
    setProfileLinks(prev =>
      prev.map(link => (link.id === id ? { ...link, [field]: value } : link))
    );
  };

  const removeProfileLink = (id: string) => {
    setProfileLinks(prev => prev.filter(link => link.id !== id));
  };

  const handleSave = () => {
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    if (!email.trim() || !mobileNumber.trim()) {
      toast.error("Email and mobile number are required");
      return;
    }

    const updatedProfile: Partial<TherapistProfile> = {
      ...profile,
      title,
      firstName,
      middleName: middleName || null,
      lastName,
      displayName: displayName || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
      orientation,
      bio: bio || null,
      yearsOfExperience,
      contactDetails: {
        email,
        mobileNumber,
        street,
        city,
        postCode,
        country
      },
      isInPerson,
      isVideo,
      isPhone,
      isLiveChat,
      isMessaging,
      willDoCouples,
      therapistTypes,
      sessionTypes,
      areasOfFocus,
      clinicalApproaches,
      spokenLanguages,
      educations,
      governingBodyMemberships: memberships,
      profileLinks,
      updatedAt: new Date()
    };

    onSave(updatedProfile);
    toast.success("Profile updated successfully!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit Therapist Profile</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-4 gap-1">
            <TabsTrigger value="basic" className="text-xs">Basic Info</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs">Contact</TabsTrigger>
            <TabsTrigger value="specialties" className="text-xs">Specialties</TabsTrigger>
            <TabsTrigger value="qualifications" className="text-xs">Qualifications</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="flex-1 overflow-y-auto space-y-4 mt-4 px-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Select value={title.toString()} onValueChange={(val) => setTitle(Number(val) as Title)}>
                  <SelectTrigger id="title" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(titleLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="displayName">Display Name (Public)</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Leave blank to use first and last name"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender.toString()} onValueChange={(val) => setGender(Number(val) as Gender)}>
                  <SelectTrigger id="gender" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(genderLabels)
                      .filter(([key]) => Number(key) !== Gender.NonBinary)
                      .map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={6}
                placeholder="Tell us about yourself and your approach to therapy..."
                className="mt-1.5"
              />
            </div>

            <div className="space-y-2">
              <Label>Session Modalities Offered</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isVideo"
                    checked={isVideo}
                    onCheckedChange={(checked) => setIsVideo(checked as boolean)}
                  />
                  <label htmlFor="isVideo" className="text-sm cursor-pointer">
                    Video Sessions
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isInPerson"
                    checked={isInPerson}
                    onCheckedChange={(checked) => setIsInPerson(checked as boolean)}
                  />
                  <label htmlFor="isInPerson" className="text-sm cursor-pointer">
                    In-Person Sessions
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPhone"
                    checked={isPhone}
                    onCheckedChange={(checked) => setIsPhone(checked as boolean)}
                  />
                  <label htmlFor="isPhone" className="text-sm cursor-pointer">
                    Phone Sessions
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isLiveChat"
                    checked={isLiveChat}
                    onCheckedChange={(checked) => setIsLiveChat(checked as boolean)}
                  />
                  <label htmlFor="isLiveChat" className="text-sm cursor-pointer">
                    Live Chat
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isMessaging"
                    checked={isMessaging}
                    onCheckedChange={(checked) => setIsMessaging(checked as boolean)}
                  />
                  <label htmlFor="isMessaging" className="text-sm cursor-pointer">
                    Messaging
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="flex-1 overflow-y-auto space-y-4 mt-4 px-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="postCode">Post Code</Label>
                <Input
                  id="postCode"
                  value={postCode}
                  onChange={(e) => setPostCode(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
          </TabsContent>

          {/* Specialties Tab */}
          <TabsContent value="specialties" className="flex-1 overflow-y-auto space-y-4 mt-4 px-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Session Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(sessionTypeLabels).map(([key, label]) => {
                    const typeValue = Number(key) as SessionType;
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sessionType_${key}`}
                          checked={sessionTypes.includes(typeValue)}
                          onCheckedChange={() => toggleSessionType(typeValue)}
                        />
                        <label htmlFor={`sessionType_${key}`} className="text-sm cursor-pointer">
                          {label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Areas of Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(areaOfFocusLabels).map(([key, label]) => {
                    const areaValue = Number(key) as AreaOfFocus;
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`area_${key}`}
                          checked={areasOfFocus.includes(areaValue)}
                          onCheckedChange={() => toggleAreaOfFocus(areaValue)}
                        />
                        <label htmlFor={`area_${key}`} className="text-sm cursor-pointer">
                          {label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Clinical Approaches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(clinicalApproachLabels).map(([key, label]) => {
                    const approachValue = Number(key) as ClinicalApproach;
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`approach_${key}`}
                          checked={clinicalApproaches.includes(approachValue)}
                          onCheckedChange={() => toggleClinicalApproach(approachValue)}
                        />
                        <label htmlFor={`approach_${key}`} className="text-sm cursor-pointer">
                          {label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Qualifications Tab */}
          <TabsContent value="qualifications" className="flex-1 overflow-y-auto space-y-4 mt-4 px-1">
            {/* Languages */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Languages</CardTitle>
                <Button onClick={addLanguage} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Language
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {spokenLanguages.map((lang) => (
                  <div key={lang.id} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Label className="text-xs">Language</Label>
                      <Select
                        value={lang.languageCode}
                        onValueChange={(val) => updateLanguage(lang.id, "languageCode", val as SpokenLanguageCode)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(languageLabels).map(([code, label]) => (
                            <SelectItem key={code} value={code}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Proficiency</Label>
                      <Select
                        value={lang.proficiency.toString()}
                        onValueChange={(val) => updateLanguage(lang.id, "proficiency", Number(val) as LanguageProficiency)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(proficiencyLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLanguage(lang.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {spokenLanguages.length === 0 && (
                  <p className="text-sm text-muted-foreground">No languages added yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Education</CardTitle>
                <Button onClick={addEducation} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {educations.map((edu) => (
                  <div key={edu.id} className="border rounded-lg p-3 space-y-3">
                    <div className="flex justify-between items-start">
                      <Label className="text-sm font-medium">Education Entry</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(edu.id)}
                        className="text-destructive -mt-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                          placeholder="e.g., Columbia University"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                          placeholder="e.g., PhD"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Field of Study</Label>
                        <Input
                          value={edu.fieldOfStudy}
                          onChange={(e) => updateEducation(edu.id, "fieldOfStudy", e.target.value)}
                          placeholder="e.g., Clinical Psychology"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Year Completed</Label>
                        <Input
                          type="number"
                          value={edu.yearCompleted}
                          onChange={(e) => updateEducation(edu.id, "yearCompleted", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {educations.length === 0 && (
                  <p className="text-sm text-muted-foreground">No education entries added yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Memberships */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Professional Memberships</CardTitle>
                <Button onClick={addMembership} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Membership
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {memberships.map((mem) => (
                  <div key={mem.id} className="border rounded-lg p-3 space-y-3">
                    <div className="flex justify-between items-start">
                      <Label className="text-sm font-medium">Membership</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMembership(mem.id)}
                        className="text-destructive -mt-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Governing Body</Label>
                        <Select
                          value={mem.governingBody.toString()}
                          onValueChange={(val) => updateMembership(mem.id, "governingBody", Number(val) as GoverningBody)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {Object.entries(governingBodyLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Membership Level</Label>
                        <Select
                          value={mem.membershipLevel.toString()}
                          onValueChange={(val) => updateMembership(mem.id, "membershipLevel", Number(val) as MembershipLevel)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {Object.entries(membershipLevelLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Membership Number</Label>
                        <Input
                          value={mem.membershipNumber}
                          onChange={(e) => updateMembership(mem.id, "membershipNumber", e.target.value)}
                          placeholder="e.g., BACP-123456"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Year Obtained</Label>
                        <Input
                          type="number"
                          value={mem.yearObtained ?? ""}
                          onChange={(e) => updateMembership(mem.id, "yearObtained", e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {memberships.length === 0 && (
                  <p className="text-sm text-muted-foreground">No memberships added yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}