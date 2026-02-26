import { Message, User, TherapistBookmark } from "../data/mockData";
import { useLinkPreview } from "../hooks/useLinkPreview";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Send,
  ArrowLeft,
  Phone,
  Video,
  UserCheck,
  Paperclip,
  Bookmark,
  Plus,
  ExternalLink,
  Globe,
  X,
  Search,
  Trash2,
  Loader2,
  Calendar,
  Clock,
  CreditCard,
  Check,
  XCircle,
  User as UserIcon,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  otherUser: User;
  onSendMessage: (content: string) => void;
  onSendBookmark?: (bookmark: { title: string; url: string }, message?: string) => void;
  onBack?: () => void;
  isMobile?: boolean;
  connectionStatus?: "pending" | "accepted" | "rejected";
  onAcceptConnection?: () => void;
  onUserClick?: () => void;
  isTherapistMode?: boolean;
  bookmarks?: TherapistBookmark[];
  onAddBookmark?: (title: string, url: string) => void;
  onDeleteBookmark?: (id: string) => void;
  onApproveSession?: (sessionId: string, messageId: string) => void;
  onDeclineSession?: (sessionId: string, messageId: string) => void;
  onPaySession?: (sessionId: string, messageId: string) => void;
}

/** Extract domain from a URL for display */
function getDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Get a colour based on the domain (deterministic) */
function getDomainColor(url: string): string {
  const domain = getDomain(url);
  const colors = [
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-violet-500 to-violet-600",
    "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600",
    "from-cyan-500 to-cyan-600",
    "from-fuchsia-500 to-fuchsia-600",
    "from-teal-500 to-teal-600",
  ];
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/** Shared link preview card rendered inside a message bubble */
function BookmarkCard({
  bookmark,
  isOwnMessage,
  isMobile,
}: {
  bookmark: { title: string; url: string };
  isOwnMessage: boolean;
  isMobile: boolean;
}) {
  const domain = getDomain(bookmark.url);
  const gradient = getDomainColor(bookmark.url);
  const { preview, loading } = useLinkPreview(bookmark.url);
  const image = preview?.image;

  return (
    <a
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-lg overflow-hidden border ${
        isOwnMessage
          ? "border-primary-foreground/20"
          : "border-border"
      } hover:opacity-90 transition-opacity`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Auto-fetched og:image or fallback gradient */}
      {loading ? (
        <div
          className={`${isMobile ? "h-28" : "h-32"} bg-muted flex items-center justify-center`}
        >
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
        </div>
      ) : image ? (
        <div className={`${isMobile ? "h-28" : "h-32"} relative bg-muted`}>
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/80"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>`;
              }
            }}
          />
        </div>
      ) : (
        <div
          className={`bg-gradient-to-br ${gradient} ${isMobile ? "h-14" : "h-16"} flex items-center justify-center`}
        >
          <Globe className="w-7 h-7 text-white/80" />
        </div>
      )}
      {/* Content */}
      <div
        className={`px-3 py-2 ${
          isOwnMessage ? "bg-primary-foreground/10" : "bg-background"
        }`}
      >
        <p
          className={`text-xs font-medium line-clamp-2 ${
            isOwnMessage ? "text-primary-foreground" : "text-foreground"
          }`}
        >
          {preview?.title || bookmark.title}
        </p>
        {preview?.description && (
          <p
            className={`text-[10px] line-clamp-2 mt-0.5 ${
              isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {preview.description}
          </p>
        )}
        <div className="flex items-center gap-1 mt-1">
          {preview?.logo ? (
            <img src={preview.logo} alt="" className="w-3 h-3 rounded-sm shrink-0" />
          ) : (
            <ExternalLink
              className={`w-3 h-3 shrink-0 ${
                isOwnMessage
                  ? "text-primary-foreground/60"
                  : "text-muted-foreground"
              }`}
            />
          )}
          <span
            className={`text-[10px] truncate ${
              isOwnMessage
                ? "text-primary-foreground/60"
                : "text-muted-foreground"
            }`}
          >
            {domain}
          </span>
        </div>
      </div>
    </a>
  );
}

const MODALITY_LABELS: Record<string, string> = {
  video: 'Video',
  inPerson: 'In-Person',
  text: 'Text',
  phoneCall: 'Phone',
};

const MODALITY_ICONS: Record<string, React.ReactNode> = {
  video: <Video className="w-4 h-4" />,
  inPerson: <UserIcon className="w-4 h-4" />,
  text: <MessageSquare className="w-4 h-4" />,
  phoneCall: <Phone className="w-4 h-4" />,
};

function SessionRequestCard({
  message,
  isOwnMessage,
  isTherapistMode,
  isMobile,
  onApprove,
  onDecline,
  onPay,
}: {
  message: Message;
  isOwnMessage: boolean;
  isTherapistMode: boolean;
  isMobile: boolean;
  onApprove?: (sessionId: string, messageId: string) => void;
  onDecline?: (sessionId: string, messageId: string) => void;
  onPay?: (sessionId: string, messageId: string) => void;
}) {
  const req = message.sessionRequest!;
  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700',
    declined: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700',
    paid: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700',
  };
  const statusLabels: Record<string, string> = {
    pending: 'Awaiting Approval',
    approved: 'Approved — Payment Required',
    declined: 'Declined',
    paid: 'Confirmed & Paid',
  };

  return (
    <div className={`rounded-xl border overflow-hidden ${isMobile ? 'max-w-[85%]' : 'max-w-[380px]'} ${
      isOwnMessage ? 'ml-auto' : ''
    }`}>
      {/* Header */}
      <div className={`px-3.5 py-2.5 flex items-center gap-2 ${
        req.status === 'pending' ? 'bg-amber-50 dark:bg-amber-950/30' :
        req.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/30' :
        req.status === 'declined' ? 'bg-red-50 dark:bg-red-950/30' :
        'bg-blue-50 dark:bg-blue-950/30'
      }`}>
        {req.status === 'pending' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
        {req.status === 'approved' && <Check className="w-4 h-4 text-emerald-600" />}
        {req.status === 'declined' && <XCircle className="w-4 h-4 text-red-600" />}
        {req.status === 'paid' && <CreditCard className="w-4 h-4 text-blue-600" />}
        <span className="text-xs font-medium">Session Request</span>
        <Badge variant="outline" className={`ml-auto text-[10px] py-0 ${statusColors[req.status]}`}>
          {statusLabels[req.status]}
        </Badge>
      </div>

      {/* Body */}
      <div className="px-3.5 py-3 bg-card space-y-2.5">
        {/* Session type row */}
        <div className="flex items-center gap-2 text-sm">
          {MODALITY_ICONS[req.modality]}
          <span className="font-medium">{req.sessionType}</span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{req.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{req.time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{req.duration} minutes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground">£{req.price}</span>
          </div>
        </div>

        {/* Message content */}
        {message.content && (
          <p className="text-sm text-muted-foreground border-t pt-2">{message.content}</p>
        )}

        {/* Action buttons */}
        {req.status === 'pending' && isTherapistMode && onApprove && onDecline && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => onApprove(req.sessionId, message.id)}
            >
              <Check className="w-3.5 h-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
              onClick={() => onDecline(req.sessionId, message.id)}
            >
              <XCircle className="w-3.5 h-3.5" />
              Decline
            </Button>
          </div>
        )}

        {req.status === 'approved' && !isTherapistMode && !isOwnMessage && onPay && (
          <div className="pt-1">
            <Button
              size="sm"
              className="w-full gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => onPay(req.sessionId, message.id)}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Pay £{req.price}
            </Button>
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div className="px-3.5 py-1.5 bg-muted/50 border-t text-[10px] text-muted-foreground text-right">
        {message.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}

export default function MessageThread({
  messages,
  currentUserId,
  otherUser,
  onSendMessage,
  onSendBookmark,
  onBack,
  isMobile = false,
  connectionStatus,
  onAcceptConnection,
  onUserClick,
  isTherapistMode = false,
  bookmarks = [],
  onAddBookmark,
  onDeleteBookmark,
  onApproveSession,
  onDeclineSession,
  onPaySession,
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Bookmark UI state
  const [attachOpen, setAttachOpen] = useState(false);
  const [addBookmarkOpen, setAddBookmarkOpen] = useState(false);
  const [newBkTitle, setNewBkTitle] = useState("");
  const [newBkUrl, setNewBkUrl] = useState("");
  const [bookmarkSearch, setBookmarkSearch] = useState("");

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
      inputRef.current?.focus();
      textareaRef.current?.focus();
    }
  };

  const handleAttachBookmark = (bk: { title: string; url: string }) => {
    onSendBookmark?.(bk);
    setAttachOpen(false);
    setBookmarkSearch("");
  };

  const handleAddBookmark = () => {
    if (!newBkTitle.trim() || !newBkUrl.trim()) return;
    let url = newBkUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    onAddBookmark?.(newBkTitle.trim(), url);
    setNewBkTitle("");
    setNewBkUrl("");
    setAddBookmarkOpen(false);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach((message) => {
    const dateStr = message.timestamp.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(message);
    } else {
      groupedMessages.push({ date: dateStr, messages: [message] });
    }
  });

  const filteredBookmarks = bookmarks.filter((bk) => {
    if (!bookmarkSearch.trim()) return true;
    const q = bookmarkSearch.toLowerCase();
    return (
      bk.title.toLowerCase().includes(q) ||
      bk.url.toLowerCase().includes(q)
    );
  });

  const showAttach = isTherapistMode && onSendBookmark;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={`border-b flex items-center gap-3 bg-background ${
          isMobile ? "px-2 py-2.5" : "p-4"
        }`}
      >
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <img
          src={otherUser.avatar}
          alt={otherUser.name}
          className={`rounded-full object-cover ${
            isMobile ? "w-9 h-9" : "w-12 h-12"
          } ${
            onUserClick
              ? "cursor-pointer hover:opacity-80 transition-opacity"
              : ""
          }`}
          onClick={onUserClick}
        />
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold truncate ${isMobile ? "text-sm" : ""} ${
              onUserClick ? "cursor-pointer hover:underline" : ""
            }`}
            onClick={onUserClick}
          >
            {otherUser.name}
          </h3>
          {!isMobile && (
            <p className="text-sm text-muted-foreground">{otherUser.email}</p>
          )}
          {isMobile && (
            <p className="text-xs text-muted-foreground">Online</p>
          )}
        </div>
        {isMobile && (
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <Video className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <Phone className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        className={`flex-1 overflow-y-auto space-y-1 ${
          isMobile ? "px-3 py-2" : "p-4 space-y-4"
        }`}
      >
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex justify-center my-3">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {group.date}
                </span>
              </div>
              {group.messages.map((message) => {
                const isOwnMessage = message.senderId === currentUserId;

                // Render session request card
                if (message.sessionRequest) {
                  return (
                    <div
                      key={message.id}
                      className={`flex mb-2 ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <SessionRequestCard
                        message={message}
                        isOwnMessage={isOwnMessage}
                        isTherapistMode={isTherapistMode}
                        isMobile={isMobile}
                        onApprove={onApproveSession}
                        onDecline={onDeclineSession}
                        onPay={onPaySession}
                      />
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={`flex mb-1.5 ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-2xl ${
                        message.bookmark ? "p-1.5 pb-2" : "px-3 py-2"
                      } ${
                        isMobile
                          ? "max-w-[80%]"
                          : `max-w-[70%] ${message.bookmark ? "" : "rounded-lg p-3"}`
                      } ${
                        isOwnMessage
                          ? `bg-primary text-primary-foreground ${
                              isMobile ? "rounded-br-md" : ""
                            }`
                          : `bg-muted ${isMobile ? "rounded-bl-md" : ""}`
                      }`}
                    >
                      {/* Text content (if any) */}
                      {message.content && (
                        <p
                          className={`break-words ${
                            isMobile ? "text-sm" : ""
                          } ${message.bookmark ? "px-1.5 pt-0.5 pb-1.5" : ""}`}
                        >
                          {message.content}
                        </p>
                      )}
                      {/* Bookmark preview card */}
                      {message.bookmark && (
                        <BookmarkCard
                          bookmark={message.bookmark}
                          isOwnMessage={isOwnMessage}
                          isMobile={isMobile}
                        />
                      )}
                      <p
                        className={`text-[10px] mt-0.5 text-right ${
                          message.bookmark ? "px-1.5" : ""
                        } ${
                          isOwnMessage
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Accept connection banner — shown to therapist when connection is pending */}
      {connectionStatus === "pending" && onAcceptConnection && (
        <div
          className={`border-t bg-amber-50 ${
            isMobile ? "px-3 py-2.5" : "px-4 py-3"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <p
              className={`text-amber-800 ${
                isMobile ? "text-xs" : "text-sm"
              }`}
            >
              <span className="font-medium">{otherUser.name}</span> wants to
              connect with you
            </p>
            <Button
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={onAcceptConnection}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Accept Connection
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div
        className={`border-t bg-background ${
          isMobile ? "px-2 py-2" : "p-4"
        }`}
      >
        <div className="flex gap-2 items-end">
          {isMobile ? (
            <>
              {/* Attach button (therapist only) */}
              {showAttach && (
                <Popover open={attachOpen} onOpenChange={setAttachOpen}>
                  <PopoverTrigger asChild>
                    <button
                      className="p-2 rounded-full hover:bg-muted transition-colors shrink-0"
                      aria-label="Attach bookmark"
                    >
                      <Paperclip className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    align="start"
                    className="w-80 p-0"
                  >
                    <BookmarkPickerContent
                      bookmarks={filteredBookmarks}
                      bookmarkSearch={bookmarkSearch}
                      setBookmarkSearch={setBookmarkSearch}
                      onSelect={handleAttachBookmark}
                      onAddNew={() => {
                        setAttachOpen(false);
                        setAddBookmarkOpen(true);
                      }}
                      onDelete={onDeleteBookmark}
                    />
                  </PopoverContent>
                </Popover>
              )}
              <input
                ref={inputRef}
                type="text"
                placeholder="Message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="rounded-full shrink-0 w-9 h-9"
                disabled={!newMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              {/* Attach button (therapist only) */}
              {showAttach && (
                <Popover open={attachOpen} onOpenChange={setAttachOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 self-end"
                      aria-label="Attach bookmark"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    align="start"
                    className="w-80 p-0"
                  >
                    <BookmarkPickerContent
                      bookmarks={filteredBookmarks}
                      bookmarkSearch={bookmarkSearch}
                      setBookmarkSearch={setBookmarkSearch}
                      onSelect={handleAttachBookmark}
                      onAddNew={() => {
                        setAttachOpen(false);
                        setAddBookmarkOpen(true);
                      }}
                      onDelete={onDeleteBookmark}
                    />
                  </PopoverContent>
                </Popover>
              )}
              <textarea
                ref={textareaRef}
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 resize-none border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                rows={2}
              />
              <Button onClick={handleSend} size="icon" className="self-end">
                <Send className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Add Bookmark Dialog ───────────────────────────────── */}
      <Dialog open={addBookmarkOpen} onOpenChange={setAddBookmarkOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="w-5 h-5" />
              Add Bookmark
            </DialogTitle>
            <DialogDescription>
              Save a link to quickly share with clients in chat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="e.g. Grounding Techniques Article"
                value={newBkTitle}
                onChange={(e) => setNewBkTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">URL</label>
              <Input
                placeholder="https://example.com/article"
                value={newBkUrl}
                onChange={(e) => setNewBkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddBookmark();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setAddBookmarkOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddBookmark}
                disabled={!newBkTitle.trim() || !newBkUrl.trim()}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Save Bookmark
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Bookmark picker content — used inside the Popover */
function BookmarkPickerContent({
  bookmarks,
  bookmarkSearch,
  setBookmarkSearch,
  onSelect,
  onAddNew,
  onDelete,
}: {
  bookmarks: TherapistBookmark[];
  bookmarkSearch: string;
  setBookmarkSearch: (v: string) => void;
  onSelect: (bk: { title: string; url: string }) => void;
  onAddNew: () => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Saved Bookmarks</span>
          </div>
          <button
            onClick={onAddNew}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={bookmarkSearch}
            onChange={(e) => setBookmarkSearch(e.target.value)}
            className="w-full text-xs bg-muted rounded-md pl-8 pr-3 py-1.5 outline-none focus:ring-1 focus:ring-primary/30"
          />
          {bookmarkSearch && (
            <button
              onClick={() => setBookmarkSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Bookmark list */}
      <div className="max-h-56 overflow-y-auto">
        {bookmarks.length === 0 ? (
          <div className="py-6 text-center">
            <Bookmark className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              {bookmarkSearch
                ? "No bookmarks match your search"
                : "No saved bookmarks yet"}
            </p>
          </div>
        ) : (
          bookmarks.map((bk) => (
            <PickerBookmarkItem
              key={bk.id}
              bk={bk}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

/** Individual bookmark item in the picker — uses useLinkPreview for thumbnail */
function PickerBookmarkItem({
  bk,
  onSelect,
  onDelete,
}: {
  bk: TherapistBookmark;
  onSelect: (bk: { title: string; url: string }) => void;
  onDelete?: (id: string) => void;
}) {
  const { preview, loading } = useLinkPreview(bk.url);
  const image = preview?.image;

  return (
    <div className="group flex items-start gap-2.5 px-3 py-2 hover:bg-muted/60 transition-colors cursor-pointer border-b border-border/50 last:border-0">
      <button
        className="flex-1 flex items-start gap-2.5 text-left cursor-pointer min-w-0"
        onClick={() => onSelect({ title: bk.title, url: bk.url })}
      >
        {/* Auto-fetched thumbnail or domain colour dot */}
        {loading ? (
          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
            <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />
          </div>
        ) : image ? (
          <img
            src={image}
            alt=""
            className="w-8 h-8 rounded-md object-cover shrink-0 mt-0.5 bg-muted"
          />
        ) : (
          <div
            className={`w-8 h-8 rounded-md bg-gradient-to-br ${getDomainColor(
              bk.url
            )} flex items-center justify-center shrink-0 mt-0.5`}
          >
            <Globe className="w-3.5 h-3.5 text-white/90" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium line-clamp-1">
            {bk.title}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {getDomain(bk.url)}
          </p>
        </div>
      </button>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(bk.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-all shrink-0 mt-0.5 cursor-pointer"
          aria-label={`Delete bookmark: ${bk.title}`}
        >
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </button>
      )}
    </div>
  );
}