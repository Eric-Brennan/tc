import { useState, useMemo, useCallback } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";
import { enUS } from "date-fns/locale";
import { 
  mockJournalEntries, 
  mockClients,
  mockCurrentTherapist,
  mockConnections
} from "../data/mockData";
import { getContrastTextColor } from "../utils/themeColors";
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { MobileCalendar } from "../components/MobileCalendar";
import { 
  BookOpen,
  Brain,
  Battery,
  Calendar as CalendarIcon,
  Moon,
  AlertCircle,
  Zap,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router";

// Setup the localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales,
});

// Calendar event type for journal entries
interface JournalCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  clientId: string;
  entryIds: string[]; // Multiple entries can be on the same day
  averageMood: number;
  averagePhysical: number;
  isCombined?: boolean; // True if this represents multiple clients on the same day
  clientIds?: string[]; // Array of client IDs for combined events
}

export default function Journals() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('month');
  const [selectedEvent, setSelectedEvent] = useState<JournalCalendarEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [selectedMobileDate, setSelectedMobileDate] = useState<Date | undefined>();

  // Get connected client IDs
  const acceptedConnections = mockConnections.filter(c => c.status === 'accepted');
  const connectedClientIds = acceptedConnections.map(c => c.clientId);
  
  // Filter journal entries for connected clients only (shared with current therapist)
  const therapistJournalEntries = mockJournalEntries
    .filter(entry => 
      connectedClientIds.includes(entry.clientId) && 
      entry.sharedWithTherapistIds.includes(mockCurrentTherapist.id)
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // Helper function to get client by ID
  const getClientById = (clientId: string) => {
    return mockClients.find(c => c.id === clientId);
  };

  // Convert journal entries to calendar events (grouped by date and client)
  const events: JournalCalendarEvent[] = useMemo(() => {
    // First, group by date only to check how many clients per day
    const byDate = new Map<string, typeof therapistJournalEntries>();
    
    therapistJournalEntries.forEach(entry => {
      const dateKey = format(entry.date, 'yyyy-MM-dd');
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, []);
      }
      byDate.get(dateKey)!.push(entry);
    });

    const calendarEvents: JournalCalendarEvent[] = [];

    // Process each date
    byDate.forEach((entriesForDate, dateKey) => {
      // Get unique clients for this date
      const uniqueClientIds = [...new Set(entriesForDate.map(e => e.clientId))];
      
      // If 4+ clients have entries on this date, create a combined event
      if (uniqueClientIds.length >= 4) {
        const totalMood = entriesForDate.reduce((sum, e) => sum + e.moodRating, 0);
        const totalPhysical = entriesForDate.reduce((sum, e) => sum + e.physicalRating, 0);
        const eventDate = new Date(entriesForDate[0].date);
        eventDate.setHours(12, 0, 0, 0);

        calendarEvents.push({
          id: `combined-${dateKey}`,
          title: `${entriesForDate.length} journals from ${uniqueClientIds.length} clients`,
          start: eventDate,
          end: eventDate,
          clientId: '', // Not applicable for combined events
          entryIds: entriesForDate.map(e => e.id),
          averageMood: Math.round(totalMood / entriesForDate.length),
          averagePhysical: Math.round(totalPhysical / entriesForDate.length),
          isCombined: true,
          clientIds: uniqueClientIds,
        });
      } else {
        // Create separate events for each client (3 or fewer clients)
        const groupedByClient = new Map<string, typeof therapistJournalEntries>();
        
        entriesForDate.forEach(entry => {
          const clientKey = `${dateKey}-${entry.clientId}`;
          if (!groupedByClient.has(clientKey)) {
            groupedByClient.set(clientKey, []);
          }
          groupedByClient.get(clientKey)!.push(entry);
        });

        groupedByClient.forEach((entries, key) => {
          const client = getClientById(entries[0].clientId);
          const totalMood = entries.reduce((sum, e) => sum + e.moodRating, 0);
          const totalPhysical = entries.reduce((sum, e) => sum + e.physicalRating, 0);
          const eventDate = new Date(entries[0].date);
          eventDate.setHours(12, 0, 0, 0);

          calendarEvents.push({
            id: key,
            title: `${client?.name || 'Client'} - ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`,
            start: eventDate,
            end: eventDate,
            clientId: entries[0].clientId,
            entryIds: entries.map(e => e.id),
            averageMood: Math.round(totalMood / entries.length),
            averagePhysical: Math.round(totalPhysical / entries.length),
          });
        });
      }
    });

    return calendarEvents;
  }, [therapistJournalEntries]);

  const getRatingColor = (rating: number) => {
    return 'text-foreground';
  };

  const getSleepQualityRating = (quality?: string): number => {
    if (!quality) return 5;
    const ratings: Record<string, number> = {
      'excellent': 10,
      'good': 8,
      'fair': 5,
      'poor': 3,
      'veryPoor': 1
    };
    return ratings[quality] || 5;
  };

  const getSleepQualityDisplay = (quality?: string): string => {
    if (!quality) return 'N/A';
    const displays: Record<string, string> = {
      'excellent': 'Excellent',
      'good': 'Good',
      'fair': 'Fair',
      'poor': 'Poor',
      'veryPoor': 'Very Poor'
    };
    return displays[quality] || 'N/A';
  };

  const handleSelectEvent = useCallback((event: JournalCalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  }, []);

  // Handle mobile calendar date selection
  const handleMobileDateSelect = useCallback((date: Date) => {
    const event = events.find(e => isSameDay(e.start, date));
    if (event) {
      handleSelectEvent(event);
      setSelectedMobileDate(date);
    }
  }, [events, handleSelectEvent]);

  // Custom event styling based on mood
  const eventStyleGetter = (event: JournalCalendarEvent) => {
    let backgroundColor = '#6b7280'; // gray default
    
    if (event.averageMood >= 8) {
      backgroundColor = '#10b981'; // green
    } else if (event.averageMood >= 6) {
      backgroundColor = '#3b82f6'; // blue
    } else if (event.averageMood >= 4) {
      backgroundColor = '#f59e0b'; // yellow
    } else if (event.averageMood >= 2) {
      backgroundColor = '#f97316'; // orange
    } else {
      backgroundColor = '#ef4444'; // red
    }

    const style: React.CSSProperties = {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.9,
      color: getContrastTextColor(backgroundColor),
      border: '0',
      display: 'block',
    };
    return { style };
  };

  // Get entries for selected event
  const selectedEntries = selectedEvent 
    ? therapistJournalEntries.filter(e => selectedEvent.entryIds.includes(e.id))
    : [];

  const selectedClient = selectedEvent ? getClientById(selectedEvent.clientId) : null;

  return (
    <Layout
      userType="therapist"
      userName={mockCurrentTherapist.name}
      userAvatar={mockCurrentTherapist.avatar}
    >
      <div className="lg:h-full lg:flex lg:flex-col">
        <div className="container mx-auto px-4 py-8 lg:flex-1 lg:overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Client Journal Entries</h1>
            <p className="text-muted-foreground">
              View and track your clients' mental health progress through their journal entries
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-220px)]">
            {/* Calendar */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="lg:flex lg:flex-col lg:h-full">
                <CardContent className="p-4 md:p-6 lg:flex-1 lg:overflow-hidden">
                  {/* Desktop Calendar */}
                  <div className="hidden lg:block calendar-container h-full">
                    <BigCalendar
                      localizer={localizer}
                      events={events}
                      startAccessor="start"
                      endAccessor="end"
                      view={view}
                      onView={(newView) => setView(newView)}
                      onSelectEvent={handleSelectEvent}
                      eventPropGetter={eventStyleGetter}
                      popup
                      style={{ height: '100%' }}
                    />
                  </div>

                  {/* Mobile Calendar */}
                  <div className="block lg:hidden">
                    <MobileCalendar
                      events={events}
                      onDateSelect={handleMobileDateSelect}
                      selectedDate={selectedMobileDate}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Recent Entries - Show below calendar on mobile */}
              <Card className="lg:hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent Entries</CardTitle>
                  <CardDescription className="text-xs">
                    Latest journal entries from your clients
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {therapistJournalEntries.slice(0, 5).map(entry => {
                    const client = getClientById(entry.clientId);
                    if (!client) return null;

                    return (
                      <div
                        key={entry.id}
                        className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors active:scale-[0.98]"
                        onClick={() => {
                          const event = events.find(e => e.entryIds.includes(entry.id));
                          if (event) handleSelectEvent(event);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={client.avatar}
                            alt={client.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{client.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(entry.date, 'MMM d, h:mm a')}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <span className={`text-xs font-semibold ${getRatingColor(entry.moodRating)}`}>
                                Mental: {entry.moodRating}/10
                              </span>
                              <span className={`text-xs font-semibold ${getRatingColor(entry.physicalRating)}`}>
                                Physical: {entry.physicalRating}/10
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {therapistJournalEntries.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No journal entries yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Entries Sidebar - Desktop Only */}
            <div className="hidden lg:block overflow-y-auto space-y-4 h-full">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Entries</CardTitle>
                  <CardDescription>
                    Latest journal entries from your clients
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {therapistJournalEntries.slice(0, 10).map(entry => {
                    const client = getClientById(entry.clientId);
                    if (!client) return null;

                    return (
                      <div
                        key={entry.id}
                        className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => {
                          const event = events.find(e => e.entryIds.includes(entry.id));
                          if (event) handleSelectEvent(event);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={client.avatar}
                            alt={client.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{client.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(entry.date, 'MMM d, h:mm a')}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <span className={`text-xs font-semibold ${getRatingColor(entry.moodRating)}`}>
                                Mental: {entry.moodRating}/10
                              </span>
                              <span className={`text-xs font-semibold ${getRatingColor(entry.physicalRating)}`}>
                                Physical: {entry.physicalRating}/10
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {therapistJournalEntries.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No journal entries yet
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mood Rating Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span>8-10: Excellent</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                    <span>6-7: Good</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded bg-yellow-500"></div>
                    <span>4-5: Fair</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded bg-orange-500"></div>
                    <span>2-3: Poor</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span>1: Very Poor</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Journal Entry Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={(open) => {
        setShowEventDialog(open);
        if (!open) setExpandedEntryId(null);
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {selectedEvent?.isCombined ? 'Multiple Clients' : `Journal Entries - ${selectedClient?.name}`}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent && format(selectedEvent.start, 'EEEE, MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent?.isCombined ? (
            // Combined view - show list of clients
            <div className="space-y-4">
              <div className="pb-4 border-b">
                <p className="text-sm text-muted-foreground">
                  {selectedEvent.clientIds?.length} clients journaled on this day
                </p>
              </div>

              <div className="space-y-2">
                {selectedEvent.clientIds?.map(clientId => {
                  const client = getClientById(clientId);
                  const clientEntries = therapistJournalEntries.filter(
                    e => e.clientId === clientId && selectedEvent.entryIds.includes(e.id)
                  );
                  
                  if (!client) return null;

                  const avgMood = Math.round(
                    clientEntries.reduce((sum, e) => sum + e.moodRating, 0) / clientEntries.length
                  );
                  const avgPhysical = Math.round(
                    clientEntries.reduce((sum, e) => sum + e.physicalRating, 0) / clientEntries.length
                  );

                  return (
                    <Card 
                      key={clientId}
                      className="cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => {
                        // Find the individual client event for this client on this date
                        const individualEvent = events.find(
                          e => !e.isCombined && e.clientId === clientId && e.entryIds.some(id => selectedEvent.entryIds.includes(id))
                        );
                        if (individualEvent) {
                          setSelectedEvent(individualEvent);
                        } else {
                          // Create a temporary event for this client
                          const clientEvent: JournalCalendarEvent = {
                            id: `temp-${clientId}`,
                            title: `${client.name} - ${clientEntries.length} ${clientEntries.length === 1 ? 'entry' : 'entries'}`,
                            start: selectedEvent.start,
                            end: selectedEvent.end,
                            clientId,
                            entryIds: clientEntries.map(e => e.id),
                            averageMood: avgMood,
                            averagePhysical: avgPhysical,
                          };
                          setSelectedEvent(clientEvent);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={client.avatar}
                            alt={client.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{client.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {clientEntries.length} {clientEntries.length === 1 ? 'entry' : 'entries'}
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <div className="flex items-center gap-1">
                              <Brain className="w-4 h-4 text-muted-foreground" />
                              <span className={`text-sm font-semibold ${getRatingColor(avgMood)}`}>
                                {avgMood}/10
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Battery className="w-4 h-4 text-muted-foreground" />
                              <span className={`text-sm font-semibold ${getRatingColor(avgPhysical)}`}>
                                {avgPhysical}/10
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : selectedEvent && selectedClient && (
            <div className="space-y-4">
              {/* Client Info */}
              <div className="flex items-center gap-3 pb-4 border-b">
                <img
                  src={selectedClient.avatar}
                  alt={selectedClient.name}
                  className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => navigate(`/t/clients/${selectedClient.id}`)}
                />
                <div>
                  <p className="font-semibold">{selectedClient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'} on this day
                  </p>
                </div>
              </div>

              {/* Show condensed list if 4+ entries, otherwise show full details */}
              {selectedEntries.length >= 4 ? (
                // Condensed List View
                <div className="space-y-2">
                  {selectedEntries.map((entry, index) => {
                    const isExpanded = expandedEntryId === entry.id;
                    
                    return (
                      <Card key={entry.id} className={isExpanded ? "border-2 border-primary" : "border"}>
                        <CardContent className="p-0">
                          {/* Condensed Header - Always Visible */}
                          <div 
                            className="p-4 cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Entry {index + 1}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(entry.createdAt, 'h:mm a')}
                                  </span>
                                </div>
                                <div className="flex gap-3">
                                  <div className="flex items-center gap-1">
                                    <Brain className="w-4 h-4 text-muted-foreground" />
                                    <span className={`text-sm font-semibold ${getRatingColor(entry.moodRating)}`}>
                                      {entry.moodRating}/10
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Battery className="w-4 h-4 text-muted-foreground" />
                                    <span className={`text-sm font-semibold ${getRatingColor(entry.physicalRating)}`}>
                                      {entry.physicalRating}/10
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className="ml-2">
                                {isExpanded ? 'Hide Details' : 'View Details'}
                              </Badge>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-2 space-y-3 border-t">
                              {/* Additional Ratings */}
                              {(entry.anxietyLevel !== undefined || entry.stressLevel !== undefined || entry.sleepQuality) && (
                                <div className="grid grid-cols-3 gap-2">
                                  {entry.anxietyLevel !== undefined && (
                                    <div className="flex flex-col px-3 py-2 bg-muted rounded-md">
                                      <div className="flex items-center gap-1 mb-1">
                                        <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Anxiety</span>
                                      </div>
                                      <span className={`text-sm font-semibold ${getRatingColor(10 - entry.anxietyLevel)}`}>
                                        {entry.anxietyLevel}/10
                                      </span>
                                    </div>
                                  )}
                                  {entry.stressLevel !== undefined && (
                                    <div className="flex flex-col px-3 py-2 bg-muted rounded-md">
                                      <div className="flex items-center gap-1 mb-1">
                                        <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Stress</span>
                                      </div>
                                      <span className={`text-sm font-semibold ${getRatingColor(10 - entry.stressLevel)}`}>
                                        {entry.stressLevel}/10
                                      </span>
                                    </div>
                                  )}
                                  {entry.sleepQuality && (
                                    <div className="flex flex-col px-3 py-2 bg-muted rounded-md">
                                      <div className="flex items-center gap-1 mb-1">
                                        <Moon className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Sleep</span>
                                      </div>
                                      <span className={`text-sm font-semibold ${getRatingColor(getSleepQualityRating(entry.sleepQuality))}`}>
                                        {getSleepQualityDisplay(entry.sleepQuality)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Thoughts */}
                              {entry.thoughts && (
                                <div className="pt-2 border-t">
                                  <p className="text-sm font-medium mb-1">Thoughts:</p>
                                  <p className="text-sm text-muted-foreground">
                                    {entry.thoughts}
                                  </p>
                                </div>
                              )}

                              {/* Gratitude */}
                              {entry.gratitude && entry.gratitude.length > 0 && (
                                <div className="pt-2 border-t">
                                  <p className="text-sm font-medium mb-2">Grateful for:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {entry.gratitude.map((item, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {item}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Accomplishments */}
                              {entry.accomplishments && entry.accomplishments.length > 0 && (
                                <div className="pt-2 border-t">
                                  <p className="text-sm font-medium mb-2">Accomplishments:</p>
                                  <ul className="list-disc list-inside space-y-1">
                                    {entry.accomplishments.map((item, idx) => (
                                      <li key={idx} className="text-sm text-muted-foreground">
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Challenges */}
                              {entry.challenges && (
                                <div className="pt-2 border-t">
                                  <p className="text-sm font-medium mb-1">Challenges:</p>
                                  <p className="text-sm text-muted-foreground">
                                    {entry.challenges}
                                  </p>
                                </div>
                              )}

                              {/* Goals */}
                              {entry.goals && entry.goals.length > 0 && (
                                <div className="pt-2 border-t">
                                  <p className="text-sm font-medium mb-2">Goals:</p>
                                  <ul className="list-disc list-inside space-y-1">
                                    {entry.goals.map((item, idx) => (
                                      <li key={idx} className="text-sm text-muted-foreground">
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                // Full Details View (for 3 or fewer entries)
                <div className="space-y-4">
                  {selectedEntries.map((entry, index) => (
                    <Card key={entry.id} className="border-2">
                      <CardContent className="p-4 space-y-3">
                        {/* Entry header with time */}
                        <div className="flex items-center justify-between pb-2 border-b">
                          <p className="text-sm text-muted-foreground">
                            Entry {index + 1} • {format(entry.createdAt, 'h:mm a')}
                          </p>
                        </div>

                        {/* Mood & Physical */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Mental Well-being</p>
                              <p className={`text-xl font-bold ${getRatingColor(entry.moodRating)}`}>
                                {entry.moodRating}/10
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Battery className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Physical Well-being</p>
                              <p className={`text-xl font-bold ${getRatingColor(entry.physicalRating)}`}>
                                {entry.physicalRating}/10
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Additional Ratings */}
                        {(entry.anxietyLevel !== undefined || entry.stressLevel !== undefined || entry.sleepQuality) && (
                          <div className="grid grid-cols-3 gap-2">
                            {entry.anxietyLevel !== undefined && (
                              <div className="flex flex-col px-3 py-2 bg-muted rounded-md">
                                <div className="flex items-center gap-1 mb-1">
                                  <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">Anxiety</span>
                                </div>
                                <span className={`text-sm font-semibold ${getRatingColor(10 - entry.anxietyLevel)}`}>
                                  {entry.anxietyLevel}/10
                                </span>
                              </div>
                            )}
                            {entry.stressLevel !== undefined && (
                              <div className="flex flex-col px-3 py-2 bg-muted rounded-md">
                                <div className="flex items-center gap-1 mb-1">
                                  <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">Stress</span>
                                </div>
                                <span className={`text-sm font-semibold ${getRatingColor(10 - entry.stressLevel)}`}>
                                  {entry.stressLevel}/10
                                </span>
                              </div>
                            )}
                            {entry.sleepQuality && (
                              <div className="flex flex-col px-3 py-2 bg-muted rounded-md">
                                <div className="flex items-center gap-1 mb-1">
                                  <Moon className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">Sleep</span>
                                </div>
                                <span className={`text-sm font-semibold ${getRatingColor(getSleepQualityRating(entry.sleepQuality))}`}>
                                  {getSleepQualityDisplay(entry.sleepQuality)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Thoughts */}
                        {entry.thoughts && (
                          <div className="pt-2 border-t">
                            <p className="text-sm font-medium mb-1">Thoughts:</p>
                            <p className="text-sm text-muted-foreground">
                              {entry.thoughts}
                            </p>
                          </div>
                        )}

                        {/* Gratitude */}
                        {entry.gratitude && entry.gratitude.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-sm font-medium mb-2">Grateful for:</p>
                            <div className="flex flex-wrap gap-2">
                              {entry.gratitude.map((item, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Accomplishments */}
                        {entry.accomplishments && entry.accomplishments.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-sm font-medium mb-2">Accomplishments:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {entry.accomplishments.map((item, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Challenges */}
                        {entry.challenges && (
                          <div className="pt-2 border-t">
                            <p className="text-sm font-medium mb-1">Challenges:</p>
                            <p className="text-sm text-muted-foreground">
                              {entry.challenges}
                            </p>
                          </div>
                        )}

                        {/* Goals */}
                        {entry.goals && entry.goals.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-sm font-medium mb-2">Goals:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {entry.goals.map((item, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* View Client Profile Button */}
              <Button 
                className="w-full"
                onClick={() => navigate(`/t/clients/${selectedClient.id}`)}
              >
                <User className="w-4 h-4 mr-2" />
                View {selectedClient.name}'s Profile
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}