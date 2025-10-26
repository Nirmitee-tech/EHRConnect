'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bed, Map, Sparkles, ArrowRight, Layout } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FloorPlanDashboardProps {
  orgId?: string;
  userId?: string;
}

export default function FloorPlanDashboard({ orgId, userId }: FloorPlanDashboardProps = {}) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Floor Plan Options</CardTitle>
          <CardDescription className="text-gray-600">Choose between different floor plan views and demonstrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2 border-green-200 bg-green-50 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => router.push('/bed-management/demo')}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Sparkles className="h-8 w-8 text-green-600" />
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                    DEMO
                  </span>
                </div>
                <CardTitle className="mt-4 text-gray-900">Interactive Demo Floor Plan</CardTitle>
                <CardDescription className="text-sm text-gray-700">
                  Try our bed management system with mock data. Perfect for training and exploration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700 mb-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    Sample data pre-loaded
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    Click beds to simulate admissions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    Safe testing environment
                  </li>
                </ul>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => router.push('/bed-management/demo')}
                >
                  Launch Demo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => router.push('/bed-management/floor-plan')}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Bed className="h-8 w-8 text-blue-600" />
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    LIVE
                  </span>
                </div>
                <CardTitle className="mt-4 text-gray-900">Real Data Floor Plan</CardTitle>
                <CardDescription className="text-sm text-gray-700">
                  Interactive floor plan with your actual bed data. Click any bed to admit patients.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700 mb-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Your actual beds and wards
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Real-time status updates
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Quick admission workflow
                  </li>
                </ul>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push('/bed-management/floor-plan')}
                >
                  Open Floor Plan
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => router.push('/bed-management/visual')}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Layout className="h-8 w-8 text-purple-600" />
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                    ADVANCED
                  </span>
                </div>
                <CardTitle className="mt-4 text-gray-900">Visual Bed Management</CardTitle>
                <CardDescription className="text-sm text-gray-700">
                  Advanced room layout view with comprehensive operations panel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700 mb-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    Detailed room visualization
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    Full operations control panel
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    Batch bed operations
                  </li>
                </ul>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => router.push('/bed-management/visual')}
                >
                  Open Visual View
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-indigo-200 bg-indigo-50 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => router.push('/bed-management/map')}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Map className="h-8 w-8 text-indigo-600" />
                  <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                    MAP
                  </span>
                </div>
                <CardTitle className="mt-4 text-gray-900">Bed Status Map</CardTitle>
                <CardDescription className="text-sm text-gray-700">
                  Bird's eye view of all beds across your facility with status indicators.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700 mb-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    Complete facility overview
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    Color-coded status
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    Quick status identification
                  </li>
                </ul>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => router.push('/bed-management/map')}
                >
                  View Map
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Getting Started</CardTitle>
          <CardDescription className="text-gray-600">New to our floor plan views? Start here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-900">Try the Demo First</h4>
                <p className="text-sm text-gray-700">
                  Familiarize yourself with the bed management workflow using our interactive demo with sample data. No real data is affected.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-900">Use Real Data Floor Plan</h4>
                <p className="text-sm text-gray-700">
                  Once comfortable, switch to the real data floor plan to manage your actual beds. Click any available bed to start the admission process.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-900">Explore Advanced Features</h4>
                <p className="text-sm text-gray-700">
                  Check out the Visual Management view for advanced operations, or use the Bed Status Map for a quick overview of your entire facility.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
