import { mockThemeSettings } from "../data/mockData";
import { getActiveColor } from "../hooks/useTheme";

/**
 * Get CSS class name for supervision session styling
 */
export function getSupervisionSessionClasses(isToday: boolean): {
  cardClass: string;
  badgeClass: string;
  todayBadgeClass: string;
} {
  const color = getActiveColor('supervisionColor', mockThemeSettings);
  const textClass = getContrastTextColor(color) === '#000000' ? 'text-black' : 'text-white';
  return {
    cardClass: `cursor-pointer hover:shadow-md transition-shadow ${isToday ? "ring-2" : ""}`,
    badgeClass: textClass,
    todayBadgeClass: `text-xs ${textClass} px-2 py-0.5 rounded-full`,
  };
}

/**
 * Get inline styles for supervision sessions
 */
export function getSupervisionStyles(isToday: boolean) {
  const color = getActiveColor('supervisionColor', mockThemeSettings);
  return {
    card: {
      borderColor: `${color}33`, // 20% opacity
      backgroundColor: `${color}08`, // 3% opacity
      ...(isToday && { borderColor: color, borderWidth: '2px' }),
    },
    badge: {
      backgroundColor: color,
    },
    icon: {
      color: color,
    },
    ring: {
      boxShadow: `0 0 0 2px ${color}`,
    },
  };
}

/**
 * Get modality color from theme settings (mode-aware)
 */
export function getModalityColorFromTheme(modality: "video" | "inPerson" | "text" | "phoneCall"): string {
  switch (modality) {
    case "video":
      return getActiveColor('videoColor', mockThemeSettings);
    case "inPerson":
      return getActiveColor('inPersonColor', mockThemeSettings);
    case "text":
      return getActiveColor('textColor', mockThemeSettings);
    case "phoneCall":
      return getActiveColor('phoneCallColor', mockThemeSettings);
    default:
      return getActiveColor('primaryColor', mockThemeSettings);
  }
}

/**
 * Get inline styles for session cards based on modality
 */
export function getSessionModalityStyles(modality: "video" | "inPerson" | "text" | "phoneCall", isToday: boolean) {
  const color = getModalityColorFromTheme(modality);
  return {
    card: {
      borderColor: isToday ? color : `${color}33`,
      backgroundColor: `${color}08`,
      ...(isToday && { borderWidth: '2px' }),
    },
    icon: {
      color: color,
    },
    badge: {
      backgroundColor: color,
      color: getContrastTextColor(color),
    },
  };
}

/**
 * Helper to create semi-transparent color with opacity
 * @param color - Hex color string (e.g., '#3b82f6')
 * @param opacity - Opacity value from 0-100 (e.g., 20 for 20%)
 */
export function withOpacity(color: string, opacity: number): string {
  const opacityHex = Math.round((opacity / 100) * 255).toString(16).padStart(2, '0');
  return `${color}${opacityHex}`;
}

/**
 * Returns '#000000' or '#ffffff' depending on which has better contrast
 * against the given hex background color (using WCAG relative luminance).
 */
export function getContrastTextColor(hexColor: string): string {
  if (!hexColor) return '#ffffff';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // sRGB to linear
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  return luminance > 0.179 ? '#000000' : '#ffffff';
}