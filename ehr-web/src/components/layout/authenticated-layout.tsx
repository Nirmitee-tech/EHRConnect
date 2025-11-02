'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { LoadingState } from '@nirmitee.io/design-system';
import { HealthcareSidebar } from './healthcare-sidebar';
import { HealthcareHeader } from './healthcare-header';
import { UserProfile } from './user-profile';
import { TabProvider } from '@/contexts/tab-context';
import { TabBar } from './tab-bar';
import { cn } from '@/lib/utils';
import { NotificationProvider } from '@/contexts/notification-context';

const MAIN_CONTENT_PADDING = {
  default: 'p-6',
  overrides: [
    { prefix: '/appointments', padding: 'p-0' },
    { prefix: '/apga', padding: 'p-0' },
    { prefix: '/feature', padding: 'p-0' },
    { prefix: '/reports', padding: 'p-0' },
    { prefix: '/patients/', padding: 'p-0' }
  ]
} as const;

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Routes that should not show the sidebar
  const noSidebarRoutes = ['/onboarding', '/register', '/accept-invitation', '/widget', '/patient-login', '/patient-register', '/portal', '/meeting'];
  const shouldShowSidebar = !noSidebarRoutes.some(route => pathname?.startsWith(route));
  const mainContentPaddingClass =
    MAIN_CONTENT_PADDING.overrides.find(({ prefix }) => pathname?.startsWith(prefix))?.padding ??
    MAIN_CONTENT_PADDING.default;

  // Show loading state
  if (status === 'loading') {
    // For routes that should have no layout (widget, patient pages, meetings), show minimal loading
    if (pathname?.startsWith('/widget') || pathname?.startsWith('/patient-login') || pathname?.startsWith('/patient-register') || pathname?.startsWith('/meeting')) {
      return <>{children}</>;
    }
    return <LoadingState message="Loading..." />;
  }

  // Show login screen if not authenticated
  if (status === 'unauthenticated' || !session) {
    // For routes that should have no layout (widget, patient pages, meetings), render without any header/layout
    if (pathname?.startsWith('/widget') || pathname?.startsWith('/patient-login') || pathname?.startsWith('/patient-register') || pathname?.startsWith('/meeting')) {
      return <>{children}</>;
    }

    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex flex-col">
          {/* Simple header with just logo and login button */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">EHR Connect</h1>
                  <p className="text-xs text-gray-500">Healthcare Management System</p>
                </div>
              </div>
              <UserProfile />
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Show full layout WITHOUT sidebar for onboarding and similar pages
  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  // Show full layout WITH sidebar when authenticated
  return (
    <NotificationProvider>
      <TabProvider>
        <div className="flex h-screen bg-gray-50">
          {/* Sidebar */}
          <HealthcareSidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <HealthcareHeader />

            {/* Tab Bar */}
            <TabBar />

            {/* Main Content */}
            <main className={cn('flex-1 overflow-auto bg-gray-50', mainContentPaddingClass)}>
              {children}
            </main>
          </div>
        </div>
      </TabProvider>
    </NotificationProvider>
  );
}
