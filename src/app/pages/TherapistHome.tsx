import { useState } from "react";
import { 
  mockConnections, 
  mockClients, 
  mockCurrentTherapist, 
  mockVideoSessions,
  mockMessages,
  mockJournalEntries
} from "../data/mockData";
import Layout from "../components/Layout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  MessageSquare, 
  Calendar as CalendarIcon,
  Video,
  Clock,
  BookOpen,
  Brain,
  Battery,
  UserPlus,
  X
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { format } from "date-fns";
import { useIsMobileView } from "../hooks/useIsMobileView";
import { toast } from "sonner";
import { persistMockData } from "../data/devPersistence";

export default function TherapistHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobileView();

  const acceptedConnections = mockConnections.filter(c => c.status === 'accepted' && c.therapistId === mockCurrentTherapist.id);

  // Pending connection requests for this therapist
  const [pendingConnections, setPendingConnections] = useState(
    () => mockConnections.filter(c => c.status === 'pending' && c.therapistId === mockCurrentTherapist.id)
  );

  // Get upcoming sessions for next 7 days
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const next48Hours = new Date(today.getTime() + 48 * 60 * 60 * 1000);
  
  const upcomingSessions = mockVideoSessions
    .filter(s => 
      s.therapistId === mockCurrentTherapist.id &&
      s.status === 'scheduled' && 
      s.scheduledTime > today &&
      s.scheduledTime < nextWeek
    )
    .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());

  // On mobile, only show sessions within the next 48 hours
  const displayedSessions = isMobile
    ? upcomingSessions.filter(s => s.scheduledTime < next48Hours)
    : upcomingSessions;

  // Get unread messages from clients
  const unreadMessages = mockMessages.filter(
    m => m.receiverId === mockCurrentTherapist.id && !m.read
  );

  // Group unread messages by sender
  const unreadBySender = unreadMessages.reduce((acc, message) => {
    const senderId = message.senderId;
    if (!acc[senderId]) {
      acc[senderId] = [];
    }
    acc[senderId].push(message);
    return acc;
  }, {} as Record<string, typeof unreadMessages>);

  // Get recent journal entries (last 7 days) from connected clients
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const connectedClientIds = acceptedConnections.map(c => c.clientId);
  
  const recentJournalEntries = mockJournalEntries
    .filter(entry => 
      connectedClientIds.includes(entry.clientId) && 
      entry.sharedWithTherapistIds.includes(mockCurrentTherapist.id) && 
      entry.date >= sevenDaysAgo
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // Group journal entries by client to get count per client
  const journalEntriesByClient = recentJournalEntries.reduce((acc, entry) => {
    if (!acc[entry.clientId]) {
      acc[entry.clientId] = [];
    }
    acc[entry.clientId].push(entry);
    return acc;
  }, {} as Record<string, typeof recentJournalEntries>);

  const getRatingColor = (rating: number) => {
    return 'text-foreground';
  };

  const formatSessionTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getClientById = (clientId: string) => {
    return mockClients.find(c => c.id === clientId);
  };

  const handleRejectConnection = (connectionId: string) => {
    // In a real app, this would call the API
    const conn = mockConnections.find(c => c.id === connectionId);
    if (conn) {
      conn.status = 'rejected';
    }
    persistMockData(); // DEV-ONLY
    setPendingConnections(prev => prev.filter(c => c.id !== connectionId));
    toast.error('Connection rejected');
  };

  return (
    <Layout
      userType="therapist"
      userName={mockCurrentTherapist.name}
      userAvatar={mockCurrentTherapist.avatar}
    >
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="container mx-auto px-4 pt-4 md:pt-8 pb-4 flex-shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Dr. Johnson</h1>
          <p className="text-sm md:text-base text-muted-foreground">Here's your schedule for today</p>
        </div>

        <div className={`flex-1 container mx-auto px-4 pb-4 ${isMobile ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 ${isMobile ? '' : 'h-full'}`}>
            {/* Left Column - Quick Stats & Upcoming Sessions */}
            <div className={`lg:col-span-2 flex flex-col ${isMobile ? '' : 'h-full overflow-hidden'}`}>
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 md:gap-3 flex-shrink-0 mb-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/t/calendar')}>
                  <CardContent className="p-3 md:p-4">
                    {isMobile ? (
                      <div className="flex flex-col h-full">
                        <p className="text-xs text-muted-foreground mb-auto">Today's Sessions</p>
                        <div className="flex items-end justify-between">
                          <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                          <p className="text-xl font-bold">
                            {upcomingSessions.filter(s => {
                              const sessionDate = new Date(s.scheduledTime);
                              return sessionDate.toDateString() === today.toDateString();
                            }).length}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Today's Sessions</p>
                          <p className="text-2xl font-bold">
                            {upcomingSessions.filter(s => {
                              const sessionDate = new Date(s.scheduledTime);
                              return sessionDate.toDateString() === today.toDateString();
                            }).length}
                          </p>
                        </div>
                        <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/t/messages')}>
                  <CardContent className="p-3 md:p-4">
                    {isMobile ? (
                      <div className="flex flex-col h-full">
                        <p className="text-xs text-muted-foreground mb-auto">Unread Messages</p>
                        <div className="flex items-end justify-between">
                          <MessageSquare className="w-5 h-5 text-muted-foreground" />
                          <p className="text-xl font-bold">{unreadMessages.length}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Unread Messages</p>
                          <p className="text-2xl font-bold">{unreadMessages.length}</p>
                        </div>
                        <MessageSquare className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/t/journals')}>
                  <CardContent className="p-3 md:p-4">
                    {isMobile ? (
                      <div className="flex flex-col h-full">
                        <p className="text-xs text-muted-foreground mb-auto">New Journals</p>
                        <div className="flex items-end justify-between">
                          <BookOpen className="w-5 h-5 text-muted-foreground" />
                          <p className="text-xl font-bold">{recentJournalEntries.length}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">New Journals</p>
                          <p className="text-2xl font-bold">{recentJournalEntries.length}</p>
                        </div>
                        <BookOpen className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Sessions */}
              <div className={`flex flex-col ${isMobile ? '' : 'flex-1 overflow-hidden'}`}>
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/t/calendar')}
                    className="gap-2"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    Calendar
                  </Button>
                </div>

                <div className={isMobile ? '' : 'flex-1 overflow-y-auto pr-2'}>
                  {displayedSessions.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {isMobile ? 'No sessions in the next 48 hours' : 'No upcoming sessions this week'}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {displayedSessions.map(session => {
                        const client = getClientById(session.clientId);
                        if (!client) return null;
                        
                        const now = new Date();
                        const isToday = new Date(session.scheduledTime).toDateString() === today.toDateString();
                        const timeUntilSession = session.scheduledTime.getTime() - now.getTime();
                        const minutesUntilSession = Math.floor(timeUntilSession / (60 * 1000));
                        
                        // Session is joinable within 10 minutes before start time
                        const isJoinable = timeUntilSession <= 10 * 60 * 1000 && timeUntilSession > -session.duration * 60 * 1000;
                        
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
                        
                        return (
                          <Card 
                            key={session.id} 
                            className={`cursor-pointer hover:shadow-md transition-shadow ${isToday ? "border-primary" : ""}`}
                            onClick={() => navigate('/t/calendar', { state: { highlightSessionId: session.id } })}
                          >
                            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="relative">
                                  <img
                                    src={client.avatar}
                                    alt={client.name}
                                    className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/t/clients/${client.id}`);
                                    }}
                                  />
                                  {journalEntriesByClient[client.id] && journalEntriesByClient[client.id].length > 0 && (
                                    <span 
                                      className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                      title={`${journalEntriesByClient[client.id].length} new journal ${journalEntriesByClient[client.id].length === 1 ? 'entry' : 'entries'}`}
                                    >
                                      <BookOpen className="w-3 h-3" />
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <p className="font-medium">{client.name}</p>
                                    {isToday && (
                                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                        Today
                                      </span>
                                    )}
                                    {isJoinable && (
                                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                        Ready to Join
                                      </span>
                                    )}
                                    {!isJoinable && minutesUntilSession <= 60 && minutesUntilSession > 10 && (
                                      <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                                        {formatSoonTime(timeUntilSession)}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {formatSessionTime(session.scheduledTime)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {session.duration} minutes
                                  </p>
                                </div>
                              </div>
                              {isJoinable ? (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/t/video-session/${session.id}`);
                                  }}
                                  className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto shrink-0"
                                >
                                  <Video className="w-4 h-4" />
                                  Join Session
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  className="gap-2 w-full sm:w-auto shrink-0"
                                  disabled
                                >
                                  <Clock className="w-4 h-4" />
                                  {minutesUntilSession > 0 ? `In ${formatTimeUntil(timeUntilSession)}` : 'Scheduled'}
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Client Updates - Messages Only */}
            <div className="flex flex-col overflow-hidden">
              <div className="flex flex-col h-full overflow-hidden">
                {/* Pending Connection Requests */}
                {pendingConnections.length > 0 && (
                  <div className="flex-shrink-0 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-semibold">Connection Requests</h3>
                      <Badge variant="secondary" className="text-xs">
                        {pendingConnections.length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {pendingConnections.map(conn => {
                        const client = getClientById(conn.clientId);
                        if (!client) return null;
                        return (
                          <Card key={conn.id} className="border-amber-200 bg-amber-50/50">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <img
                                  src={client.avatar}
                                  alt={client.name}
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm">{client.name}</p>
                                  {client.areasOfFocus && client.areasOfFocus.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {client.areasOfFocus.slice(0, 3).map(area => (
                                        <Badge key={area} variant="outline" className="text-[10px] px-1.5 py-0">
                                          {area}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  {conn.message && (
                                    <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-2">
                                      "{conn.message}"
                                    </p>
                                  )}
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="gap-1 flex-1 h-7 text-xs"
                                      onClick={() => navigate(`/t/messages/${conn.clientId}`)}
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                      Message
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="gap-1 h-7 text-xs text-destructive hover:text-destructive"
                                      onClick={() => handleRejectConnection(conn.id)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between flex-shrink-0 mb-3">
                  <h3 className="font-semibold">Unread Messages</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/t/messages')}
                  >
                    View All
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                  {Object.keys(unreadBySender).length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No unread messages</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(unreadBySender).map(([senderId, messages]) => {
                        const client = getClientById(senderId);
                        if (!client) return null;
                        
                        const latestMessage = messages[messages.length - 1];
                        
                        return (
                          <Card 
                            key={senderId}
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => navigate(`/t/messages/${senderId}`)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="relative">
                                  <img
                                    src={client.avatar}
                                    alt={client.name}
                                    className="w-12 h-12 rounded-full object-cover hover:ring-2 hover:ring-primary transition-all"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/t/clients/${client.id}`);
                                    }}
                                  />
                                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                    {messages.length}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium truncate">{client.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatTime(latestMessage.timestamp)}
                                    </p>
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {latestMessage.content}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}