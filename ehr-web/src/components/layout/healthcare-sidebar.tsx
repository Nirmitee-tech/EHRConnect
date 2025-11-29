'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Building2, TrendingUp, Users, Search } from 'lucide-react';
import { useFacility } from '@/contexts/facility-context';
import { useResourceCounts } from '@/hooks/use-resource-counts';
import { NAVIGATION_SECTIONS } from '@/config/navigation.config';
import { NavItem } from './nav-item';
import { cn } from '@/lib/utils';
import { useUIPreferences } from '@/contexts/ui-preferences-context';

const Logo = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <div className="flex items-center space-x-2">
    <div className="w-8 h-8 bg-[#4A90E2] rounded-lg flex items-center justify-center">
      <div className="w-4 h-4 bg-white rounded" />
    </div>
    {!isCollapsed && (
      <div>
        <h2 className="text-base font-bold text-white">
          EHR Connect
        </h2>
        <p className="text-[9px] text-[#B0B7D0] font-medium tracking-wide">HEALTHCARE SYSTEM</p>
      </div>
    )}
  </div>
);

const FacilityInfo = ({ facilityName, patientCount, staffCount }: {
  facilityName: string;
  patientCount: number;
  staffCount: number;
}) => (
  <div className="mx-3 mb-3 p-3 rounded-lg bg-[#1E2A70]/30 border border-[#1E2A70]">
    <div className="flex items-center space-x-2 mb-2">
      <div className="w-7 h-7 bg-[#4A90E2] rounded-lg flex items-center justify-center">
        <Building2 className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xs font-semibold text-white truncate">{facilityName}</h3>
        <p className="text-[9px] text-[#B0B7D0]">Active Facility</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-[#1E2A70]/50 rounded-lg p-2 border border-[#1E2A70]">
        <div className="flex items-center gap-1 mb-0.5">
          <Users className="h-3 w-3 text-[#4A90E2]" />
          <span className="text-[9px] text-[#B0B7D0]">Patients</span>
        </div>
        <p className="text-base font-bold text-white">
          {patientCount}
        </p>
      </div>
      <div className="bg-[#1E2A70]/50 rounded-lg p-2 border border-[#1E2A70]">
        <div className="flex items-center gap-1 mb-0.5">
          <TrendingUp className="h-3 w-3 text-[#9B59B6]" />
          <span className="text-[9px] text-[#B0B7D0]">Staff</span>
        </div>
        <p className="text-base font-bold text-white">
          {staffCount}
        </p>
      </div>
    </div>
  </div>
);

const Footer = () => (
  <div className="p-3 mx-3 mb-2 bg-[#1E2A70]/30 rounded-lg border border-[#1E2A70]">
    <div className="flex items-center justify-center gap-2 mb-1">
      <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
      <p className="text-[9px] text-[#B0B7D0] font-semibold tracking-wide">SYSTEM ONLINE</p>
    </div>
    <p className="text-[9px] text-[#B0B7D0]/70 text-center">
      FHIR R4 • Version 1.0.0
    </p>
  </div>
);

export function HealthcareSidebar() {
  const pathname = usePathname() || '';
  const { currentFacility } = useFacility();
  const { patients, staff } = useResourceCounts(currentFacility?.id);
  const { sidebarCollapsed, setSidebarCollapsed } = useUIPreferences();
  const [searchQuery, setSearchQuery] = useState('');

  // Use the context state for collapsed
  const isCollapsed = sidebarCollapsed;

  const isActive = (href: string): boolean =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  const getItemCount = (href: string): number | undefined => {
    if (href === '/patients') return patients;
    if (href === '/staff') return staff;
    return undefined;
  };

  // Filter navigation sections based on search query
  const filteredSections = searchQuery
    ? NAVIGATION_SECTIONS.map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(section => section.items.length > 0)
    : NAVIGATION_SECTIONS;

  return (
    <aside
      className={cn(
        'bg-[#0F1E56] flex flex-col h-full transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className={cn('p-3 border-b border-[#1E2A70]/30', isCollapsed ? 'px-2' : 'px-3')}>
        <div className="flex items-center justify-between">
          <Logo isCollapsed={isCollapsed} />
          <button
            onClick={() => setSidebarCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg border border-[#1E2A70] bg-[#1E2A70] hover:bg-[#3342A5] transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5 text-[#B0B7D0]" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5 text-[#B0B7D0]" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-[#B0B7D0]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-lg border border-[#1E2A70] bg-[#1E2A70]/50 py-2 pl-10 pr-3 text-sm text-white placeholder-[#B0B7D0] focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2] transition-colors duration-200"
                placeholder="Search menu..."
              />
            </div>
          </div>
          <div className="pb-3">
            {/* <FacilityInfo
              facilityName={currentFacility?.name || 'Healthcare Clinic'}
              patientCount={patients}
              staffCount={staff}
            /> */}
          </div>
        </>
      )}

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-4">
          {filteredSections.map((section, index) => (
            <div key={index}>
              {section.title && !isCollapsed && (
                <h3 className="px-2 mb-1.5 text-[9px] font-bold text-[#B0B7D0] uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                    isActive={isActive(item.href)}
                    isCollapsed={isCollapsed}
                    count={getItemCount(item.href)}
                    children={item.children}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {!isCollapsed && <Footer />}
    </aside>
  );
}
