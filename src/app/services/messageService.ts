// ============================================================
// Message Service
// ============================================================
// GET    /messages?userId1&userId2   → list messages between two users
// GET    /messages/conversations/:id → list unique conversations for a user
// POST   /messages                   → send a message
// PUT    /messages/read              → mark messages as read
// DELETE /messages/:id               → delete a message
// ============================================================

import type { ApiResponse, PaginatedResponse } from './apiClient';
import { success, created, deleted, notFound, paginated, delay, uid } from './apiClient';
import type {
  SendMessageRequest,
  ListMessagesParams,
  MarkMessagesReadRequest,
} from './types';
import {
  mockMessages,
  type Message,
} from '../data/mockData';

// ---- Conversation summary (used by Messages page sidebar) -------------------

export interface ConversationSummary {
  contactId: string;
  lastMessage: Message;
  unreadCount: number;
}

export async function listConversations(
  userId: string,
): Promise<ApiResponse<ConversationSummary[]>> {
  await delay();

  const userMessages = mockMessages.filter(
    m => m.senderId === userId || m.receiverId === userId,
  );

  // Group by contact
  const contactMap = new Map<string, Message[]>();
  for (const m of userMessages) {
    const contactId = m.senderId === userId ? m.receiverId : m.senderId;
    if (!contactMap.has(contactId)) contactMap.set(contactId, []);
    contactMap.get(contactId)!.push(m);
  }

  const summaries: ConversationSummary[] = [];
  for (const [contactId, msgs] of contactMap) {
    msgs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const unreadCount = msgs.filter(m => m.senderId === contactId && !m.read).length;
    summaries.push({ contactId, lastMessage: msgs[0], unreadCount });
  }

  summaries.sort((a, b) => b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime());

  return success(summaries);
}

// ---- GET messages between two users -----------------------------------------

export async function listMessages(
  params: ListMessagesParams,
): Promise<PaginatedResponse<Message>> {
  await delay();

  const results = mockMessages
    .filter(
      m =>
        (m.senderId === params.userId1 && m.receiverId === params.userId2) ||
        (m.senderId === params.userId2 && m.receiverId === params.userId1),
    )
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const total = results.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 100;
  const start = (page - 1) * pageSize;
  const slice = results.slice(start, start + pageSize);

  return paginated(slice, total, page, pageSize);
}

// ---- POST send message ------------------------------------------------------

export async function sendMessage(
  data: SendMessageRequest,
): Promise<ApiResponse<Message>> {
  await delay();
  const message: Message = {
    id: uid('m'),
    senderId: data.senderId,
    receiverId: data.receiverId,
    content: data.content,
    timestamp: new Date(),
    read: false,
  };
  mockMessages.push(message);
  return created(message);
}

// ---- PUT mark as read -------------------------------------------------------

export async function markMessagesRead(
  data: MarkMessagesReadRequest,
): Promise<ApiResponse<number>> {
  await delay();
  let count = 0;
  for (const id of data.messageIds) {
    const msg = mockMessages.find(m => m.id === id);
    if (msg && !msg.read) {
      msg.read = true;
      count++;
    }
  }
  return success(count);
}

// ---- DELETE message ---------------------------------------------------------

export async function deleteMessage(
  id: string,
): Promise<ApiResponse<null>> {
  await delay();
  const idx = mockMessages.findIndex(m => m.id === id);
  if (idx === -1) return notFound('Message');
  mockMessages.splice(idx, 1);
  return deleted();
}
