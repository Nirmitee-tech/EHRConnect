'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PanelLeft, PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SidebarToggle() {
  const [hideSidebar, setHideSidebar] = useState(false);
  const { status } = useSession();

  // Don't show toggle if not authenticated (no sidebar exists)
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (hideSidebar) {
      document.body.classList.add('hide-sidebar');
    } else {
      document.body.classList.remove('hide-sidebar');
    }
    return () => {
      document.body.classList.remove('hide-sidebar');
    };
  }, [hideSidebar]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setHideSidebar(!hideSidebar)}
      className="h-6 px-1.5 text-xs"
      title={hideSidebar ? 'Show sidebar' : 'Hide sidebar'}
    >
      {hideSidebar ? (
        <PanelLeft className="h-3 w-3" />
      ) : (
        <PanelLeftClose className="h-3 w-3" />
      )}
    </Button>
  );
}
