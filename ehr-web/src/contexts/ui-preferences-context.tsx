'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UIPreferencesContextType {
  hideHeaderOnDetailPages: boolean;
  setHideHeaderOnDetailPages: (value: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
}

const UIPreferencesContext = createContext<UIPreferencesContextType | undefined>(undefined);

export function UIPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [hideHeaderOnDetailPages, setHideHeaderOnDetailPages] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedHeader = localStorage.getItem('hideHeaderOnDetailPages');
    if (savedHeader !== null) {
      setHideHeaderOnDetailPages(JSON.parse(savedHeader));
    }

    const savedSidebar = localStorage.getItem('sidebarCollapsed');
    if (savedSidebar !== null) {
      setSidebarCollapsed(JSON.parse(savedSidebar));
    }
  }, []);

  // Save header preference to localStorage when it changes
  const updateHeaderPreference = (value: boolean) => {
    setHideHeaderOnDetailPages(value);
    localStorage.setItem('hideHeaderOnDetailPages', JSON.stringify(value));
  };

  // Save sidebar preference to localStorage when it changes
  const updateSidebarPreference = (value: boolean) => {
    setSidebarCollapsed(value);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(value));
  };

  return (
    <UIPreferencesContext.Provider
      value={{
        hideHeaderOnDetailPages,
        setHideHeaderOnDetailPages: updateHeaderPreference,
        sidebarCollapsed,
        setSidebarCollapsed: updateSidebarPreference,
      }}
    >
      {children}
    </UIPreferencesContext.Provider>
  );
}

export function useUIPreferences() {
  const context = useContext(UIPreferencesContext);
  if (context === undefined) {
    throw new Error('useUIPreferences must be used within a UIPreferencesProvider');
  }
  return context;
}
