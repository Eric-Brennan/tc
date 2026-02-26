// ============================================================
// Backward-compat re-export — use './shared/messageService' directly
// ============================================================
export type { ConversationSummary } from './shared/messageService';
export {
  listConversations,
  listMessages,
  sendMessage,
  markMessagesRead,
  deleteMessage,
} from './shared/messageService';
