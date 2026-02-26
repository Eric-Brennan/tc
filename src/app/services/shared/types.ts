// ============================================================
// Shared API Request / Response DTOs
// ============================================================
// Types used by services that both client and therapist consume.
// ============================================================

import type { PaginationParams } from './apiClient';

// ---- Auth -------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  type: 'client' | 'therapist';
}

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: 'client' | 'therapist';
  token?: string; // JWT token from backend
}

// ---- Connections ------------------------------------------------------------

export interface CreateConnectionRequest {
  clientId: string;
  therapistId: string;
  message?: string;
}

export interface UpdateConnectionRequest {
  status: 'accepted' | 'rejected';
}

export interface ListConnectionsParams extends PaginationParams {
  userId: string;
  status?: 'pending' | 'accepted' | 'rejected';
}

// ---- Messages ---------------------------------------------------------------

export interface SendMessageRequest {
  senderId: string;
  receiverId: string;
  content: string;
  bookmark?: { title: string; url: string };
}

export interface ListMessagesParams extends PaginationParams {
  userId1: string;
  userId2: string;
}

export interface MarkMessagesReadRequest {
  messageIds: string[];
}

// ---- Video Sessions ---------------------------------------------------------

export interface CreateVideoSessionRequest {
  therapistId: string;
  clientId: string;
  scheduledTime: Date;
  duration: number;
  sessionRateId?: string;
  modality?: 'video' | 'inPerson' | 'text' | 'phoneCall';
  price?: number;
}

export interface UpdateVideoSessionRequest {
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledTime?: Date;
  duration?: number;
  azureRoomId?: string;
  isPaid?: boolean;
}

export interface ListVideoSessionsParams extends PaginationParams {
  therapistId?: string;
  clientId?: string;
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  from?: Date;
  to?: Date;
}

// ---- Theme / Settings -------------------------------------------------------

export interface UpdateThemeSettingsRequest {
  primaryColor?: string;
  supervisionColor?: string;
  workshopColor?: string;
  videoColor?: string;
  inPersonColor?: string;
  textColor?: string;
  phoneCallColor?: string;
  accentColor?: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  darkPrimaryColor?: string;
  darkSupervisionColor?: string;
  darkWorkshopColor?: string;
  darkVideoColor?: string;
  darkInPersonColor?: string;
  darkTextColor?: string;
  darkPhoneCallColor?: string;
  darkAccentColor?: string;
  darkSuccessColor?: string;
  darkWarningColor?: string;
  darkErrorColor?: string;
  darkMode?: boolean;
}
