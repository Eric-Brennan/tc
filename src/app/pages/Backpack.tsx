import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import {
  mockClients,
  mockCurrentTherapist,
  mockConnections,
  mockVideoSessions,
  mockAssessments,
  mockSessionNotes,
  mockJournalEntries,
  type Client,
} from "../data/mockData";
import Layout from "../components/Layout";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Search,
  Calendar as CalendarIcon,
  FileText,
  ClipboardList,
  ChevronRight,
  Users,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { useIsMobileView } from "../hooks/useIsMobileView";

interface ClientSummary {
  client: Client;
  totalSessions: number;
  completedSessions: number;
  nextSession: Date | null;
  lastSession: Date | null;
  totalNotes: number;
  totalAssessments: number;
  totalJournalEntries: number;
}

export default function Backpack() {
  const navigate = useNavigate();
  const isMobile = useIsMobileView();
  const [searchQuery, setSearchQuery] = useState("");

  const therapistId = mockCurrentTherapist.id;

  // Get connected client IDs
  const connectedClientIds = useMemo(
    () =>
      mockConnections
        .filter((c) => c.therapistId === therapistId && c.status === "accepted")
        .map((c) => c.clientId),
    [therapistId]
  );

  // Build client summaries
  const clientSummaries: ClientSummary[] = useMemo(() => {
    return mockClients
      .filter((c) => connectedClientIds.includes(c.id))
      .map((client) => {
        const sessions = mockVideoSessions.filter(
          (s) => s.clientId === client.id && s.therapistId === therapistId
        );
        const completed = sessions.filter((s) => s.status === "completed");
        const scheduled = sessions
          .filter(
            (s) => s.status === "scheduled" && s.scheduledTime > new Date()
          )
          .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
        const past = [...completed].sort(
          (a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime()
        );

        const notes = mockSessionNotes.filter(
          (n) => n.clientId === client.id && n.therapistId === therapistId
        );
        const assessments = mockAssessments.filter(
          (a) => a.clientId === client.id && a.therapistId === therapistId
        );
        const journalEntries = mockJournalEntries.filter(
          (j) => j.clientId === client.id && j.sharedWithTherapistIds.includes(therapistId)
        );

        return {
          client,
          totalSessions: sessions.length,
          completedSessions: completed.length,
          nextSession: scheduled.length > 0 ? scheduled[0].scheduledTime : null,
          lastSession: past.length > 0 ? past[0].scheduledTime : null,
          totalNotes: notes.length,
          totalAssessments: assessments.length,
          totalJournalEntries: journalEntries.length,
        };
      });
  }, [connectedClientIds, therapistId]);

  // Filter by search
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clientSummaries;
    const q = searchQuery.toLowerCase();
    return clientSummaries.filter(
      ({ client }) =>
        client.name.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q) ||
        client.areasOfFocus?.some((a) => a.toLowerCase().includes(q))
    );
  }, [clientSummaries, searchQuery]);

  return (
    <Layout
      userType="therapist"
      userName={mockCurrentTherapist.name}
      userAvatar={mockCurrentTherapist.avatar}
    >
      <div className="h-full flex flex-col">
        <div className="flex-1 container mx-auto px-4 py-6 md:py-8 space-y-6">
          {/* Header */}
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <Users className="w-6 h-6" />
              Clients
            </h2>
            <p className="text-muted-foreground mt-1">
              Client records, session history, notes & assessments
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by name, email, or area of concern..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Clients count */}
          <p className="text-sm text-muted-foreground">
            {filteredClients.length} client{filteredClients.length !== 1 ? "s" : ""}
          </p>

          {/* Client List */}
          {filteredClients.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No clients match your search"
                    : "No connected clients yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filteredClients.map(
                ({
                  client,
                  completedSessions,
                  nextSession,
                  totalNotes,
                  totalAssessments,
                  totalJournalEntries,
                }) => (
                  <Card
                    key={client.id}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/t/clients/${client.id}`)}
                  >
                    <CardContent className={isMobile ? "p-3" : "p-4"}>
                      <div className="flex items-center gap-3 md:gap-4">
                        {/* Avatar */}
                        <img
                          src={client.avatar}
                          alt={client.name}
                          className="w-11 h-11 md:w-12 md:h-12 rounded-full object-cover shrink-0"
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{client.name}</p>
                          </div>

                          {/* Areas of concern */}
                          {client.areasOfFocus && client.areasOfFocus.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {client.areasOfFocus.map((area) => (
                                <Badge
                                  key={area}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Stats row */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {completedSessions} session{completedSessions !== 1 ? "s" : ""}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {totalNotes} note{totalNotes !== 1 ? "s" : ""}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClipboardList className="w-3 h-3" />
                              {totalAssessments} assessment{totalAssessments !== 1 ? "s" : ""}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {totalJournalEntries} entr{totalJournalEntries !== 1 ? "ies" : "y"}
                            </span>
                            {nextSession && (
                              <span className="text-primary">
                                Next: {format(nextSession, "MMM d")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Message"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/t/messages/${client.id}`);
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}