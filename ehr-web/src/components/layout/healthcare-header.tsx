'use client';

import { Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getPageInfo } from '@/config/navigation.config';
import { SearchBar } from './search-bar';
import { UserProfile } from './user-profile';
import { NotificationBell } from './notification-bell';
import { FacilitySwitcher } from '../facility-switcher';
import { useUIPreferences } from '@/contexts/ui-preferences-context';
import { LocationSwitcher } from '../location-switcher';

// Routes where the entire header/navbar should be hidden
const HIDE_HEADER_ROUTES = [
  {
    pattern: /^\/patients\/[^/]+$/,  // /patients/[id] - patient details page
    exclude: ['/patients/new']        // but not /patients/new
  },
  {
    pattern: /^\/forms\/builder/,     // /forms/builder - form builder page
    exclude: []
  },
  // Add more routes here as needed:
  // {
  //   pattern: /^\/staff\/[^/]+$/,   // /staff/[id] - staff details page
  //   exclude: ['/staff/new']
  // },
  // {
  //   pattern: /^\/appointments\/[^/]+$/,  // /appointments/[id] - appointment details page
  //   exclude: ['/appointments/new']
  // },
];

export function HealthcareHeader() {
  const pathname = usePathname() || '/';
  const pageInfo = getPageInfo(pathname);
  const { hideHeaderOnDetailPages } = useUIPreferences();

  // Check if current route should hide the entire header
  const isDetailPage = pathname && HIDE_HEADER_ROUTES.some(route => {
    const matchesPattern = route.pattern.test(pathname);
    const isExcluded = route.exclude?.some(exclusion => pathname.includes(exclusion));
    return matchesPattern && !isExcluded;
  });

  // Hide entire header for specified routes only if the preference is enabled
  if (isDetailPage && hideHeaderOnDetailPages) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-gray-900">
            <h1 className="text-lg font-semibold">{pageInfo.title}</h1>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>

          <div className="flex items-center gap-3">
            <div id="header-actions-root" className="flex items-center gap-2" />

            {pageInfo.actionButton && (
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="font-medium">{pageInfo.actionButton.label}</span>
              </Button>
            )}

            <LocationSwitcher />
            <FacilitySwitcher />
            <NotificationBell />
            <UserProfile />
          </div>
        </div>
      </div>
    </header>
  );
}
