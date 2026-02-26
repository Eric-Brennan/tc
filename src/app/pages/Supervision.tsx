import React from "react";
import { format } from "date-fns";
import { useNavigate, useLocation } from "react-router";
import {
  mockCurrentTherapist,
  mockTherapists,
  mockSupervisionConnections,
  mockSupervisionSessions,
  mockTherapistJournalEntries,
  therapistOffersSupervision,
} from "../data/mockData";
import type {
  SupervisionConnection,
  Therapist,
  TherapistJournalEntry,
} from "../data/mockData";
import { persistMockData } from "../data/devPersistence";
import Layout from "../components/Layout";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Search,
  UserCheck,
  Users,
  Shield,
  MapPin,
  GraduationCap,
  PoundSterling,
  Send,
  BookOpen,
  Smile,
  Meh,
  Frown,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  CalendarPlus,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import SupervisionBookingModal from "../components/SupervisionBookingModal";

function getMoodEmoji(mood: number) {
  if (mood >= 8) return <Smile className="w-4 h-4 text-green-600" />;
  if (mood >= 5) return <Meh className="w-4 h-4 text-amber-500" />;
  return <Frown className="w-4 h-4 text-red-500" />;
}

function getMoodLabel(mood: number) {
  if (mood >= 9) return "Excellent";
  if (mood >= 7) return "Good";
  if (mood >= 5) return "Okay";
  if (mood >= 3) return "Low";
  return "Very Low";
}

// Format time until session in days, hours, minutes (matches home page)
function formatTimeUntil(ms: number): string {
  const totalMinutes = Math.floor(ms / (60 * 1000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(" ");
}

export default function Supervision() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tick, setTick] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState(() => {
    // Allow navigation state to override the default tab
    const stateTab = (location.state as { tab?: string } | null)?.tab;
    if (stateTab === "supervisees" || stateTab === "my-supervision" || stateTab === "find") {
      return stateTab;
    }
    const id = mockCurrentTherapist.id;
    const hasAccepted = mockSupervisionConnections.some(
      (c) => c.superviseeId === id && c.status === "accepted"
    );
    return hasAccepted ? "my-supervision" : "find";
  });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [connectDialogOpen, setConnectDialogOpen] = React.useState(false);
  const [connectTarget, setConnectTarget] = React.useState<Therapist | null>(null);
  const [connectMessage, setConnectMessage] = React.useState("");
  const [selectedSupervisee, setSelectedSupervisee] = React.useState<string | null>(null);
  const [bookingSupervisor, setBookingSupervisor] = React.useState<Therapist | null>(null);

  const currentId = mockCurrentTherapist.id;
  const currentOffersSupervision = therapistOffersSupervision(mockCurrentTherapist);

  // ── Derived data ──────────────────────────────────────────────

  // All supervisors (excluding self)
  const supervisors = mockTherapists.filter(
    (t) => therapistOffersSupervision(t) && t.id !== currentId
  );

  // Filter supervisors by search
  const filteredSupervisors = supervisors.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.specializations.some((s) => s.toLowerCase().includes(q)) ||
      t.clinicalApproaches.some((a) => a.toLowerCase().includes(q)) ||
      (t.supervisionBio || "").toLowerCase().includes(q)
    );
  });

  // My supervisor connections (where I'm the supervisee)
  const mySupervisionConnections = mockSupervisionConnections.filter(
    (c) => c.superviseeId === currentId
  );

  // Whether the current therapist already has an accepted supervisor
  const hasSupervisor = mySupervisionConnections.some(
    (c) => c.status === "accepted"
  );

  // My supervisee connections (where I'm the supervisor)
  const mySuperviseeConnections = mockSupervisionConnections.filter(
    (c) => c.supervisorId === currentId
  );

  // My supervision sessions as supervisee
  const mySupervisorSessions = mockSupervisionSessions.filter(
    (s) => s.superviseeId === currentId
  );

  // My supervision sessions as supervisor
  const mySuperiseeSessions = mockSupervisionSessions.filter(
    (s) => s.supervisorId === currentId
  );

  // Get connection status for a given supervisor
  const getConnectionStatus = (supervisorId: string) => {
    const conn = mockSupervisionConnections.find(
      (c) => c.superviseeId === currentId && c.supervisorId === supervisorId
    );
    return conn?.status || null;
  };

  // ── Handlers ──────────────────────────────────────────────────

  const openConnectDialog = (therapist: Therapist) => {
    setConnectTarget(therapist);
    setConnectMessage("");
    setConnectDialogOpen(true);
  };

  const handleSendRequest = () => {
    if (!connectTarget) return;
    const conn: SupervisionConnection = {
      id: `sc-${Date.now()}`,
      superviseeId: currentId,
      supervisorId: connectTarget.id,
      status: "pending",
      message: connectMessage.trim() || undefined,
      createdAt: new Date(),
    };
    mockSupervisionConnections.push(conn);
    persistMockData();
    setConnectDialogOpen(false);
    setTick((t) => t + 1);
    toast.success(`Connection request sent to ${connectTarget.name}`);
  };

  const handleAcceptSupervisee = (connId: string) => {
    const conn = mockSupervisionConnections.find((c) => c.id === connId);
    if (conn) {
      conn.status = "accepted";
      persistMockData();
      setTick((t) => t + 1);
      const supervisee = mockTherapists.find((t) => t.id === conn.superviseeId);
      toast.success(`Accepted ${supervisee?.name ?? "supervisee"}`);
    }
  };

  const handleRejectSupervisee = (connId: string) => {
    const conn = mockSupervisionConnections.find((c) => c.id === connId);
    if (conn) {
      conn.status = "rejected";
      persistMockData();
      setTick((t) => t + 1);
      toast("Connection declined");
    }
  };

  // ── Supervisee journal entries (only if accepted + have sessions) ──
  const getVisibleJournalEntries = (superviseeId: string): TherapistJournalEntry[] => {
    // Check accepted connection
    const conn = mySuperviseeConnections.find(
      (c) => c.superviseeId === superviseeId && c.status === "accepted"
    );
    if (!conn) return [];

    // Check we have sessions together
    const hasSessions = mockSupervisionSessions.some(
      (s) => s.supervisorId === currentId && s.superviseeId === superviseeId
    );
    if (!hasSessions) return [];

    // Return shared entries
    return mockTherapistJournalEntries
      .filter(
        (e) => e.therapistId === superviseeId && e.sharedWithSupervisor
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Build supervisee list with their data
  const superviseeData = mySuperviseeConnections.map((conn) => {
    const therapist = mockTherapists.find((t) => t.id === conn.superviseeId);
    const sessions = mySuperiseeSessions.filter(
      (s) => s.superviseeId === conn.superviseeId
    );
    const journalEntries = getVisibleJournalEntries(conn.superviseeId);
    return { conn, therapist, sessions, journalEntries };
  });

  return (
    <Layout
      userType="therapist"
      userName={mockCurrentTherapist.name}
      userAvatar={mockCurrentTherapist.avatar}
    >
      <div className="flex flex-col h-full" data-tick={tick}>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full"
        >
          {/* Fixed header */}
          <div className="shrink-0 container mx-auto px-4 pt-6 md:pt-8">
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                Supervision
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Find a supervisor or manage your supervisees
              </p>
            </div>

            <TabsList className="mb-4">
              {!hasSupervisor && (
                <TabsTrigger value="find" className="gap-1.5">
                  <Search className="w-4 h-4" />
                  Find Supervisor
                </TabsTrigger>
              )}
              <TabsTrigger value="my-supervision" className="gap-1.5">
                <Shield className="w-4 h-4" />
                Supervisors
              </TabsTrigger>
              {currentOffersSupervision && (
                <TabsTrigger value="supervisees" className="gap-1.5">
                  <Users className="w-4 h-4" />
                  Supervisees
                </TabsTrigger>
              )}
              {hasSupervisor && (
                <TabsTrigger value="find" className="gap-1.5">
                  <Search className="w-4 h-4" />
                  Find Supervisor
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="container mx-auto px-4 pb-24 md:pb-8">
              {/* ── Find Supervisor Tab ─────────────────────── */}
              <TabsContent value="find" className="mt-0">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, specialisation, or approach..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {filteredSupervisors.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        {searchQuery
                          ? "No supervisors match your search."
                          : "No supervisors available at this time."}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredSupervisors.map((supervisor) => {
                      const status = getConnectionStatus(supervisor.id);
                      return (
                        <Card
                          key={supervisor.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4 md:p-5">
                            <div className="flex gap-3">
                              <img
                                src={supervisor.avatar}
                                alt={supervisor.name}
                                className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                                onClick={() => navigate(`/t/therapist/${supervisor.id}`)}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <button
                                    className="text-left hover:opacity-80 transition-opacity cursor-pointer"
                                    onClick={() => navigate(`/t/therapist/${supervisor.id}`)}
                                  >
                                    <h3 className="font-semibold text-sm md:text-base hover:text-primary transition-colors">
                                      {supervisor.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {supervisor.credentials}
                                    </p>
                                  </button>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs shrink-0 gap-1"
                                  >
                                    <Shield className="w-3 h-3" />
                                    Supervisor
                                  </Badge>
                                </div>

                                <button
                                  className="block text-left w-full cursor-pointer"
                                  onClick={() => navigate(`/t/therapist/${supervisor.id}`)}
                                >
                                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {supervisor.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <GraduationCap className="w-3 h-3" />
                                      {supervisor.yearsOfExperience} yrs
                                    </span>
                                  </div>

                                  {supervisor.supervisionBio && (
                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 hover:text-foreground transition-colors">
                                      {supervisor.supervisionBio}
                                    </p>
                                  )}
                                </button>

                                {/* Supervision rates summary */}
                                {(() => {
                                  const svRates = (supervisor.sessionRates || []).filter(r => r.isSupervision);
                                  if (svRates.length === 0) return null;
                                  const minPrice = Math.min(...svRates.map(r => r.price));
                                  return (
                                    <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                                      <PoundSterling className="w-3 h-3" />
                                      <span>Supervision from £{minPrice}</span>
                                    </div>
                                  );
                                })()}

                                <div className="flex flex-wrap gap-1 mt-2">
                                  {supervisor.specializations
                                    .slice(0, 3)
                                    .map((s) => (
                                      <Badge
                                        key={s}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {s}
                                      </Badge>
                                    ))}
                                  {supervisor.specializations.length > 3 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      +{supervisor.specializations.length - 3}
                                    </Badge>
                                  )}
                                </div>

                                <div className="mt-3">
                                  {status === "accepted" ? (
                                    <Badge className="gap-1">
                                      <UserCheck className="w-3 h-3" />
                                      Connected
                                    </Badge>
                                  ) : status === "pending" ? (
                                    <Badge
                                      variant="secondary"
                                      className="gap-1"
                                    >
                                      <Loader2 className="w-3 h-3" />
                                      Request Pending
                                    </Badge>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        openConnectDialog(supervisor)
                                      }
                                      className="gap-1.5"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                      Request Supervision
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* ── My Supervision Tab ──────────────────────── */}
              <TabsContent value="my-supervision" className="mt-0">
                {mySupervisionConnections.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">
                        You haven't connected with a supervisor yet.
                      </p>
                      <Button
                        onClick={() => setActiveTab("find")}
                        className="gap-1.5"
                      >
                        <Search className="w-4 h-4" />
                        Find a Supervisor
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Upcoming Sessions Section */}
                    {(() => {
                      const upcomingSessions = mySupervisorSessions
                        .filter(
                          (s) =>
                            s.status === "scheduled" &&
                            new Date(s.scheduledTime) > new Date()
                        )
                        .sort(
                          (a, b) =>
                            new Date(a.scheduledTime).getTime() -
                            new Date(b.scheduledTime).getTime()
                        );
                      
                      if (upcomingSessions.length > 0) {
                        return (
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Upcoming Sessions</h3>
                            <div className="space-y-3">
                              {upcomingSessions.map((session) => {
                                const supervisor = mockTherapists.find(
                                  (t) => t.id === session.supervisorId
                                );
                                if (!supervisor) return null;
                                const now = new Date();
                                const timeUntilSession = new Date(session.scheduledTime).getTime() - now.getTime();
                                const minutesUntilSession = Math.floor(timeUntilSession / (60 * 1000));
                                const isToday = new Date(session.scheduledTime).toDateString() === now.toDateString();
                                return (
                                  <Card key={session.id} className={`border-blue-200 bg-blue-50/30 ${isToday ? "border-primary" : ""}`}>
                                    <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <img
                                          src={supervisor.avatar}
                                          alt={supervisor.name}
                                          className="w-10 h-10 rounded-full object-cover shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-wrap items-center gap-1.5">
                                            <h4 className="font-semibold text-sm">
                                              {supervisor.name}
                                            </h4>
                                            {isToday && (
                                              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                                Today
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-xs text-muted-foreground">
                                            {format(session.scheduledTime, "EEEE, d MMMM yyyy 'at' HH:mm")}
                                          </p>
                                          <p className="text-xs text-muted-foreground capitalize">
                                            {session.modality === "video" ? "Video call" : session.modality}
                                            {" · "}{session.duration} minutes
                                            {session.price && ` · £${session.price}`}
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        variant="outline"
                                        className="gap-2 w-full sm:w-auto shrink-0"
                                        disabled
                                      >
                                        <Clock className="w-4 h-4" />
                                        {minutesUntilSession > 0 ? `In ${formatTimeUntil(timeUntilSession)}` : 'Scheduled'}
                                      </Button>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* My Supervisors */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">My Supervisors</h3>
                      <div className="space-y-4">{mySupervisionConnections.map((conn) => {
                        const supervisor = mockTherapists.find(
                          (t) => t.id === conn.supervisorId
                        );
                        if (!supervisor) return null;
                        const sessions = mySupervisorSessions
                          .filter((s) => s.supervisorId === conn.supervisorId)
                          .sort(
                            (a, b) =>
                              new Date(b.scheduledTime).getTime() -
                              new Date(a.scheduledTime).getTime()
                          );
                        const completedSessions = sessions.filter(
                          (s) => s.status === "completed"
                        );

                        return (
                          <Card key={conn.id}>
                            <CardContent className="p-4 md:p-5">
                              <div className="flex gap-3">
                                <img
                                  src={supervisor.avatar}
                                  alt={supervisor.name}
                                  className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                                  onClick={() => navigate(`/t/therapist/${supervisor.id}`)}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                      className="cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => navigate(`/t/therapist/${supervisor.id}`)}
                                    >
                                      <h3 className="font-semibold text-sm md:text-base hover:text-primary transition-colors text-left">
                                        {supervisor.name}
                                      </h3>
                                    </button>
                                    {conn.status === "accepted" ? (
                                      <Badge className="gap-1 text-xs">
                                        <UserCheck className="w-3 h-3" />
                                        Active
                                      </Badge>
                                    ) : conn.status === "pending" ? (
                                      <Badge
                                        variant="secondary"
                                        className="gap-1 text-xs"
                                      >
                                        <Loader2 className="w-3 h-3" />
                                        Pending
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs"
                                      >
                                        Declined
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {supervisor.credentials}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Connected{" "}
                                    {format(conn.createdAt, "d MMM yyyy")}
                                    {conn.status === "accepted" && completedSessions.length > 0 && (
                                      <> · {completedSessions.length} session{completedSessions.length !== 1 ? "s" : ""} completed</>
                                    )}
                                  </p>

                                  {/* Book session button for accepted connections */}
                                  {conn.status === "accepted" && (
                                    <Button
                                      size="sm"
                                      onClick={() => setBookingSupervisor(supervisor)}
                                      className="gap-1.5 mt-3"
                                    >
                                      <CalendarPlus className="w-3.5 h-3.5" />
                                      Book Supervision Session
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}</div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ── Supervisees Tab ─────────────────────────── */}
              {currentOffersSupervision && (
                <TabsContent value="supervisees" className="mt-0">
                  {superviseeData.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          No therapists have requested supervision from you yet.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {/* Upcoming Sessions Section */}
                      {(() => {
                        const upcomingSessions = mySuperiseeSessions
                          .filter(
                            (s) =>
                              s.status === "scheduled" &&
                              new Date(s.scheduledTime) > new Date()
                          )
                          .sort(
                            (a, b) =>
                              new Date(a.scheduledTime).getTime() -
                              new Date(b.scheduledTime).getTime()
                          );
                        
                        if (upcomingSessions.length > 0) {
                          return (
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Upcoming Sessions</h3>
                              <div className="space-y-3">
                                {upcomingSessions.map((session) => {
                                  const supervisee = mockTherapists.find(
                                    (t) => t.id === session.superviseeId
                                  );
                                  if (!supervisee) return null;
                                  const now = new Date();
                                  const timeUntilSession = new Date(session.scheduledTime).getTime() - now.getTime();
                                  const minutesUntilSession = Math.floor(timeUntilSession / (60 * 1000));
                                  const isToday = new Date(session.scheduledTime).toDateString() === now.toDateString();
                                  return (
                                    <Card key={session.id} className={`border-purple-200 bg-purple-50/30 ${isToday ? "border-primary" : ""}`}>
                                      <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                          <img
                                            src={supervisee.avatar}
                                            alt={supervisee.name}
                                            className="w-10 h-10 rounded-full object-cover shrink-0"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                              <h4 className="font-semibold text-sm">
                                                {supervisee.name}
                                              </h4>
                                              {isToday && (
                                                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                                  Today
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                              {format(session.scheduledTime, "EEEE, d MMMM yyyy 'at' HH:mm")}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                              {session.modality === "video" ? "Video call" : session.modality}
                                              {" · "}{session.duration} minutes
                                              {session.price && ` · £${session.price}`}
                                            </p>
                                          </div>
                                        </div>
                                        <Button
                                          variant="outline"
                                          className="gap-2 w-full sm:w-auto shrink-0"
                                          disabled
                                        >
                                          <Clock className="w-4 h-4" />
                                          {minutesUntilSession > 0 ? `In ${formatTimeUntil(timeUntilSession)}` : 'Scheduled'}
                                        </Button>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* My Supervisees List */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">My Supervisees</h3>
                        <div className="space-y-4">
                          {/* Pending requests first */}
                          {superviseeData
                            .filter((d) => d.conn.status === "pending")
                            .map(({ conn, therapist }) => {
                              if (!therapist) return null;
                              return (
                                <Card
                                  key={conn.id}
                                  className="border-amber-200 bg-amber-50/30"
                                >
                                  <CardContent className="p-4 md:p-5">
                                    <div className="flex gap-3">
                                      <img
                                        src={therapist.avatar}
                                        alt={therapist.name}
                                        className="w-12 h-12 rounded-full object-cover shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                                        onClick={() => navigate(`/t/therapist/${therapist.id}`)}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <button
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => navigate(`/t/therapist/${therapist.id}`)}
                                          >
                                            <h3 className="font-semibold text-sm md:text-base hover:text-primary transition-colors text-left">
                                              {therapist.name}
                                            </h3>
                                          </button>
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            Pending Request
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          {therapist.credentials}
                                        </p>
                                        {conn.message && (
                                          <p className="text-sm mt-2 bg-background rounded-lg p-3 border">
                                            "{conn.message}"
                                          </p>
                                        )}
                                        <div className="flex gap-2 mt-3">
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              handleAcceptSupervisee(conn.id)
                                            }
                                            className="gap-1.5"
                                          >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Accept
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              handleRejectSupervisee(conn.id)
                                            }
                                            className="gap-1.5"
                                          >
                                            <XCircle className="w-3.5 h-3.5" />
                                            Decline
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}

                          {/* Accepted supervisees */}
                          {superviseeData
                            .filter((d) => d.conn.status === "accepted")
                            .map(
                              ({
                                conn,
                                therapist,
                                sessions,
                                journalEntries,
                              }) => {
                                if (!therapist) return null;
                                const isExpanded =
                                  selectedSupervisee === conn.superviseeId;
                                const completedCount = sessions.filter(
                                  (s) => s.status === "completed"
                                ).length;
                                const upcomingCount = sessions.filter(
                                  (s) =>
                                    s.status === "scheduled" &&
                                    new Date(s.scheduledTime) > new Date()
                                ).length;

                                return (
                                  <Card key={conn.id}>
                                    <CardContent className="p-4 md:p-5">
                                      <div className="flex gap-3">
                                        <img
                                          src={therapist.avatar}
                                          alt={therapist.name}
                                          className="w-12 h-12 rounded-full object-cover shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                                          onClick={() => navigate(`/t/therapist/${therapist.id}`)}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <button
                                              className="cursor-pointer hover:opacity-80 transition-opacity"
                                              onClick={() => navigate(`/t/therapist/${therapist.id}`)}
                                            >
                                              <h3 className="font-semibold text-sm md:text-base hover:text-primary transition-colors text-left">
                                                {therapist.name}
                                              </h3>
                                            </button>
                                            <Badge
                                              className="gap-1 text-xs"
                                            >
                                              <UserCheck className="w-3 h-3" />
                                              Active Supervisee
                                            </Badge>
                                          </div>
                                          <p className="text-xs text-muted-foreground">
                                            {therapist.credentials}
                                          </p>

                                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span>
                                              {completedCount} completed
                                              session
                                              {completedCount !== 1 ? "s" : ""}
                                            </span>
                                            <span>
                                              {upcomingCount} upcoming
                                            </span>
                                            <span>
                                              {journalEntries.length} shared
                                              journal{" "}
                                              {journalEntries.length !== 1
                                                ? "entries"
                                                : "entry"}
                                            </span>
                                          </div>

                                          {/* Journal toggle */}
                                          {journalEntries.length > 0 && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                setSelectedSupervisee(
                                                  isExpanded
                                                    ? null
                                                    : conn.superviseeId
                                                )
                                              }
                                              className="gap-1.5 mt-3"
                                            >
                                              <BookOpen className="w-3.5 h-3.5" />
                                              {isExpanded
                                                ? "Hide Journal"
                                                : "View Shared Journal"}
                                            </Button>
                                          )}

                                          {sessions.length === 0 &&
                                            journalEntries.length === 0 && (
                                              <p className="text-xs text-muted-foreground mt-2 italic">
                                                No sessions yet — journal entries
                                                will become visible once you've had
                                                supervision sessions together.
                                              </p>
                                            )}

                                          {/* Expanded journal entries */}
                                          {isExpanded && (
                                            <div className="mt-4 space-y-3 border-t pt-4">
                                              <div className="flex items-center gap-2 mb-2">
                                                <BookOpen className="w-4 h-4 text-primary" />
                                                <h4 className="text-sm font-medium">
                                                  {therapist.name}'s Shared
                                                  Journal
                                                </h4>
                                                <Badge
                                                  variant="outline"
                                                  className="text-xs gap-1"
                                                >
                                                  <Eye className="w-3 h-3" />
                                                  {journalEntries.length}{" "}
                                                  {journalEntries.length !== 1
                                                    ? "entries"
                                                    : "entry"}
                                                </Badge>
                                              </div>
                                              {journalEntries.map((entry) => (
                                                <div
                                                  key={entry.id}
                                                  className="bg-muted/40 rounded-lg p-3"
                                                >
                                                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                    {getMoodEmoji(entry.mood)}
                                                    <span className="text-xs text-muted-foreground">
                                                      {format(
                                                        entry.date,
                                                        "EEE d MMM yyyy"
                                                      )}
                                                    </span>
                                                    <Badge
                                                      variant={
                                                        entry.mood >= 7
                                                          ? "default"
                                                          : entry.mood >= 4
                                                            ? "secondary"
                                                            : "destructive"
                                                      }
                                                      className="text-xs"
                                                    >
                                                      {getMoodLabel(entry.mood)}{" "}
                                                      ({entry.mood}/10)
                                                    </Badge>
                                                  </div>
                                                  <p className="text-sm whitespace-pre-wrap">
                                                    {entry.thoughtsAndFeelings}
                                                  </p>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              }
                            )}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              )}
            </div>
          </div>
        </Tabs>
      </div>

      {/* ── Connection Request Dialog ──────────────────────────── */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Request Supervision
            </DialogTitle>
            <DialogDescription>
              Send a connection request to {connectTarget?.name} for clinical
              supervision.
            </DialogDescription>
          </DialogHeader>
          {connectTarget && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                <img
                  src={connectTarget.avatar}
                  alt={connectTarget.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-sm">{connectTarget.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {connectTarget.credentials}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Message (optional)
                </label>
                <Textarea
                  placeholder="Introduce yourself and explain what you're looking for in supervision..."
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConnectDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSendRequest} className="gap-1.5">
                  <Send className="w-4 h-4" />
                  Send Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Supervision Booking Modal ──────────────────────────── */}
      {bookingSupervisor && (
        <SupervisionBookingModal
          open={true}
          onOpenChange={(open) => { if (!open) setBookingSupervisor(null); }}
          supervisor={bookingSupervisor}
          superviseeId={currentId}
          onBooked={() => setTick((t) => t + 1)}
        />
      )}
    </Layout>
  );
}