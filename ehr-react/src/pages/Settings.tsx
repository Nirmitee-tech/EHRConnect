
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Building2,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  FileText,
  Settings as SettingsIcon,
  ChevronRight,
  Clock
} from 'lucide-react';

interface SettingCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
  color: string;
}

export default function SettingsPage() {
  const settingCards: SettingCard[] = [
    {
      title: 'Appointment Types',
      description: 'Manage appointment types, durations, and categories',
      icon: <Calendar className="h-6 w-6" />,
      href: '/settings/appointment-types',
      color: 'bg-blue-500'
    },
    {
      title: 'Office Hours',
      description: 'Configure facility and provider working hours',
      icon: <Clock className="h-6 w-6" />,
      href: '/settings/office-hours',
      color: 'bg-purple-500'
    },
    {
      title: 'Staff Management',
      description: 'Manage staff roles, permissions, and access',
      icon: <Users className="h-6 w-6" />,
      href: '/staff',
      color: 'bg-green-500'
    },
    {
      title: 'Facility Settings',
      description: 'Update facility information and locations',
      icon: <Building2 className="h-6 w-6" />,
      href: '/settings/facility',
      color: 'bg-orange-500'
    },
    {
      title: 'Notifications',
      description: 'Configure email, SMS, and push notifications',
      icon: <Bell className="h-6 w-6" />,
      href: '/settings/notifications',
      color: 'bg-yellow-500'
    },
    {
      title: 'Security & Privacy',
      description: 'Manage security settings and data privacy',
      icon: <Shield className="h-6 w-6" />,
      href: '/settings/security',
      color: 'bg-red-500'
    },
    {
      title: 'Appearance',
      description: 'Customize colors, themes, and branding',
      icon: <Palette className="h-6 w-6" />,
      href: '/settings/appearance',
      color: 'bg-pink-500'
    },
    {
      title: 'Localization',
      description: 'Set language, timezone, and regional preferences',
      icon: <Globe className="h-6 w-6" />,
      href: '/settings/localization',
      color: 'bg-indigo-500'
    },
    {
      title: 'Billing & Payment',
      description: 'Configure billing settings and payment methods',
      icon: <CreditCard className="h-6 w-6" />,
      href: '/settings/billing',
      color: 'bg-teal-500'
    },
    {
      title: 'Templates',
      description: 'Manage document templates and forms',
      icon: <FileText className="h-6 w-6" />,
      href: '/settings/templates',
      color: 'bg-cyan-500'
    },
    {
      title: 'System Configuration',
      description: 'Advanced system settings and integrations',
      icon: <SettingsIcon className="h-6 w-6" />,
      href: '/settings/system',
      badge: 'Admin',
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your system configuration and preferences
          </p>
        </div>
      </div>

      {/* Settings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingCards.map((card, index) => (
          <Link
            key={index}
            href={card.href}
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`${card.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}
                  >
                    {card.icon}
                  </div>
                  {card.badge && (
                    <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded">
                      {card.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 ml-2" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white rounded-lg p-4 text-left hover:shadow-md transition-shadow border border-gray-200">
            <div className="text-sm font-medium text-gray-900 mb-1">Backup Data</div>
            <div className="text-xs text-gray-600">Create a system backup</div>
          </button>
          <button className="bg-white rounded-lg p-4 text-left hover:shadow-md transition-shadow border border-gray-200">
            <div className="text-sm font-medium text-gray-900 mb-1">View Logs</div>
            <div className="text-xs text-gray-600">Check system activity logs</div>
          </button>
          <button className="bg-white rounded-lg p-4 text-left hover:shadow-md transition-shadow border border-gray-200">
            <div className="text-sm font-medium text-gray-900 mb-1">Export Settings</div>
            <div className="text-xs text-gray-600">Download configuration</div>
          </button>
        </div>
      </div>
    </div>
  );
}
