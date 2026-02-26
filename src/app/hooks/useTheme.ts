import React from "react";
import { mockThemeSettings } from "../data/mockData";
import type { ThemeSettings } from "../data/mockData";

/**
 * Get the active color for a given key, respecting dark mode.
 * If darkMode is on, returns the dark variant; otherwise returns the light variant.
 */
export function getActiveColor(
  key: 'primaryColor' | 'supervisionColor' | 'workshopColor' | 'videoColor' | 'inPersonColor' | 'textColor' | 'phoneCallColor' | 'accentColor' | 'successColor' | 'warningColor' | 'errorColor',
  themeSettings: ThemeSettings
): string {
  if (themeSettings.darkMode) {
    const darkKey = `dark${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof ThemeSettings;
    return (themeSettings[darkKey] as string) || (themeSettings[key] as string) || '#3b82f6';
  }
  return (themeSettings[key] as string) || '#3b82f6';
}

/**
 * Apply theme colors to CSS custom properties
 */
export function applyThemeColors(themeSettings: ThemeSettings): void {
  const root = document.documentElement;
  
  // Apply dark mode
  if (themeSettings.darkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Resolve active colors based on mode
  const primary = getActiveColor('primaryColor', themeSettings);
  const supervision = getActiveColor('supervisionColor', themeSettings);
  const workshop = getActiveColor('workshopColor', themeSettings);
  const video = getActiveColor('videoColor', themeSettings);
  const inPerson = getActiveColor('inPersonColor', themeSettings);
  const text = getActiveColor('textColor', themeSettings);
  const phoneCall = getActiveColor('phoneCallColor', themeSettings);
  const accent = getActiveColor('accentColor', themeSettings);
  const success = getActiveColor('successColor', themeSettings);
  const warning = getActiveColor('warningColor', themeSettings);
  const error = getActiveColor('errorColor', themeSettings);
  
  // Apply primary color directly as hex
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--primary-foreground', '#ffffff');
  root.style.setProperty('--sidebar-primary', primary);
  root.style.setProperty('--ring', primary);
  
  // Apply custom theme colors as CSS variables (hex format for direct use)
  root.style.setProperty('--theme-supervision', supervision);
  root.style.setProperty('--theme-workshop', workshop);
  root.style.setProperty('--theme-video', video);
  root.style.setProperty('--theme-in-person', inPerson);
  root.style.setProperty('--theme-text', text);
  root.style.setProperty('--theme-phone-call', phoneCall);
  root.style.setProperty('--theme-accent', accent);
  root.style.setProperty('--theme-success', success);
  root.style.setProperty('--theme-warning', warning);
  root.style.setProperty('--theme-error', error);
}

/**
 * Get the color for a specific session modality
 */
export function getModalityColor(modality: "video" | "inPerson" | "text" | "phoneCall", themeSettings?: ThemeSettings): string {
  const theme = themeSettings || mockThemeSettings;
  
  switch (modality) {
    case "video":
      return getActiveColor('videoColor', theme);
    case "inPerson":
      return getActiveColor('inPersonColor', theme);
    case "text":
      return getActiveColor('textColor', theme);
    case "phoneCall":
      return getActiveColor('phoneCallColor', theme);
    default:
      return getActiveColor('primaryColor', theme);
  }
}

/**
 * Hook to get current theme settings and apply them
 */
export function useTheme() {
  const [themeSettings] = React.useState<ThemeSettings>(() => {
    // Use the already-hydrated global mockThemeSettings
    return { ...mockThemeSettings };
  });

  React.useEffect(() => {
    // Apply theme on mount
    applyThemeColors(mockThemeSettings);
  }, []);

  return {
    themeSettings,
    applyThemeColors: () => applyThemeColors(mockThemeSettings),
    getModalityColor: (modality: "video" | "inPerson" | "text" | "phoneCall") => 
      getModalityColor(modality, mockThemeSettings),
    getActiveColor: (key: 'primaryColor' | 'supervisionColor' | 'workshopColor' | 'videoColor' | 'inPersonColor' | 'textColor' | 'phoneCallColor' | 'accentColor' | 'successColor' | 'warningColor' | 'errorColor') =>
      getActiveColor(key, mockThemeSettings),
  };
}