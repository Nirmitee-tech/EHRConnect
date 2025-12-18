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

  return (
    <div className="h-full flex flex-col bg-gray-50 -m-6">
      {/* Sticky Header with Theme Sidebar Color */}
      <div
        className="sticky top-0 z-50 text-white shadow-lg"
        style={{ backgroundColor: themeSettings.sidebarBackgroundColor }}
      >
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold">
                {greeting}, {userName}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: themeSettings.sidebarTextColor }}>
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" style={{ color: themeSettings.sidebarTextColor }} />
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[140px] h-8 bg-white/10 border-white/20 text-white text-xs">
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
                  <MapPin className="h-4 w-4" style={{ color: themeSettings.sidebarTextColor }} />
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-[140px] h-8 bg-white/10 border-white/20 text-white text-xs">
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
                  <Building2 className="h-4 w-4" style={{ color: themeSettings.sidebarTextColor }} />
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="w-[140px] h-8 bg-white/10 border-white/20 text-white text-xs">
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

              <div className="text-right border-l border-white/20 pl-6">
                <div className="text-xs text-white/70 uppercase tracking-wider">{t('dashboard.system_status')}</div>
                <div className="flex items-center gap-1.5 text-white text-xs font-medium mt-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  {t('dashboard.all_systems_operational')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-t border-white/10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-11 bg-transparent border-0 p-0 px-6 w-full justify-start rounded-none">
              <TabsTrigger
                value="executive"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-all"
                style={{
                  backgroundColor: activeTab === 'executive' ? themeSettings.sidebarActiveColor : undefined,
                  color: activeTab === 'executive' ? '#ffffff' : undefined
                }}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                {t('dashboard.executive')}
              </TabsTrigger>
              <TabsTrigger
                value="clinical"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-all"
                style={{
                  backgroundColor: activeTab === 'clinical' ? themeSettings.sidebarActiveColor : undefined,
                  color: activeTab === 'clinical' ? '#ffffff' : undefined
                }}
              >
                <Activity className="h-4 w-4 mr-2" />
                {t('dashboard.clinical')}
              </TabsTrigger>
              <TabsTrigger
                value="operations"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-all"
                style={{
                  backgroundColor: activeTab === 'operations' ? themeSettings.sidebarActiveColor : undefined,
                  color: activeTab === 'operations' ? '#ffffff' : undefined
                }}
              >
                <Building2 className="h-4 w-4 mr-2" />
                {t('dashboard.operations')}
              </TabsTrigger>
              <TabsTrigger
                value="rcm"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-all"
                style={{
                  backgroundColor: activeTab === 'rcm' ? themeSettings.sidebarActiveColor : undefined,
                  color: activeTab === 'rcm' ? '#ffffff' : undefined
                }}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                {t('dashboard.revenue_cycle')}
              </TabsTrigger>
              <TabsTrigger
                value="quality"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-all"
                style={{
                  backgroundColor: activeTab === 'quality' ? themeSettings.sidebarActiveColor : undefined,
                  color: activeTab === 'quality' ? '#ffffff' : undefined
                }}
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
