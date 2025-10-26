'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Bed,
  Map,
  Users,
  TrendingUp,
  Settings,
  Calendar,
  MapPin,
  Building2,
  AlertCircle,
  Activity
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFacility } from '@/contexts/facility-context';

// Import dashboard views
import OverviewDashboard from './views/enhanced-overview-dashboard';
import AnalyticsDashboard from './views/analytics-dashboard';
import FloorPlanDashboard from './views/floor-plan-dashboard';
import AdmissionsDashboard from './views/admissions-dashboard';
import ReportsDashboard from './views/reports-dashboard';
import ConfigurationDashboard from './views/configuration-dashboard';

export default function BedManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { currentFacility } = useFacility();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30d');
  const [location, setLocation] = useState('all');
  const [ward, setWard] = useState('all');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  const isLoadingSession = status === 'loading';

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/bed-management?tab=${value}`, { scroll: false });
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Get orgId and userId from session
  useEffect(() => {
    if (!session) {
      setOrgId(null);
      setUserId(null);
      return;
    }

    if (session.org_id) {
      setOrgId(session.org_id);
      setUserId((session.user as any)?.id || session.user?.email || null);
    }
  }, [session]);

  if (isLoadingSession) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please log in to access the bed management system.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userName = session?.user?.name?.split(' ')[0] || 'User';
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="h-full flex flex-col bg-gray-50 -m-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-[#0F1E56] text-white shadow-lg">
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Bed Management System
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
                      <SelectItem value="main">Main Building</SelectItem>
                      <SelectItem value="north">North Wing</SelectItem>
                      <SelectItem value="south">South Wing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-300" />
                  <Select value={ward} onValueChange={setWard}>
                    <SelectTrigger className="w-[140px] h-8 bg-white/10 border-white/20 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Wards</SelectItem>
                      <SelectItem value="icu">ICU</SelectItem>
                      <SelectItem value="general">General Medicine</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-right border-l border-white/20 pl-6">
                <div className="text-xs text-blue-200 uppercase tracking-wider">Current Facility</div>
                <div className="flex items-center gap-1.5 text-white text-xs font-medium mt-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  {currentFacility?.name || 'Main Hospital'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-t border-white/10">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="h-11 bg-transparent border-0 p-0 px-6 w-full justify-start rounded-none">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-2 text-blue-200 hover:text-white hover:bg-white/5 transition-all"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-2 text-blue-200 hover:text-white hover:bg-white/5 transition-all"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="floor-plan"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-2 text-blue-200 hover:text-white hover:bg-white/5 transition-all"
              >
                <Map className="h-4 w-4 mr-2" />
                Floor Plans
              </TabsTrigger>
              <TabsTrigger
                value="admissions"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-2 text-blue-200 hover:text-white hover:bg-white/5 transition-all"
              >
                <Users className="h-4 w-4 mr-2" />
                Admissions
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-2 text-blue-200 hover:text-white hover:bg-white/5 transition-all"
              >
                <Activity className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger
                value="configuration"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-2 text-blue-200 hover:text-white hover:bg-white/5 transition-all"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configuration
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Content */}
            <div className="bg-gray-50">
              <TabsContent value="overview" className="mt-0 p-6">
                <OverviewDashboard orgId={orgId} userId={userId || undefined} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0 p-6">
                <AnalyticsDashboard orgId={orgId} userId={userId || undefined} />
              </TabsContent>

              <TabsContent value="floor-plan" className="mt-0 p-6">
                <FloorPlanDashboard orgId={orgId} userId={userId || undefined} />
              </TabsContent>

              <TabsContent value="admissions" className="mt-0 p-6">
                <AdmissionsDashboard orgId={orgId} userId={userId || undefined} />
              </TabsContent>

              <TabsContent value="reports" className="mt-0 p-6">
                <ReportsDashboard orgId={orgId} userId={userId || undefined} />
              </TabsContent>

              <TabsContent value="configuration" className="mt-0 p-6">
                <ConfigurationDashboard orgId={orgId} userId={userId || undefined} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
