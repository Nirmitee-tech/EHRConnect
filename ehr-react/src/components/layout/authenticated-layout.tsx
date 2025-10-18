'use client';

import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/ui/loading-state';
import { HealthcareSidebar } from './healthcare-sidebar';
import { HealthcareHeader } from './healthcare-header';
import { UserProfile } from './user-profile';
import { TabProvider } from '@/contexts/tab-context';
import { TabBar } from './tab-bar';

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  // Routes that should not show the sidebar
  const noSidebarRoutes = ['/onboarding', '/register', '/accept-invitation'];
  const shouldShowSidebar = !noSidebarRoutes.some(route => pathname?.startsWith(route));

  // Show loading state
  if (isLoading) {
    return <LoadingState message="Loading..." />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
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
          <main className="flex-1 overflow-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </TabProvider>
  );
}
