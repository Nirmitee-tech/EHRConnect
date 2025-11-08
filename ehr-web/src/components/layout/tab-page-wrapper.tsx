'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTabs } from '@/contexts/tab-context';

interface TabPageWrapperProps {
  title: string;
  icon?: React.ReactNode;
  closeable?: boolean;
  children: React.ReactNode;
}

/**
 * Wrapper component that automatically registers the current page as a tab
 * Use this in your page components to enable tab functionality
 */
export function TabPageWrapper({
  title,
  icon,
  closeable = true,
  children,
}: TabPageWrapperProps) {
  const pathname = usePathname() || '/';
  const { addTab, tabs, activeTabId } = useTabs();

  useEffect(() => {
    // Only add tab if it doesn't exist or isn't already active with this path
    const existingTab = tabs.find((t) => t.path === pathname);
    const isAlreadyActive = existingTab && existingTab.id === activeTabId;

    if (!isAlreadyActive) {
      addTab({
        title,
        path: pathname,
        icon,
        closeable,
      });
    }
  }, [pathname]); // Only run when pathname changes

  return <>{children}</>;
}
