'use client';

import { User, Settings, LogOut, LogIn, Calendar } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

export function UserProfile() {
  const { data: session, status } = useSession();
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

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2 p-1.5">
        <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Handle sign in with optional session cleanup
  const handleSignIn = async () => {
    // Only clear session if there's actually a session present
    if (session) {
      await signOut({ redirect: false });
      // Small delay to ensure cleanup completes before signing in
      setTimeout(() => {
        signIn();
      }, 100);
    } else {
      // No session to clear, sign in directly
      signIn();
    }
  };

  // Show login button if not authenticated
  if (status === 'unauthenticated' || !session) {
    return (
      <button
        onClick={handleSignIn}
        className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
      >
        <LogIn className="h-4 w-4" />
        <span className="text-sm font-medium">Sign In</span>
      </button>
    );
  }

  // Get user info from session
  const userName = session.user?.name || 'User';
  const userEmail = session.user?.email || '';
  const userRoles = (session as any).roles || [];
  const primaryRole = userRoles[0] || 'User';

  // Format role for display
  const formatRole = (role: string) => {
    return role
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
      >
        <div className="relative">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
        </div>
        {!isOpen ? (
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-gray-900">{userName}</p>
            <p className="text-[10px] text-gray-500">{formatRole(primaryRole)}</p>
          </div>
        ) : null}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
            {userEmail && (
              <p className="text-xs text-gray-500 mt-0.5">{userEmail}</p>
            )}
            {userRoles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {userRoles.slice(0, 3).map((role: string) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary"
                  >
                    {formatRole(role)}
                  </span>
                ))}
                {userRoles.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                    +{userRoles.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          <Link
            href={`/widget/booking?org=${(session as any)?.org_slug || ''}`}
            target="_blank"
            className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-primary/5 transition-all flex items-center gap-3 font-semibold"
            onClick={() => setIsOpen(false)}
          >
            <Calendar className="h-4 w-4 text-primary" />
            <span>Book Appointment (Public Widget)</span>
          </Link>

          <div className="border-t border-gray-100 mt-1 pt-1">
            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-3">
              <User className="h-4 w-4 text-gray-400" />
              <span>Profile</span>
            </button>

            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-3">
              <Settings className="h-4 w-4 text-gray-400" />
              <span>Settings</span>
            </button>
          </div>

          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-all flex items-center gap-3"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
