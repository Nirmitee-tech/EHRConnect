'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  sidebarBackgroundColor: string;
  sidebarTextColor: string;
  sidebarActiveColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl: string | null;
  faviconUrl: string | null;
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
  faviconUrl: null
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
      if (!session?.user?.orgId) {
        setIsLoading(false);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('API URL not configured');
        }

        const response = await fetch(
          `${apiUrl}/api/orgs/${session.user.orgId}/theme`,
          {
            headers: {
              'x-user-id': session.user.id,
              'x-org-id': session.user.orgId,
              'x-user-roles': JSON.stringify(session.user.roles || []),
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
  };

  // Update theme settings
  const updateTheme = async (settings: Partial<ThemeSettings>) => {
    if (!session?.user?.orgId) {
      throw new Error('No organization context');
    }

    setError(null);
    const newTheme = { ...themeSettings, ...settings };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      const response = await fetch(
        `${apiUrl}/api/orgs/${session.user.orgId}/theme`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': session.user.id,
            'x-org-id': session.user.orgId,
            'x-user-roles': JSON.stringify(session.user.roles || []),
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
