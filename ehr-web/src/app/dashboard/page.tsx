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

// Import dashboard views
import ExecutiveDashboard from './views/executive-dashboard'
import ClinicalDashboard from './views/clinical-dashboard'
import OperationsDashboard from './views/operations-dashboard'
import RCMDashboardEnhanced from './views/rcm-dashboard-enhanced'
import QualityDashboard from './views/quality-dashboard'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [dateRange, setDateRange] = useState('30d')
  const [location, setLocation] = useState('all')
  const [department, setDepartment] = useState('all')

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const userName = session?.user?.name?.split(' ')[0] || 'Wynter'
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="h-full flex flex-col bg-gray-50 -m-6">
      {/* Sticky Header with Sidebar Color */}
      <div className="sticky top-0 z-50 bg-[#0F1E56] text-white shadow-lg">
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold">
                {greeting}, {userName}
              </h1>
              <p className="text-xs text-blue-200 mt-0.5">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-300" />
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[140px] h-8 bg-white/10 border-white/20 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                      <SelectItem value="ytd">Year to Date</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-300" />
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-[140px] h-8 bg-white/10 border-white/20 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="main">Main Campus</SelectItem>
                      <SelectItem value="north">North Clinic</SelectItem>
                      <SelectItem value="south">South Clinic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-300" />
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="w-[140px] h-8 bg-white/10 border-white/20 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="primary">Primary Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-right border-l border-white/20 pl-6">
                <div className="text-xs text-blue-200 uppercase tracking-wider">System Status</div>
                <div className="flex items-center gap-1.5 text-white text-xs font-medium mt-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  All Systems Operational
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-t border-white/10">
          <Tabs defaultValue="quality" className="w-full">
            <TabsList className="h-11 bg-transparent border-0 p-0 px-6 w-full justify-start rounded-none">
              <TabsTrigger
                value="executive"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-2 text-blue-200 hover:text-white hover:bg-white/5 transition-all"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Executive
              </TabsTrigger>
              <TabsTrigger
                value="clinical"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-2 text-blue-200 hover:text-white hover:bg-white/5 transition-all"
              >
                <Activity className="h-4 w-4 mr-2" />
                Clinical
              </TabsTrigger>
              <TabsTrigger
                value="operations"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-2 text-blue-200 hover:text-white hover:bg-white/5 transition-all"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Operations
              </TabsTrigger>
              <TabsTrigger
                value="rcm"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-2 text-blue-200 hover:text-white hover:bg-white/5 transition-all"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Revenue Cycle
              </TabsTrigger>
              <TabsTrigger
                value="quality"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-2 text-blue-200 hover:text-white hover:bg-white/5 transition-all"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Quality
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
