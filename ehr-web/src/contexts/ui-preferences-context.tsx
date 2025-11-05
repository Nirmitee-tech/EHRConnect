'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UIPreferencesContextType {
  hideHeaderOnDetailPages: boolean;
  setHideHeaderOnDetailPages: (value: boolean) => void;
}

const UIPreferencesContext = createContext<UIPreferencesContextType | undefined>(undefined);

export function UIPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [hideHeaderOnDetailPages, setHideHeaderOnDetailPages] = useState(true);

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hideHeaderOnDetailPages');
    if (saved !== null) {
      setHideHeaderOnDetailPages(JSON.parse(saved));
    }
  }, []);

  // Save preference to localStorage when it changes
  const updatePreference = (value: boolean) => {
    setHideHeaderOnDetailPages(value);
    localStorage.setItem('hideHeaderOnDetailPages', JSON.stringify(value));
  };

  return (
    <UIPreferencesContext.Provider
      value={{
        hideHeaderOnDetailPages,
        setHideHeaderOnDetailPages: updatePreference,
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
