import React, { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { format } from "date-fns";
import {
  mockClients,
  mockCurrentTherapist,
  mockConnections,
  mockVideoSessions,
  mockSessionNotes,
  mockAssessments,
  mockJournalEntries,
  mockTherapists,
  mockMessages,
  mockProBonoTokens,
  mockClientCourseBookings,
  getPHQ9Severity,
  getGAD7Severity,
  type VideoSession,
  type SessionNote,
  type Assessment,
  type JournalEntry,
  type Message,
  type ProBonoToken,
  type ClientCourseBooking,
} from "../data/mockData";
import Layout from "../components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  FileText,
  ClipboardList,
  Video,
  PhoneCall,
  Users,
  MessageSquare,
  Clock,
  TrendingDown,
  TrendingUp,
  Minus,
  ChevronRight,
  XCircle,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Filter,
  Plus,
  Send,
  Loader2,
  CalendarCheck,
  Gift,
  User,
  Check,
  Package,
} from "lucide-react";
import { useIsMobileView } from "../hooks/useIsMobileView";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { persistMockData } from "../data/devPersistence";
import BackpackJournalTab from "../components/BackpackJournalTab";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";

// ---- Assessment response sub-component ------------------------------------

function ResponseItem({
  question,
  value,
  label,
  highlight = false,
}: {
  question: string;
  value: number;
  label: string;
  highlight?: boolean;
}) {
  const getColorClass = (val: number) => {
    if (val === 0)
      return "bg-green-100 dark:bg-green-950 border-green-200 dark:border-green-800";
    if (val === 1)
      return "bg-yellow-100 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
    if (val === 2)
      return "bg-orange-100 dark:bg-orange-950 border-orange-200 dark:border-orange-800";
    return "bg-red-100 dark:bg-red-950 border-red-200 dark:border-red-800";
  };

  return (
    <div
      className={`p-3 rounded-lg border ${
        highlight ? "ring-2 ring-red-500" : getColorClass(value)
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium flex-1">{question}</p>
        <div className="text-right">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">Score: {value}</div>
        </div>
      </div>
    </div>
  );
}

// ---- Session status filter type -------------------------------------------

type SessionFilter = "all" | "upcoming" | "completed" | "missed" | "cancelled";

type ReminderStatus = "idle" | "sending" | "sent" | "replied-complete" | "replied-in-session";

// ---- Main component -------------------------------------------------------

export default function BackpackClientDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobileView();

  const therapistId = mockCurrentTherapist.id;
  const client = mockClients.find((c) => c.id === clientId);

  const connection = mockConnections.find(
    (c) =>
      c.clientId === clientId &&
      c.therapistId === therapistId &&
      c.status === "accepted"
  );

  // ---- state ----

  const [sessionFilter, setSessionFilter] = useState<SessionFilter>("all");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [noteVersion, setNoteVersion] = useState(0);
  const [reminderStatus, setReminderStatus] = useState<ReminderStatus>("idle");
  const [expandedAssessmentId, setExpandedAssessmentId] = useState<string | null>(null);

  // ---- gifted sessions & courses ----
  const [tokens, setTokens] = useState<ProBonoToken[]>(mockProBonoTokens);
  const [courseBookings, setCourseBookings] = useState<ClientCourseBooking[]>(mockClientCourseBookings);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [giftMode, setGiftMode] = useState<"session" | "course">("session");
  const [selectedRateId, setSelectedRateId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [giftQuantity, setGiftQuantity] = useState(1);

  const therapistData = mockTherapists.find(t => t.id === therapistId);
  const sessionRates = therapistData?.sessionRates ?? [];
  const coursePackages = (therapistData?.coursePackages ?? []).filter(cp => cp.isActive);

  const clientAvailableTokens = tokens.filter(
    t => t.clientId === clientId && t.therapistId === therapistId && t.status === 'available'
  );

  const clientGiftedCourses = courseBookings.filter(
    cb => cb.clientId === clientId && cb.therapistId === therapistId && cb.totalPrice === 0 && cb.status === 'active' && cb.sessionsUsed < cb.totalSessions
  );

  const handleGiftSessions = () => {
    const rate = sessionRates.find(r => r.id === selectedRateId);
    if (!rate || !clientId) return;

    const newTokens: ProBonoToken[] = Array.from({ length: giftQuantity }, (_, i) => ({
      id: `pbt-${Date.now()}-${i}`,
      therapistId,
      clientId,
      sessionRateId: rate.id,
      sessionRateTitle: rate.title,
      createdAt: new Date(),
      status: 'available' as const,
    }));

    mockProBonoTokens.push(...newTokens);
    persistMockData(); // DEV-ONLY
    setTokens([...mockProBonoTokens]); // sync from source of truth
    closeGiftDialog();
    toast.success(`Gifted ${giftQuantity} session${giftQuantity > 1 ? 's' : ''} of ${rate.title}`);
  };

  const handleGiftCourse = () => {
    const course = coursePackages.find(cp => cp.id === selectedCourseId);
    if (!course || !clientId) return;

    const rate = sessionRates.find(r => r.id === course.sessionRateId);
    const newBooking: ClientCourseBooking = {
      id: `ccb-gift-${Date.now()}`,
      clientId,
      therapistId,
      coursePackageId: course.id,
      courseTitle: course.title,
      sessionRateId: course.sessionRateId,
      totalSessions: course.totalSessions,
      sessionsUsed: 0,
      totalPrice: 0, // gifted — free
      purchaseDate: new Date(),
      status: 'active',
    };

    mockClientCourseBookings.push(newBooking);
    persistMockData(); // DEV-ONLY
    setCourseBookings([...mockClientCourseBookings]); // sync from source of truth
    closeGiftDialog();
    toast.success(`Gifted "${course.title}" (${course.totalSessions} × ${rate?.title ?? 'sessions'}) to ${client?.name}`);
  };

  const closeGiftDialog = () => {
    setShowGiftDialog(false);
    setSelectedRateId("");
    setSelectedCourseId("");
    setGiftQuantity(1);
    setGiftMode("session");
  };

  const modalityIconsSmall: Record<string, React.ReactNode> = {
    video: <Video className="w-3.5 h-3.5" />,
    inPerson: <User className="w-3.5 h-3.5" />,
    text: <MessageSquare className="w-3.5 h-3.5" />,
    phoneCall: <Phone className="w-3.5 h-3.5" />,
  };

  const now = new Date();

  // ---- data ----

  const sessions: VideoSession[] = useMemo(
    () =>
      mockVideoSessions
        .filter(
          (s) => s.clientId === clientId && s.therapistId === therapistId
        )
        .sort(
          (a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime()
        ),
    [clientId, therapistId]
  );

  const notes: SessionNote[] = useMemo(
    () =>
      mockSessionNotes
        .filter(
          (n) => n.clientId === clientId && n.therapistId === therapistId
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [clientId, therapistId, noteVersion]
  );

  const assessments: Assessment[] = useMemo(
    () =>
      mockAssessments
        .filter(
          (a) => a.clientId === clientId && a.therapistId === therapistId
        )
        .sort((a, b) => b.date.getTime() - a.date.getTime()),
    [clientId, therapistId]
  );

  // Shared journal entries (shared with current therapist)
  const journalEntries: JournalEntry[] = useMemo(
    () =>
      mockJournalEntries
        .filter((j) => j.clientId === clientId && j.sharedWithTherapistIds.includes(mockCurrentTherapist.id))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [clientId]
  );

  const getSessionCategory = (s: VideoSession): SessionFilter => {
    if (s.status === "completed") return "completed";
    if (s.status === "cancelled") return "cancelled";
    if (s.status === "scheduled" && s.scheduledTime < now) return "missed";
    if (s.status === "scheduled" || s.status === "in-progress") return "upcoming";
    return "all";
  };

  const filteredSessions = useMemo(() => {
    if (sessionFilter === "all") return sessions;
    return sessions.filter((s) => getSessionCategory(s) === sessionFilter);
  }, [sessions, sessionFilter]);

  const sessionCounts = useMemo(() => {
    const counts = { all: sessions.length, upcoming: 0, completed: 0, missed: 0, cancelled: 0 };
    for (const s of sessions) {
      const cat = getSessionCategory(s);
      if (cat !== "all") counts[cat]++;
    }
    return counts;
  }, [sessions]);

  // ---- assessment helpers ----

  const frequencyLabels = [
    "Not at all",
    "Several days",
    "More than half the days",
    "Nearly every day",
  ];
  const impairmentLabels: Record<string, string> = {
    notDifficult: "Not difficult at all",
    somewhatDifficult: "Somewhat difficult",
    veryDifficult: "Very difficult",
    extremelyDifficult: "Extremely difficult",
  };

  const getTrendIcon = (current: number, previous: number | undefined) => {
    if (previous === undefined)
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (current < previous)
      return <TrendingDown className="h-4 w-4 text-green-600" />;
    if (current > previous)
      return <TrendingUp className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Minimal":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
      case "Mild":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300";
      case "Moderate":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300";
      case "Moderately Severe":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
      case "Severe":
        return "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // ---- session helpers ----

  const getSessionStatusBadge = (session: VideoSession) => {
    switch (session.status) {
      case "completed":
        return (
          <Badge
            variant="default"
            className="bg-green-600 hover:bg-green-700 gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Cancelled
          </Badge>
        );
      case "scheduled":
        if (session.scheduledTime < now) {
          return (
            <Badge
              variant="outline"
              className="text-amber-600 border-amber-300 gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              Missed
            </Badge>
          );
        }
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Upcoming
          </Badge>
        );
      case "in-progress":
        return (
          <Badge
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 gap-1"
          >
            <Video className="w-3 h-3" />
            In Progress
          </Badge>
        );
      default:
        return <Badge variant="outline">{session.status}</Badge>;
    }
  };

  const getModalityIcon = (modality?: string) => {
    switch (modality) {
      case "video":
        return <Video className="w-4 h-4 text-blue-500" />;
      case "phoneCall":
        return <PhoneCall className="w-4 h-4 text-green-500" />;
      case "inPerson":
        return <Users className="w-4 h-4 text-purple-500" />;
      case "text":
        return <MessageSquare className="w-4 h-4 text-orange-500" />;
      default:
        return <Video className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getModalityLabel = (modality?: string) => {
    switch (modality) {
      case "video":
        return "Video";
      case "phoneCall":
        return "Phone Call";
      case "inPerson":
        return "In-Person";
      case "text":
        return "Text";
      default:
        return "Session";
    }
  };

  const getSessionRateTitle = (session: VideoSession) => {
    if (session.sessionRateId) {
      const therapist = mockTherapists.find(
        (t) => t.id === session.therapistId
      );
      const rate = therapist?.sessionRates?.find(
        (r) => r.id === session.sessionRateId
      );
      if (rate) return rate.title;
    }
    return getModalityLabel(session.modality);
  };

  // ---- add note handler ----

  const handleAddNote = useCallback(() => {
    if (!newNoteContent.trim() || !clientId) return;

    const newNote: SessionNote = {
      id: `sn-${Date.now()}`,
      clientId,
      therapistId,
      content: newNoteContent.trim(),
      createdAt: new Date(),
    };

    mockSessionNotes.push(newNote);
    persistMockData(); // DEV-ONLY
    setNewNoteContent("");
    setNoteVersion((v) => v + 1);
    toast.success("Note added");
  }, [newNoteContent, clientId, therapistId]);

  // ---- assessment overdue check ----

  const latestAssessment = assessments[0] || null;
  const isAssessmentOverdue = useMemo(() => {
    if (!latestAssessment) return true;
    const daysSince = Math.floor(
      (now.getTime() - latestAssessment.date.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince >= 14;
  }, [latestAssessment]);

  const daysSinceLastAssessment = latestAssessment
    ? Math.floor(
        (now.getTime() - latestAssessment.date.getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const sendAssessmentReminder = useCallback(() => {
    if (!client || !clientId) return;

    setReminderStatus("sending");

    setTimeout(() => {
      const reminderMsg: Message = {
        id: `m-reminder-${Date.now()}-${clientId}`,
        senderId: therapistId,
        receiverId: clientId,
        content: `Hi ${client.name.split(" ")[0]}, it's time for your fortnightly wellbeing check-in (PHQ-9 & GAD-7). You can complete it at your convenience, or we can do it together in our next session — whichever you prefer!`,
        timestamp: new Date(),
        read: false,
      };
      mockMessages.push(reminderMsg);
      persistMockData(); // DEV-ONLY

      setReminderStatus("sent");
      toast.success(`Reminder sent to ${client.name.split(" ")[0]}`);

      // Simulate client reply
      const willCompleteNow = Math.random() > 0.5;
      const replyDelay = 2000 + Math.random() * 1000;

      setTimeout(() => {
        const replyContent = willCompleteNow
          ? "Thanks for the reminder! I'll complete it now."
          : "Thanks! Let's do it together in our next session if that's okay.";

        const replyMsg: Message = {
          id: `m-reply-${Date.now()}-${clientId}`,
          senderId: clientId,
          receiverId: therapistId,
          content: replyContent,
          timestamp: new Date(),
          read: false,
        };
        mockMessages.push(replyMsg);
        persistMockData(); // DEV-ONLY

        const newStatus: ReminderStatus = willCompleteNow
          ? "replied-complete"
          : "replied-in-session";
        setReminderStatus(newStatus);

        toast(
          willCompleteNow
            ? `${client.name.split(" ")[0]} will complete their assessment now`
            : `${client.name.split(" ")[0]} prefers to complete it in session`,
          {
            description: willCompleteNow
              ? "They said they'll fill it out right away"
              : "Plan to administer during your next session",
          }
        );
      }, replyDelay);
    }, 600);
  }, [client, clientId, therapistId]);

  const getReminderButtonContent = () => {
    switch (reminderStatus) {
      case "sending":
        return { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, label: "Sending...", disabled: true };
      case "sent":
        return { icon: <Send className="h-3.5 w-3.5" />, label: "Sent", disabled: true };
      case "replied-complete":
        return { icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />, label: "Completing now", disabled: true };
      case "replied-in-session":
        return { icon: <CalendarCheck className="h-3.5 w-3.5 text-blue-600" />, label: "In session", disabled: true };
      default:
        return { icon: <Send className="h-3.5 w-3.5" />, label: "Send Reminder", disabled: false };
    }
  };

  // ---- not found ----

  if (!client) {
    return (
      <Layout
        userType="therapist"
        userName={mockCurrentTherapist.name}
        userAvatar={mockCurrentTherapist.avatar}
      >
        <div className="p-6 max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">Client not found.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/t/clients")}
          >
            Back to Clients
          </Button>
        </div>
      </Layout>
    );
  }

  // ---- render ----------------------------------------------------------------

  const filterButtons: { key: SessionFilter; label: string }[] = [
    { key: "all", label: `All (${sessionCounts.all})` },
    { key: "upcoming", label: `Upcoming (${sessionCounts.upcoming})` },
    { key: "completed", label: `Completed (${sessionCounts.completed})` },
    { key: "missed", label: `Missed (${sessionCounts.missed})` },
    { key: "cancelled", label: `Cancelled (${sessionCounts.cancelled})` },
  ];

  return (
    <Layout
      userType="therapist"
      userName={mockCurrentTherapist.name}
      userAvatar={mockCurrentTherapist.avatar}
    >
      <div className="h-full flex flex-col">
        <div className="flex-1 container mx-auto px-4 py-4 md:py-8 space-y-6 max-w-4xl">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 -ml-2"
            onClick={() => navigate("/t/clients")}
          >
            <ArrowLeft className="w-4 h-4" />
            Clients
          </Button>

          {/* ============ Client Header Card ============ */}
          <Card>
            <CardContent className={isMobile ? "p-4" : "p-6"}>
              <div className="flex items-start gap-4">
                <img
                  src={client.avatar}
                  alt={client.name}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Name + message button row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h1 className="text-xl md:text-2xl font-semibold">
                        {client.name}
                      </h1>
                      {connection && (
                        <p className="text-xs text-muted-foreground">
                          Connected since{" "}
                          {format(connection.createdAt, "MMMM yyyy")}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size={isMobile ? "icon" : "sm"}
                      className={isMobile ? "shrink-0" : "gap-1.5 shrink-0"}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/t/messages/${client.id}`);
                      }}
                    >
                      <MessageSquare className="w-4 h-4" />
                      {!isMobile && <span>Message</span>}
                    </Button>
                  </div>

                  {/* Contact details */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {client.email}
                    </span>
                    {client.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {client.phone}
                      </span>
                    )}
                    {client.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {client.location}
                      </span>
                    )}
                  </div>

                  {/* Areas of concern */}
                  {client.areasOfFocus && client.areasOfFocus.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Areas of concern
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {client.areasOfFocus.map((area) => (
                          <Badge key={area} variant="secondary">
                            {area}
                          </Badge>
                        ))}
                      </div>
                      {client.areasOfFocusDetails && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {client.areasOfFocusDetails}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Quick stats */}
                  <div className="flex flex-wrap gap-4 pt-1 text-sm">
                    <div className="text-center">
                      <p className="font-semibold">
                        {sessions.filter((s) => s.status === "completed").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{notes.length}</p>
                      <p className="text-xs text-muted-foreground">Notes</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{assessments.length}</p>
                      <p className="text-xs text-muted-foreground">
                        Assessments
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{journalEntries.length}</p>
                      <p className="text-xs text-muted-foreground">
                        Journal
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ============ Gifted Sessions & Courses ============ */}
          {connection && (
            <Card>
              <CardContent className={`${isMobile ? 'p-3' : 'p-4'} space-y-2`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                    <Gift className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Gifted Sessions</p>
                    {(clientAvailableTokens.length > 0 || clientGiftedCourses.length > 0) ? (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {Object.entries(
                          clientAvailableTokens.reduce((acc, t) => {
                            acc[t.sessionRateTitle] = (acc[t.sessionRateTitle] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([title, count]) => (
                          <Badge key={title} variant="outline" className="text-xs gap-1 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                            <Gift className="w-3 h-3" />
                            {count}&times; {title}
                          </Badge>
                        ))}
                        {clientGiftedCourses.map(cb => {
                          const remaining = cb.totalSessions - cb.sessionsUsed;
                          return (
                            <Badge key={cb.id} variant="outline" className="text-xs gap-1 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                              <Package className="w-3 h-3" />
                              {cb.courseTitle} ({remaining}/{cb.totalSessions})
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No gifted sessions</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() => setShowGiftDialog(true)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isMobile ? 'Gift' : 'Gift Sessions'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gift Sessions Dialog */}
          <Dialog open={showGiftDialog} onOpenChange={(open) => { if (!open) closeGiftDialog(); else setShowGiftDialog(true); }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Gift Sessions
                </DialogTitle>
                <DialogDescription>
                  Gift free sessions or a full course to {client.name}.
                </DialogDescription>
              </DialogHeader>

              {/* Mode toggle */}
              <div className="flex gap-1 p-1 rounded-lg bg-muted">
                <button
                  type="button"
                  onClick={() => { setGiftMode("session"); setSelectedCourseId(""); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm transition-colors ${
                    giftMode === "session"
                      ? "bg-background shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  Sessions
                </button>
                <button
                  type="button"
                  onClick={() => { setGiftMode("course"); setSelectedRateId(""); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm transition-colors ${
                    giftMode === "course"
                      ? "bg-background shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  Courses
                </button>
              </div>

              <div className="space-y-4 py-2">
                {giftMode === "session" ? (
                  <>
                    <div className="space-y-2">
                      <Label>Session Type</Label>
                      <div className="grid gap-2 max-h-56 overflow-y-auto">
                        {sessionRates.map(rate => (
                          <button
                            key={rate.id}
                            type="button"
                            onClick={() => setSelectedRateId(rate.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                              selectedRateId === rate.id
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'hover:bg-muted'
                            }`}
                          >
                            <div className={selectedRateId === rate.id ? 'text-primary' : 'text-muted-foreground'}>
                              {modalityIconsSmall[rate.modality] || <Gift className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{rate.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {rate.duration} min &middot; normally &pound;{rate.price}
                              </p>
                            </div>
                            {selectedRateId === rate.id && (
                              <Check className="w-4 h-4 text-primary shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Number of Sessions</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={() => setGiftQuantity(prev => Math.max(1, prev - 1))}
                          disabled={giftQuantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="flex-1 text-center">
                          <span className="text-2xl font-bold">{giftQuantity}</span>
                          <p className="text-xs text-muted-foreground">
                            session{giftQuantity > 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={() => setGiftQuantity(prev => Math.min(10, prev + 1))}
                          disabled={giftQuantity >= 10}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label>Course</Label>
                    {coursePackages.length > 0 ? (
                      <div className="grid gap-2 max-h-64 overflow-y-auto">
                        {coursePackages.map(cp => {
                          const rate = sessionRates.find(r => r.id === cp.sessionRateId);
                          const isSelected = selectedCourseId === cp.id;
                          return (
                            <button
                              key={cp.id}
                              type="button"
                              onClick={() => setSelectedCourseId(cp.id)}
                              className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                                isSelected
                                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                  : 'hover:bg-muted'
                              }`}
                            >
                              <div className={`mt-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                                <Package className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{cp.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cp.description}</p>
                                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {cp.totalSessions} sessions
                                  </span>
                                  {rate && (
                                    <span>&middot; {rate.title}</span>
                                  )}
                                  <span className="ml-auto">
                                    <span className="line-through">£{cp.totalPrice}</span>
                                    <span className="ml-1 text-emerald-600 font-medium">£0</span>
                                  </span>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm text-muted-foreground">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No active course packages.</p>
                        <p className="text-xs mt-1">Create course packages in your profile settings.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={closeGiftDialog}
                >
                  Cancel
                </Button>
                {giftMode === "session" ? (
                  <Button
                    onClick={handleGiftSessions}
                    disabled={!selectedRateId}
                    className="gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    Gift {giftQuantity} Session{giftQuantity > 1 ? 's' : ''}
                  </Button>
                ) : (
                  <Button
                    onClick={handleGiftCourse}
                    disabled={!selectedCourseId}
                    className="gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Gift Course
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ============ Tabs ============ */}
          <Tabs defaultValue="sessions" className="w-full">
            <TabsList
              className={`grid w-full ${
                isMobile ? "grid-cols-4" : "grid-cols-4 max-w-lg"
              }`}
            >
              <TabsTrigger value="sessions" className="gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span className={isMobile ? "sr-only sm:not-sr-only" : ""}>Sessions</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span className={isMobile ? "sr-only sm:not-sr-only" : ""}>Notes</span>
              </TabsTrigger>
              <TabsTrigger value="assessments" className="gap-1.5">
                <ClipboardList className="w-3.5 h-3.5" />
                <span className={isMobile ? "sr-only sm:not-sr-only" : ""}>Assessments</span>
              </TabsTrigger>
              <TabsTrigger value="journal" className="gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span className={isMobile ? "sr-only sm:not-sr-only" : ""}>Journal</span>
              </TabsTrigger>
            </TabsList>

            {/* ==================== SESSIONS TAB ==================== */}
            <TabsContent value="sessions" className="mt-4 space-y-3">
              {/* Filter pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                {filterButtons.map((fb) => (
                  <button
                    key={fb.key}
                    onClick={() => setSessionFilter(fb.key)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      sessionFilter === fb.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {fb.label}
                  </button>
                ))}
              </div>

              {filteredSessions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CalendarIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {sessionFilter === "all"
                        ? "No sessions recorded yet"
                        : `No ${sessionFilter} sessions`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredSessions.map((session) => {
                  const isMissed =
                    session.status === "scheduled" &&
                    session.scheduledTime < now;

                  return (
                    <Card
                      key={session.id}
                      className={
                        isMissed
                          ? "border-amber-300 dark:border-amber-700"
                          : ""
                      }
                    >
                      <CardContent className={isMobile ? "p-3" : "p-4"}>
                        <div className="flex items-center gap-3">
                          {/* Modality icon */}
                          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                            {getModalityIcon(session.modality)}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm">
                                {getSessionRateTitle(session)}
                              </p>
                              {getSessionStatusBadge(session)}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                              <span>
                                {format(
                                  session.scheduledTime,
                                  "EEE, MMM d yyyy 'at' h:mm a"
                                )}
                              </span>
                              <span>{session.duration} min</span>
                              {session.price !== undefined && (
                                <span>£{session.price}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* ==================== NOTES TAB ==================== */}
            <TabsContent value="notes" className="mt-4 space-y-3">
              {/* Add new note */}
              <Card>
                <CardContent className={isMobile ? "p-3" : "p-4"}>
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      Add a note
                    </p>
                    <Textarea
                      placeholder="Write a session note or observation..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        disabled={!newNoteContent.trim()}
                        onClick={handleAddNote}
                        className="gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Save Note
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {notes.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No session notes recorded yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                notes.map((note) => {
                  const linkedSession = note.sessionId
                    ? mockVideoSessions.find((s) => s.id === note.sessionId)
                    : null;

                  return (
                    <Card key={note.id}>
                      <CardContent className={isMobile ? "p-3" : "p-4"}>
                        <div className="space-y-2">
                          {/* Header */}
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {format(note.createdAt, "MMM d, yyyy")}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(note.createdAt, "h:mm a")}
                              </span>
                            </div>
                            {linkedSession && (
                              <Badge
                                variant="outline"
                                className="text-xs gap-1"
                              >
                                {getModalityIcon(linkedSession.modality)}
                                {format(
                                  linkedSession.scheduledTime,
                                  "MMM d"
                                )}{" "}
                                session
                              </Badge>
                            )}
                          </div>

                          {/* Content */}
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* ==================== ASSESSMENTS TAB ==================== */}
            <TabsContent value="assessments" className="mt-4 space-y-4">
              {/* Overdue banner */}
              {isAssessmentOverdue && (
                <Card className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
                  <CardContent className={isMobile ? "p-3" : "p-4"}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                          Assessment overdue
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                          {daysSinceLastAssessment !== null
                            ? `Last completed ${daysSinceLastAssessment} days ago — fortnightly check-ins are recommended`
                            : "No assessments have been completed yet"}
                        </p>
                      </div>
                      {(() => {
                        const btn = getReminderButtonContent();
                        return (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 shrink-0 border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900"
                            disabled={btn.disabled}
                            onClick={sendAssessmentReminder}
                          >
                            {btn.icon}
                            {btn.label}
                          </Button>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}

              {assessments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ClipboardList className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No assessments completed yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                assessments.map((assessment, index) => {
                  const previousAssessment = assessments[index + 1];
                  const isExpanded =
                    expandedAssessmentId === assessment.id;

                  return (
                    <Card key={assessment.id}>
                      <CardHeader
                        className="cursor-pointer"
                        onClick={() =>
                          setExpandedAssessmentId(
                            isExpanded ? null : assessment.id
                          )
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base md:text-lg">
                              {format(assessment.date, "MMMM d, yyyy")}
                            </CardTitle>
                            <CardDescription>
                              Completed at{" "}
                              {format(assessment.createdAt, "h:mm a")}
                              {index === 0 && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs"
                                >
                                  Latest
                                </Badge>
                              )}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">
                                PHQ-9
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-lg md:text-xl font-bold">
                                  {assessment.phq9Score}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  /27
                                </span>
                                {previousAssessment &&
                                  getTrendIcon(
                                    assessment.phq9Score,
                                    previousAssessment.phq9Score
                                  )}
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${getSeverityColor(
                                  getPHQ9Severity(assessment.phq9Score)
                                )}`}
                              >
                                {getPHQ9Severity(assessment.phq9Score)}
                              </Badge>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">
                                GAD-7
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-lg md:text-xl font-bold">
                                  {assessment.gad7Score}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  /21
                                </span>
                                {previousAssessment &&
                                  getTrendIcon(
                                    assessment.gad7Score,
                                    previousAssessment.gad7Score
                                  )}
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${getSeverityColor(
                                  getGAD7Severity(assessment.gad7Score)
                                )}`}
                              >
                                {getGAD7Severity(assessment.gad7Score)}
                              </Badge>
                            </div>
                            <ChevronRight
                              className={`h-5 w-5 text-muted-foreground transition-transform ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          </div>
                        </div>
                      </CardHeader>

                      {isExpanded && (
                        <CardContent>
                          <Tabs defaultValue="phq9" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="phq9">
                                PHQ-9 Responses
                              </TabsTrigger>
                              <TabsTrigger value="gad7">
                                GAD-7 Responses
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent
                              value="phq9"
                              className="space-y-4 mt-4"
                            >
                              <div className="space-y-3">
                                <ResponseItem
                                  question="Little interest or pleasure in doing things"
                                  value={
                                    assessment.phq9.littleInterest
                                  }
                                  label={
                                    frequencyLabels[
                                      assessment.phq9.littleInterest
                                    ]
                                  }
                                />
                                <ResponseItem
                                  question="Feeling down, depressed, or hopeless"
                                  value={assessment.phq9.feelingDown}
                                  label={
                                    frequencyLabels[
                                      assessment.phq9.feelingDown
                                    ]
                                  }
                                />
                                <ResponseItem
                                  question="Trouble falling or staying asleep, or sleeping too much"
                                  value={
                                    assessment.phq9.sleepProblems
                                  }
                                  label={
                                    frequencyLabels[
                                      assessment.phq9.sleepProblems
                                    ]
                                  }
                                />
                                <ResponseItem
                                  question="Feeling tired or having little energy"
                                  value={
                                    assessment.phq9.feelingTired
                                  }
                                  label={
                                    frequencyLabels[
                                      assessment.phq9.feelingTired
                                    ]
                                  }
                                />
                                <ResponseItem
                                  question="Poor appetite or overeating"
                                  value={
                                    assessment.phq9.appetiteProblems
                                  }
                                  label={
                                    frequencyLabels[
                                      assessment.phq9.appetiteProblems
                                    ]
                                  }
                                />
                                <ResponseItem
                                  question="Feeling bad about yourself"
                                  value={assessment.phq9.feelingBad}
                                  label={
                                    frequencyLabels[
                                      assessment.phq9.feelingBad
                                    ]
                                  }
                                />
                                <ResponseItem
                                  question="Trouble concentrating"
                                  value={
                                    assessment.phq9
                                      .troubleConcentrating
                                  }
                                  label={
                                    frequencyLabels[
                                      assessment.phq9
                                        .troubleConcentrating
                                    ]
                                  }
                                />
                                <ResponseItem
                                  question="Moving or speaking slowly/being fidgety"
                                  value={
                                    assessment.phq9.movingSpeaking
                                  }
                                  label={
                                    frequencyLabels[
                                      assessment.phq9.movingSpeaking
                                    ]
                                  }
                                />
                                <ResponseItem
                                  question="Thoughts of self-harm"
                                  value={
                                    assessment.phq9.selfHarmThoughts
                                  }
                                  label={
                                    frequencyLabels[
                                      assessment.phq9.selfHarmThoughts
                                    ]
                                  }
                                  highlight={
                                    assessment.phq9.selfHarmThoughts >
                                    0
                                  }
                                />
                              </div>
                              {assessment.phq9
                                .functionalImpairment && (
                                <div className="pt-4 border-t">
                                  <p className="text-sm font-medium mb-2">
                                    Functional Impairment:
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {
                                      impairmentLabels[
                                        assessment.phq9
                                          .functionalImpairment
                                      ]
                                    }
                                  </p>
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent
                              value="gad7"
                              className="space-y-4 mt-4"
                            >
                              <div className="space-y-3">
                                <ResponseItem
                                  question="Feeling nervous, anxious or on edge"
                                  value={
                                    assessment.gad7.feelingNervous
                                  }
                                  label={
                                    frequencyLabels[
                                      assessment.gad7.feelingNervous
                                    ]
                                  }
                                />
                                <ResponseItem
                                  question="Not being able to stop or control worrying"
                                  value={
                                    assessment.gad7.cantStopWorrying
                                  }
                                  label={
                                    frequencyLabels[
                                      assessment.gad7.cantStopWorrying
                                    ]
                                  }
                                />
                                <ResponseItem
                                  question="Worrying too much about different things"
                                  value={
                                    assessment.gad7.worryingTooMuch
                                  }
                                  label={
                                    frequencyLabels[
                                      assessment.gad7.worryingTooMuch
                                    ]
                                  }
                                />
                                <ResponseItem
                                  question="Trouble relaxing"
                                  value={
                                    assessment.gad7.troubleRelaxing
                                  }
                                  label={
                                    frequencyLabels[
                                      assessment.gad7.troubleRelaxing
                                    ]
                                  }
                                />
                                <ResponseItem
                                  question="Being so restless that it's hard to sit still"
                                  value={
                                    assessment.gad7.beingRestless
                                  }
                                  label={
                                    frequencyLabels[
                                      assessment.gad7.beingRestless
                                    ]
                                  }
                                />
                                <ResponseItem
                                  question="Becoming easily annoyed or irritable"
                                  value={
                                    assessment.gad7.easilyAnnoyed
                                  }
                                  label={
                                    frequencyLabels[
                                      assessment.gad7.easilyAnnoyed
                                    ]
                                  }
                                />
                                <ResponseItem
                                  question="Feeling afraid as if something awful might happen"
                                  value={
                                    assessment.gad7.feelingAfraid
                                  }
                                  label={
                                    frequencyLabels[
                                      assessment.gad7.feelingAfraid
                                    ]
                                  }
                                />
                              </div>
                              {assessment.gad7
                                .functionalImpairment && (
                                <div className="pt-4 border-t">
                                  <p className="text-sm font-medium mb-2">
                                    Functional Impairment:
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {
                                      impairmentLabels[
                                        assessment.gad7
                                          .functionalImpairment
                                      ]
                                    }
                                  </p>
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      )}
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* ==================== JOURNAL TAB ==================== */}
            <TabsContent value="journal" className="mt-4">
              <BackpackJournalTab
                journalEntries={journalEntries}
                isMobile={isMobile}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}