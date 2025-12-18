'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getContrastColor } from '@/lib/utils';

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  sidebarBackgroundColor: string;
  sidebarTextColor: string;
  sidebarActiveColor: string;
  sidebarActiveTextColor?: string | null;
  primaryTextColor?: string | null;
  accentColor: string;
  fontFamily: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  orgNameOverride?: string | null;
}

interface ThemeContextType {
  themeSettings: ThemeSettings;
  updateTheme: (settings: Partial<ThemeSettings>) => Promise<void>;
  resetTheme: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#4A90E2',
  secondaryColor: '#9B59B6',
  sidebarBackgroundColor: '#0F1E56',
  sidebarTextColor: '#B0B7D0',
  sidebarActiveColor: '#3342A5',
  accentColor: '#10B981',
  fontFamily: 'Inter, sans-serif',
  logoUrl: null,
  faviconUrl: null,
  orgNameOverride: null
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch theme settings on mount
  useEffect(() => {
    const fetchThemeSettings = async () => {
      // Use org_id from the root session object as defined in types/next-auth.d.ts
      if (!session?.org_id) {
        setIsLoading(false);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('API URL not configured');
        }

        const response = await fetch(
          `${apiUrl}/api/orgs/${session.org_id}/theme`,
          {
            headers: {
              'x-user-id': session.user?.id || '',
              'x-org-id': session.org_id,
              'x-user-roles': JSON.stringify(session.roles || []),
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setThemeSettings(data.themeSettings);
          applyThemeToDOM(data.themeSettings);
        } else {
          const statusText = response.status === 404 ? 'Organization not found' :
            response.status === 403 ? 'Access denied' :
              `Server error (${response.status})`;
          console.error(`Failed to fetch theme settings: ${statusText}`);
          applyThemeToDOM(defaultTheme);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error fetching theme settings:', errorMessage);
        setError(`Failed to load theme settings: ${errorMessage}`);
        applyThemeToDOM(defaultTheme);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThemeSettings();
  }, [session]);

  // Apply theme to DOM as CSS variables
  const applyThemeToDOM = (theme: ThemeSettings) => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primaryColor);
    root.style.setProperty('--theme-secondary', theme.secondaryColor);
    root.style.setProperty('--theme-sidebar-bg', theme.sidebarBackgroundColor);
    root.style.setProperty('--theme-sidebar-text', theme.sidebarTextColor);
    root.style.setProperty('--theme-sidebar-active', theme.sidebarActiveColor);
    root.style.setProperty('--theme-accent', theme.accentColor);
    root.style.setProperty('--theme-font-family', theme.fontFamily);

    // Dynamic Contrast Intelligence
    const primaryContrast = theme.primaryTextColor || (getContrastColor(theme.primaryColor) === 'white' ? '#FFFFFF' : '#000000');
    const sidebarContrast = theme.sidebarTextColor || (getContrastColor(theme.sidebarBackgroundColor) === 'white' ? '#FFFFFF' : '#000000');
    const sidebarActiveContrast = theme.sidebarActiveTextColor || (getContrastColor(theme.sidebarActiveColor) === 'white' ? '#FFFFFF' : '#000000');

    root.style.setProperty('--theme-primary-contrast', primaryContrast);
    root.style.setProperty('--theme-sidebar-contrast', sidebarContrast);
    root.style.setProperty('--theme-sidebar-active-contrast', sidebarActiveContrast);

    // Also update the primary color used by UI components
    root.style.setProperty('--primary', theme.primaryColor);
    root.style.setProperty('--primary-foreground', primaryContrast);
    root.style.setProperty('--sidebar-primary', theme.primaryColor);
    root.style.setProperty('--sidebar-primary-foreground', sidebarActiveContrast);
    root.style.setProperty('--sidebar-foreground', sidebarContrast);
  };

  // Update theme settings
  const updateTheme = async (settings: Partial<ThemeSettings>) => {
    // Check if session is loaded
    if (!session) {
      const errorMessage = 'Session not loaded. Please wait or refresh the page.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    if (!session.org_id) {
      const errorMessage = 'No organization context found. Please ensure you are logged in.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    setError(null);
    const newTheme = { ...themeSettings, ...settings };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      const response = await fetch(
        `${apiUrl}/api/orgs/${session.org_id}/theme`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': session.user?.id || '',
            'x-org-id': session.org_id,
            'x-user-roles': JSON.stringify(session.roles || []),
          },
          body: JSON.stringify(settings)
        }
      );

      if (response.ok) {
        const data = await response.json();
        setThemeSettings(data.themeSettings);
        applyThemeToDOM(data.themeSettings);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update theme');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update theme';
      setError(errorMessage);
      throw err;
    }
  };

  // Reset to default theme
  const resetTheme = async () => {
    await updateTheme(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{ themeSettings, updateTheme, resetTheme, isLoading, error }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { defaultTheme };
