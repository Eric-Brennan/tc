import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { format, startOfDay, isSameDay } from "date-fns";
import {
  mockJournalEntries,
  mockCurrentClient,
  mockConnections,
  mockTherapists,
  mockCurrentTherapist,
  mockTherapistJournalEntries,
  mockSupervisionConnections,
  JournalEntry,
  TherapistJournalEntry,
  MoodRating,
  PhysicalRating,
  SleepQuality,
  AnxietyLevel,
  StressLevel
} from "../data/mockData";
import { persistMockData } from "../data/devPersistence";
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { 
  BookOpen, 
  Plus, 
  TrendingUp,
  Heart,
  Battery,
  Moon,
  Brain,
  Calendar as CalendarIcon,
  Lock,
  X,
  ChevronDown,
  Check,
  Users,
  Eye,
  EyeOff,
  Shield
} from "lucide-react";
import { useIsMobileView } from "../hooks/useIsMobileView";
import { useProfileMode } from "../contexts/ProfileModeContext";

// Helper: get connected therapists
function getConnectedTherapists() {
  const acceptedConnections = mockConnections.filter(
    c => c.clientId === mockCurrentClient.id && c.status === 'accepted'
  );
  return acceptedConnections
    .map(c => mockTherapists.find(t => t.id === c.therapistId))
    .filter(Boolean) as typeof mockTherapists;
}

// Therapist multi-select dropdown component
function TherapistMultiSelect({
  selectedIds,
  onChange,
  connectedTherapists,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  connectedTherapists: typeof mockTherapists;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTherapist = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(tid => tid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const isPrivate = selectedIds.length === 0;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 p-3 border rounded-lg text-left transition-colors hover:bg-accent ${
          open ? 'ring-2 ring-ring' : ''
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isPrivate ? (
            <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <Users className="w-4 h-4 text-primary shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            {isPrivate ? (
              <span className="text-sm text-muted-foreground">Private — only you can see this</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedIds.map(id => {
                  const t = connectedTherapists.find(th => th.id === id);
                  return t ? (
                    <Badge key={id} variant="secondary" className="text-xs gap-1">
                      <img src={t.avatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                      {t.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden">
          <div className="p-1">
            {connectedTherapists.map(therapist => {
              const isSelected = selectedIds.includes(therapist.id);
              return (
                <button
                  key={therapist.id}
                  type="button"
                  onClick={() => toggleTherapist(therapist.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    isSelected ? 'bg-primary/10' : 'hover:bg-accent'
                  }`}
                >
                  <img
                    src={therapist.avatar}
                    alt={therapist.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{therapist.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{therapist.credentials}</p>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                </button>
              );
            })}
          </div>
          {connectedTherapists.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No connected therapists
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Journal() {
  const navigate = useNavigate();
  const isMobile = useIsMobileView();
  const { isClientMode, clientModeUser } = useProfileMode();

  // ── Client-mode: show therapist's own journal entries ──────────
  const [therapistEntries, setTherapistEntries] = useState<TherapistJournalEntry[]>(
    () => mockTherapistJournalEntries.filter(e => e.therapistId === mockCurrentTherapist.id)
  );
  const [showTherapistEntryDialog, setShowTherapistEntryDialog] = useState(false);
  const [therapistFormMood, setTherapistFormMood] = useState<number>(5);
  const [therapistFormThoughts, setTherapistFormThoughts] = useState('');
  const [therapistFormShared, setTherapistFormShared] = useState(false);

  // Supervisor for the current therapist (if any)
  const supervisorConnection = mockSupervisionConnections.find(
    c => c.superviseeId === mockCurrentTherapist.id && c.status === 'accepted'
  );
  const supervisor = supervisorConnection
    ? mockTherapists.find(t => t.id === supervisorConnection.supervisorId)
    : null;

  // ── Regular client mode state ──────────────────────────────────
  const [entries, setEntries] = useState<JournalEntry[]>(
    mockJournalEntries.filter(e => e.clientId === mockCurrentClient.id)
  );
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false);

  const connectedTherapists = getConnectedTherapists();

  // Form state for new entry
  const [formData, setFormData] = useState({
    moodRating: 5 as MoodRating,
    physicalRating: 5 as PhysicalRating,
    sleepQuality: 'good' as SleepQuality,
    sleepHours: 7,
    anxietyLevel: 5 as AnxietyLevel,
    stressLevel: 5 as StressLevel,
    gratitude: ['', '', ''],
    accomplishments: ['', ''],
    challenges: '',
    activities: [] as string[],
    goals: ['', ''],
    thoughts: '',
    sharedWithTherapistIds: connectedTherapists.map(t => t.id) // default: share with all
  });

  const today = startOfDay(new Date());
  const hasEntryToday = isClientMode
    ? therapistEntries.some(entry => isSameDay(entry.date, today))
    : entries.some(entry => isSameDay(entry.date, today));

  const sleepOptions: { value: SleepQuality; label: string }[] = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
    { value: 'veryPoor', label: 'Very Poor' }
  ];

  const commonActivities = [
    'Exercise', 'Meditation', 'Reading', 'Socializing', 'Work', 
    'Therapy', 'Cooking', 'Hobbies', 'Nature', 'Self-care'
  ];

  const handleOpenNewEntry = () => {
    setFormData({
      moodRating: 5,
      physicalRating: 5,
      sleepQuality: 'good',
      sleepHours: 7,
      anxietyLevel: 5,
      stressLevel: 5,
      gratitude: ['', '', ''],
      accomplishments: ['', ''],
      challenges: '',
      activities: [],
      goals: ['', ''],
      thoughts: '',
      sharedWithTherapistIds: connectedTherapists.map(t => t.id) // default: share with all
    });
    setShowNewEntryDialog(true);
  };

  const handleToggleTherapistSharing = (entryId: string, therapistId: string) => {
    setEntries(entries.map(e => {
      if (e.id !== entryId) return e;
      const currentIds = e.sharedWithTherapistIds;
      const newIds = currentIds.includes(therapistId)
        ? currentIds.filter(id => id !== therapistId)
        : [...currentIds, therapistId];
      return { ...e, sharedWithTherapistIds: newIds, updatedAt: new Date() };
    }));
  };

  const handleUpdateSharing = (entryId: string, newIds: string[]) => {
    setEntries(entries.map(e =>
      e.id === entryId ? { ...e, sharedWithTherapistIds: newIds, updatedAt: new Date() } : e
    ));
  };

  const handleSaveEntry = () => {
    const newEntry: JournalEntry = {
      id: `j${Date.now()}`,
      clientId: mockCurrentClient.id,
      date: today,
      moodRating: formData.moodRating,
      physicalRating: formData.physicalRating,
      sleepQuality: formData.sleepQuality,
      sleepHours: formData.sleepHours,
      anxietyLevel: formData.anxietyLevel,
      stressLevel: formData.stressLevel,
      gratitude: formData.gratitude.filter(g => g.trim() !== ''),
      accomplishments: formData.accomplishments.filter(a => a.trim() !== ''),
      challenges: formData.challenges,
      activities: formData.activities,
      goals: formData.goals.filter(g => g.trim() !== ''),
      thoughts: formData.thoughts,
      sharedWithTherapistIds: formData.sharedWithTherapistIds,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setEntries([newEntry, ...entries]);

    setShowNewEntryDialog(false);
  };

  const toggleActivity = (activity: string) => {
    if (formData.activities.includes(activity)) {
      setFormData({ ...formData, activities: formData.activities.filter(a => a !== activity) });
    } else {
      setFormData({ ...formData, activities: [...formData.activities, activity] });
    }
  };

  const getRatingColor = (rating: number) => {
    return 'text-foreground';
  };

  // ── Client-mode handlers ───────────────────────────────────────
  const handleOpenTherapistEntry = () => {
    setTherapistFormMood(5);
    setTherapistFormThoughts('');
    setTherapistFormShared(false);
    setShowTherapistEntryDialog(true);
  };

  const handleSaveTherapistEntry = () => {
    const newEntry: TherapistJournalEntry = {
      id: `tj${Date.now()}`,
      therapistId: mockCurrentTherapist.id,
      date: today,
      mood: therapistFormMood,
      thoughtsAndFeelings: therapistFormThoughts,
      sharedWithSupervisor: therapistFormShared,
      createdAt: new Date(),
    };
    // Push to the global mock array & persist
    mockTherapistJournalEntries.push(newEntry);
    persistMockData();
    setTherapistEntries(prev => [newEntry, ...prev]);
    setShowTherapistEntryDialog(false);
  };

  const handleToggleSupervisorSharing = (entryId: string) => {
    const entry = mockTherapistJournalEntries.find(e => e.id === entryId);
    if (entry) {
      entry.sharedWithSupervisor = !entry.sharedWithSupervisor;
      persistMockData();
    }
    setTherapistEntries(prev =>
      prev.map(e => e.id === entryId ? { ...e, sharedWithSupervisor: !e.sharedWithSupervisor } : e)
    );
  };

  // ── Client-mode render ─────────────────────────────────────────
  if (isClientMode) {
    return (
      <Layout
        userType="client"
        userName={mockCurrentClient.name}
        userAvatar={mockCurrentClient.avatar}
      >
        <div className="h-full flex flex-col">
          <div className="flex-1 container mx-auto px-4 py-8 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div className={isMobile ? '' : 'flex items-center justify-between'}>
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    <BookOpen className="w-8 h-8" />
                    My Journal
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Track your wellbeing and reflect on your practice
                  </p>
                </div>
                <Button
                  onClick={handleOpenTherapistEntry}
                  disabled={hasEntryToday}
                  size="lg"
                  className={isMobile ? 'w-full mt-4' : ''}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {hasEntryToday ? 'Entry Created Today' : 'New Entry'}
                </Button>
              </div>

              {/* Entries List */}
              <div className="space-y-4">
                {therapistEntries.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Start Your Journey</h3>
                      <p className="text-muted-foreground mb-4">
                        Begin tracking your wellbeing by creating your first journal entry
                      </p>
                      <Button onClick={handleOpenTherapistEntry}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Entry
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  [...therapistEntries]
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map(entry => (
                      <Card key={entry.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <CardTitle className="text-lg">
                                  {format(entry.date, 'EEEE, MMMM d, yyyy')}
                                </CardTitle>
                                <CardDescription>
                                  {format(entry.createdAt, 'h:mm a')}
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Mood */}
                          <div className="flex items-center gap-3">
                            <Brain className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Mood</p>
                              <p className={`text-2xl font-bold ${getRatingColor(entry.mood)}`}>{entry.mood}/10</p>
                            </div>
                          </div>

                          {/* Thoughts */}
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Reflections:</p>
                            <p className="text-sm whitespace-pre-wrap">{entry.thoughtsAndFeelings}</p>
                          </div>

                          {/* Shared with Supervisor */}
                          <div className="pt-3 border-t">
                            <Label className="text-sm text-muted-foreground mb-2 block">Shared with</Label>
                            <button
                              type="button"
                              onClick={() => handleToggleSupervisorSharing(entry.id)}
                              className={`w-full flex items-center gap-2 p-3 border rounded-lg text-left transition-colors hover:bg-accent`}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {entry.sharedWithSupervisor && supervisor ? (
                                  <>
                                    <Shield className="w-4 h-4 text-primary shrink-0" />
                                    <div className="flex flex-wrap gap-1">
                                      <Badge variant="secondary" className="text-xs gap-1">
                                        <img src={supervisor.avatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                                        {supervisor.name}
                                      </Badge>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <span className="text-sm text-muted-foreground">
                                      Private — only you can see this
                                    </span>
                                  </>
                                )}
                              </div>
                              {supervisor && (
                                entry.sharedWithSupervisor
                                  ? <Eye className="w-4 h-4 text-primary shrink-0" />
                                  : <EyeOff className="w-4 h-4 text-muted-foreground shrink-0" />
                              )}
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* New Therapist Entry Dialog */}
        <Dialog open={showTherapistEntryDialog} onOpenChange={setShowTherapistEntryDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Journal Entry</DialogTitle>
              <DialogDescription>
                Reflect on your day for {format(today, 'MMMM d, yyyy')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Mood Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  How are you feeling? (1 = Low, 10 = High)
                </Label>
                <div className="grid grid-cols-10 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setTherapistFormMood(rating)}
                      className={`p-3 border rounded-lg text-center transition-all hover:border-primary ${
                        therapistFormMood === rating ? 'border-primary bg-primary text-primary-foreground' : ''
                      }`}
                    >
                      <div className="text-lg font-bold">{rating}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Thoughts */}
              <div>
                <Label htmlFor="therapistThoughts" className="text-base font-semibold mb-2 block">
                  Thoughts & Reflections
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Write about your day, feelings, or anything on your mind
                </p>
                <Textarea
                  id="therapistThoughts"
                  placeholder="Today I felt..."
                  value={therapistFormThoughts}
                  onChange={(e) => setTherapistFormThoughts(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              {/* Share with Supervisor */}
              {supervisor && (
                <div>
                  <Label className="text-base font-semibold mb-2 block">Share with supervisor</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Choose whether your supervisor can view this entry.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTherapistFormShared(!therapistFormShared)}
                    className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-colors hover:bg-accent ${
                      therapistFormShared ? 'border-primary/30 bg-primary/5' : ''
                    }`}
                  >
                    <img
                      src={supervisor.avatar}
                      alt={supervisor.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{supervisor.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{supervisor.credentials}</p>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      therapistFormShared ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                    }`}>
                      {therapistFormShared && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTherapistEntryDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTherapistEntry}>
                Save Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Layout>
    );
  }

  // ── Regular client render ──────────────────────────────────────
  return (
    <Layout
      userType="client"
      userName={mockCurrentClient.name}
      userAvatar={mockCurrentClient.avatar}
    >
      <div className="h-full flex flex-col">
        <div className="flex-1 container mx-auto px-4 py-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className={isMobile ? '' : 'flex items-center justify-between'}>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <BookOpen className="w-8 h-8" />
                  My Journal
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track your mental health journey and share insights with your therapist
                </p>
              </div>
              <Button 
                onClick={handleOpenNewEntry}
                disabled={hasEntryToday}
                size="lg"
                className={isMobile ? 'w-full mt-4' : ''}
              >
                <Plus className="w-5 h-5 mr-2" />
                {hasEntryToday ? 'Entry Created Today' : 'New Entry'}
              </Button>
            </div>

            {/* Entries List */}
            <div className="space-y-4">
              {entries.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Start Your Journey</h3>
                    <p className="text-muted-foreground mb-4">
                      Begin tracking your mental health by creating your first journal entry
                    </p>
                    <Button onClick={handleOpenNewEntry}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Entry
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                entries
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .map(entry => (
                    <Card key={entry.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <CardTitle className="text-lg">
                                {format(entry.date, 'EEEE, MMMM d, yyyy')}
                              </CardTitle>
                              <CardDescription>
                                {format(entry.updatedAt, 'h:mm a')}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Mood & Physical */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <Brain className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Mental Health</p>
                              <p className={`text-2xl font-bold ${getRatingColor(entry.moodRating)}`}>{entry.moodRating}/10</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Battery className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Physical Health</p>
                              <p className={`text-2xl font-bold ${getRatingColor(entry.physicalRating)}`}>{entry.physicalRating}/10</p>
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-2">
                          {entry.sleepHours && (
                            <Badge variant="outline" className="gap-1">
                              <Moon className="w-3 h-3" />
                              {entry.sleepHours}h sleep
                            </Badge>
                          )}
                          {entry.anxietyLevel && (
                            <Badge variant="outline" className="gap-1">
                              <Brain className="w-3 h-3" />
                              Anxiety: {entry.anxietyLevel}/10
                            </Badge>
                          )}
                          {entry.stressLevel && (
                            <Badge variant="outline" className="gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Stress: {entry.stressLevel}/10
                            </Badge>
                          )}
                        </div>

                        {/* Gratitude */}
                        {entry.gratitude && entry.gratitude.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              Grateful for:
                            </p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {entry.gratitude.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Thoughts */}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Reflections:</p>
                          <p className="text-sm whitespace-pre-wrap">{entry.thoughts}</p>
                        </div>

                        {/* Activities */}
                        {entry.activities && entry.activities.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {entry.activities.map((activity, idx) => (
                              <Badge key={idx} variant="secondary">{activity}</Badge>
                            ))}
                          </div>
                        )}

                        {/* Shared with Therapists */}
                        <div className="pt-3 border-t">
                          <Label className="text-sm text-muted-foreground mb-2 block">Shared with</Label>
                          <TherapistMultiSelect
                            selectedIds={entry.sharedWithTherapistIds}
                            onChange={(ids) => handleUpdateSharing(entry.id, ids)}
                            connectedTherapists={connectedTherapists}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Entry Dialog */}
      <Dialog open={showNewEntryDialog} onOpenChange={setShowNewEntryDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              New Journal Entry
            </DialogTitle>
            <DialogDescription>
              Track your mental health for {format(today, 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Mood Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                How are you feeling mentally? (1 = Low, 10 = High)
              </Label>
              <div className="grid grid-cols-10 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFormData({ ...formData, moodRating: rating as MoodRating })}
                    className={`p-3 border rounded-lg text-center transition-all hover:border-primary ${
                      formData.moodRating === rating ? 'border-primary bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    <div className="text-lg font-bold">{rating}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Physical Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                How are you feeling physically? (1 = Low, 10 = High)
              </Label>
              <div className="grid grid-cols-10 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFormData({ ...formData, physicalRating: rating as PhysicalRating })}
                    className={`p-3 border rounded-lg text-center transition-all hover:border-primary ${
                      formData.physicalRating === rating ? 'border-primary bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    <div className="text-lg font-bold">{rating}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sleepHours" className="mb-2 block">Hours of Sleep</Label>
                <Input
                  id="sleepHours"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={formData.sleepHours}
                  onChange={(e) => setFormData({ ...formData, sleepHours: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="sleepQuality" className="mb-2 block">Sleep Quality</Label>
                <select
                  id="sleepQuality"
                  value={formData.sleepQuality}
                  onChange={(e) => setFormData({ ...formData, sleepQuality: e.target.value as SleepQuality })}
                  className="w-full h-9 rounded-md border border-input bg-input-background px-3 py-1 text-sm focus:outline-none focus:ring-[3px] focus:ring-ring/50 focus-visible:border-ring transition-[color,box-shadow]"
                >
                  {sleepOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Anxiety & Stress Levels */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="anxietyLevel" className="mb-2 block">Anxiety Level (1-10)</Label>
                <Input
                  id="anxietyLevel"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.anxietyLevel}
                  onChange={(e) => setFormData({ ...formData, anxietyLevel: parseInt(e.target.value) as AnxietyLevel })}
                />
              </div>
              <div>
                <Label htmlFor="stressLevel" className="mb-2 block">Stress Level (1-10)</Label>
                <Input
                  id="stressLevel"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.stressLevel}
                  onChange={(e) => setFormData({ ...formData, stressLevel: parseInt(e.target.value) as StressLevel })}
                />
              </div>
            </div>

            {/* Gratitude */}
            <div>
              <Label className="text-base font-semibold mb-2 block">What are you grateful for today?</Label>
              {formData.gratitude.map((item, idx) => (
                <Input
                  key={idx}
                  placeholder={`Gratitude ${idx + 1}`}
                  value={item}
                  onChange={(e) => {
                    const newGratitude = [...formData.gratitude];
                    newGratitude[idx] = e.target.value;
                    setFormData({ ...formData, gratitude: newGratitude });
                  }}
                  className="mb-2"
                />
              ))}
            </div>

            {/* Accomplishments */}
            <div>
              <Label className="text-base font-semibold mb-2 block">What did you accomplish today?</Label>
              {formData.accomplishments.map((item, idx) => (
                <Input
                  key={idx}
                  placeholder={`Accomplishment ${idx + 1}`}
                  value={item}
                  onChange={(e) => {
                    const newAccomplishments = [...formData.accomplishments];
                    newAccomplishments[idx] = e.target.value;
                    setFormData({ ...formData, accomplishments: newAccomplishments });
                  }}
                  className="mb-2"
                />
              ))}
            </div>

            {/* Challenges */}
            <div>
              <Label htmlFor="challenges" className="mb-2 block">What challenges did you face?</Label>
              <Textarea
                id="challenges"
                placeholder="Describe any challenges or difficulties you experienced today..."
                value={formData.challenges}
                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                rows={2}
              />
            </div>

            {/* Activities */}
            <div>
              <Label className="text-base font-semibold mb-2 block">What activities did you do?</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {commonActivities.map(activity => (
                  <button
                    key={activity}
                    onClick={() => toggleActivity(activity)}
                    className={`px-3 py-1 border rounded-full text-sm transition-all ${
                      formData.activities.includes(activity)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-input hover:border-primary'
                    }`}
                  >
                    {activity}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Add custom activity (press Enter)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    const customActivity = e.currentTarget.value.trim();
                    if (!formData.activities.includes(customActivity)) {
                      setFormData({ ...formData, activities: [...formData.activities, customActivity] });
                    }
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>

            {/* Goals */}
            <div>
              <Label className="text-base font-semibold mb-2 block">Goals for tomorrow</Label>
              {formData.goals.map((item, idx) => (
                <Input
                  key={idx}
                  placeholder={`Goal ${idx + 1}`}
                  value={item}
                  onChange={(e) => {
                    const newGoals = [...formData.goals];
                    newGoals[idx] = e.target.value;
                    setFormData({ ...formData, goals: newGoals });
                  }}
                  className="mb-2"
                />
              ))}
            </div>

            {/* Thoughts */}
            <div>
              <Label htmlFor="thoughts" className="text-base font-semibold mb-2 block">Your Thoughts & Reflections</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Write about your day, feelings, or anything on your mind
              </p>
              <Textarea
                id="thoughts"
                placeholder="Today I felt..."
                value={formData.thoughts}
                onChange={(e) => setFormData({ ...formData, thoughts: e.target.value })}
                rows={6}
                className="resize-none"
              />
            </div>

            {/* Share with Therapists */}
            <div>
              <Label className="text-base font-semibold mb-2 block">Share with therapists</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Choose which therapists can view this entry. Deselect all to keep it private.
              </p>
              <TherapistMultiSelect
                selectedIds={formData.sharedWithTherapistIds}
                onChange={(ids) => setFormData({ ...formData, sharedWithTherapistIds: ids })}
                connectedTherapists={connectedTherapists}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewEntryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEntry}>
              Save Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}