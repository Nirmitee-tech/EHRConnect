'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFacility } from '@/contexts/facility-context';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Stethoscope, 
  UserCheck,
  CreditCard,
  TrendingUp,
  ShoppingCart,
  Banknote,
  Package,
  Cpu,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  count?: number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export function HealthcareSidebar() {
  const pathname = usePathname();
  const { currentFacility } = useFacility();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [patientCount, setPatientCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);

  // Load counts from API
  useEffect(() => {
    const loadCounts = async () => {
      try {
        // Load patient count
        const patientResponse = await fetch('/api/fhir/Patient?_count=1');
        if (patientResponse.ok) {
          const patientBundle = await patientResponse.json();
          setPatientCount(patientBundle.total || 0);
        }

        // Load staff count (practitioners)
        const staffResponse = await fetch('/api/fhir/Practitioner?_count=1');
        if (staffResponse.ok) {
          const staffBundle = await staffResponse.json();
          setStaffCount(staffBundle.total || 0);
        }
      } catch (error) {
        console.error('Failed to load counts:', error);
      }
    };

    loadCounts();
  }, [currentFacility]);

  const navigationSections: NavSection[] = [
    {
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'CLINIC',
      items: [
        { name: 'Reservations', href: '/reservations', icon: Calendar },
        { name: 'Patients', href: '/patients', icon: Users, count: patientCount },
        { name: 'Treatments', href: '/treatments', icon: Stethoscope },
        { name: 'Staff List', href: '/staff', icon: UserCheck, count: staffCount }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { name: 'Accounts', href: '/accounts', icon: CreditCard },
        { name: 'Sales', href: '/sales', icon: TrendingUp },
        { name: 'Purchases', href: '/purchases', icon: ShoppingCart },
        { name: 'Payment Method', href: '/payment-methods', icon: Banknote }
      ]
    },
    {
      title: 'PHYSICAL ASSET',
      items: [
        { name: 'Stocks', href: '/stocks', icon: Package },
        { name: 'Peripherals', href: '/peripherals', icon: Cpu }
      ]
    },
    {
      items: [
        { name: 'Report', href: '/reports', icon: FileText },
        { name: 'Customer Support', href: '/support', icon: HelpCircle }
      ]
    }
  ];

  const isActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 shadow-sm`}>
      {/* Logo and Brand */}
      <div className={`p-4 border-b border-gray-100 ${isCollapsed ? 'px-3' : 'px-6'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            {!isCollapsed && (
              <div className="text-xl font-bold text-gray-900">EHR Connect</div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Facility Info */}
      {!isCollapsed && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-2 mb-1">
            <Building2 className="h-4 w-4 text-blue-600" />
            <div className="text-sm font-semibold text-gray-900">
              {currentFacility?.name || 'Healthcare Clinic'}
            </div>
          </div>
          <div className="text-xs text-gray-600 flex items-center space-x-4">
            <span>Patients: {patientCount}</span>
            <span>Staff: {staffCount}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <div className="space-y-6">
          {navigationSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && !isCollapsed && (
                <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative
                        ${active 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={`
                        ${isCollapsed ? 'h-5 w-5' : 'mr-3 h-5 w-5'} flex-shrink-0 transition-colors
                        ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}
                      `} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.name}</span>
                          {item.count !== undefined && item.count > 0 && (
                            <span className={`
                              text-xs px-2 py-1 rounded-full font-semibold
                              ${active 
                                ? 'bg-white/20 text-white' 
                                : 'bg-blue-100 text-blue-700'
                              }
                            `}>
                              {item.count}
                            </span>
                          )}
                          {item.badge && (
                            <span className={`
                              text-xs px-2 py-1 rounded-full font-semibold
                              ${active 
                                ? 'bg-white/20 text-white' 
                                : 'bg-blue-100 text-blue-700'
                              }
                            `}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                          {item.name}
                          {item.count !== undefined && ` (${item.count})`}
                          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"></div>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            FHIR R4 Compliant • v1.0.0
          </div>
        </div>
      )}
    </div>
  );
}
