'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Building2, TrendingUp, Users } from 'lucide-react';
import { useFacility } from '@/contexts/facility-context';
import { useResourceCounts } from '@/hooks/use-resource-counts';
import { NAVIGATION_SECTIONS } from '@/config/navigation.config';
import { NavItem } from './nav-item';
import { cn } from '@/lib/utils';

const Logo = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <div className="flex items-center space-x-2">
    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
      <div className="w-4 h-4 bg-white rounded" />
    </div>
    {!isCollapsed && (
      <div>
        <h2 className="text-base font-bold text-gray-900">
          EHR Connect
        </h2>
        <p className="text-[9px] text-gray-500 font-medium tracking-wide">HEALTHCARE SYSTEM</p>
      </div>
    )}
  </div>
);

const FacilityInfo = ({ facilityName, patientCount, staffCount }: { 
  facilityName: string; 
  patientCount: number; 
  staffCount: number; 
}) => (
  <div className="mx-3 mb-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
    <div className="flex items-center space-x-2 mb-2">
      <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
        <Building2 className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xs font-semibold text-gray-900 truncate">{facilityName}</h3>
        <p className="text-[9px] text-gray-500">Active Facility</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-white rounded-lg p-2 border border-gray-200">
        <div className="flex items-center gap-1 mb-0.5">
          <Users className="h-3 w-3 text-primary" />
          <span className="text-[9px] text-gray-600">Patients</span>
        </div>
        <p className="text-base font-bold text-primary">
          {patientCount}
        </p>
      </div>
      <div className="bg-white rounded-lg p-2 border border-gray-200">
        <div className="flex items-center gap-1 mb-0.5">
          <TrendingUp className="h-3 w-3 text-purple-600" />
          <span className="text-[9px] text-gray-600">Staff</span>
        </div>
        <p className="text-base font-bold text-purple-600">
          {staffCount}
        </p>
      </div>
    </div>
  </div>
);

const Footer = () => (
  <div className="p-3 mx-3 mb-2 bg-gray-50 rounded-lg border border-gray-200">
    <div className="flex items-center justify-center gap-2 mb-1">
      <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
      <p className="text-[9px] text-gray-600 font-semibold tracking-wide">SYSTEM ONLINE</p>
    </div>
    <p className="text-[9px] text-gray-500 text-center">
      FHIR R4 • Version 1.0.0
    </p>
  </div>
);

export function HealthcareSidebar() {
  const pathname = usePathname();
  const { currentFacility } = useFacility();
  const { patients, staff } = useResourceCounts(currentFacility?.id);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string): boolean => 
    pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));

  const getItemCount = (href: string): number | undefined => {
    if (href === '/patients') return patients;
    if (href === '/staff') return staff;
    return undefined;
  };

  return (
    <aside 
      className={cn(
        'bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className={cn('p-3 border-b border-gray-200', isCollapsed ? 'px-2' : 'px-3')}>
        <div className="flex items-center justify-between">
          <Logo isCollapsed={isCollapsed} />
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="pt-3">
          <FacilityInfo
            facilityName={currentFacility?.name || 'Healthcare Clinic'}
            patientCount={patients}
            staffCount={staff}
          />
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-4">
          {NAVIGATION_SECTIONS.map((section, index) => (
            <div key={index}>
              {section.title && !isCollapsed && (
                <h3 className="px-2 mb-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
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
