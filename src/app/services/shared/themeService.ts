// ============================================================
// Theme / Settings Service
// ============================================================
// GET    /settings/theme          -> get current theme settings
// PUT    /settings/theme          -> update theme settings
// POST   /settings/theme/reset    -> reset theme to defaults
// ============================================================

import type { ApiResponse } from './apiClient';
import { success, delay } from './apiClient';
import type { UpdateThemeSettingsRequest } from './types';
import { mockThemeSettings } from '../../data/mockData';
import type { ThemeSettings } from '../../../types';

// ---- GET theme settings -----------------------------------------------------

export async function getThemeSettings(): Promise<ApiResponse<ThemeSettings>> {
  await delay();
  return success({ ...mockThemeSettings });
}

// ---- PUT update theme settings ----------------------------------------------

export async function updateThemeSettings(
  data: UpdateThemeSettingsRequest,
): Promise<ApiResponse<ThemeSettings>> {
  await delay();
  Object.assign(mockThemeSettings, data);
  return success({ ...mockThemeSettings });
}

// ---- POST reset theme to defaults -------------------------------------------

export async function resetThemeSettings(): Promise<ApiResponse<ThemeSettings>> {
  await delay();
  const defaults: ThemeSettings = {
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
  Object.assign(mockThemeSettings, defaults);
  return success({ ...mockThemeSettings });
}
