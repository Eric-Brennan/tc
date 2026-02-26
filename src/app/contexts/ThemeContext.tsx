import React from "react";
import { mockThemeSettings } from "../data/mockData";
import type { ThemeSettings } from "../data/mockData";
import { persistThemeSettings } from "../data/devPersistence";
import { applyThemeColors, getActiveColor } from "../hooks/useTheme";

// Theme Actions
type ThemeAction =
  | { type: "SET_THEME"; payload: ThemeSettings }
  | { type: "UPDATE_COLOR"; payload: { key: keyof ThemeSettings; value: string | boolean } }
  | { type: "TOGGLE_DARK_MODE" }
  | { type: "RESET_THEME" };

// Theme Context Type
interface ThemeContextType {
  themeSettings: ThemeSettings;
  dispatch: React.Dispatch<ThemeAction>;
  updateColor: (key: keyof ThemeSettings, value: string | boolean) => void;
  toggleDarkMode: () => void;
  toggleAndSaveDarkMode: () => void;
  resetTheme: () => void;
  saveTheme: () => void;
}

// Default theme values
const defaultTheme: ThemeSettings = {
  primaryColor: '#3b82f6',
  supervisionColor: '#ec4899',
  workshopColor: '#f97316',
  videoColor: '#8b5cf6',
  inPersonColor: '#10b981',
  textColor: '#06b6d4',
  phoneCallColor: '#f59e0b',
  accentColor: '#06b6d4',
  successColor: '#10b981',
  warningColor: '#f59e0b',
  errorColor: '#ef4444',
  darkPrimaryColor: '#60a5fa',
  darkSupervisionColor: '#f472b6',
  darkWorkshopColor: '#fb923c',
  darkVideoColor: '#a78bfa',
  darkInPersonColor: '#34d399',
  darkTextColor: '#22d3ee',
  darkPhoneCallColor: '#fbbf24',
  darkAccentColor: '#22d3ee',
  darkSuccessColor: '#34d399',
  darkWarningColor: '#fbbf24',
  darkErrorColor: '#f87171',
  darkMode: false,
};

/* Safe defaults so useThemeContext never throws, even outside provider */
const defaultThemeContext: ThemeContextType = {
  themeSettings: { ...defaultTheme },
  dispatch: () => {},
  updateColor: () => {},
  toggleDarkMode: () => {},
  toggleAndSaveDarkMode: () => {},
  resetTheme: () => {},
  saveTheme: () => {},
};

export const ThemeContext =
  React.createContext<ThemeContextType>(defaultThemeContext);

// Theme Reducer
function themeReducer(state: ThemeSettings, action: ThemeAction): ThemeSettings {
  switch (action.type) {
    case "SET_THEME":
      return { ...action.payload };
    case "UPDATE_COLOR":
      return { ...state, [action.payload.key]: action.payload.value };
    case "TOGGLE_DARK_MODE":
      return { ...state, darkMode: !state.darkMode };
    case "RESET_THEME":
      return { ...defaultTheme };
    default:
      return state;
  }
}

// Theme Provider Component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeSettings, dispatch] = React.useReducer(
    themeReducer,
    { ...mockThemeSettings }
  );

  // Apply theme whenever it changes
  React.useEffect(() => {
    applyThemeColors(themeSettings);
  }, [themeSettings]);

  const updateColor = React.useCallback((key: keyof ThemeSettings, value: string | boolean) => {
    dispatch({ type: "UPDATE_COLOR", payload: { key, value } });
  }, []);

  const toggleDarkMode = React.useCallback(() => {
    dispatch({ type: "TOGGLE_DARK_MODE" });
  }, []);

  const toggleAndSaveDarkMode = React.useCallback(() => {
    const newSettings = { ...themeSettings, darkMode: !themeSettings.darkMode };
    dispatch({ type: "SET_THEME", payload: newSettings });
    Object.assign(mockThemeSettings, newSettings);
    persistThemeSettings(newSettings);
    applyThemeColors(newSettings);
  }, [themeSettings]);

  const resetTheme = React.useCallback(() => {
    dispatch({ type: "RESET_THEME" });
  }, []);

  const saveTheme = React.useCallback(() => {
    Object.assign(mockThemeSettings, themeSettings);
    persistThemeSettings(themeSettings);
    applyThemeColors(themeSettings);
  }, [themeSettings]);

  const value = React.useMemo(
    () => ({
      themeSettings,
      dispatch,
      updateColor,
      toggleDarkMode,
      toggleAndSaveDarkMode,
      resetTheme,
      saveTheme,
    }),
    [themeSettings, updateColor, toggleDarkMode, toggleAndSaveDarkMode, resetTheme, saveTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Custom hook to use theme context
export function useThemeContext(): ThemeContextType {
  const ctx = React.useContext(ThemeContext);
  return ctx;
}

// Utility function to get modality color
export function getModalityColor(
  modality: "video" | "inPerson" | "text" | "phoneCall",
  themeSettings: ThemeSettings
): string {
  switch (modality) {
    case "video":
      return getActiveColor('videoColor', themeSettings);
    case "inPerson":
      return getActiveColor('inPersonColor', themeSettings);
    case "text":
      return getActiveColor('textColor', themeSettings);
    case "phoneCall":
      return getActiveColor('phoneCallColor', themeSettings);
    default:
      return getActiveColor('primaryColor', themeSettings);
  }
}
