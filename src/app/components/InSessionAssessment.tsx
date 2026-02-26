import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { X, CheckCircle2, ClipboardList, StickyNote, Send, Clock, MessageCircle, Link2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import {
  AssessmentFrequency,
  PHQ9Response,
  GAD7Response,
  calculatePHQ9Score,
  calculateGAD7Score,
  getPHQ9Severity,
  getGAD7Severity,
  mockSessionNotes,
  mockMessages,
  SessionNote,
  Message,
} from '../data/mockData';
import { persistMockData } from "../data/devPersistence";

const PHQ9_QUESTIONS: { key: keyof Omit<PHQ9Response, 'functionalImpairment'>; label: string }[] = [
  { key: 'littleInterest', label: 'Little interest or pleasure in doing things' },
  { key: 'feelingDown', label: 'Feeling down, depressed, or hopeless' },
  { key: 'sleepProblems', label: 'Trouble falling/staying asleep, or sleeping too much' },
  { key: 'feelingTired', label: 'Feeling tired or having little energy' },
  { key: 'appetiteProblems', label: 'Poor appetite or overeating' },
  { key: 'feelingBad', label: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down' },
  { key: 'troubleConcentrating', label: 'Trouble concentrating on things, such as reading or watching TV' },
  { key: 'movingSpeaking', label: 'Moving or speaking so slowly that other people could have noticed? Or being fidgety or restless' },
  { key: 'selfHarmThoughts', label: 'Thoughts that you would be better off dead, or of hurting yourself in some way' },
];

const GAD7_QUESTIONS: { key: keyof Omit<GAD7Response, 'functionalImpairment'>; label: string }[] = [
  { key: 'feelingNervous', label: 'Feeling nervous, anxious, or on edge' },
  { key: 'cantStopWorrying', label: 'Not being able to stop or control worrying' },
  { key: 'worryingTooMuch', label: 'Worrying too much about different things' },
  { key: 'troubleRelaxing', label: 'Trouble relaxing' },
  { key: 'beingRestless', label: 'Being so restless that it\'s hard to sit still' },
  { key: 'easilyAnnoyed', label: 'Becoming easily annoyed or irritable' },
  { key: 'feelingAfraid', label: 'Feeling afraid, as if something awful might happen' },
];

const FREQUENCY_OPTIONS: { value: AssessmentFrequency; label: string; short: string }[] = [
  { value: 0, label: 'Not at all', short: '0' },
  { value: 1, label: 'Several days', short: '1' },
  { value: 2, label: 'More than half the days', short: '2' },
  { value: 3, label: 'Nearly every day', short: '3' },
];

// Simple URL detection for rendering links
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function MessageContent({ content }: { content: string }) {
  const parts = content.split(URL_REGEX);
  return (
    <p className="break-words text-[13px]">
      {parts.map((part, i) =>
        URL_REGEX.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 break-all hover:opacity-80"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

interface InSessionAssessmentProps {
  open: boolean;
  onClose: () => void;
  clientName: string;
  clientId: string;
  /** Use absolute instead of fixed positioning (for mobile video session) */
  useAbsolutePosition?: boolean;
}

export function InSessionAssessment({ open, onClose, clientName, clientId, useAbsolutePosition }: InSessionAssessmentProps) {
  const [topTab, setTopTab] = useState<'assessments' | 'notes' | 'chat'>('assessments');
  const [assessmentTab, setAssessmentTab] = useState<'phq9' | 'gad7'>('phq9');
  const [phq9Submitted, setPhq9Submitted] = useState(false);
  const [gad7Submitted, setGad7Submitted] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<SessionNote[]>(() =>
    mockSessionNotes
      .filter(n => n.clientId === clientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  );
  const [newNote, setNewNote] = useState('');
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Data policy notice state
  const [showDataPolicy, setShowDataPolicy] = useState(false);

  // Chat state — therapist is always t1
  const therapistId = 't1';
  const [chatMessages, setChatMessages] = useState<Message[]>(() =>
    mockMessages
      .filter(
        m =>
          (m.senderId === clientId && m.receiverId === therapistId) ||
          (m.senderId === therapistId && m.receiverId === clientId)
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  );
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const [phq9, setPhq9] = useState<PHQ9Response>({
    littleInterest: 0,
    feelingDown: 0,
    sleepProblems: 0,
    feelingTired: 0,
    appetiteProblems: 0,
    feelingBad: 0,
    troubleConcentrating: 0,
    movingSpeaking: 0,
    selfHarmThoughts: 0,
  });

  const [gad7, setGad7] = useState<GAD7Response>({
    feelingNervous: 0,
    cantStopWorrying: 0,
    worryingTooMuch: 0,
    troubleRelaxing: 0,
    beingRestless: 0,
    easilyAnnoyed: 0,
    feelingAfraid: 0,
  });

  const phq9Score = useMemo(() => calculatePHQ9Score(phq9), [phq9]);
  const gad7Score = useMemo(() => calculateGAD7Score(gad7), [gad7]);
  const phq9Severity = getPHQ9Severity(phq9Score);
  const gad7Severity = getGAD7Severity(gad7Score);

  // Auto-resize note textarea
  useEffect(() => {
    if (noteTextareaRef.current) {
      noteTextareaRef.current.style.height = 'auto';
      noteTextareaRef.current.style.height = Math.min(noteTextareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [newNote]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Clear unread when switching to chat tab
  useEffect(() => {
    if (topTab === 'chat') {
      setUnreadChatCount(0);
    }
  }, [topTab]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Minimal': return 'bg-green-100 text-green-800';
      case 'Mild': return 'bg-yellow-100 text-yellow-800';
      case 'Moderate': return 'bg-orange-100 text-orange-800';
      case 'Moderately Severe': return 'bg-red-100 text-red-800';
      case 'Severe': return 'bg-red-200 text-red-900';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleSubmitPHQ9 = () => {
    setPhq9Submitted(true);
    toast.success(`PHQ-9 recorded for ${clientName}: ${phq9Score}/27 (${phq9Severity})`);
    if (!gad7Submitted) {
      setAssessmentTab('gad7');
    }
  };

  const handleSubmitGAD7 = () => {
    setGad7Submitted(true);
    toast.success(`GAD-7 recorded for ${clientName}: ${gad7Score}/21 (${gad7Severity})`);
    if (!phq9Submitted) {
      setAssessmentTab('phq9');
    }
  };

  const handleSubmitBoth = () => {
    toast.success(`Assessment complete for ${clientName}`);
    onClose();
  };

  // === Notes handlers ===
  const handleAddNote = () => {
    const trimmed = newNote.trim();
    if (!trimmed) return;

    const note: SessionNote = {
      id: `sn-${Date.now()}`,
      clientId,
      therapistId,
      content: trimmed,
      createdAt: new Date(),
    };

    setNotes(prev => [note, ...prev]);
    setNewNote('');
    toast.success('Note saved');
  };

  const handleNoteKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAddNote();
    }
  };

  // === Chat handlers ===
  const handleSendChat = useCallback(() => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderId: therapistId,
      receiverId: clientId,
      content: trimmed,
      timestamp: new Date(),
      read: false,
    };

    // Persist to shared mock array so Messages page sees it
    mockMessages.push(newMsg);
    persistMockData(); // DEV-ONLY
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    chatInputRef.current?.focus();

    // Simulate client auto-reply after a short delay (only for demo)
    if (trimmed.match(URL_REGEX)) {
      setTimeout(() => {
        const reply: Message = {
          id: `m-${Date.now()}-reply`,
          senderId: clientId,
          receiverId: therapistId,
          content: 'Thanks for the link! I\'ll check it out.',
          timestamp: new Date(),
          read: false,
        };
        mockMessages.push(reply);
        persistMockData(); // DEV-ONLY
        setChatMessages(prev => [...prev, reply]);
        if (topTab !== 'chat') {
          setUnreadChatCount(prev => prev + 1);
        }
      }, 2000);
    }
  }, [chatInput, clientId, therapistId, topTab]);

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendChat();
    }
  };

  // === Formatting helpers ===
  const formatNoteDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatChatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const formatChatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // Group chat messages by date
  const groupedChatMessages = useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    chatMessages.forEach(msg => {
      const dateStr = formatChatDate(msg.timestamp);
      const last = groups[groups.length - 1];
      if (last && last.date === dateStr) {
        last.messages.push(msg);
      } else {
        groups.push({ date: dateStr, messages: [msg] });
      }
    });
    return groups;
  }, [chatMessages]);

  const bothSubmitted = phq9Submitted && gad7Submitted;

  return (
    <div
      className={`${useAbsolutePosition ? 'absolute' : 'fixed'} inset-y-0 right-0 z-50 flex flex-col bg-background border-l shadow-2xl transition-transform duration-300 ease-in-out ${useAbsolutePosition ? 'w-full' : 'w-full sm:w-[420px]'} ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div>
          <h2 className="font-semibold">In-Session Tools</h2>
          <p className="text-xs text-muted-foreground">{clientName}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Top-level tabs */}
      <div className="flex border-b shrink-0">
        <button
          onClick={() => setTopTab('assessments')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-sm transition-colors relative ${
            topTab === 'assessments'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          <span className="hidden min-[420px]:inline">Assessments</span>
          <span className="min-[420px]:hidden">Assess</span>
          {(phq9Submitted || gad7Submitted) && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          )}
          {topTab === 'assessments' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setTopTab('notes')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-sm transition-colors relative ${
            topTab === 'notes'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <StickyNote className="h-3.5 w-3.5" />
          Notes
          {notes.some(n => (Date.now() - n.createdAt.getTime()) < 60000) && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          )}
          {topTab === 'notes' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setTopTab('chat')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-sm transition-colors relative ${
            topTab === 'chat'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Chat
          {unreadChatCount > 0 && (
            <span className="min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center px-1">
              {unreadChatCount}
            </span>
          )}
          {topTab === 'chat' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* === ASSESSMENTS PANEL === */}
      {topTab === 'assessments' && (
        <div className="flex flex-col flex-1 min-h-0">
          <Tabs value={assessmentTab} onValueChange={(v) => setAssessmentTab(v as 'phq9' | 'gad7')} className="flex flex-col flex-1 min-h-0">
            <TabsList className="mx-4 mt-3 shrink-0">
              <TabsTrigger value="phq9" className="flex-1 gap-1.5">
                PHQ-9
                {phq9Submitted && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
              </TabsTrigger>
              <TabsTrigger value="gad7" className="flex-1 gap-1.5">
                GAD-7
                {gad7Submitted && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
              </TabsTrigger>
            </TabsList>

            {/* PHQ-9 Tab */}
            <TabsContent value="phq9" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=inactive]:hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Score:</span>
                  <span className="text-lg font-bold">{phq9Score}</span>
                  <span className="text-sm text-muted-foreground">/27</span>
                </div>
                <Badge className={`${getSeverityColor(phq9Severity)} border-0`}>
                  {phq9Severity}
                </Badge>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="p-4 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Over the last 2 weeks, how often has {clientName.split(' ')[0]} been bothered by:
                  </p>
                  {PHQ9_QUESTIONS.map((q, idx) => (
                    <QuestionItem
                      key={q.key}
                      index={idx + 1}
                      label={q.label}
                      value={phq9[q.key] as AssessmentFrequency}
                      onChange={(val) => setPhq9(prev => ({ ...prev, [q.key]: val }))}
                      disabled={phq9Submitted}
                    />
                  ))}
                </div>
              </div>

              <div className="px-4 py-3 border-t shrink-0">
                {phq9Submitted ? (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>PHQ-9 recorded ({phq9Score}/27)</span>
                  </div>
                ) : (
                  <Button onClick={handleSubmitPHQ9} className="w-full">
                    Record PHQ-9 Score
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* GAD-7 Tab */}
            <TabsContent value="gad7" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=inactive]:hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Score:</span>
                  <span className="text-lg font-bold">{gad7Score}</span>
                  <span className="text-sm text-muted-foreground">/21</span>
                </div>
                <Badge className={`${getSeverityColor(gad7Severity)} border-0`}>
                  {gad7Severity}
                </Badge>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="p-4 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Over the last 2 weeks, how often has {clientName.split(' ')[0]} been bothered by:
                  </p>
                  {GAD7_QUESTIONS.map((q, idx) => (
                    <QuestionItem
                      key={q.key}
                      index={idx + 1}
                      label={q.label}
                      value={gad7[q.key] as AssessmentFrequency}
                      onChange={(val) => setGad7(prev => ({ ...prev, [q.key]: val }))}
                      disabled={gad7Submitted}
                    />
                  ))}
                </div>
              </div>

              <div className="px-4 py-3 border-t shrink-0">
                {gad7Submitted ? (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>GAD-7 recorded ({gad7Score}/21)</span>
                  </div>
                ) : (
                  <Button onClick={handleSubmitGAD7} className="w-full">
                    Record GAD-7 Score
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Final submit when both done */}
          {bothSubmitted && (
            <div className="px-4 py-3 border-t shrink-0 bg-green-50 dark:bg-green-950/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">PHQ-9</span>
                    <span className="font-medium">{phq9Score}/27 · {phq9Severity}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-muted-foreground">GAD-7</span>
                    <span className="font-medium">{gad7Score}/21 · {gad7Severity}</span>
                  </div>
                </div>
              </div>
              <Button onClick={handleSubmitBoth} className="w-full bg-green-600 hover:bg-green-700">
                Complete Assessment
              </Button>
            </div>
          )}
        </div>
      )}

      {/* === NOTES PANEL === */}
      {topTab === 'notes' && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Data policy notice */}
          <div className="px-4 pt-3 pb-2 border-b shrink-0 bg-amber-50 dark:bg-amber-950/20">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <span className="font-semibold">Important:</span> Please do not store any sensitive client data in therapist notes.
                </p>
                {showDataPolicy ? (
                  <div className="mt-2 space-y-2 text-[11px] text-amber-700 dark:text-amber-300/90 leading-relaxed">
                    <p>
                      We understand that collecting client data is an important responsibility for a therapist. This enables ethical risk and safeguarding boundaries to be upheld.
                    </p>
                    <p>
                      In the interest of keeping things secure and simple, we maintain a strict policy that only essential client data is held in order to maintain functionality. We collect this information, such as name and login information, at the time of client registration.
                    </p>
                    <p>
                      The recording and protection of client data, under GDPR and ICO regulations, remains the sole responsibility of the therapist entrusted with this information.
                    </p>
                    <p>
                      As such, it is not permitted to hold sensitive client data in a therapist's notes within the Therapy Connect platform.
                    </p>
                    <p>
                      Therapy Connect is not responsible for any data breaches that occur as a result of a therapist maintaining client data within their Therapy Connect notes.
                    </p>
                    <p>
                      It is permitted to maintain emergency contact information for the client's GP/Doctor for risk and emergency situations.
                    </p>
                    <p>
                      What is allowed is any kind of note-taking that the therapist feels is appropriate to their sessions that does not conflict with this policy.
                    </p>
                    <button
                      onClick={() => setShowDataPolicy(false)}
                      className="flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 mt-1 transition-colors"
                    >
                      <ChevronUp className="h-3 w-3" />
                      Show less
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDataPolicy(true)}
                    className="flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 mt-1 transition-colors"
                  >
                    <ChevronDown className="h-3 w-3" />
                    See more
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Note input area */}
          <div className="px-4 pt-4 pb-3 border-b shrink-0">
            <div className="relative">
              <textarea
                ref={noteTextareaRef}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={handleNoteKeyDown}
                placeholder="Type session notes..."
                rows={2}
                className="w-full resize-none rounded-lg border bg-muted/30 px-3 py-2.5 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="absolute bottom-2 right-2 h-7 w-7 text-muted-foreground hover:text-primary disabled:opacity-30"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Press Ctrl+Enter to save
            </p>
          </div>

          {/* Notes list */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                <StickyNote className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No notes yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Start typing above to capture session observations
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border bg-card p-3 space-y-2"
                  >
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatNoteDate(note.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes count footer */}
          <div className="px-4 py-2.5 border-t shrink-0">
            <p className="text-xs text-muted-foreground text-center">
              {notes.length} note{notes.length !== 1 ? 's' : ''} for {clientName.split(' ')[0]}
            </p>
          </div>
        </div>
      )}

      {/* === CHAT PANEL === */}
      {topTab === 'chat' && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Chat hint */}
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/20 border-b shrink-0">
            <Link2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="text-[11px] text-blue-700 dark:text-blue-300">
              Messages sent here appear in your chat with {clientName.split(' ')[0]}
            </p>
          </div>

          {/* Messages area */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <MessageCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Send a link or message to {clientName.split(' ')[0]} during the session
                </p>
              </div>
            ) : (
              groupedChatMessages.map((group) => (
                <div key={group.date}>
                  {/* Date separator */}
                  <div className="flex justify-center my-3">
                    <span className="text-[10px] text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                      {group.date}
                    </span>
                  </div>
                  {group.messages.map((msg) => {
                    const isOwn = msg.senderId === therapistId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex mb-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`rounded-2xl px-3 py-2 max-w-[85%] ${
                            isOwn
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          }`}
                        >
                          <MessageContent content={msg.content} />
                          <p
                            className={`text-[9px] mt-0.5 text-right ${
                              isOwn
                                ? 'text-primary-foreground/60'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {formatChatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div className="px-3 py-2.5 border-t shrink-0 bg-background">
            <div className="flex gap-2 items-center">
              <input
                ref={chatInputRef}
                type="text"
                placeholder="Send a message or link..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <Button
                onClick={handleSendChat}
                size="icon"
                className="rounded-full shrink-0 w-9 h-9"
                disabled={!chatInput.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionItem({
  index,
  label,
  value,
  onChange,
  disabled,
}: {
  index: number;
  label: string;
  value: AssessmentFrequency;
  onChange: (val: AssessmentFrequency) => void;
  disabled: boolean;
}) {
  return (
    <div className={`rounded-lg border p-3 space-y-2.5 ${disabled ? 'opacity-60' : ''}`}>
      <p className="text-sm">
        <span className="font-medium text-muted-foreground mr-1.5">{index}.</span>
        {label}
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {FREQUENCY_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-0.5 rounded-md py-1.5 px-1 text-center transition-colors border ${
              value === opt.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/40 hover:bg-muted border-transparent'
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="text-xs font-bold">{opt.short}</span>
            <span className="text-[9px] leading-tight">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}