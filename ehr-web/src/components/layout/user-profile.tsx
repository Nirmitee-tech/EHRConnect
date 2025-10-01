'use client';

import { User, Settings, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-all"
      >
        <div className="relative">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
        </div>
        {!isOpen ? (
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-gray-900">Dr. Sarah Johnson</p>
            <p className="text-[10px] text-gray-500">Administrator</p>
          </div>
        ) : null}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Dr. Sarah Johnson</p>
            <p className="text-xs text-gray-500 mt-0.5">sarah.johnson@healthcare.com</p>
          </div>
          
          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-3">
            <User className="h-4 w-4 text-gray-400" />
            <span>Profile</span>
          </button>
          
          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-3">
            <Settings className="h-4 w-4 text-gray-400" />
            <span>Settings</span>
          </button>
          
          <div className="border-t border-gray-100 mt-1 pt-1">
            <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-all flex items-center gap-3">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
