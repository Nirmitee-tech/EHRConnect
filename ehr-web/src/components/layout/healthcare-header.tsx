'use client';

import React from 'react';
import { Search, Plus, HelpCircle, Zap, Calculator, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

const getPageInfo = (pathname: string) => {
  // Remove leading slash and split by forward slash
  const pathSegments = pathname.replace(/^\//, '').split('/');
  
  const pageMap: Record<string, { title: string; actionButton?: { label: string; href?: string } }> = {
    'dashboard': { title: 'Dashboard' },
    'patients': { 
      title: 'Patients', 
      actionButton: { label: 'Add Patient', href: '/patients/new' }
    },
    'staff': { 
      title: 'Staff List', 
      actionButton: { label: 'Add Doctor' }
    },
    'treatments': { title: 'Treatments' },
    'reservations': { title: 'Reservations' },
    'accounts': { title: 'Accounts' },
    'sales': { title: 'Sales' },
    'purchases': { title: 'Purchases' },
    'payment-methods': { title: 'Payment Methods' },
    'stocks': { title: 'Stocks' },
    'peripherals': { title: 'Peripherals' },
    'reports': { title: 'Reports' },
    'support': { title: 'Customer Support' },
    'admin': { title: 'Administration' }
  };

  // Handle nested routes
  if (pathSegments[0] === 'patients') {
    if (pathSegments[1] === 'new') {
      return { title: 'Add New Patient', actionButton: undefined };
    } else if (pathSegments[1] && pathSegments[2] === 'edit') {
      return { title: 'Edit Patient', actionButton: undefined };
    } else if (pathSegments[1] && !pathSegments[2]) {
      return { title: 'Patient Details', actionButton: { label: 'Edit Patient' } };
    }
  }

  if (pathSegments[0] === 'admin' && pathSegments[1]) {
    const adminPages: Record<string, string> = {
      'facilities': 'Facilities Management',
      'users': 'User Management'
    };
    return { title: adminPages[pathSegments[1]] || 'Administration', actionButton: undefined };
  }

  // Default to the first segment
  const firstSegment = pathSegments[0] || 'dashboard';
  return pageMap[firstSegment] || { title: 'Dashboard' };
};

export function HealthcareHeader() {
  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Page Title and Breadcrumb */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-500">
            <span className="text-sm">←</span>
            <span className="ml-2 text-lg font-semibold text-gray-900">{pageInfo.title}</span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for anything here..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section - Actions and User */}
        <div className="flex items-center space-x-3">
          {/* Dynamic Action Button */}
          {pageInfo.actionButton && (
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg px-4 py-2 flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-4 w-4" />
              <span>{pageInfo.actionButton.label}</span>
            </Button>
          )}

          {/* Action Icons */}
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
              <Zap className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
              <Calculator className="h-5 w-5" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            1/4
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">Dr. John Stewart</div>
                <div className="text-gray-500 text-xs">Super Admin</div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
