import { Message, User } from "../data/mockData";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Send, ArrowLeft, Phone, Video, UserCheck } from "lucide-react";

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  otherUser: User;
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  isMobile?: boolean;
  connectionStatus?: 'pending' | 'accepted' | 'rejected';
  onAcceptConnection?: () => void;
  onUserClick?: () => void;
}

export default function MessageThread({ 
  messages, 
  currentUserId, 
  otherUser,
  onSendMessage,
  onBack,
  isMobile = false,
  connectionStatus,
  onAcceptConnection,
  onUserClick,
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
      // Refocus the input after sending
      inputRef.current?.focus();
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach((message) => {
    const dateStr = message.timestamp.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(message);
    } else {
      groupedMessages.push({ date: dateStr, messages: [message] });
    }
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`border-b flex items-center gap-3 bg-background ${isMobile ? 'px-2 py-2.5' : 'p-4'}`}>
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
          className={`rounded-full object-cover ${isMobile ? 'w-9 h-9' : 'w-12 h-12'} ${onUserClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          onClick={onUserClick}
        />
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold truncate ${isMobile ? 'text-sm' : ''} ${onUserClick ? 'cursor-pointer hover:underline' : ''}`}
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
      <div className={`flex-1 overflow-y-auto space-y-1 ${isMobile ? 'px-3 py-2' : 'p-4 space-y-4'}`}>
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
                return (
                  <div
                    key={message.id}
                    className={`flex mb-1.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-2xl px-3 py-2 ${
                        isMobile ? 'max-w-[80%]' : 'max-w-[70%] rounded-lg p-3'
                      } ${
                        isOwnMessage
                          ? `bg-primary text-primary-foreground ${isMobile ? 'rounded-br-md' : ''}`
                          : `bg-muted ${isMobile ? 'rounded-bl-md' : ''}`
                      }`}
                    >
                      <p className={`break-words ${isMobile ? 'text-sm' : ''}`}>{message.content}</p>
                      <p
                        className={`text-[10px] mt-0.5 text-right ${
                          isOwnMessage
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
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
      {connectionStatus === 'pending' && onAcceptConnection && (
        <div className={`border-t bg-amber-50 ${isMobile ? 'px-3 py-2.5' : 'px-4 py-3'}`}>
          <div className="flex items-center justify-between gap-3">
            <p className={`text-amber-800 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <span className="font-medium">{otherUser.name}</span> wants to connect with you
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
      <div className={`border-t bg-background ${isMobile ? 'px-2 py-2' : 'p-4'}`}>
        <div className="flex gap-2 items-end">
          {isMobile ? (
            <>
              <input
                ref={inputRef}
                type="text"
                placeholder="Message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
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
              <textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
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
    </div>
  );
}