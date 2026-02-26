import React from "react";
import { mockCurrentClient, mockCurrentTherapist } from "../data/mockData";
import type { User, UserType } from "../data/mockData";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: UserType;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string, type: UserType) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

const STORAGE_KEY = "besthelp_auth";

// Mock user accounts for demo login
const MOCK_ACCOUNTS: { email: string; password: string; user: AuthUser }[] = [
  {
    email: mockCurrentClient.email,
    password: "password",
    user: {
      id: mockCurrentClient.id,
      name: mockCurrentClient.name,
      email: mockCurrentClient.email,
      avatar: mockCurrentClient.avatar,
      type: "client",
    },
  },
  {
    email: mockCurrentTherapist.email,
    password: "password",
    user: {
      id: mockCurrentTherapist.id,
      name: mockCurrentTherapist.name,
      email: mockCurrentTherapist.email,
      avatar: mockCurrentTherapist.avatar,
      type: "therapist",
    },
  },
];

function loadAuth(): { isAuthenticated: boolean; user: AuthUser | null } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.isAuthenticated && parsed?.user) {
        return { isAuthenticated: true, user: parsed.user };
      }
    }
  } catch {}
  return { isAuthenticated: false, user: null };
}

function saveAuth(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ isAuthenticated: true, user }));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState(loadAuth);

  const login = React.useCallback((email: string, _password: string): { success: boolean; error?: string } => {
    const account = MOCK_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase()
    );
    if (!account) {
      return { success: false, error: "No account found with that email" };
    }
    // In a mock app, accept any non-empty password
    if (!_password) {
      return { success: false, error: "Please enter a password" };
    }
    saveAuth(account.user);
    setState({ isAuthenticated: true, user: account.user });
    return { success: true };
  }, []);

  const register = React.useCallback(
    (name: string, email: string, _password: string, type: UserType): { success: boolean; error?: string } => {
      if (!name.trim()) return { success: false, error: "Please enter your name" };
      if (!email.trim()) return { success: false, error: "Please enter your email" };
      if (!_password) return { success: false, error: "Please enter a password" };
      if (_password.length < 6) return { success: false, error: "Password must be at least 6 characters" };

      // Check if email already exists
      const exists = MOCK_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === email.toLowerCase()
      );
      if (exists) {
        return { success: false, error: "An account with that email already exists" };
      }

      // Create mock user — route to the appropriate demo persona
      const mockUser = type === "therapist" ? mockCurrentTherapist : mockCurrentClient;
      const newUser: AuthUser = {
        id: mockUser.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar: mockUser.avatar,
        type,
      };

      // Add to mock accounts so login works afterwards
      MOCK_ACCOUNTS.push({ email: newUser.email, password: _password, user: newUser });
      saveAuth(newUser);
      setState({ isAuthenticated: true, user: newUser });
      return { success: true };
    },
    []
  );

  const logout = React.useCallback(() => {
    saveAuth(null);
    setState({ isAuthenticated: false, user: null });
  }, []);

  const value = React.useMemo(
    () => ({ ...state, login, register, logout }),
    [state, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
