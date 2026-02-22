import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { X, StickyNote, Send, Clock, MessageCircle, Link2, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import {
  mockClientNotes,
  mockMessages,
  mockVideoSessions,
  ClientNote,
  Message,
} from '../data/mockData';

import { persistMockData } from "../data/devPersistence";

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

interface ClientSessionToolsProps {
  open: boolean;
  onClose: () => void;
  therapistName: string;
  clientId: string;
  sessionId: string;
  /** Use absolute instead of fixed positioning (for mobile video session) */
  useAbsolutePosition?: boolean;
}

export function ClientSessionTools({
  open,
  onClose,
  therapistName,
  clientId,
  sessionId,
  useAbsolutePosition,
}: ClientSessionToolsProps) {
  const [topTab, setTopTab] = useState<'notes' | 'chat'>('notes');

  // Notes state — client's own private notes
  const [notes, setNotes] = useState<ClientNote[]>(() =>
    mockClientNotes
      .filter(n => n.clientId === clientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  );
  const [newNote, setNewNote] = useState('');
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreviousNotes, setShowPreviousNotes] = useState(false);

  // Chat state — client perspective
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

  // Split notes into "this session" and "previous sessions"
  const thisSessionNotes = useMemo(
    () => notes.filter(n => n.sessionId === sessionId),
    [notes, sessionId]
  );
  const previousNotes = useMemo(() => {
    const prev = notes.filter(n => n.sessionId !== sessionId);
    // Group by session
    const grouped: { sessionId: string; sessionLabel: string; notes: ClientNote[] }[] = [];
    prev.forEach(note => {
      const sid = note.sessionId || 'unsorted';
      let group = grouped.find(g => g.sessionId === sid);
      if (!group) {
        // Find session info for label
        const vs = mockVideoSessions.find(s => s.id === sid);
        const label = vs
          ? vs.scheduledTime.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Other';
        group = { sessionId: sid, sessionLabel: label, notes: [] };
        grouped.push(group);
      }
      group.notes.push(note);
    });
    // Sort groups by latest note date desc
    grouped.sort((a, b) => {
      const aLatest = Math.max(...a.notes.map(n => n.createdAt.getTime()));
      const bLatest = Math.max(...b.notes.map(n => n.createdAt.getTime()));
      return bLatest - aLatest;
    });
    return grouped;
  }, [notes, sessionId]);

  // Auto-resize note textarea
  useEffect(() => {
    if (noteTextareaRef.current) {
      noteTextareaRef.current.style.height = 'auto';
      noteTextareaRef.current.style.height =
        Math.min(noteTextareaRef.current.scrollHeight, 120) + 'px';
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

  // === Notes handlers ===
  const handleAddNote = () => {
    const trimmed = newNote.trim();
    if (!trimmed) return;

    const note: ClientNote = {
      id: `cn-${Date.now()}`,
      clientId,
      sessionId,
      content: trimmed,
      createdAt: new Date(),
    };

    // Persist to shared mock array
    mockClientNotes.push(note);
    persistMockData(); // DEV-ONLY
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
      senderId: clientId,
      receiverId: therapistId,
      content: trimmed,
      timestamp: new Date(),
      read: false,
    };

    // Persist to shared mock array
    mockMessages.push(newMsg);
    persistMockData(); // DEV-ONLY
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    chatInputRef.current?.focus();

    // Simulate therapist auto-reply after a short delay (only for demo)
    setTimeout(() => {
      const replies = [
        "Thanks for sharing that. We can explore this further.",
        "I appreciate you bringing that up.",
        "That's a great observation. Let's discuss.",
        "I hear you. We'll work through this together.",
      ];
      const reply: Message = {
        id: `m-${Date.now()}-reply`,
        senderId: therapistId,
        receiverId: clientId,
        content: replies[Math.floor(Math.random() * replies.length)],
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

    return (
      date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      }) +
      ' at ' +
      date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    );
  };

  const formatChatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const formatChatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

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

  return (
    <div
      className={`${useAbsolutePosition ? 'absolute' : 'fixed'} inset-y-0 right-0 z-50 flex flex-col bg-background border-l shadow-2xl transition-transform duration-300 ease-in-out ${useAbsolutePosition ? 'w-full' : 'w-full sm:w-[420px]'} ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div>
          <h2 className="font-semibold">Session Tools</h2>
          <p className="text-xs text-muted-foreground">
            with {therapistName}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Top-level tabs */}
      <div className="flex border-b shrink-0">
        <button
          onClick={() => setTopTab('notes')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-sm transition-colors relative ${
            topTab === 'notes'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <StickyNote className="h-3.5 w-3.5" />
          My Notes
          {thisSessionNotes.length > 0 && topTab !== 'notes' && (
            <span className="min-w-[18px] h-[18px] rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center px-1">
              {thisSessionNotes.length}
            </span>
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

      {/* === NOTES PANEL === */}
      {topTab === 'notes' && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Privacy indicator */}
          <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-950/20 border-b shrink-0">
            <Lock className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
            <p className="text-[11px] text-violet-700 dark:text-violet-300">
              Personal notes — only visible to you
            </p>
          </div>

          {/* Note input area */}
          <div className="px-4 pt-4 pb-3 border-b shrink-0">
            <div className="relative">
              <textarea
                ref={noteTextareaRef}
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={handleNoteKeyDown}
                placeholder="Jot down thoughts, reminders, or reflections..."
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
                  Capture your thoughts, insights, or things to remember during this session
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {/* This session's notes */}
                {thisSessionNotes.length > 0 && (
                  <>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                      This Session
                    </p>
                    {thisSessionNotes.map(note => (
                      <div
                        key={note.id}
                        className="rounded-lg border bg-violet-50/50 dark:bg-violet-950/10 border-violet-100 dark:border-violet-900/30 p-3 space-y-2"
                      >
                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatNoteDate(note.createdAt)}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Previous session notes (collapsible) */}
                {previousNotes.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => setShowPreviousNotes(!showPreviousNotes)}
                      className="flex items-center gap-2 w-full text-left text-[11px] text-muted-foreground uppercase tracking-wide font-medium hover:text-foreground transition-colors py-1"
                    >
                      {showPreviousNotes ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      Previous Sessions ({previousNotes.reduce((sum, g) => sum + g.notes.length, 0)} notes)
                    </button>

                    {showPreviousNotes && (
                      <div className="mt-2 space-y-4">
                        {previousNotes.map(group => (
                          <div key={group.sessionId}>
                            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                              {group.sessionLabel}
                            </p>
                            <div className="space-y-2 pl-3 border-l-2 border-muted">
                              {group.notes.map(note => (
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
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Divider if only previous notes and no current */}
                {thisSessionNotes.length === 0 && previousNotes.length > 0 && !showPreviousNotes && (
                  <div className="flex flex-col items-center text-center pt-4 pb-2">
                    <p className="text-xs text-muted-foreground">
                      No notes for this session yet — start typing above
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes count footer */}
          <div className="px-4 py-2.5 border-t shrink-0">
            <p className="text-xs text-muted-foreground text-center">
              {thisSessionNotes.length} note{thisSessionNotes.length !== 1 ? 's' : ''} this session
              {previousNotes.length > 0 && (
                <span>
                  {' '}· {previousNotes.reduce((sum, g) => sum + g.notes.length, 0)} from previous
                </span>
              )}
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
              Messages sent here appear in your chat with {therapistName.split(' ')[0]}
            </p>
          </div>

          {/* Messages area */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <MessageCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Send a message to {therapistName.split(' ')[0]} during the session
                </p>
              </div>
            ) : (
              groupedChatMessages.map(group => (
                <div key={group.date}>
                  {/* Date separator */}
                  <div className="flex justify-center my-3">
                    <span className="text-[10px] text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                      {group.date}
                    </span>
                  </div>
                  {group.messages.map(msg => {
                    const isOwn = msg.senderId === clientId;
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
                placeholder="Send a message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
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