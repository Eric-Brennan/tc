// ============================================================
// Auth Service
// ============================================================
// POST   /auth/login              -> authenticate user
// POST   /auth/register           -> register new user
// POST   /auth/logout             -> log out (invalidate token)
// GET    /auth/me                 -> get current authenticated user
// POST   /auth/refresh            -> refresh auth token
// POST   /auth/forgot-password    -> request password reset email
// POST   /auth/reset-password     -> reset password with token
// ============================================================

import type { ApiResponse } from './apiClient';
import { success, delay } from './apiClient';
import type { LoginRequest, RegisterRequest, AuthResponse } from './types';
import {
  mockCurrentClient,
  mockCurrentTherapist,
} from '../../data/mockData';

// Mock user accounts for demo
const MOCK_ACCOUNTS = [
  {
    email: mockCurrentClient.email,
    password: 'password',
    user: {
      id: mockCurrentClient.id,
      name: mockCurrentClient.name,
      email: mockCurrentClient.email,
      avatar: mockCurrentClient.avatar,
      type: 'client' as const,
    },
  },
  {
    email: mockCurrentTherapist.email,
    password: 'password',
    user: {
      id: mockCurrentTherapist.id,
      name: mockCurrentTherapist.name,
      email: mockCurrentTherapist.email,
      avatar: mockCurrentTherapist.avatar,
      type: 'therapist' as const,
    },
  },
];

// ---- POST login -------------------------------------------------------------

export async function login(
  data: LoginRequest,
): Promise<ApiResponse<AuthResponse | null>> {
  await delay();
  const account = MOCK_ACCOUNTS.find(
    a => a.email.toLowerCase() === data.email.toLowerCase() && a.password === data.password,
  );
  if (!account) {
    return { data: null, error: 'Invalid email or password', status: 401 };
  }
  return success({ ...account.user, token: 'mock-jwt-token' });
}

// ---- POST register ----------------------------------------------------------

export async function register(
  data: RegisterRequest,
): Promise<ApiResponse<AuthResponse | null>> {
  await delay();
  const exists = MOCK_ACCOUNTS.find(
    a => a.email.toLowerCase() === data.email.toLowerCase(),
  );
  if (exists) {
    return { data: null, error: 'Email already registered', status: 409 };
  }
  // In production this creates the user in the database
  const newUser: AuthResponse = {
    id: `${data.type[0]}${Date.now()}`,
    name: data.name,
    email: data.email,
    avatar: '',
    type: data.type,
    token: 'mock-jwt-token',
  };
  return success(newUser);
}

// ---- POST logout ------------------------------------------------------------

export async function logout(): Promise<ApiResponse<null>> {
  await delay();
  // In production: invalidate token / clear session server-side
  return success(null);
}

// ---- GET current user -------------------------------------------------------

export async function getCurrentUser(): Promise<ApiResponse<AuthResponse | null>> {
  await delay();
  // In production: validate JWT and return user from DB
  // Mock: return null (caller should check localStorage / auth context)
  return { data: null, error: 'Not authenticated', status: 401 };
}

// ---- POST refresh token -----------------------------------------------------

export async function refreshToken(): Promise<ApiResponse<{ token: string } | null>> {
  await delay();
  // In production: validate refresh token and issue new JWT
  return success({ token: 'mock-refreshed-jwt-token' });
}

// ---- POST forgot password ---------------------------------------------------

export async function forgotPassword(
  email: string,
): Promise<ApiResponse<{ message: string }>> {
  await delay();
  // In production: send password reset email
  return success({ message: `Password reset email sent to ${email}` });
}

// ---- POST reset password ----------------------------------------------------

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<ApiResponse<{ message: string } | null>> {
  await delay();
  // In production: validate reset token and update password
  if (!token || !newPassword) {
    return { data: null, error: 'Invalid token or password', status: 400 };
  }
  return success({ message: 'Password has been reset successfully' });
}
