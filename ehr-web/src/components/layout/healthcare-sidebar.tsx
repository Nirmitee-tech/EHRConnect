'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Building2, TrendingUp, Users, Search } from 'lucide-react';
import { useFacility } from '@/contexts/facility-context';
import { useResourceCounts } from '@/hooks/use-resource-counts';
import { useTheme } from '@/contexts/theme-context';
import { NAVIGATION_SECTIONS } from '@/config/navigation.config';
import { NavItem } from './nav-item';
import { cn } from '@/lib/utils';
import { useUIPreferences } from '@/contexts/ui-preferences-context';

import { useLocation } from '@/contexts/location-context';

const Logo = ({ isCollapsed, logoUrl, primaryColor, orgName, locationName }: {
  isCollapsed: boolean;
  logoUrl: string | null;
  primaryColor: string;
  orgName: string;
  locationName: string;
}) => (
  <div className="flex items-center space-x-2">
    {logoUrl ? (
      <div className="w-8 h-8 flex items-center justify-center">
        <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
      </div>
    ) : (
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
        <div className="w-4 h-4 bg-white rounded" />
      </div>
    )}
    {!isCollapsed && (
      <div className="min-w-0">
        <h2 className="text-sm font-bold text-white truncate leading-tight">
          {orgName}
        </h2>
        <p className="text-[10px] font-medium tracking-wide truncate opacity-80 uppercase" style={{ color: 'var(--theme-sidebar-text)' }}>
          {locationName}
        </p>
      </div>
    )}
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
  const { currentLocation } = useLocation();
  const { patients, staff } = useResourceCounts(currentFacility?.id);
  const { sidebarCollapsed, setSidebarCollapsed } = useUIPreferences();
  const { themeSettings } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Use the context state for collapsed
  const isCollapsed = sidebarCollapsed;

  const orgName = themeSettings.orgNameOverride || currentFacility?.name || 'EHR Connect';
  const locationName = currentLocation?.name || 'Healthcare System';

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
        'flex flex-col h-full transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
      style={{
        backgroundColor: themeSettings.sidebarBackgroundColor,
        color: themeSettings.sidebarTextColor,
        fontFamily: themeSettings.fontFamily
      }}
    >
      <div className={cn('p-3 border-b', isCollapsed ? 'px-2' : 'px-3')} style={{ borderColor: 'rgba(30, 42, 112, 0.3)' }}>
        <div className="flex items-center justify-between">
          <Logo
            isCollapsed={isCollapsed}
            logoUrl={themeSettings.logoUrl}
            primaryColor={themeSettings.primaryColor}
            orgName={orgName}
            locationName={locationName}
          />
          <button
            onClick={() => setSidebarCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5 text-white/80" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5 text-white/80" />
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
