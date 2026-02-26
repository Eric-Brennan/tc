import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { 
  mockMessages, 
  mockTherapists, 
  mockClients, 
  mockCurrentClient,
  mockCurrentTherapist,
  mockConnections,
  mockSupervisionConnections,
  mockTherapistBookmarks,
  mockVideoSessions,
  Message,
  User
} from "../data/mockData";
import MessageThread from "../components/MessageThread";
import Layout from "../components/Layout";
import { Card } from "../components/ui/card";
import { Search, MessageCircle } from "lucide-react";
import { Input } from "../components/ui/input";
import { useIsMobileView } from "../hooks/useIsMobileView";
import { toast } from "sonner";
import { persistMockData } from "../data/devPersistence";
import { useProfileMode } from "../contexts/ProfileModeContext";

export default function Messages() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobileView();

  // Track locally-accepted connections so the banner disappears without navigation
  const [locallyAccepted, setLocallyAccepted] = useState<Set<string>>(new Set());
  const [bookmarkTick, setBookmarkTick] = useState(0);

  // Re-sync messages whenever mock data is updated externally
  // (e.g. therapist approves a request while client's Messages is mounted)
  useEffect(() => {
    const handler = () => setMessages([...mockMessages]);
    window.addEventListener('mockDataUpdated', handler);
    return () => window.removeEventListener('mockDataUpdated', handler);
  }, []);

  // Determine if we're in therapist mode based on route
  const isTherapistMode = location.pathname.startsWith('/t/');
  
  // Client-mode awareness: therapist browsing as a client
  const { isClientMode } = useProfileMode();

  // Determine current user (in real app, this would come from auth context)
  const currentUser = isTherapistMode ? mockCurrentTherapist : mockCurrentClient;

  // When therapist is in client mode, exclude their own therapist ID from conversations
  const ownTherapistId = isClientMode ? mockCurrentTherapist.id : null;

  // Get connected users based on accepted connections
  const connectedTherapistIds = !isTherapistMode 
    ? mockConnections
        .filter(c => (c.status === 'accepted' || c.status === 'pending') && c.clientId === currentUser.id)
        .map(c => c.therapistId)
        .filter(id => id !== ownTherapistId) // exclude self in client mode
    : [];
  
  const connectedClientIds = isTherapistMode
    ? mockConnections
        .filter(c => (c.status === 'accepted' || c.status === 'pending') && c.therapistId === currentUser.id)
        .map(c => c.clientId)
    : [];

  // In therapist mode, also include other therapists from supervision connections
  const connectedPeerTherapistIds = isTherapistMode
    ? mockSupervisionConnections
        .filter(sc =>
          (sc.status === 'accepted' || sc.status === 'pending') &&
          (sc.supervisorId === currentUser.id || sc.superviseeId === currentUser.id)
        )
        .map(sc => sc.supervisorId === currentUser.id ? sc.superviseeId : sc.supervisorId)
    : [];
  
  const connectedUsers = isTherapistMode
    ? [
        ...(mockClients.filter(c => connectedClientIds.includes(c.id)) as User[]),
        ...(mockTherapists.filter(t => connectedPeerTherapistIds.includes(t.id)) as User[]),
      ]
    : mockTherapists.filter(t => connectedTherapistIds.includes(t.id)) as User[];

  // Get conversations
  const conversations = connectedUsers.map(user => {
    const userMessages = messages.filter(
      m => m.senderId === user.id || m.receiverId === user.id
    );
    const lastMessage = userMessages.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )[0];
    const unreadCount = userMessages.filter(
      m => m.senderId === user.id && !m.read
    ).length;

    return {
      user,
      lastMessage,
      unreadCount
    };
  }).sort((a, b) => {
    if (!a.lastMessage) return 1;
    if (!b.lastMessage) return -1;
    return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
  });

  // Filter conversations
  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected conversation
  const selectedUser = userId 
    ? connectedUsers.find(u => u.id === userId)
    : null;

  // Find the connection between current user and selected user
  const selectedConnection = selectedUser
    ? mockConnections.find(c =>
        isTherapistMode
          ? c.therapistId === currentUser.id && c.clientId === selectedUser.id
          : c.clientId === currentUser.id && c.therapistId === selectedUser.id
      )
    : null;

  // For therapist-to-therapist conversations, find the supervision connection
  const selectedSupervisionConnection = selectedUser && isTherapistMode
    ? mockSupervisionConnections.find(sc =>
        (sc.supervisorId === currentUser.id && sc.superviseeId === selectedUser.id) ||
        (sc.superviseeId === currentUser.id && sc.supervisorId === selectedUser.id)
      )
    : null;

  // Determine if the selected user is a peer therapist (not a client)
  const isSelectedUserPeerTherapist = selectedUser
    ? connectedPeerTherapistIds.includes(selectedUser.id)
    : false;

  const selectedConnectionStatus = selectedConnection
    ? (locallyAccepted.has(selectedConnection.id) ? 'accepted' : selectedConnection.status)
    : selectedSupervisionConnection
      ? (locallyAccepted.has(selectedSupervisionConnection.id) ? 'accepted' : selectedSupervisionConnection.status)
      : undefined;

  const selectedMessages = selectedUser
    ? messages
        .filter(m => 
          (m.senderId === selectedUser.id && m.receiverId === currentUser.id) ||
          (m.senderId === currentUser.id && m.receiverId === selectedUser.id)
        )
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    : [];

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (!selectedUser) return;
    let didMark = false;
    mockMessages.forEach(m => {
      if (m.senderId === selectedUser.id && m.receiverId === currentUser.id && !m.read) {
        m.read = true;
        didMark = true;
      }
    });
    if (didMark) {
      persistMockData();
      setMessages([...mockMessages]);
    }
  }, [selectedUser?.id, currentUser.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prepend the connection request message as the first message in the thread
  const messagesWithConnectionMsg = (() => {
    // Use either client-therapist connection or supervision connection message
    const connWithMessage = selectedConnection?.message
      ? selectedConnection
      : selectedSupervisionConnection?.message
        ? selectedSupervisionConnection
        : null;

    if (!connWithMessage?.message || !selectedUser) return selectedMessages;

    const connectionMsg: Message = {
      id: `conn-msg-${connWithMessage.id}`,
      senderId: 'superviseeId' in connWithMessage ? connWithMessage.superviseeId : connWithMessage.clientId,
      receiverId: 'supervisorId' in connWithMessage ? connWithMessage.supervisorId : connWithMessage.therapistId,
      content: connWithMessage.message,
      timestamp: connWithMessage.createdAt,
      read: true,
    };
    // Only prepend if it's earlier than (or same as) the first real message
    if (selectedMessages.length === 0 || connectionMsg.timestamp <= selectedMessages[0].timestamp) {
      return [connectionMsg, ...selectedMessages];
    }
    // Insert in chronological order
    const merged = [...selectedMessages, connectionMsg].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    return merged;
  })();

  const handleAcceptConnection = () => {
    if (!selectedConnection) return;
    // Mutate mock data so it persists across navigation
    selectedConnection.status = 'accepted';
    persistMockData(); // DEV-ONLY
    // Track locally so the banner disappears immediately
    setLocallyAccepted(prev => new Set(prev).add(selectedConnection.id));
    toast.success(`Connection with ${selectedUser?.name} accepted`);
  };

  const handleSendMessage = (content: string) => {
    if (!selectedUser) return;

    const newMessage: Message = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      content,
      timestamp: new Date(),
      read: false
    };

    mockMessages.push(newMessage); // persist to shared array
    persistMockData(); // DEV-ONLY
    setMessages([...mockMessages]); // sync from source of truth to avoid double-append
  };

  const handleSendBookmark = (bookmark: { title: string; url: string }, message?: string) => {
    if (!selectedUser) return;

    const newMessage: Message = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      content: message || '',
      timestamp: new Date(),
      read: false,
      bookmark,
    };

    mockMessages.push(newMessage);
    persistMockData();
    setMessages([...mockMessages]);
  };

  const handleAddBookmark = (title: string, url: string) => {
    mockTherapistBookmarks.push({
      id: `bk-${Date.now()}`,
      therapistId: currentUser.id,
      title,
      url,
      createdAt: new Date(),
    });
    persistMockData();
    setBookmarkTick((t) => t + 1);
    toast.success('Bookmark saved');
  };

  const handleDeleteBookmark = (id: string) => {
    const idx = mockTherapistBookmarks.findIndex((b) => b.id === id);
    if (idx !== -1) {
      mockTherapistBookmarks.splice(idx, 1);
      persistMockData();
      setBookmarkTick((t) => t + 1);
      toast('Bookmark removed');
    }
  };

  // Current therapist's bookmarks (filtered by therapist id)
  const currentBookmarks = mockTherapistBookmarks.filter(
    (b) => b.id && (bookmarkTick >= 0) && b.therapistId === currentUser.id
  );

  const handleApproveSession = (sessionId: string, messageId: string) => {
    // Update the original request message status
    const requestMsg = mockMessages.find(m => m.id === messageId);
    if (requestMsg?.sessionRequest) {
      requestMsg.sessionRequest.status = 'approved';
    }

    // Send an approval message to the client with payment link
    const approvalMessage: Message = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: currentUser.id,
      receiverId: selectedUser!.id,
      content: 'Your session request has been approved! Please complete payment to confirm your booking.',
      timestamp: new Date(),
      read: false,
      sessionRequest: requestMsg?.sessionRequest ? {
        ...requestMsg.sessionRequest,
        status: 'approved',
      } : undefined,
    };
    mockMessages.push(approvalMessage);
    persistMockData();
    setMessages([...mockMessages]);
    toast.success('Session approved — payment link sent to client');
  };

  const handleDeclineSession = (sessionId: string, messageId: string) => {
    // Update the original request message status
    const requestMsg = mockMessages.find(m => m.id === messageId);
    if (requestMsg?.sessionRequest) {
      requestMsg.sessionRequest.status = 'declined';
    }

    // Remove the session from mockVideoSessions
    const sessionIdx = mockVideoSessions.findIndex(s => s.id === sessionId);
    if (sessionIdx !== -1) {
      mockVideoSessions.splice(sessionIdx, 1);
    }

    // Send a decline message to the client
    const declineMessage: Message = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: currentUser.id,
      receiverId: selectedUser!.id,
      content: 'Unfortunately I\'m unable to accommodate this session at the requested time. Please feel free to choose another available slot.',
      timestamp: new Date(),
      read: false,
      sessionRequest: requestMsg?.sessionRequest ? {
        ...requestMsg.sessionRequest,
        status: 'declined',
      } : undefined,
    };
    mockMessages.push(declineMessage);
    persistMockData();
    setMessages([...mockMessages]);
    toast.success('Session declined — client has been notified');
  };

  const handlePaySession = (sessionId: string, messageId: string) => {
    // Update the approval message status to paid
    const approvalMsg = mockMessages.find(m => m.id === messageId);
    if (approvalMsg?.sessionRequest) {
      approvalMsg.sessionRequest.status = 'paid';
    }

    // Also update any other messages with the same sessionId
    mockMessages.forEach(m => {
      if (m.sessionRequest?.sessionId === sessionId) {
        m.sessionRequest.status = 'paid';
      }
    });

    // Update the session: mark as paid and remove requiresApproval
    const session = mockVideoSessions.find(s => s.id === sessionId);
    if (session) {
      session.isPaid = true;
      session.requiresApproval = undefined;
    }

    // Send a confirmation message to the therapist
    const confirmMessage: Message = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: currentUser.id,
      receiverId: selectedUser!.id,
      content: 'Payment completed! Session is now confirmed.',
      timestamp: new Date(),
      read: false,
      sessionRequest: approvalMsg?.sessionRequest ? {
        ...approvalMsg.sessionRequest,
        status: 'paid',
      } : undefined,
    };
    mockMessages.push(confirmMessage);
    persistMockData();
    setMessages([...mockMessages]);
    toast.success('Payment successful — session confirmed!');
  };

  const handleBack = () => {
    navigate(`${isTherapistMode ? '/t' : '/c'}/messages`);
  };

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  // Mobile: show thread fullscreen when a user is selected, otherwise show list
  if (isMobile && selectedUser) {
    return (
      <Layout
        userType={isTherapistMode ? "therapist" : "client"}
        userName={currentUser.name}
        userAvatar={currentUser.avatar}
        showNavigation={false}
      >
        <div className="h-[100dvh] flex flex-col bg-background">
          <MessageThread
            messages={messagesWithConnectionMsg}
            currentUserId={currentUser.id}
            otherUser={selectedUser}
            onSendMessage={handleSendMessage}
            onBack={handleBack}
            isMobile
            connectionStatus={selectedConnectionStatus}
            onAcceptConnection={handleAcceptConnection}
            onUserClick={isTherapistMode ? () => navigate(isSelectedUserPeerTherapist ? `/t/therapist/${selectedUser.id}` : `/t/clients/${selectedUser.id}`) : undefined}
            isTherapistMode={isTherapistMode}
            onSendBookmark={isTherapistMode ? handleSendBookmark : undefined}
            bookmarks={isTherapistMode ? currentBookmarks : undefined}
            onAddBookmark={isTherapistMode ? handleAddBookmark : undefined}
            onDeleteBookmark={isTherapistMode ? handleDeleteBookmark : undefined}
            onApproveSession={isTherapistMode ? handleApproveSession : undefined}
            onDeclineSession={isTherapistMode ? handleDeclineSession : undefined}
            onPaySession={!isTherapistMode ? handlePaySession : undefined}
          />
        </div>
      </Layout>
    );
  }

  // Mobile: conversations list only
  if (isMobile) {
    return (
      <Layout
        userType={isTherapistMode ? "therapist" : "client"}
        userName={currentUser.name}
        userAvatar={currentUser.avatar}
      >
        <div className="flex flex-col h-[calc(100dvh-64px)]">
          {/* Header */}
          <div className="px-4 pt-4 pb-2">
            <h1 className="text-xl font-semibold">Messages</h1>
          </div>
          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full bg-muted border-0"
              />
            </div>
          </div>
          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? 'No conversations found' : 'No messages yet'}
                </p>
              </div>
            ) : (
              <div>
                {filteredConversations.map(({ user, lastMessage, unreadCount }) => (
                  <button
                    key={user.id}
                    onClick={() => navigate(`${isTherapistMode ? '/t' : '/c'}/messages/${user.id}`)}
                    className="w-full px-4 py-3 hover:bg-muted active:bg-muted/80 transition-colors text-left"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {unreadCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-medium">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p className={`font-medium truncate text-sm ${unreadCount > 0 ? 'font-semibold' : ''}`}>
                            {user.name}
                          </p>
                          {lastMessage && (
                            <span className={`text-xs whitespace-nowrap ml-2 ${unreadCount > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                              {formatLastMessageTime(lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        {lastMessage && (
                          <p className={`text-sm truncate ${unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                            {lastMessage.bookmark && !lastMessage.content
                              ? `Shared: ${lastMessage.bookmark.title}`
                              : lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Desktop view — side-by-side
  return (
    <Layout
      userType={isTherapistMode ? "therapist" : "client"}
      userName={currentUser.name}
      userAvatar={currentUser.avatar}
    >
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        <div className="grid grid-cols-3 gap-4 h-full">
          {/* Conversations List */}
          <Card className="col-span-1 flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <p className="text-muted-foreground text-sm">
                    {searchQuery ? 'No conversations found' : 'No messages yet'}
                  </p>
                </div>
              ) : (
                <div>
                  {filteredConversations.map(({ user, lastMessage, unreadCount }) => (
                    <button
                      key={user.id}
                      onClick={() => navigate(`${isTherapistMode ? '/t' : '/c'}/messages/${user.id}`)}
                      className={`w-full p-4 border-b hover:bg-muted transition-colors text-left ${
                        userId === user.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium truncate">{user.name}</p>
                            {lastMessage && (
                              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                {formatLastMessageTime(lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          {lastMessage && (
                            <p className="text-sm text-muted-foreground truncate">
                              {lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                              {lastMessage.bookmark && !lastMessage.content
                                ? `Shared: ${lastMessage.bookmark.title}`
                                : lastMessage.content}
                            </p>
                          )}
                          {unreadCount > 0 && (
                            <div className="mt-1">
                              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                {unreadCount} new
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Message Thread */}
          <Card className="col-span-2 h-full">
            {selectedUser ? (
              <MessageThread
                messages={messagesWithConnectionMsg}
                currentUserId={currentUser.id}
                otherUser={selectedUser}
                onSendMessage={handleSendMessage}
                onAcceptConnection={handleAcceptConnection}
                connectionStatus={selectedConnectionStatus}
                onUserClick={isTherapistMode ? () => navigate(isSelectedUserPeerTherapist ? `/t/therapist/${selectedUser.id}` : `/t/clients/${selectedUser.id}`) : undefined}
                isTherapistMode={isTherapistMode}
                onSendBookmark={isTherapistMode ? handleSendBookmark : undefined}
                bookmarks={isTherapistMode ? currentBookmarks : undefined}
                onAddBookmark={isTherapistMode ? handleAddBookmark : undefined}
                onDeleteBookmark={isTherapistMode ? handleDeleteBookmark : undefined}
                onApproveSession={isTherapistMode ? handleApproveSession : undefined}
                onDeclineSession={isTherapistMode ? handleDeclineSession : undefined}
                onPaySession={!isTherapistMode ? handlePaySession : undefined}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}