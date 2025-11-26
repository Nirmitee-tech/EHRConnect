'use client';

import { HMSRoomProvider } from '@100mslive/react-sdk';
import { useEffect } from 'react';

export default function MeetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hide the main layout sidebar when in meeting pages
  useEffect(() => {
    // Hide the sidebar and adjust main content
    const sidebar = document.querySelector('[data-sidebar]');
    const mainContent = document.querySelector('main');

    if (sidebar) {
      (sidebar as HTMLElement).style.display = 'none';
    }
    if (mainContent) {
      (mainContent as HTMLElement).style.marginLeft = '0';
      (mainContent as HTMLElement).style.width = '100%';
    }

    // Cleanup: restore on unmount
    return () => {
      if (sidebar) {
        (sidebar as HTMLElement).style.display = '';
      }
      if (mainContent) {
        (mainContent as HTMLElement).style.marginLeft = '';
        (mainContent as HTMLElement).style.width = '';
      }
    };
  }, []);

  return (
    <HMSRoomProvider>
      <div className="fixed inset-0 bg-white z-50">
        {children}
      </div>
    </HMSRoomProvider>
  );
}
