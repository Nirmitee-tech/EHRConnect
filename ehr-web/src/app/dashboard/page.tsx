'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { LayoutDashboard, TrendingUp, Activity, DollarSign, Building2, Calendar, MapPin, Filter } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTheme } from '@/contexts/theme-context'
import { getContrastColor } from '@/lib/utils'
import { useTranslation } from '@/i18n/client'
import '@/i18n/client'

// Import dashboard views
import ExecutiveDashboard from './views/executive-dashboard'
import ClinicalDashboard from './views/clinical-dashboard'
import OperationsDashboard from './views/operations-dashboard'
import RCMDashboardEnhanced from './views/rcm-dashboard-enhanced'
import QualityDashboard from './views/quality-dashboard'

export default function DashboardPage() {
  const { data: session } = useSession()
  const { themeSettings } = useTheme()
  const { t } = useTranslation('common')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [dateRange, setDateRange] = useState('30d')
  const [location, setLocation] = useState('all')
  const [department, setDepartment] = useState('all')
  const [activeTab, setActiveTab] = useState('quality')

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const userName = session?.user?.name?.split(' ')[0] || 'Wynter'
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? t('dashboard.good_morning') : currentHour < 18 ? t('dashboard.good_afternoon') : t('dashboard.good_evening')

  // Auto-detect text color based on background
  const headerBg = themeSettings.quaternaryColor || '#8B5CF6'
  const headerTextColor = getContrastColor(headerBg) === 'white' ? '#FFFFFF' : '#000000'
  const headerTextMuted = getContrastColor(headerBg) === 'white' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
  const headerBorder = getContrastColor(headerBg) === 'white' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
  const dropdownBg = getContrastColor(headerBg) === 'white' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
  const dropdownBorder = getContrastColor(headerBg) === 'white' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'

  return (
    <div className="h-full flex flex-col bg-gray-50 -m-6">
      {/* Sticky Header with Theme Sidebar Color */}
      <div
        className="sticky top-0 z-50 shadow-lg"
        style={{ backgroundColor: headerBg, color: headerTextColor }}
      >
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold" style={{ color: headerTextColor }}>
                {greeting}, {userName}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: headerTextMuted }}>
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" style={{ color: headerTextColor }} />
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger
                      className="w-[140px] h-8 text-xs"
                      style={{
                        backgroundColor: dropdownBg,
                        borderColor: dropdownBorder,
                        color: headerTextColor
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">{t('dashboard.last_7_days')}</SelectItem>
                      <SelectItem value="30d">{t('dashboard.last_30_days')}</SelectItem>
                      <SelectItem value="90d">{t('dashboard.last_90_days')}</SelectItem>
                      <SelectItem value="ytd">{t('dashboard.year_to_date')}</SelectItem>
                      <SelectItem value="custom">{t('dashboard.custom_range')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" style={{ color: headerTextColor }} />
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger
                      className="w-[140px] h-8 text-xs"
                      style={{
                        backgroundColor: dropdownBg,
                        borderColor: dropdownBorder,
                        color: headerTextColor
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('dashboard.all_locations')}</SelectItem>
                      <SelectItem value="main">{t('dashboard.main_campus')}</SelectItem>
                      <SelectItem value="north">{t('dashboard.north_clinic')}</SelectItem>
                      <SelectItem value="south">{t('dashboard.south_clinic')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" style={{ color: headerTextColor }} />
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger
                      className="w-[140px] h-8 text-xs"
                      style={{
                        backgroundColor: dropdownBg,
                        borderColor: dropdownBorder,
                        color: headerTextColor
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('dashboard.all_departments')}</SelectItem>
                      <SelectItem value="cardiology">{t('dashboard.cardiology')}</SelectItem>
                      <SelectItem value="orthopedics">{t('dashboard.orthopedics')}</SelectItem>
                      <SelectItem value="primary">{t('dashboard.primary_care')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-right pl-6" style={{ borderLeft: `1px solid ${headerBorder}` }}>
                <div className="text-xs uppercase tracking-wider" style={{ color: headerTextMuted }}>{t('dashboard.system_status')}</div>
                <div className="flex items-center gap-1.5 text-xs font-medium mt-0.5" style={{ color: headerTextColor }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeSettings.accentColor }} />
                  {t('dashboard.all_systems_operational')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div style={{ borderTop: `1px solid ${headerBorder}` }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-11 bg-transparent border-0 p-0 px-6 w-full justify-start rounded-none">
              <TabsTrigger
                value="executive"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-2 transition-all relative"
                style={{
                  color: activeTab === 'executive' ? headerTextColor : headerTextMuted,
                  borderBottom: activeTab === 'executive' ? `3px solid ${themeSettings.accentColor}` : '3px solid transparent',
                  backgroundColor: activeTab === 'executive' ? 'transparent' : 'transparent',
                  '--hover-bg': dropdownBg
                } as React.CSSProperties}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = dropdownBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                {t('dashboard.executive')}
              </TabsTrigger>
              <TabsTrigger
                value="clinical"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-2 transition-all relative"
                style={{
                  color: activeTab === 'clinical' ? headerTextColor : headerTextMuted,
                  borderBottom: activeTab === 'clinical' ? `3px solid ${themeSettings.accentColor}` : '3px solid transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = dropdownBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Activity className="h-4 w-4 mr-2" />
                {t('dashboard.clinical')}
              </TabsTrigger>
              <TabsTrigger
                value="operations"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-2 transition-all relative"
                style={{
                  color: activeTab === 'operations' ? headerTextColor : headerTextMuted,
                  borderBottom: activeTab === 'operations' ? `3px solid ${themeSettings.accentColor}` : '3px solid transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = dropdownBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Building2 className="h-4 w-4 mr-2" />
                {t('dashboard.operations')}
              </TabsTrigger>
              <TabsTrigger
                value="rcm"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-2 transition-all relative"
                style={{
                  color: activeTab === 'rcm' ? headerTextColor : headerTextMuted,
                  borderBottom: activeTab === 'rcm' ? `3px solid ${themeSettings.accentColor}` : '3px solid transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = dropdownBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                {t('dashboard.revenue_cycle')}
              </TabsTrigger>
              <TabsTrigger
                value="quality"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-2 transition-all relative"
                style={{
                  color: activeTab === 'quality' ? headerTextColor : headerTextMuted,
                  borderBottom: activeTab === 'quality' ? `3px solid ${themeSettings.accentColor}` : '3px solid transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = dropdownBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('dashboard.quality')}
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Content */}
            <div className="bg-gray-50">
              <TabsContent value="executive" className="mt-0 p-6">
                <ExecutiveDashboard filters={{ dateRange, location, department }} />
              </TabsContent>

              <TabsContent value="clinical" className="mt-0 p-6">
                <ClinicalDashboard filters={{ dateRange, location, department }} />
              </TabsContent>

              <TabsContent value="operations" className="mt-0 p-6">
                <OperationsDashboard filters={{ dateRange, location, department }} />
              </TabsContent>

              <TabsContent value="rcm" className="mt-0 p-6">
                <RCMDashboardEnhanced filters={{ dateRange, location, department }} />
              </TabsContent>

              <TabsContent value="quality" className="mt-0 p-6">
                <QualityDashboard filters={{ dateRange, location, department }} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
