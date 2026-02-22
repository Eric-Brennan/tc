import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { 
  mockAssessments, 
  mockClients,
  mockTherapists,
  mockConnections,
  mockVideoSessions,
  mockMessages,
  getPHQ9Severity,
  getGAD7Severity,
  VideoSession,
  Message,
} from '../data/mockData';
import { format } from 'date-fns';
import { TrendingDown, TrendingUp, Minus, AlertCircle, FileText, ChevronRight, Clock, Video, MapPin, Phone, MessageSquare, Send, CheckCircle2, Loader2, CalendarCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router';
import { useIsMobileView } from '../hooks/useIsMobileView';
import { toast } from 'sonner';
import { persistMockData } from "../data/devPersistence";

type ReminderStatus = 'idle' | 'sending' | 'sent' | 'replied-complete' | 'replied-in-session';

function getNextSession(clientId: string, therapistId: string): VideoSession | null {
  const now = new Date();
  const upcoming = mockVideoSessions
    .filter(s => s.clientId === clientId && s.therapistId === therapistId && s.status === 'scheduled' && s.scheduledTime > now)
    .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  return upcoming[0] || null;
}

function formatCountdown(targetDate: Date, now: Date): string {
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return 'Now';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}

const modalityIcon: Record<string, React.ReactNode> = {
  video: <Video className="h-3 w-3" />,
  inPerson: <MapPin className="h-3 w-3" />,
  phoneCall: <Phone className="h-3 w-3" />,
  text: <MessageSquare className="h-3 w-3" />,
};

const modalityLabel: Record<string, string> = {
  video: 'Video',
  inPerson: 'In Person',
  phoneCall: 'Phone',
  text: 'Text',
};

export function TherapistAssessments() {
  const navigate = useNavigate();
  const isMobile = useIsMobileView();
  const therapistId = 't1';
  const currentTherapist = mockTherapists.find(t => t.id === therapistId)!;
  const [now, setNow] = useState(new Date());
  const [reminderStatuses, setReminderStatuses] = useState<Record<string, ReminderStatus>>({});

  // Update "now" every minute for live countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Get connected clients via connections
  const connectedClientIds = mockConnections
    .filter(c => c.therapistId === therapistId && c.status === 'accepted')
    .map(c => c.clientId);

  const therapistClients = mockClients.filter(c => connectedClientIds.includes(c.id));

  // Build per-client data
  const clientData = therapistClients.map(client => {
    const assessments = mockAssessments
      .filter(a => a.clientId === client.id && a.therapistId === therapistId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    const latest = assessments[0] || null;
    const previous = assessments[1] || null;
    const totalCount = assessments.length;

    let isOverdue = false;
    if (!latest) {
      isOverdue = true;
    } else {
      const daysSince = Math.floor(
        (now.getTime() - latest.date.getTime()) / (1000 * 60 * 60 * 24)
      );
      isOverdue = daysSince >= 14;
    }

    const nextSession = getNextSession(client.id, therapistId);

    return { client, latest, previous, totalCount, isOverdue, nextSession };
  });

  // Sort by next session time (soonest first), clients without sessions go last
  const sortedClientData = [...clientData].sort((a, b) => {
    const aTime = a.nextSession?.scheduledTime.getTime() ?? Infinity;
    const bTime = b.nextSession?.scheduledTime.getTime() ?? Infinity;
    return aTime - bTime;
  });

  const overdueClients = clientData.filter(c => c.isOverdue);

  const getTrendIcon = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    if (current < previous) return <TrendingDown className="h-3.5 w-3.5 text-green-600" />;
    if (current > previous) return <TrendingUp className="h-3.5 w-3.5 text-red-600" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Minimal': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
      case 'Mild': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300';
      case 'Moderate': return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300';
      case 'Moderately Severe': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      case 'Severe': return 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const sendReminder = useCallback((clientId: string) => {
    const client = mockClients.find(c => c.id === clientId);
    if (!client) return;

    // Mark as sending
    setReminderStatuses(prev => ({ ...prev, [clientId]: 'sending' }));

    // Simulate brief sending delay
    setTimeout(() => {
      // Push therapist's reminder message
      const reminderMsg: Message = {
        id: `m-reminder-${Date.now()}-${clientId}`,
        senderId: therapistId,
        receiverId: clientId,
        content: `Hi ${client.name.split(' ')[0]}, it's time for your fortnightly wellbeing check-in (PHQ-9 & GAD-7). You can complete it at your convenience, or we can do it together in our next session — whichever you prefer!`,
        timestamp: new Date(),
        read: false,
      };
      mockMessages.push(reminderMsg);
      persistMockData(); // DEV-ONLY

      setReminderStatuses(prev => ({ ...prev, [clientId]: 'sent' }));
      toast.success(`Reminder sent to ${client.name.split(' ')[0]}`);

      // Simulate client reply after 2–3 seconds
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

        const newStatus: ReminderStatus = willCompleteNow ? 'replied-complete' : 'replied-in-session';
        setReminderStatuses(prev => ({ ...prev, [clientId]: newStatus }));

        toast(
          willCompleteNow
            ? `${client.name.split(' ')[0]} will complete their assessment now`
            : `${client.name.split(' ')[0]} prefers to complete it in session`,
          {
            icon: willCompleteNow ? '✅' : '📅',
            description: willCompleteNow
              ? 'They said they\'ll fill it out right away'
              : 'Plan to administer during your next session',
          }
        );
      }, replyDelay);
    }, 600);
  }, [therapistId]);

  const getReminderButtonContent = (clientId: string) => {
    const status = reminderStatuses[clientId] || 'idle';
    switch (status) {
      case 'sending':
        return { icon: <Loader2 className="h-3 w-3 animate-spin" />, label: 'Sending...', disabled: true, variant: 'outline' as const };
      case 'sent':
        return { icon: <Send className="h-3 w-3" />, label: 'Sent', disabled: true, variant: 'outline' as const };
      case 'replied-complete':
        return { icon: <CheckCircle2 className="h-3 w-3 text-green-600" />, label: 'Completing now', disabled: true, variant: 'outline' as const };
      case 'replied-in-session':
        return { icon: <CalendarCheck className="h-3 w-3 text-blue-600" />, label: 'In session', disabled: true, variant: 'outline' as const };
      default:
        return { icon: <Send className="h-3 w-3" />, label: 'Send Reminder', disabled: false, variant: 'outline' as const };
    }
  };

  return (
    <Layout userType="therapist" userName={currentTherapist.name} userAvatar={currentTherapist.avatar}>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Client Assessments</h1>
          <p className="text-muted-foreground mt-1">
            Review PHQ-9 and GAD-7 assessments from your clients
          </p>
        </div>

        {/* Overdue alert */}
        {overdueClients.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Clients Due for Assessment</AlertTitle>
            <AlertDescription>
              The following clients are due for their fortnightly assessment:
              <div className="mt-2 space-y-2">
                {overdueClients.map(({ client }) => {
                  const btn = getReminderButtonContent(client.id);
                  const status = reminderStatuses[client.id] || 'idle';
                  return (
                    <div key={client.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={client.avatar} alt={client.name} className="w-5 h-5 rounded-full shrink-0" />
                        <span className="font-medium truncate">{client.name}</span>
                        {status === 'replied-complete' && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 shrink-0">
                            Completing
                          </Badge>
                        )}
                        {status === 'replied-in-session' && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                            In session
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant={btn.variant}
                        size="sm"
                        disabled={btn.disabled}
                        className="gap-1.5 text-xs h-7 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          sendReminder(client.id);
                        }}
                      >
                        {btn.icon}
                        {btn.label}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Client cards */}
        {sortedClientData.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No connected clients</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {sortedClientData.map(({ client, latest, previous, totalCount, isOverdue, nextSession }) => (
              <Card
                key={client.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  isOverdue ? 'border-orange-300 dark:border-orange-700' : ''
                }`}
                onClick={() => navigate(`/t/assessments/${client.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <img
                      src={client.avatar}
                      alt={client.name}
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">{client.name}</p>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>

                      {/* Next session timer */}
                      {nextSession ? (
                        <div className="flex items-center gap-1.5 mb-2 text-xs">
                          <span className="text-muted-foreground flex items-center gap-1">
                            {modalityIcon[nextSession.modality || 'video']}
                            {modalityLabel[nextSession.modality || 'video']}
                          </span>
                          <span className="text-muted-foreground">&middot;</span>
                          <span className="text-muted-foreground">
                            {format(nextSession.scheduledTime, 'MMM d, h:mm a')}
                          </span>
                          <span className="text-muted-foreground">&middot;</span>
                          <span className="font-medium text-primary">
                            {formatCountdown(nextSession.scheduledTime, now)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>No upcoming session</span>
                        </div>
                      )}

                      {latest ? (
                        <>
                          {/* Scores row */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">PHQ-9</span>
                              <span className="font-bold">{latest.phq9Score}</span>
                              <span className="text-xs text-muted-foreground">/27</span>
                              {previous && getTrendIcon(latest.phq9Score, previous.phq9Score)}
                            </div>
                            <div className="w-px h-4 bg-border" />
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">GAD-7</span>
                              <span className="font-bold">{latest.gad7Score}</span>
                              <span className="text-xs text-muted-foreground">/21</span>
                              {previous && getTrendIcon(latest.gad7Score, previous.gad7Score)}
                            </div>
                          </div>

                          {/* Severity badges & meta */}
                          <div className="flex items-center flex-wrap gap-1.5">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getSeverityColor(getPHQ9Severity(latest.phq9Score))}`}>
                              {getPHQ9Severity(latest.phq9Score)}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getSeverityColor(getGAD7Severity(latest.gad7Score))}`}>
                              {getGAD7Severity(latest.gad7Score)}
                            </Badge>
                            {isOverdue && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                                Overdue
                              </Badge>
                            )}
                          </div>

                          {/* Date & count */}
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Last: {format(latest.date, 'MMM d, yyyy')}</span>
                            <span>&middot;</span>
                            <span>{totalCount} total</span>
                          </div>

                          {/* Reminder button for overdue clients */}
                          {isOverdue && (() => {
                            const btn = getReminderButtonContent(client.id);
                            const status = reminderStatuses[client.id] || 'idle';
                            return (
                              <div className="mt-2.5 flex items-center gap-2">
                                <Button
                                  variant={btn.variant}
                                  size="sm"
                                  disabled={btn.disabled}
                                  className="gap-1.5 text-xs h-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    sendReminder(client.id);
                                  }}
                                >
                                  {btn.icon}
                                  {btn.label}
                                </Button>
                                {status === 'replied-complete' && (
                                  <span className="text-[11px] text-green-700 dark:text-green-400">Will complete now</span>
                                )}
                                {status === 'replied-in-session' && (
                                  <span className="text-[11px] text-blue-700 dark:text-blue-400">Prefers in session</span>
                                )}
                              </div>
                            );
                          })()}
                        </>
                      ) : (
                        <div className="mt-1">
                          <p className="text-sm text-muted-foreground">No assessments yet</p>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-1.5 bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                            Overdue
                          </Badge>
                          {/* Reminder button for clients with no assessments */}
                          {(() => {
                            const btn = getReminderButtonContent(client.id);
                            const status = reminderStatuses[client.id] || 'idle';
                            return (
                              <div className="mt-2.5 flex items-center gap-2">
                                <Button
                                  variant={btn.variant}
                                  size="sm"
                                  disabled={btn.disabled}
                                  className="gap-1.5 text-xs h-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    sendReminder(client.id);
                                  }}
                                >
                                  {btn.icon}
                                  {btn.label}
                                </Button>
                                {status === 'replied-complete' && (
                                  <span className="text-[11px] text-green-700 dark:text-green-400">Will complete now</span>
                                )}
                                {status === 'replied-in-session' && (
                                  <span className="text-[11px] text-blue-700 dark:text-blue-400">Prefers in session</span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}