import React from "react";
import { format } from "date-fns";
import {
  mockCurrentTherapist,
  mockTherapistJournalEntries,
  mockCpdEntries,
} from "../data/mockData";
import type { TherapistJournalEntry, CpdEntry } from "../data/mockData";
import { persistMockData } from "../data/devPersistence";
import Layout from "../components/Layout";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Slider } from "../components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  BookOpen,
  GraduationCap,
  Plus,
  ExternalLink,
  Eye,
  EyeOff,
  Smile,
  Meh,
  Frown,
  Filter,
  Calendar,
} from "lucide-react";

function getMoodEmoji(mood: number) {
  if (mood >= 8) return <Smile className="w-5 h-5 text-green-600" />;
  if (mood >= 5) return <Meh className="w-5 h-5 text-amber-500" />;
  return <Frown className="w-5 h-5 text-red-500" />;
}

function getMoodLabel(mood: number) {
  if (mood >= 9) return "Excellent";
  if (mood >= 7) return "Good";
  if (mood >= 5) return "Okay";
  if (mood >= 3) return "Low";
  return "Very Low";
}

export default function TherapistJournal() {
  const [activeTab, setActiveTab] = React.useState<string>("journal");
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [addType, setAddType] = React.useState<"journal" | "cpd">("journal");

  // Journal filter state
  const [supervisorFilter, setSupervisorFilter] = React.useState<"all" | "shared" | "private">("all");

  // Journal form state
  const [journalMood, setJournalMood] = React.useState<number>(5);
  const [journalThoughts, setJournalThoughts] = React.useState("");
  const [journalShared, setJournalShared] = React.useState<string>("no");

  // CPD form state
  const [cpdTitle, setCpdTitle] = React.useState("");
  const [cpdDescription, setCpdDescription] = React.useState("");
  const [cpdLink, setCpdLink] = React.useState("");
  const [cpdStartDate, setCpdStartDate] = React.useState("");
  const [cpdCompletedDate, setCpdCompletedDate] = React.useState("");

  // Force re-render after mutations
  const [, setTick] = React.useState(0);

  const allTherapistEntries = mockTherapistJournalEntries
    .filter((e) => e.therapistId === mockCurrentTherapist.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const therapistEntries = allTherapistEntries.filter((entry) => {
    if (supervisorFilter === "shared") return entry.sharedWithSupervisor;
    if (supervisorFilter === "private") return !entry.sharedWithSupervisor;
    return true;
  });

  const cpdEntries = mockCpdEntries
    .filter((e) => e.therapistId === mockCurrentTherapist.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const openAddDialog = (type: "journal" | "cpd") => {
    setAddType(type);
    // Reset form
    setJournalMood(5);
    setJournalThoughts("");
    setJournalShared("no");
    setCpdTitle("");
    setCpdDescription("");
    setCpdLink("");
    setCpdStartDate("");
    setCpdCompletedDate("");
    setShowAddDialog(true);
  };

  const handleSaveJournal = () => {
    if (!journalThoughts.trim()) return;

    const entry: TherapistJournalEntry = {
      id: `tj-${Date.now()}`,
      therapistId: mockCurrentTherapist.id,
      date: new Date(),
      mood: journalMood,
      thoughtsAndFeelings: journalThoughts.trim(),
      sharedWithSupervisor: journalShared === "yes",
      createdAt: new Date(),
    };

    mockTherapistJournalEntries.push(entry);
    persistMockData();
    setShowAddDialog(false);
    setTick((t) => t + 1);
  };

  const handleSaveCpd = () => {
    if (!cpdTitle.trim() || !cpdDescription.trim()) return;

    const entry: CpdEntry = {
      id: `cpd-${Date.now()}`,
      therapistId: mockCurrentTherapist.id,
      title: cpdTitle.trim(),
      description: cpdDescription.trim(),
      link: cpdLink.trim() || undefined,
      startDate: cpdStartDate.trim() ? new Date(cpdStartDate.trim()) : undefined,
      completedDate: cpdCompletedDate.trim() ? new Date(cpdCompletedDate.trim()) : undefined,
      createdAt: new Date(),
    };

    mockCpdEntries.push(entry);
    persistMockData();
    setShowAddDialog(false);
    setTick((t) => t + 1);
  };

  return (
    <Layout
      userType="therapist"
      userName={mockCurrentTherapist.name}
      userAvatar={mockCurrentTherapist.avatar}
    >
      <div className="flex flex-col h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          {/* Fixed header area */}
          <div className="shrink-0 container mx-auto px-4 pt-6 md:pt-8">
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Journal & CPD</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Your personal reflective journal and CPD scrapbook
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 mb-4">
              <TabsList>
                <TabsTrigger value="journal" className="gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  Journal
                </TabsTrigger>
                <TabsTrigger value="cpd" className="gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  CPD Scrapbook
                </TabsTrigger>
              </TabsList>

              <Button
                size="sm"
                onClick={() =>
                  openAddDialog(activeTab === "cpd" ? "cpd" : "journal")
                }
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {activeTab === "cpd" ? "Add CPD" : "Add Entry"}
                </span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            {/* Supervisor sharing filter — fixed in header for journal tab */}
            {activeTab === "journal" && allTherapistEntries.length > 0 && (
              <div className="flex items-center gap-2 pb-4">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex gap-1.5">
                  <Button
                    variant={supervisorFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSupervisorFilter("all")}
                    className="h-7 text-xs px-2.5"
                  >
                    All ({allTherapistEntries.length})
                  </Button>
                  <Button
                    variant={supervisorFilter === "shared" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSupervisorFilter("shared")}
                    className="h-7 text-xs px-2.5 gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Shared ({allTherapistEntries.filter((e) => e.sharedWithSupervisor).length})
                  </Button>
                  <Button
                    variant={supervisorFilter === "private" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSupervisorFilter("private")}
                    className="h-7 text-xs px-2.5 gap-1"
                  >
                    <EyeOff className="w-3 h-3" />
                    Private ({allTherapistEntries.filter((e) => !e.sharedWithSupervisor).length})
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable entries area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="container mx-auto px-4 pb-24 md:pb-8">
              {/* ── Journal Tab ────────────────────────────────────── */}
              <TabsContent value="journal" className="mt-0">
                {allTherapistEntries.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">
                        No journal entries yet. Start tracking your mood and reflections.
                      </p>
                      <Button onClick={() => openAddDialog("journal")} className="gap-1.5">
                        <Plus className="w-4 h-4" />
                        Add First Entry
                      </Button>
                    </CardContent>
                  </Card>
                ) : therapistEntries.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground text-sm">
                        No {supervisorFilter === "shared" ? "shared" : "private"} entries found.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {therapistEntries.map((entry) => (
                      <Card key={entry.id}>
                        <CardContent className="p-4 md:p-5">
                          <div className="flex items-start gap-3">
                            {/* Mood indicator */}
                            <div className="flex flex-col items-center gap-1 pt-0.5 min-w-[48px]">
                              {getMoodEmoji(entry.mood)}
                              <span className="text-xs text-muted-foreground">
                                {entry.mood}/10
                              </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                <span className="text-sm text-muted-foreground">
                                  {format(entry.date, "EEE d MMM yyyy")}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(entry.createdAt, "h:mm a")}
                                </span>
                                <Badge
                                  variant={entry.mood >= 7 ? "default" : entry.mood >= 4 ? "secondary" : "destructive"}
                                  className="text-xs"
                                >
                                  {getMoodLabel(entry.mood)}
                                </Badge>
                                {entry.sharedWithSupervisor ? (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <Eye className="w-3 h-3" />
                                    Supervisor
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
                                    <EyeOff className="w-3 h-3" />
                                    Private
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm whitespace-pre-wrap">
                                {entry.thoughtsAndFeelings}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ── CPD Tab ─────────────────────────────────────────── */}
              <TabsContent value="cpd" className="mt-0">
                {cpdEntries.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">
                        No CPD entries yet. Log your professional development activities.
                      </p>
                      <Button onClick={() => openAddDialog("cpd")} className="gap-1.5">
                        <Plus className="w-4 h-4" />
                        Add First CPD
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {cpdEntries.map((entry) => (
                      <Card key={entry.id}>
                        <CardContent className="p-4 md:p-5">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                              <GraduationCap className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-medium text-sm md:text-base">
                                    {entry.title}
                                  </h3>
                                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                    <span className="text-xs text-muted-foreground">
                                      Added {format(entry.createdAt, "d MMM yyyy")}
                                    </span>
                                    {(entry.startDate || entry.completedDate) && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {entry.startDate && entry.completedDate
                                          ? `${format(entry.startDate, "d MMM yyyy")} — ${format(entry.completedDate, "d MMM yyyy")}`
                                          : entry.startDate
                                            ? `Started ${format(entry.startDate, "d MMM yyyy")}`
                                            : `Completed ${format(entry.completedDate!, "d MMM yyyy")}`}
                                      </span>
                                    )}
                                    {entry.completedDate && (
                                      <Badge variant="outline" className="text-xs">Completed</Badge>
                                    )}
                                    {entry.startDate && !entry.completedDate && (
                                      <Badge variant="secondary" className="text-xs">In Progress</Badge>
                                    )}
                                  </div>
                                </div>
                                {entry.link && (
                                  <a
                                    href={entry.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0"
                                  >
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  </a>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                                {entry.description}
                              </p>
                              {entry.link && (
                                <a
                                  href={entry.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1 break-all"
                                >
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                  {entry.link}
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>

      {/* ── Add Entry Dialog ───────────────────────────────────── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {addType === "journal" ? (
                <>
                  <BookOpen className="w-5 h-5" /> New Journal Entry
                </>
              ) : (
                <>
                  <GraduationCap className="w-5 h-5" /> New CPD Entry
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {addType === "journal"
                ? "Record your mood and reflections"
                : "Log a professional development activity"}
            </DialogDescription>
          </DialogHeader>

          {addType === "journal" ? (
            <div className="space-y-5 pt-2">
              {/* Mood slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Mood</Label>
                  <div className="flex items-center gap-2">
                    {getMoodEmoji(journalMood)}
                    <span className="text-sm font-medium">
                      {journalMood}/10 — {getMoodLabel(journalMood)}
                    </span>
                  </div>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[journalMood]}
                  onValueChange={(val) => setJournalMood(val[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Very Low</span>
                  <span>Excellent</span>
                </div>
              </div>

              {/* Thoughts and feelings */}
              <div className="space-y-2">
                <Label htmlFor="thoughts">Thoughts & Feelings</Label>
                <Textarea
                  id="thoughts"
                  placeholder="How are you feeling? What's on your mind today..."
                  value={journalThoughts}
                  onChange={(e) => setJournalThoughts(e.target.value)}
                  rows={5}
                />
              </div>

              {/* Shared with supervisor */}
              <div className="space-y-2">
                <Label htmlFor="supervisor-share">Shared with Supervisor</Label>
                <Select value={journalShared} onValueChange={setJournalShared}>
                  <SelectTrigger id="supervisor-share">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">
                      <span className="flex items-center gap-2">
                        <EyeOff className="w-3.5 h-3.5" />
                        Private — not shared
                      </span>
                    </SelectItem>
                    <SelectItem value="yes">
                      <span className="flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5" />
                        Shared with supervisor
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveJournal}
                  disabled={!journalThoughts.trim()}
                >
                  Save Entry
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 pt-2">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="cpd-title">Title</Label>
                <Input
                  id="cpd-title"
                  placeholder="e.g. EMDR Advanced Training"
                  value={cpdTitle}
                  onChange={(e) => setCpdTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="cpd-desc">Description</Label>
                <Textarea
                  id="cpd-desc"
                  placeholder="Describe the CPD activity, what you learned, hours, etc."
                  value={cpdDescription}
                  onChange={(e) => setCpdDescription(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Link */}
              <div className="space-y-2">
                <Label htmlFor="cpd-link">Link (optional)</Label>
                <Input
                  id="cpd-link"
                  placeholder="https://..."
                  value={cpdLink}
                  onChange={(e) => setCpdLink(e.target.value)}
                  type="url"
                />
              </div>

              {/* Dates row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cpd-start-date">Start Date (optional)</Label>
                  <Input
                    id="cpd-start-date"
                    placeholder="YYYY-MM-DD"
                    value={cpdStartDate}
                    onChange={(e) => setCpdStartDate(e.target.value)}
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpd-completed-date">Completed (optional)</Label>
                  <Input
                    id="cpd-completed-date"
                    placeholder="YYYY-MM-DD"
                    value={cpdCompletedDate}
                    onChange={(e) => setCpdCompletedDate(e.target.value)}
                    type="date"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveCpd}
                  disabled={!cpdTitle.trim() || !cpdDescription.trim()}
                >
                  Save CPD
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}