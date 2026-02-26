import React from "react";
import { mockCurrentTherapist } from "../data/mockData";

interface ProfileModeContextType {
  /** True when a therapist is browsing the platform as a client */
  isClientMode: boolean;
  /** Toggle client mode on/off */
  toggleClientMode: () => void;
  /** Enter client mode */
  enterClientMode: () => void;
  /** Exit client mode (back to therapist) */
  exitClientMode: () => void;
  /** When in client mode, the therapist's name/avatar to display */
  clientModeUser: { name: string; avatar: string } | null;
}

/* Safe defaults so useProfileMode never throws, even outside provider */
const defaultProfileMode: ProfileModeContextType = {
  isClientMode: false,
  toggleClientMode: () => {},
  enterClientMode: () => {},
  exitClientMode: () => {},
  clientModeUser: null,
};

export const ProfileModeContext =
  React.createContext<ProfileModeContextType>(defaultProfileMode);

const STORAGE_KEY = "besthelp_client_mode";

export function ProfileModeProvider({ children }: { children: React.ReactNode }) {
  const [isClientMode, setIsClientMode] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isClientMode));
    } catch {
      // ignore
    }
  }, [isClientMode]);

  const toggleClientMode = React.useCallback(() => {
    setIsClientMode(prev => !prev);
  }, []);

  const enterClientMode = React.useCallback(() => {
    setIsClientMode(true);
  }, []);

  const exitClientMode = React.useCallback(() => {
    setIsClientMode(false);
  }, []);

  const clientModeUser = React.useMemo(() => {
    if (!isClientMode) return null;
    return {
      name: mockCurrentTherapist.name,
      avatar: mockCurrentTherapist.avatar,
    };
  }, [isClientMode]);

  const value = React.useMemo(
    () => ({
      isClientMode,
      toggleClientMode,
      enterClientMode,
      exitClientMode,
      clientModeUser,
    }),
    [isClientMode, toggleClientMode, enterClientMode, exitClientMode, clientModeUser]
  );

  return (
    <ProfileModeContext.Provider value={value}>
      {children}
    </ProfileModeContext.Provider>
  );
}

export function useProfileMode(): ProfileModeContextType {
  const ctx = React.useContext(ProfileModeContext);
  return ctx;
}
