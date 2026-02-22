import { useState, useMemo, useCallback, useEffect } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
// CSS is loaded globally via /src/styles/calendar.css @import
import type { View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays, startOfDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { 
  mockVideoSessions, 
  mockWorkshops, 
  mockCurrentClient,
  mockCurrentTherapist,
  mockTherapists,
  mockClients 
} from "../data/mockData";
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Calendar as CalendarIcon, Video, Users, Download, ExternalLink, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import { useIsMobileView } from "../hooks/useIsMobileView";

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

// Calendar event type
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'session' | 'workshop';
  therapistId: string;
  description?: string;
  isPaid?: boolean;
  price?: number;
  isRegistered?: boolean;
  maxParticipants?: number;
  currentParticipants?: number;
}

export default function Calendar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if we're in therapist mode (needed for default view)
  const isTherapistMode = location.pathname.startsWith('/t/');
  const currentUser = isTherapistMode ? mockCurrentTherapist : mockCurrentClient;

  // Default to agenda view on mobile, week for therapists, month for clients
  const isMobile = useIsMobileView();
  const [view, setView] = useState<View>(isMobile ? 'agenda' : isTherapistMode ? 'week' : 'month');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayEventsDialog, setShowDayEventsDialog] = useState(false);

  // Scroll to current time when switching to day/week views
  const scrollToTime = useMemo(() => new Date(), []);

  // Ref to scroll to current time when view changes to day/week
  const calendarContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    // Small delay to let BigCalendar render the time view
    setTimeout(() => {
      const timeContent = node.querySelector('.rbc-time-content') as HTMLElement | null;
      if (timeContent) {
        const currentTimeIndicator = node.querySelector('.rbc-current-time-indicator') as HTMLElement | null;
        if (currentTimeIndicator) {
          // Scroll the time-content container itself, not the page
          const containerTop = timeContent.getBoundingClientRect().top;
          const indicatorTop = currentTimeIndicator.getBoundingClientRect().top;
          const offset = indicatorTop - containerTop - timeContent.clientHeight / 2;
          timeContent.scrollTo({ top: timeContent.scrollTop + offset, behavior: 'smooth' });
        }
      }
    }, 100);
  }, [view]);

  // Combine sessions and workshops into calendar events
  const events: CalendarEvent[] = useMemo(() => {
    const sessionEvents: CalendarEvent[] = mockVideoSessions
      .filter(session => 
        isTherapistMode
          ? (session.therapistId === mockCurrentTherapist.id && session.status === 'scheduled')
          : (session.clientId === mockCurrentClient.id && session.status === 'scheduled' && session.isPaid)
      )
      .map(session => {
        const therapist = mockTherapists.find(t => t.id === session.therapistId);
        const client = mockClients.find(c => c.id === session.clientId);
        const clientFirstName = client?.name.split(' ')[0] || 'Client';
        
        // Get session rate title if available
        let sessionTitle = 'Session';
        if (session.sessionRateId && therapist?.sessionRates) {
          const sessionRate = therapist.sessionRates.find(sr => sr.id === session.sessionRateId);
          if (sessionRate) {
            sessionTitle = sessionRate.title;
          }
        } else if (session.modality) {
          // Fallback to modality if no session rate
          sessionTitle = session.modality.charAt(0).toUpperCase() + session.modality.slice(1).replace(/([A-Z])/g, '-$1');
        }
        
        return {
          id: session.id,
          title: isTherapistMode 
            ? `${sessionTitle} with ${clientFirstName}` 
            : `Session with ${therapist?.name || 'Therapist'}`,
          start: session.scheduledTime,
          end: new Date(session.scheduledTime.getTime() + session.duration * 60000),
          type: 'session' as const,
          therapistId: session.therapistId,
          isPaid: session.isPaid,
          price: session.price,
        };
      });

    const workshopEvents: CalendarEvent[] = isTherapistMode ? mockWorkshops
      .filter(workshop => workshop.therapistId === mockCurrentTherapist.id)
      .map(workshop => ({
        id: workshop.id,
        title: workshop.title,
        start: workshop.scheduledTime,
        end: new Date(workshop.scheduledTime.getTime() + workshop.duration * 60000),
        type: 'workshop' as const,
        therapistId: workshop.therapistId,
        description: workshop.description,
        price: workshop.price,
        maxParticipants: workshop.maxParticipants,
        currentParticipants: workshop.currentParticipants,
      })) : mockWorkshops
      .filter(workshop => {
        // Show registered workshops or workshops from followed therapists
        return workshop.isRegistered || 
          mockCurrentClient.followedTherapists?.includes(workshop.therapistId);
      })
      .map(workshop => {
        const therapist = mockTherapists.find(t => t.id === workshop.therapistId);
        return {
          id: workshop.id,
          title: workshop.title,
          start: workshop.scheduledTime,
          end: new Date(workshop.scheduledTime.getTime() + workshop.duration * 60000),
          type: 'workshop' as const,
          therapistId: workshop.therapistId,
          description: workshop.description,
          isRegistered: workshop.isRegistered,
          price: workshop.price,
          maxParticipants: workshop.maxParticipants,
          currentParticipants: workshop.currentParticipants,
        };
      });

    return [...sessionEvents, ...workshopEvents];
  }, [isTherapistMode]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  }, []);

  // Handle clicking on a date in month view (especially for mobile)
  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date; slots: Date[] | string[]; action: 'select' | 'click' | 'doubleClick' }) => {
    // Only handle single clicks on dates
    if (slotInfo.action === 'click') {
      const clickedDate = slotInfo.start;
      
      // Find events for this date
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start);
        return (
          eventDate.getFullYear() === clickedDate.getFullYear() &&
          eventDate.getMonth() === clickedDate.getMonth() &&
          eventDate.getDate() === clickedDate.getDate()
        );
      });
      
      if (dayEvents.length > 0) {
        setSelectedDate(clickedDate);
        setShowDayEventsDialog(true);
      }
    }
  }, [events]);

  // Get events for a specific date
  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    }).sort((a, b) => a.start.getTime() - b.start.getTime());
  };

  const handleExportToGoogleCalendar = (event: CalendarEvent) => {
    // Format dates for Google Calendar
    const formatDateForGoogle = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    };

    const therapist = mockTherapists.find(t => t.id === event.therapistId);
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDateForGoogle(event.start)}/${formatDateForGoogle(event.end)}`,
      details: event.description || `${event.type === 'session' ? 'Therapy session' : 'Workshop'} with ${therapist?.name}`,
      location: 'Online (Video Session)',
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  };

  const handleDownloadICS = (event: CalendarEvent) => {
    // Create ICS file for calendar import
    const therapist = mockTherapists.find(t => t.id === event.therapistId);
    const formatDateForICS = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TherapyConnect//Calendar//EN
BEGIN:VEVENT
UID:${event.id}@therapyconnect.com
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${formatDateForICS(event.start)}
DTEND:${formatDateForICS(event.end)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || `${event.type === 'session' ? 'Therapy session' : 'Workshop'} with ${therapist?.name}`}
LOCATION:Online (Video Session)
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Custom event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    const style: React.CSSProperties = {
      backgroundColor: event.type === 'session' ? '#3b82f6' : '#8b5cf6',
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: '0',
      display: 'block',
    };
    return { style };
  };

  // Custom toolbar component
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    const label = () => {
      const date = toolbar.date;
      if (toolbar.view === 'day') {
        return format(date, 'EEEE, MMMM d, yyyy');
      }
      return format(date, 'MMMM yyyy');
    };

    return (
      <div className="rbc-toolbar">
        <div className="rbc-toolbar-nav">
          <button onClick={goToBack} className="rbc-nav-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span className="rbc-toolbar-label">{label()}</span>
          <button onClick={goToNext} className="rbc-nav-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        <div className="rbc-toolbar-views">
          {toolbar.views.map((view: string) => (
            <button
              key={view}
              className={toolbar.view === view ? 'rbc-active' : ''}
              onClick={() => toolbar.onView(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Custom header for week/day views — stacks day name above date on mobile
  const MobileWeekHeader = ({ date }: { date: Date; label: string; localizer: any }) => {
    return (
      <div className="rbc-header-stacked">
        <span className="rbc-header-day">{format(date, 'EEE')}</span>
        <span className="rbc-header-date">{format(date, 'd')}</span>
      </div>
    );
  };

  // Custom month event component for mobile — shows pill for single-event days,
  // count badge for multi-event days. Clicking the badge opens the day events modal.
  const MobileMonthEvent = ({ event }: { event: CalendarEvent }) => {
    const eventDate = new Date(event.start);
    const dayEvents = events.filter(e => {
      const d = new Date(e.start);
      return (
        d.getFullYear() === eventDate.getFullYear() &&
        d.getMonth() === eventDate.getMonth() &&
        d.getDate() === eventDate.getDate()
      );
    });

    const count = dayEvents.length;

    if (count === 1) {
      // Single event — render a visible pill with title
      return (
        <div
          className="mobile-month-event-pill"
          style={{
            backgroundColor: event.type === 'session' ? '#3b82f6' : '#8b5cf6',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectEvent(event);
          }}
        >
          <span className="mobile-month-event-pill-title">{event.title}</span>
        </div>
      );
    }

    // Multiple events — only the first event (sorted by time) renders the badge
    const sorted = [...dayEvents].sort((a, b) => a.start.getTime() - b.start.getTime());
    if (sorted[0].id !== event.id) {
      // Not the first event of the day, render nothing (hidden via CSS too)
      return null;
    }

    // Render a count badge
    return (
      <div
        className="mobile-month-event-badge"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedDate(eventDate);
          setShowDayEventsDialog(true);
        }}
      >
        {count} events
      </div>
    );
  };

  const selectedEventTherapist = selectedEvent 
    ? mockTherapists.find(t => t.id === selectedEvent.therapistId)
    : null;

  // Get client info for selected event in therapist mode
  const selectedEventClient = selectedEvent && isTherapistMode
    ? (() => {
        const session = mockVideoSessions.find(s => s.id === selectedEvent.id);
        return session ? mockClients.find(c => c.id === session.clientId) : null;
      })()
    : null;

  // Handle highlighting a session when navigated from dashboard
  useEffect(() => {
    const state = location.state as { highlightSessionId?: string } | null;
    if (state?.highlightSessionId) {
      // Find the event to highlight
      const eventToHighlight = events.find(e => e.id === state.highlightSessionId);
      if (eventToHighlight) {
        setSelectedEvent(eventToHighlight);
        setShowEventDialog(true);
      }
      // Clear the state to avoid re-highlighting on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [events, location.state]);

  // Custom Agenda view — renders every event with its own date cell (no rowSpan grouping)
  const CustomAgendaView = useMemo(() => {
    const AgendaView = ({ date, events: allEvents, accessors, localizer: loc }: any) => {
      const end = addDays(date, 30);
      const rangeEvents = (allEvents as CalendarEvent[])
        .filter(event => {
          const eStart = accessors.start(event);
          const eEnd = accessors.end(event);
          return eStart <= end && eEnd >= startOfDay(date);
        })
        .sort((a, b) => +accessors.start(a) - +accessors.start(b));

      if (rangeEvents.length === 0) {
        return (
          <div className="rbc-agenda-view">
            <span className="rbc-agenda-empty">{loc.messages.noEventsInRange}</span>
          </div>
        );
      }

      const agendaTimeRange = isMobile
        ? (start: Date, end: Date) => `${format(start, 'H:mm')} - ${format(end, 'H:mm')}`
        : (start: Date, end: Date) => `${format(start, 'H:mm')} - ${format(end, 'H:mm')}`;

      return (
        <div className="rbc-agenda-view">
          <table className="rbc-agenda-table">
            <thead>
              <tr>
                <th className="rbc-header">{loc.messages.date}</th>
                <th className="rbc-header">{loc.messages.time}</th>
                <th className="rbc-header">{loc.messages.event}</th>
              </tr>
            </thead>
          </table>
          <div className="rbc-agenda-content">
            <table className="rbc-agenda-table">
              <tbody>
                {rangeEvents.map((event) => {
                  const start = accessors.start(event);
                  const eventEnd = accessors.end(event);
                  const { style } = eventStyleGetter(event);
                  return (
                    <tr key={event.id} style={style}>
                      <td className="rbc-agenda-date-cell">
                        {format(start, isMobile ? 'EEE MMM d' : 'EEE MMM d')}
                      </td>
                      <td className="rbc-agenda-time-cell">
                        {agendaTimeRange(start, eventEnd)}
                      </td>
                      <td
                        className="rbc-agenda-event-cell"
                        onClick={(e) => {
                          handleSelectEvent(event);
                        }}
                      >
                        {event.title}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    // Required static properties for react-big-calendar custom views
    AgendaView.range = (start: Date) => {
      const end = addDays(start, 30);
      return { start, end };
    };

    AgendaView.navigate = (date: Date, action: string) => {
      switch (action) {
        case 'PREV':
          return addDays(date, -30);
        case 'NEXT':
          return addDays(date, 30);
        default:
          return date;
      }
    };

    AgendaView.title = (start: Date) => {
      const end = addDays(start, 30);
      return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
    };

    return AgendaView;
  }, [isMobile, events, handleSelectEvent, eventStyleGetter]);
  
  return (
    <Layout
      userType={isTherapistMode ? "therapist" : "client"}
      userName={currentUser.name}
      userAvatar={currentUser.avatar}
    >
      <div className="h-full flex flex-col">
        <div className={`flex-1 container mx-auto overflow-auto ${isMobile ? 'px-0 py-0' : 'px-4 py-8'}`}>
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-0' : 'lg:grid-cols-3 gap-6 items-start'}`}>
            {/* Calendar */}
            <div className={`flex flex-col min-h-[500px] ${isMobile ? '' : 'lg:col-span-2 lg:min-h-0 border rounded-xl bg-card shadow-sm'}`}>
              {!isMobile && (
                <div className="p-6 pb-3">
                  <h3 className="flex items-center gap-2 text-xl font-semibold">
                    <CalendarIcon className="w-5 h-5" />
                    Schedule
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your upcoming therapy sessions and workshops
                  </p>
                </div>
              )}
              <div className={`flex-1 ${isMobile ? 'overflow-hidden p-0' : 'p-6 pt-0'}`}>
                <div ref={calendarContainerRef} className={`calendar-container h-full min-h-[400px] ${isMobile ? 'is-mobile' : ''}`}>
                  <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    date={calendarDate}
                    onNavigate={(newDate) => setCalendarDate(newDate)}
                    view={view}
                    onView={(newView) => setView(newView)}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    selectable
                    eventPropGetter={eventStyleGetter}
                    popup
                    scrollToTime={scrollToTime}
                    style={{ height: '100%' }}
                    views={{
                      month: true,
                      week: true,
                      day: true,
                      agenda: CustomAgendaView as any,
                    }}
                    formats={isMobile ? {
                      timeGutterFormat: 'H',
                      agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
                        `${format(start, 'H:mm')} - ${format(end, 'H:mm')}`,
                    } : {
                      agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
                        `${format(start, 'H:mm')} - ${format(end, 'H:mm')}`,
                    }}
                    components={{
                      toolbar: CustomToolbar,
                      ...(isMobile ? {
                        week: { header: MobileWeekHeader },
                        day: { header: MobileWeekHeader },
                        month: { event: MobileMonthEvent },
                      } : {}),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Upcoming Events List */}
            <div className={`space-y-4 ${isMobile ? 'px-4 pt-4' : 'lg:overflow-y-auto lg:max-h-[calc(100vh-12rem)]'}`}>
              {isTherapistMode && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Availability Settings</CardTitle>
                    <CardDescription className="text-sm">
                      Manage your session availability
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AvailabilityCalendar sessionRates={mockCurrentTherapist.sessionRates || []} />
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>
                    Next {events.filter(e => e.start > new Date()).length} events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {events
                    .filter(event => event.start > new Date())
                    .sort((a, b) => a.start.getTime() - b.start.getTime())
                    .slice(0, 5)
                    .map(event => {
                      // Get client info for therapist mode
                      const session = mockVideoSessions.find(s => s.id === event.id);
                      const client = session ? mockClients.find(c => c.id === session.clientId) : null;
                      const clientFirstName = client?.name.split(' ')[0];
                      
                      return (
                        <div
                          key={event.id}
                          className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => handleSelectEvent(event)}
                        >
                          <div className="flex items-start gap-2">
                            {event.type === 'session' ? (
                              <Video className="w-4 h-4 mt-1 text-blue-500" />
                            ) : (
                              <Users className="w-4 h-4 mt-1 text-purple-500" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{event.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(event.start, 'MMM d, h:mm a')}
                              </p>
                              {isTherapistMode && event.type === 'session' && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {clientFirstName || 'Client'}
                                </p>
                              )}
                            </div>
                            <Badge variant={event.type === 'session' ? 'default' : 'secondary'}>
                              {event.type}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  {events.filter(e => e.start > new Date()).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No upcoming events scheduled
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Calendar Integration</CardTitle>
                  <CardDescription>
                    Sync with your favorite calendar apps
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    Export individual events to Google Calendar, Outlook, Apple Calendar, or any calendar app that supports .ics files.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <ExternalLink className="w-4 h-4" />
                      <span>Click on any event to export</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Download className="w-4 h-4" />
                      <span>Download .ics file for offline import</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              {selectedEvent && format(selectedEvent.start, 'EEEE, MMMM d, yyyy • h:mm a')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              {/* Show client for therapist mode, therapist for client mode */}
              {isTherapistMode && selectedEventClient ? (
                <div className="flex items-center gap-3">
                  <img
                    src={selectedEventClient.avatar}
                    alt={selectedEventClient.name}
                    className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => navigate(`/t/clients/${selectedEventClient.id}`)}
                  />
                  <div>
                    <p className="font-semibold">{selectedEventClient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Client
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <img
                    src={selectedEventTherapist?.avatar}
                    alt={selectedEventTherapist?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{selectedEventTherapist?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedEventTherapist?.credentials}
                    </p>
                  </div>
                </div>
              )}

              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant={selectedEvent.type === 'session' ? 'default' : 'secondary'}>
                    {selectedEvent.type === 'session' ? 'Therapy Session' : 'Workshop'}
                  </Badge>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">
                    {Math.round((selectedEvent.end.getTime() - selectedEvent.start.getTime()) / 60000)} minutes
                  </span>
                </div>

                {selectedEvent.price && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">£{selectedEvent.price}</span>
                  </div>
                )}

                {selectedEvent.type === 'workshop' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Participants:</span>
                    <span className="font-medium">
                      {selectedEvent.currentParticipants}/{selectedEvent.maxParticipants}
                    </span>
                  </div>
                )}

                {selectedEvent.isPaid !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <Badge variant={selectedEvent.isPaid ? 'default' : 'secondary'}>
                      {selectedEvent.isPaid ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </div>
                )}

                {selectedEvent.isRegistered !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Registration:</span>
                    <Badge variant={selectedEvent.isRegistered ? 'default' : 'outline'}>
                      {selectedEvent.isRegistered ? 'Registered' : 'Not Registered'}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <h4 className="font-medium text-sm mb-2">Export to Calendar</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportToGoogleCalendar(selectedEvent)}
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Google Calendar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadICS(selectedEvent)}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download .ics
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Export to Google Calendar, Outlook, Apple Calendar, or any app that supports .ics files.
                </p>
              </div>

              {selectedEvent.type === 'session' && (() => {
                const now = new Date();
                const timeUntilSession = selectedEvent.start.getTime() - now.getTime();
                const duration = Math.round((selectedEvent.end.getTime() - selectedEvent.start.getTime()) / 60000);
                
                // Session is joinable within 10 minutes before start time
                const isJoinable = timeUntilSession <= 10 * 60 * 1000 && timeUntilSession > -duration * 60 * 1000;
                
                // Format time until session in days, hours, minutes
                const formatTimeUntil = (ms: number) => {
                  const totalMinutes = Math.floor(ms / (60 * 1000));
                  const days = Math.floor(totalMinutes / (24 * 60));
                  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
                  const minutes = totalMinutes % 60;
                  
                  const parts = [];
                  if (days > 0) parts.push(`${days}d`);
                  if (hours > 0) parts.push(`${hours}h`);
                  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
                  
                  return parts.join(' ');
                };
                
                // Format time for soon sessions (within 10 minutes or already started)
                const formatSoonTime = (ms: number) => {
                  const minutes = Math.floor(Math.abs(ms) / (60 * 1000));
                  if (ms > 0) {
                    return `Starts in ${minutes}m`;
                  } else {
                    return `Started ${minutes}m ago`;
                  }
                };

                return isJoinable ? (
                  <div className="space-y-2">
                    <div className="text-sm text-center text-muted-foreground">
                      {timeUntilSession > 0 ? formatSoonTime(timeUntilSession) : formatSoonTime(timeUntilSession)}
                    </div>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => navigate(`/video-session/${selectedEvent.id}`)}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join Session Now
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full"
                    variant="outline"
                    disabled
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    {timeUntilSession > 0 ? `Available in ${formatTimeUntil(timeUntilSession)}` : 'Session Not Available'}
                  </Button>
                );
              })()}

              {selectedEvent.type === 'workshop' && !selectedEvent.isRegistered && (
                <Button className="w-full">
                  Register for Workshop
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Day Events Dialog */}
      <Dialog open={showDayEventsDialog} onOpenChange={setShowDayEventsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Events on {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Selected Date'}</DialogTitle>
            <DialogDescription>
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date to view events'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDate && (
            <div className="space-y-4">
              {getEventsForDate(selectedDate).map(event => {
                // Get client info for therapist mode
                const session = mockVideoSessions.find(s => s.id === event.id);
                const client = session ? mockClients.find(c => c.id === session.clientId) : null;
                const clientFirstName = client?.name.split(' ')[0];
                
                return (
                  <div
                    key={event.id}
                    className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleSelectEvent(event)}
                  >
                    <div className="flex items-start gap-2">
                      {event.type === 'session' ? (
                        <Video className="w-4 h-4 mt-1 text-blue-500" />
                      ) : (
                        <Users className="w-4 h-4 mt-1 text-purple-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(event.start, 'MMM d, h:mm a')}
                        </p>
                        {isTherapistMode && event.type === 'session' && (
                          <p className="text-xs text-muted-foreground truncate">
                            {clientFirstName || 'Client'}
                          </p>
                        )}
                      </div>
                      <Badge variant={event.type === 'session' ? 'default' : 'secondary'}>
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {getEventsForDate(selectedDate).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No events scheduled for this date
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}