'use client';

import React from 'react';
import { Search, Plus, HelpCircle, Zap, Calculator, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HealthcareHeader() {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Page Title and Breadcrumb */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-500">
            <span className="text-sm">←</span>
            <span className="ml-2 text-lg font-semibold text-gray-900">Staff List</span>
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
          {/* Add Button */}
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Doctor</span>
          </Button>

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
