'use client';

import React from 'react';
import ActiveSessions from '@/components/security/active-sessions';
import { ArrowLeft, Shield, Key, Lock, Eye } from 'lucide-react';
import Link from 'next/link';

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security & Privacy</h1>
          <p className="text-gray-600 mt-1">
            Manage your security settings and active sessions
          </p>
        </div>
      </div>

      {/* Security Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Two-Factor Authentication */}
        <Link
          href="/settings/security/2fa"
          className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Shield className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
        </Link>

        {/* Change Password */}
        <Link
          href="/settings/security/change-password"
          className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 text-green-700 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Key className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                Change Password
              </h3>
              <p className="text-sm text-gray-600">
                Update your password regularly for better security
              </p>
            </div>
          </div>
        </Link>

        {/* Privacy Settings */}
        <Link
          href="/settings/security/privacy"
          className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Eye className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                Privacy Settings
              </h3>
              <p className="text-sm text-gray-600">
                Control who can see your information
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Active Sessions Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <ActiveSessions />
      </div>

      {/* Security Recommendations */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <Lock className="h-6 w-6 text-amber-700 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Security Recommendations</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Enable two-factor authentication for enhanced account protection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Use a strong, unique password that you don't use anywhere else</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Regularly review your active sessions and sign out of unused devices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Never share your account credentials with anyone</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
