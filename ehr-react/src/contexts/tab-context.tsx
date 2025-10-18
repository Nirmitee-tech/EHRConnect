'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useTransition } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface Tab {
  id: string;
  title: string;
  path: string;
  icon?: React.ReactNode;
  closeable?: boolean;
}

interface TabContextType {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab: Omit<Tab, 'id'> & { id?: string }) => string;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (tabId: string) => void;
  reorderTabs: (startIndex: number, endIndex: number) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

const STORAGE_KEY = 'ehr_tabs_state';
const MAX_TABS = 15;

export function TabProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPending, startTransition] = useTransition();
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();

  // Load tabs from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTabs(parsed.tabs || []);
        setActiveTabId(parsed.activeTabId || null);
      }
    } catch (error) {
      console.error('Failed to load tabs from storage:', error);
    }
    setIsInitialized(true);
  }, []);

  // Save tabs to sessionStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      try {
        // Remove icons before saving to avoid serialization issues
        const tabsToSave = tabs.map(({ icon, ...rest }) => rest);
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ tabs: tabsToSave, activeTabId })
        );
      } catch (error) {
        console.error('Failed to save tabs to storage:', error);
      }
    }
  }, [tabs, activeTabId, isInitialized]);

  // Generate unique tab ID
  const generateTabId = useCallback(() => {
    return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add a new tab
  const addTab = useCallback(
    (tab: Omit<Tab, 'id'> & { id?: string }): string => {
      const tabId = tab.id || generateTabId();

      console.log('[Tab Context] addTab called:', { path: tab.path, title: tab.title });

      // Check if tab with same path already exists
      const existingTab = tabs.find((t) => t.path === tab.path);
      if (existingTab) {
        console.log('[Tab Context] Existing tab found, activating:', existingTab.id);
        // Only navigate if this tab is not already active
        if (existingTab.id !== activeTabId) {
          setActiveTabId(existingTab.id);
          // Use Next.js router with startTransition for instant navigation
          startTransition(() => {
            navigate(existingTab.path);
          });
        }
        return existingTab.id;
      }

      console.log('[Tab Context] Creating new tab');

      // Enforce max tabs limit
      if (tabs.length >= MAX_TABS) {
        // Remove oldest closeable tab
        const closeableIndex = tabs.findIndex((t) => t.closeable !== false);
        if (closeableIndex !== -1) {
          setTabs((prev) => prev.filter((_, i) => i !== closeableIndex));
        } else {
          console.warn('Maximum tab limit reached');
          return tabs[0].id;
        }
      }

      const newTab: Tab = {
        id: tabId,
        title: tab.title,
        path: tab.path,
        icon: tab.icon,
        closeable: tab.closeable !== false,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(tabId);

      // Use Next.js router with startTransition for instant navigation
      startTransition(() => {
        navigate(tab.path);
      });

      return tabId;
    },
    [tabs, generateTabId, navigate, startTransition]
  );

  // Remove a tab
  const removeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        const filtered = prev.filter((t) => t.id !== tabId);

        // If removing active tab, activate the next or previous tab
        if (tabId === activeTabId && filtered.length > 0) {
          const removedIndex = prev.findIndex((t) => t.id === tabId);
          const nextTab = filtered[Math.min(removedIndex, filtered.length - 1)];
          setActiveTabId(nextTab.id);
          startTransition(() => {
            navigate(nextTab.path);
          });
        } else if (filtered.length === 0) {
          setActiveTabId(null);
        }

        return filtered;
      });
    },
    [activeTabId, navigate, startTransition]
  );

  // Set active tab
  const setActiveTab = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (tab) {
        setActiveTabId(tabId);
        startTransition(() => {
          navigate(tab.path);
        });
      }
    },
    [tabs, navigate, startTransition]
  );

  // Update tab properties
  const updateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId ? { ...tab, ...updates } : tab
      )
    );
  }, []);

  // Close tab (same as remove, but with better naming)
  const closeTab = useCallback(
    (tabId: string) => {
      removeTab(tabId);
    },
    [removeTab]
  );

  // Close all tabs
  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
  }, []);

  // Close other tabs
  const closeOtherTabs = useCallback((tabId: string) => {
    setTabs((prev) => {
      const keepTab = prev.find((t) => t.id === tabId);
      return keepTab ? [keepTab] : prev;
    });
    setActiveTabId(tabId);
  }, []);

  // Reorder tabs (for drag and drop)
  const reorderTabs = useCallback((startIndex: number, endIndex: number) => {
    setTabs((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const matchingTab = tabs.find((t) => t.path === currentPath);
      if (matchingTab) {
        setActiveTabId(matchingTab.id);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [tabs]);

  // Sync current pathname with active tab on route change
  useEffect(() => {
    if (!isInitialized) return;

    const currentTab = tabs.find((t) => t.path === pathname);
    if (currentTab && currentTab.id !== activeTabId) {
      setActiveTabId(currentTab.id);
    }
  }, [pathname, tabs, activeTabId, isInitialized]);

  const value: TabContextType = {
    tabs,
    activeTabId,
    addTab,
    removeTab,
    setActiveTab,
    updateTab,
    closeTab,
    closeAllTabs,
    closeOtherTabs,
    reorderTabs,
  };

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}

export function useTabs() {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabProvider');
  }
  return context;
}
