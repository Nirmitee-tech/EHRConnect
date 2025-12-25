'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useFacility } from '@/contexts/facility-context';
import { useResourceCounts } from '@/hooks/use-resource-counts';
import { useTheme } from '@/contexts/theme-context';
import { NAVIGATION_SECTIONS } from '@/config/navigation.config';
import { NavItem, toNavTranslationKey } from './nav-item';
import { cn } from '@/lib/utils';
import { useUIPreferences } from '@/contexts/ui-preferences-context';
import { useTranslation } from '@/i18n/client';

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
        <h2
          className="text-sm font-bold truncate leading-tight transition-colors"
          style={{ color: 'var(--theme-sidebar-contrast)' }}
        >
          {orgName}
        </h2>
        <p
          className="text-[10px] font-medium tracking-wide truncate opacity-70 uppercase transition-colors"
          style={{ color: 'var(--theme-sidebar-contrast)' }}
        >
          {locationName}
        </p>
      </div>
    )}
  </div>
);

const Footer = () => {
  const { t } = useTranslation('common');
  return (
    <div
      className="p-3 mx-3 mb-2 rounded-lg border transition-all"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
        <p className="text-[9px] font-semibold tracking-wide" style={{ color: 'var(--theme-sidebar-contrast)', opacity: 0.7 }}>{t('nav.system_online')}</p>
      </div>
      <p className="text-[9px] text-center" style={{ color: 'var(--theme-sidebar-contrast)', opacity: 0.5 }}>
        FHIR R4 • Version 1.0.0
      </p>
    </div>
  );
};

export function HealthcareSidebar() {
  const { t } = useTranslation('common');
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
  const locationName = currentLocation?.name || t('nav.default_location');

  const isActive = (href: string): boolean =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  const getItemCount = (href: string): number | undefined => {
    if (href === '/patients') return patients;
    if (href === '/staff') return staff;
    return undefined;
  };

  // Filter navigation sections based on search query
  const filteredSections = searchQuery
    ? NAVIGATION_SECTIONS.map(section => {
      const sectionItems = section.items.filter(item => {
        const translatedName = t(toNavTranslationKey(item.name), { defaultValue: item.name });
        return translatedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
      return { ...section, items: sectionItems };
    }).filter(section => section.items.length > 0)
    : NAVIGATION_SECTIONS;

  return (
    <aside
      className={cn(
        'flex flex-col h-full transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-52'
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
            className="p-1.5 rounded-lg border transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
            aria-label={isCollapsed ? t('nav.expand_sidebar') : t('nav.collapse_sidebar')}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" style={{ color: 'var(--theme-sidebar-contrast)' }} />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" style={{ color: 'var(--theme-sidebar-contrast)' }} />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4" style={{ color: 'var(--theme-sidebar-contrast)', opacity: 0.5 }} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-lg border py-2 pl-10 pr-3 text-sm placeholder-opacity-50 transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'var(--theme-sidebar-contrast)',
                  color: 'var(--theme-sidebar-contrast)',
                  // opacity check for placeholder
                }}
                placeholder={t('nav.search_menu')}
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
                <h3
                  className="px-2 mb-1.5 text-[9px] font-bold uppercase tracking-wider opacity-50"
                  style={{ color: 'var(--theme-sidebar-contrast)' }}
                >
                  {t(`nav.${section.title.toLowerCase().replace(/\s*&\s*/g, '_').replace(/\s+/g, '_')}_section`, {
                    defaultValue: section.title
                  })}
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
                    subItems={item.subItems}
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
