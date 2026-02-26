import { useState } from "react";
import Layout from "../components/Layout";
import { mockCurrentTherapist, mockPosts, mockCurrentTherapistExtended, mockTherapists } from "../data/mockData";
import type { SessionRate, CoursePackage, AvailabilityWindow } from "../data/mockData";
import type { TherapistProfile } from "../../types";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Edit, PoundSterling, Clock, Trash2, Camera, MapPin, GraduationCap, Shield, Coffee, Package, ToggleLeft, ToggleRight, Bookmark } from "lucide-react";
import { Badge } from "../components/ui/badge";
import PostCard from "../components/PostCard";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import EditTherapistProfileDialog from "../components/EditTherapistProfileDialog";
import BookmarkManagerDialog from "../components/BookmarkManagerDialog";
import { toast } from "sonner";
import { persistMockData } from "../data/devPersistence";
import { areaOfFocusLabels, clinicalApproachLabels, governingBodyLabels, membershipLevelLabels } from "../../utils/enumLabels";

type SessionModality = 'video' | 'inPerson' | 'text' | 'phoneCall';

export default function TherapistProfile() {
  const [therapistData, setTherapistData] = useState(mockCurrentTherapist);
  const [extendedProfile, setExtendedProfile] = useState<Partial<TherapistProfile>>(mockCurrentTherapistExtended);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRatesDialogOpen, setIsRatesDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostLink, setNewPostLink] = useState("");
  const [showAddRateForm, setShowAddRateForm] = useState(false);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [rateToDelete, setRateToDelete] = useState<SessionRate | null>(null);

  // Session rates - using custom session rates structure
  const [sessionRates, setSessionRates] = useState<SessionRate[]>(
    therapistData.sessionRates || []
  );

  // New session rate form
  const [newRateTitle, setNewRateTitle] = useState("");
  const [newRateModality, setNewRateModality] = useState<SessionModality>("video");
  const [newRateDuration, setNewRateDuration] = useState("");
  const [newRatePrice, setNewRatePrice] = useState("");
  const [newRateCooldown, setNewRateCooldown] = useState("");

  // ── Course Packages ───────────────────────────────────────────
  const [coursePackages, setCoursePackages] = useState<CoursePackage[]>(
    therapistData.coursePackages || []
  );
  const [isCoursesDialogOpen, setIsCoursesDialogOpen] = useState(false);
  const [isBookmarksDialogOpen, setIsBookmarksDialogOpen] = useState(false);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<CoursePackage | null>(null);

  // New course form fields
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [newCourseSessionRateId, setNewCourseSessionRateId] = useState("");
  const [newCourseTotalSessions, setNewCourseTotalSessions] = useState("");
  const [newCourseTotalPrice, setNewCourseTotalPrice] = useState("");

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast.error("Please add content to your post");
      return;
    }

    toast.success("Post created successfully!");
    setNewPostContent("");
    setNewPostLink("");
    setIsPostDialogOpen(false);
  };

  const handleSaveExtendedProfile = (profile: Partial<TherapistProfile>) => {
    setExtendedProfile(profile);
    // Update the basic therapist data with values from extended profile
    setTherapistData({
      ...therapistData,
      bio: profile.bio || therapistData.bio,
      yearsOfExperience: profile.yearsOfExperience || therapistData.yearsOfExperience,
    });
  };

  const handleSaveRates = () => {
    setTherapistData({
      ...therapistData,
      sessionRates
    });
    toast.success("Session rates updated successfully!");
    setIsRatesDialogOpen(false);
  };

  const handleAddRate = () => {
    if (!newRateTitle.trim() || !newRateDuration || !newRatePrice) {
      toast.error("Please fill in all fields");
      return;
    }

    const cooldownValue = newRateCooldown ? Number(newRateCooldown) : undefined;

    if (editingRateId) {
      // Update existing rate
      setSessionRates(sessionRates.map(rate => 
        rate.id === editingRateId 
          ? {
              ...rate,
              title: newRateTitle,
              modality: newRateModality,
              duration: Number(newRateDuration),
              price: Number(newRatePrice),
              cooldown: cooldownValue
            }
          : rate
      ));
      toast.success("Session rate updated!");
    } else {
      // Add new rate
      const newRate: SessionRate = {
        id: `sr${Date.now()}`,
        title: newRateTitle,
        modality: newRateModality,
        duration: Number(newRateDuration),
        price: Number(newRatePrice),
        cooldown: cooldownValue
      };
      setSessionRates([...sessionRates, newRate]);
      toast.success("Session rate added!");
    }
    
    // Reset form and hide it
    setNewRateTitle("");
    setNewRateModality("video");
    setNewRateDuration("");
    setNewRatePrice("");
    setNewRateCooldown("");
    setShowAddRateForm(false);
    setEditingRateId(null);
  };

  const handleEditRate = (rate: SessionRate) => {
    setNewRateTitle(rate.title);
    setNewRateModality(rate.modality);
    setNewRateDuration(rate.duration.toString());
    setNewRatePrice(rate.price.toString());
    setNewRateCooldown(rate.cooldown ? rate.cooldown.toString() : "");
    setEditingRateId(rate.id);
    setShowAddRateForm(true);
  };

  const handleCancelEdit = () => {
    setShowAddRateForm(false);
    setEditingRateId(null);
    setNewRateTitle("");
    setNewRateModality("video");
    setNewRateDuration("");
    setNewRatePrice("");
    setNewRateCooldown("");
  };

  const handleDeleteRate = (rateId: string) => {
    setSessionRates(sessionRates.filter(rate => rate.id !== rateId));
    toast.success("Session rate removed");
  };

  // ── Course Package Handlers ───────────────────────────────────

  const resetCourseForm = () => {
    setNewCourseTitle("");
    setNewCourseDescription("");
    setNewCourseSessionRateId("");
    setNewCourseTotalSessions("");
    setNewCourseTotalPrice("");
    setShowAddCourseForm(false);
    setEditingCourseId(null);
  };

  const handleAddCourse = () => {
    if (!newCourseTitle.trim() || !newCourseSessionRateId || !newCourseTotalSessions || !newCourseTotalPrice) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (editingCourseId) {
      setCoursePackages(coursePackages.map(cp =>
        cp.id === editingCourseId
          ? {
              ...cp,
              title: newCourseTitle,
              description: newCourseDescription,
              sessionRateId: newCourseSessionRateId,
              totalSessions: Number(newCourseTotalSessions),
              totalPrice: Number(newCourseTotalPrice),
            }
          : cp
      ));
      toast.success("Course package updated!");
    } else {
      const newCourse: CoursePackage = {
        id: `cp${Date.now()}`,
        therapistId: therapistData.id,
        title: newCourseTitle,
        description: newCourseDescription,
        sessionRateId: newCourseSessionRateId,
        totalSessions: Number(newCourseTotalSessions),
        totalPrice: Number(newCourseTotalPrice),
        isActive: true,
      };
      setCoursePackages([...coursePackages, newCourse]);
      toast.success("Course package created!");
    }
    resetCourseForm();
  };

  const handleEditCourse = (cp: CoursePackage) => {
    setNewCourseTitle(cp.title);
    setNewCourseDescription(cp.description);
    setNewCourseSessionRateId(cp.sessionRateId);
    setNewCourseTotalSessions(cp.totalSessions.toString());
    setNewCourseTotalPrice(cp.totalPrice.toString());
    setEditingCourseId(cp.id);
    setShowAddCourseForm(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCoursePackages(coursePackages.filter(cp => cp.id !== courseId));
    toast.success("Course package removed");
  };

  const handleToggleCourseActive = (courseId: string) => {
    setCoursePackages(coursePackages.map(cp =>
      cp.id === courseId ? { ...cp, isActive: !cp.isActive } : cp
    ));
  };

  const handleSaveCourses = () => {
    setTherapistData({ ...therapistData, coursePackages });
    toast.success("Course packages updated!");
    setIsCoursesDialogOpen(false);
  };

  const getSessionRateLabel = (rateId: string) => {
    const rate = sessionRates.find(r => r.id === rateId);
    return rate ? `${rate.title} (${rate.duration} min)` : "Unknown";
  };

  const getPerSessionPrice = (total: number, sessions: number) =>
    sessions > 0 ? Math.round(total / sessions) : 0;

  const handleUpdateBanner = () => {
    toast.info("Banner image update would integrate with file upload in production");
    // In production, this would open a file picker or image URL input
    // For now, we'll simulate with a placeholder
  };

  const handleUpdateProfilePicture = () => {
    toast.info("Profile picture update would integrate with file upload in production");
    // In production, this would open a file picker or image URL input
  };

  const getModalityLabel = (modality: SessionModality) => {
    const labels = {
      video: "Video",
      inPerson: "In-Person",
      text: "Text",
      phoneCall: "Phone Call"
    };
    return labels[modality];
  };

  const myPosts = mockPosts.filter(post => post.therapistId === therapistData.id);

  return (
    <Layout
      userType="therapist"
      userName={therapistData.name}
      userAvatar={therapistData.avatar}
    >
      <div className="bg-background pb-8">
        {/* Banner and Profile Header - Matching Client View */}
        <div className="relative">
          {/* Banner Image */}
          <div className="w-full h-64 md:h-80 bg-muted overflow-hidden relative group">
            {therapistData.bannerImage ? (
              <img
                src={therapistData.bannerImage}
                alt="Profile banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
            )}
            {/* Banner Edit Button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleUpdateBanner}
            >
              <Camera className="w-4 h-4" />
              Update Banner
            </Button>
          </div>

          {/* Profile Info Container */}
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="relative">
              {/* Profile Picture - Overlapping Banner */}
              <div className="absolute -top-20 left-0">
                <div className="relative group">
                  <img
                    src={therapistData.avatar}
                    alt={therapistData.name}
                    className="w-40 h-40 rounded-full border-4 border-background object-cover bg-background"
                  />
                  {/* Profile Picture Edit Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2 rounded-full p-2 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleUpdateProfilePicture}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Action Button - Top Right */}
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" className="gap-2" onClick={() => setIsBookmarksDialogOpen(true)}>
                  <Bookmark className="w-4 h-4" />
                  Bookmarks
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>

              {/* Name and Credentials */}
              <div className="pt-6 pl-44">
                <h1 className="text-3xl font-bold">{therapistData.name}</h1>
                <p className="text-lg text-muted-foreground">{therapistData.credentials}</p>
                
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{therapistData.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span>{therapistData.yearsOfExperience} years experience</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs/Info Section */}
            <div className="border-t mt-4">
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="container mx-auto px-4 mt-6 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - About & Info */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {therapistData.bio}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {therapistData.specializations.map((spec, index) => (
                      <Badge key={index} variant="default">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Clinical Approaches</h3>
                  <div className="flex flex-wrap gap-2">
                    {therapistData.clinicalApproaches.map((approach, index) => (
                      <Badge key={index} variant="secondary">
                        {approach}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Education</h3>
                  <ul className="space-y-2">
                    {therapistData.education.map((edu, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{edu}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {therapistData.governingBodyMemberships && therapistData.governingBodyMemberships.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3">Professional Memberships</h3>
                    <ul className="space-y-3">
                      {therapistData.governingBodyMemberships.map((mem) => (
                        <li key={mem.id} className="flex items-start gap-2 text-sm">
                          <Shield className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-foreground">{governingBodyLabels[mem.governingBody]}</p>
                            <p className="text-muted-foreground">
                              {membershipLevelLabels[mem.membershipLevel]} · {mem.membershipNumber}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Session Rates */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base">Session Rates</CardTitle>
                  <Dialog open={isRatesDialogOpen} onOpenChange={setIsRatesDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1 h-auto p-1">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent aria-describedby={undefined}>
                      <DialogHeader>
                        <DialogTitle>Edit Session Rates</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
                        {/* List of existing session rates */}
                        {sessionRates.length > 0 && (
                          <div className="space-y-3 px-1">
                            <Label>Current Session Rates</Label>
                            {sessionRates.map((rate) => (
                              <div key={rate.id}>
                                <div 
                                  onClick={() => !(showAddRateForm && !editingRateId) && handleEditRate(rate)}
                                  className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                                    !(showAddRateForm && !editingRateId) ? 'cursor-pointer hover:bg-accent' : 'opacity-50'
                                  } ${
                                    editingRateId === rate.id ? 'ring-2 ring-primary rounded-b-none border-b-0' : ''
                                  }`}
                                >
                                  <div className="flex-1 space-y-1">
                                    <div className="font-medium">{rate.title}</div>
                                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        {getModalityLabel(rate.modality)}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {rate.duration} min
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <PoundSterling className="w-3 h-3" />
                                        {rate.price}
                                      </span>
                                      {rate.cooldown && (
                                        <span className="flex items-center gap-1">
                                          <Coffee className="w-3 h-3" />
                                          {rate.cooldown} min cooldown
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRateToDelete(rate);
                                    }}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>

                                {/* Inline edit form under the rate being edited */}
                                {editingRateId === rate.id && showAddRateForm && (
                                  <div className="space-y-3 p-3 border border-t-0 rounded-b-lg bg-muted/30 ring-2 ring-primary ring-t-0">
                                    <div>
                                      <Label htmlFor="newRateTitle" className="text-sm">Session Title</Label>
                                      <Input
                                        id="newRateTitle"
                                        placeholder="e.g., 50-min Video Session"
                                        value={newRateTitle}
                                        onChange={(e) => setNewRateTitle(e.target.value)}
                                        className="mt-1"
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label htmlFor="newRateModality" className="text-sm">Modality</Label>
                                        <Select
                                          value={newRateModality}
                                          onValueChange={(value: SessionModality) => setNewRateModality(value)}
                                        >
                                          <SelectTrigger id="newRateModality" className="mt-1">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="inPerson">In-Person</SelectItem>
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="phoneCall">Phone Call</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div>
                                        <Label htmlFor="newRateDuration" className="text-sm">Duration (min)</Label>
                                        <Input
                                          id="newRateDuration"
                                          type="number"
                                          placeholder="50"
                                          value={newRateDuration}
                                          onChange={(e) => setNewRateDuration(e.target.value)}
                                          className="mt-1"
                                        />
                                      </div>

                                      <div>
                                        <Label htmlFor="newRatePrice" className="text-sm">Price (£)</Label>
                                        <Input
                                          id="newRatePrice"
                                          type="number"
                                          placeholder="175"
                                          value={newRatePrice}
                                          onChange={(e) => setNewRatePrice(e.target.value)}
                                          className="mt-1"
                                        />
                                      </div>

                                      <div>
                                        <Label htmlFor="newRateCooldown" className="text-sm">Cooldown (min)</Label>
                                        <Input
                                          id="newRateCooldown"
                                          type="number"
                                          placeholder="10"
                                          value={newRateCooldown}
                                          onChange={(e) => setNewRateCooldown(e.target.value)}
                                          className="mt-1"
                                        />
                                        <p className="text-[11px] text-muted-foreground mt-1">Break after session for notes</p>
                                      </div>
                                    </div>

                                    <div className="flex gap-2">
                                      <Button 
                                        onClick={handleAddRate} 
                                        className="flex-1 gap-2"
                                      >
                                        <Edit className="w-4 h-4" />
                                        Update Rate
                                      </Button>
                                      <Button 
                                        onClick={handleCancelEdit} 
                                        variant="outline"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add new session rate button or form (only for new rates, not edits) */}
                        {!showAddRateForm ? (
                          <Button 
                            onClick={() => { setEditingRateId(null); setShowAddRateForm(true); }} 
                            variant="outline" 
                            className="w-full gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add New Rate
                          </Button>
                        ) : !editingRateId ? (
                          <div className="space-y-3 pt-4 border-t">
                            <Label>Add New Session Rate</Label>
                            
                            <div>
                              <Label htmlFor="newRateTitle" className="text-sm">Session Title</Label>
                              <Input
                                id="newRateTitle"
                                placeholder="e.g., 50-min Video Session"
                                value={newRateTitle}
                                onChange={(e) => setNewRateTitle(e.target.value)}
                                className="mt-1"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="newRateModality" className="text-sm">Modality</Label>
                                <Select
                                  value={newRateModality}
                                  onValueChange={(value: SessionModality) => setNewRateModality(value)}
                                >
                                  <SelectTrigger id="newRateModality" className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="inPerson">In-Person</SelectItem>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="phoneCall">Phone Call</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="newRateDuration" className="text-sm">Duration (min)</Label>
                                <Input
                                  id="newRateDuration"
                                  type="number"
                                  placeholder="50"
                                  value={newRateDuration}
                                  onChange={(e) => setNewRateDuration(e.target.value)}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label htmlFor="newRatePrice" className="text-sm">Price (£)</Label>
                                <Input
                                  id="newRatePrice"
                                  type="number"
                                  placeholder="175"
                                  value={newRatePrice}
                                  onChange={(e) => setNewRatePrice(e.target.value)}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label htmlFor="newRateCooldown" className="text-sm">Cooldown (min)</Label>
                                <Input
                                  id="newRateCooldown"
                                  type="number"
                                  placeholder="10"
                                  value={newRateCooldown}
                                  onChange={(e) => setNewRateCooldown(e.target.value)}
                                  className="mt-1"
                                />
                                <p className="text-[11px] text-muted-foreground mt-1">Break after session for notes</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                onClick={handleAddRate} 
                                className="flex-1 gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Add Rate
                              </Button>
                              <Button 
                                onClick={handleCancelEdit} 
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : null}

                        <Button onClick={handleSaveRates} className="w-full">
                          Save All Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {sessionRates.length === 0 ? (
                    <p className="text-muted-foreground">No session rates configured yet.</p>
                  ) : (
                    sessionRates.map((rate) => (
                      <div key={rate.id} className="flex justify-between">
                        <span className="text-muted-foreground">{rate.title}</span>
                        <span className="font-medium">£{rate.price}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Course Packages */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base">Course Packages</CardTitle>
                  <Dialog open={isCoursesDialogOpen} onOpenChange={(open) => { setIsCoursesDialogOpen(open); if (!open) resetCourseForm(); }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1 h-auto p-1">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg" aria-describedby={undefined}>
                      <DialogHeader>
                        <DialogTitle>Manage Course Packages</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
                        <p className="text-xs text-muted-foreground">
                          Create block booking packages that clients can purchase upfront. Each course is linked to one of your session rates.
                        </p>

                        {/* Existing courses */}
                        {coursePackages.length > 0 && (
                          <div className="space-y-3 px-1">
                            <Label>Current Courses</Label>
                            {coursePackages.map((cp) => (
                              <div key={cp.id}>
                                <div
                                  onClick={() => !(showAddCourseForm && !editingCourseId) && handleEditCourse(cp)}
                                  className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                                    !(showAddCourseForm && !editingCourseId) ? 'cursor-pointer hover:bg-accent' : 'opacity-50'
                                  } ${editingCourseId === cp.id ? 'ring-2 ring-primary rounded-b-none border-b-0' : ''}`}
                                >
                                  <div className="flex-1 space-y-1.5 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium truncate">{cp.title}</span>
                                      <Badge variant={cp.isActive ? "default" : "secondary"} className="text-[10px] shrink-0">
                                        {cp.isActive ? "Active" : "Inactive"}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{cp.description}</p>
                                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                      <span>{cp.totalSessions} sessions</span>
                                      <span className="flex items-center gap-1">
                                        <PoundSterling className="w-3 h-3" />
                                        {cp.totalPrice} total
                                      </span>
                                      <span className="text-muted-foreground/70">
                                        (~£{getPerSessionPrice(cp.totalPrice, cp.totalSessions)}/session)
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground/70">
                                      Session type: {getSessionRateLabel(cp.sessionRateId)}
                                    </p>
                                  </div>
                                  <div className="flex flex-col gap-1 shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => { e.stopPropagation(); handleToggleCourseActive(cp.id); }}
                                      className="h-7 w-7 p-0"
                                      title={cp.isActive ? "Deactivate" : "Activate"}
                                    >
                                      {cp.isActive ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => { e.stopPropagation(); setCourseToDelete(cp); }}
                                      className="text-destructive hover:text-destructive h-7 w-7 p-0"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Inline edit form */}
                                {editingCourseId === cp.id && showAddCourseForm && (
                                  <div className="space-y-3 p-3 border border-t-0 rounded-b-lg bg-muted/30 ring-2 ring-primary">
                                    <div>
                                      <Label className="text-sm">Course Title</Label>
                                      <Input value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} placeholder="e.g., EMDR Course" className="mt-1" />
                                    </div>
                                    <div>
                                      <Label className="text-sm">Description</Label>
                                      <Textarea value={newCourseDescription} onChange={(e) => setNewCourseDescription(e.target.value)} placeholder="Describe the course..." rows={2} className="mt-1" />
                                    </div>
                                    <div>
                                      <Label className="text-sm">Session Type</Label>
                                      <Select value={newCourseSessionRateId} onValueChange={setNewCourseSessionRateId}>
                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select session type" /></SelectTrigger>
                                        <SelectContent>
                                          {sessionRates.map(r => (
                                            <SelectItem key={r.id} value={r.id}>{r.title} ({r.duration} min · £{r.price})</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label className="text-sm">Total Sessions</Label>
                                        <Input type="number" value={newCourseTotalSessions} onChange={(e) => setNewCourseTotalSessions(e.target.value)} placeholder="8" className="mt-1" />
                                      </div>
                                      <div>
                                        <Label className="text-sm">Total Price (£)</Label>
                                        <Input type="number" value={newCourseTotalPrice} onChange={(e) => setNewCourseTotalPrice(e.target.value)} placeholder="1150" className="mt-1" />
                                      </div>
                                    </div>
                                    {newCourseTotalSessions && newCourseTotalPrice && (
                                      <p className="text-xs text-muted-foreground">
                                        Per-session cost: £{getPerSessionPrice(Number(newCourseTotalPrice), Number(newCourseTotalSessions))}
                                        {(() => {
                                          const rate = sessionRates.find(r => r.id === newCourseSessionRateId);
                                          if (rate) {
                                            const standardTotal = rate.price * Number(newCourseTotalSessions);
                                            const saving = standardTotal - Number(newCourseTotalPrice);
                                            if (saving > 0) return ` (saving £${saving} vs. individual bookings)`;
                                          }
                                          return '';
                                        })()}
                                      </p>
                                    )}
                                    <div className="flex gap-2">
                                      <Button onClick={handleAddCourse} className="flex-1 gap-2"><Edit className="w-4 h-4" /> Update Course</Button>
                                      <Button onClick={resetCourseForm} variant="outline">Cancel</Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add new course form */}
                        {!showAddCourseForm ? (
                          <Button onClick={() => { setEditingCourseId(null); setShowAddCourseForm(true); }} variant="outline" className="w-full gap-2">
                            <Plus className="w-4 h-4" /> Add New Course Package
                          </Button>
                        ) : !editingCourseId ? (
                          <div className="space-y-3 pt-4 border-t">
                            <Label>Add New Course Package</Label>
                            <div>
                              <Label className="text-sm">Course Title</Label>
                              <Input value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} placeholder="e.g., EMDR Trauma Processing Course" className="mt-1" />
                            </div>
                            <div>
                              <Label className="text-sm">Description</Label>
                              <Textarea value={newCourseDescription} onChange={(e) => setNewCourseDescription(e.target.value)} placeholder="Describe what the course covers..." rows={2} className="mt-1" />
                            </div>
                            <div>
                              <Label className="text-sm">Session Type</Label>
                              <Select value={newCourseSessionRateId} onValueChange={setNewCourseSessionRateId}>
                                <SelectTrigger className="mt-1"><SelectValue placeholder="Select which session type each booking uses" /></SelectTrigger>
                                <SelectContent>
                                  {sessionRates.map(r => (
                                    <SelectItem key={r.id} value={r.id}>{r.title} ({r.duration} min · £{r.price})</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-[11px] text-muted-foreground mt-1">Each course session uses this session type for booking</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-sm">Total Sessions</Label>
                                <Input type="number" value={newCourseTotalSessions} onChange={(e) => setNewCourseTotalSessions(e.target.value)} placeholder="8" className="mt-1" />
                              </div>
                              <div>
                                <Label className="text-sm">Total Price (£)</Label>
                                <Input type="number" value={newCourseTotalPrice} onChange={(e) => setNewCourseTotalPrice(e.target.value)} placeholder="1150" className="mt-1" />
                              </div>
                            </div>
                            {newCourseTotalSessions && newCourseTotalPrice && (
                              <p className="text-xs text-muted-foreground">
                                Per-session cost: £{getPerSessionPrice(Number(newCourseTotalPrice), Number(newCourseTotalSessions))}
                                {(() => {
                                  const rate = sessionRates.find(r => r.id === newCourseSessionRateId);
                                  if (rate) {
                                    const standardTotal = rate.price * Number(newCourseTotalSessions);
                                    const saving = standardTotal - Number(newCourseTotalPrice);
                                    if (saving > 0) return ` (saving £${saving} vs. individual bookings)`;
                                  }
                                  return '';
                                })()}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <Button onClick={handleAddCourse} className="flex-1 gap-2"><Plus className="w-4 h-4" /> Create Course</Button>
                              <Button onClick={resetCourseForm} variant="outline">Cancel</Button>
                            </div>
                          </div>
                        ) : null}

                        <Button onClick={handleSaveCourses} className="w-full">Save All Changes</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {coursePackages.filter(cp => cp.isActive).length === 0 ? (
                    <p className="text-muted-foreground">No active course packages.</p>
                  ) : (
                    coursePackages.filter(cp => cp.isActive).map((cp) => (
                      <div key={cp.id} className="space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-xs">{cp.title}</span>
                            <p className="text-[11px] text-muted-foreground">{cp.totalSessions} x {getSessionRateLabel(cp.sessionRateId)}</p>
                          </div>
                          <span className="font-medium">£{cp.totalPrice}</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Availability */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{therapistData.availability}</p>
                  <AvailabilityCalendar
                    sessionRates={sessionRates}
                    availabilityWindows={mockCurrentTherapist.availabilityWindows}
                    onSave={(updatedWindows: AvailabilityWindow[]) => {
                      mockCurrentTherapist.availabilityWindows = updatedWindows;
                      const t = mockTherapists.find(t => t.id === mockCurrentTherapist.id);
                      if (t) t.availabilityWindows = updatedWindows;
                      persistMockData();
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Main Feed - Posts */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Posts</CardTitle>
                    <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="w-4 h-4" />
                          Create Post
                        </Button>
                      </DialogTrigger>
                      <DialogContent aria-describedby={undefined}>
                        <DialogHeader>
                          <DialogTitle>Create New Post</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div>
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                              id="content"
                              placeholder="Share your insights, tips, or resources..."
                              value={newPostContent}
                              onChange={(e) => setNewPostContent(e.target.value)}
                              rows={6}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="link">Link (optional)</Label>
                            <Input
                              id="link"
                              type="url"
                              placeholder="https://..."
                              value={newPostLink}
                              onChange={(e) => setNewPostLink(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <Button onClick={handleCreatePost} className="w-full">
                            Publish Post
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
              </Card>

              {/* Posts List */}
              <div className="space-y-4">
                {myPosts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">You haven't created any posts yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">Share insights with your clients to build engagement.</p>
                    </CardContent>
                  </Card>
                ) : (
                  myPosts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      currentUserId={therapistData.id}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!rateToDelete} onOpenChange={(open) => !open && setRateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session Rate?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete \"{rateToDelete?.title}\"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (rateToDelete) {
                  handleDeleteRate(rateToDelete.id);
                  setRateToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Course Confirmation Dialog */}
      <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course Package?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{courseToDelete?.title}"? Clients with active bookings for this course will not be affected, but no new purchases will be possible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (courseToDelete) {
                  handleDeleteCourse(courseToDelete.id);
                  setCourseToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Comprehensive Edit Profile Dialog */}
      <EditTherapistProfileDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        profile={extendedProfile}
        onSave={handleSaveExtendedProfile}
      />

      {/* Bookmark Manager Dialog */}
      <BookmarkManagerDialog
        open={isBookmarksDialogOpen}
        onOpenChange={setIsBookmarksDialogOpen}
        therapistId={therapistData.id}
      />
    </Layout>
  );
}