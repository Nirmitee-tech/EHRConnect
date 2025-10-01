'use client';

import { Plus, HelpCircle, Zap, Calculator, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getPageInfo } from '@/config/navigation.config';
import { SearchBar } from './search-bar';
import { UserProfile } from './user-profile';

const ActionIcons = () => (
  <div className="flex items-center space-x-1">
    {[
      { Icon: Bell, badge: true },
      { Icon: HelpCircle, badge: false },
      { Icon: Zap, badge: false },
      { Icon: Calculator, badge: false }
    ].map(({ Icon, badge }, index) => (
      <button
        key={index}
        className="relative p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Icon className="h-4 w-4" />
        {badge && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white" />
        )}
      </button>
    ))}
  </div>
);

const StatusBadge = () => (
  <div className="bg-[#10B981] text-white px-3 py-1 rounded-md text-xs font-medium">
    <span className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
      1/4 Active
    </span>
  </div>
);

export function HealthcareHeader() {
  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">
              {pageInfo.title}
            </h1>
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

          <div className="flex items-center gap-2">
            {pageInfo.actionButton && (
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="font-medium">{pageInfo.actionButton.label}</span>
              </Button>
            )}

            <ActionIcons />
            <StatusBadge />
            <UserProfile />
          </div>
        </div>
      </div>
    </header>
  );
}
