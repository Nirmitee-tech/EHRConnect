'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Bed, Settings, MapPin, Edit, Plus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ConfigurationDashboardProps {
  orgId?: string;
  userId?: string;
}

export default function ConfigurationDashboard({ orgId, userId }: ConfigurationDashboardProps = {}) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuration & Setup</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage wards, rooms, beds, and system settings
          </p>
        </div>
        <Button
          onClick={() => router.push('/bed-management/wards')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Settings className="h-4 w-4 mr-2" />
          Ward Settings
        </Button>
      </div>

      {/* Main Configuration Options */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-blue-200 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => router.push('/bed-management/wards')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Building2 className="h-10 w-10 text-blue-600" />
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
            <CardTitle className="mt-4 text-gray-900">Ward Management</CardTitle>
            <CardDescription className="text-gray-600">
              Configure hospital wards, departments, and organizational structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700 mb-4">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Create and manage wards
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Assign ward administrators
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Set ward-specific policies
              </li>
            </ul>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push('/bed-management/wards')}
            >
              Manage Wards
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => router.push('/bed-management/beds')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Bed className="h-10 w-10 text-green-600" />
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
            <CardTitle className="mt-4 text-gray-900">Bed Configuration</CardTitle>
            <CardDescription className="text-gray-600">
              Add, edit, and organize beds across your facility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700 mb-4">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                Add new beds and rooms
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                Update bed status and type
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                Assign beds to wards
              </li>
            </ul>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => router.push('/bed-management/beds')}
            >
              Manage Beds
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Setup Guide</CardTitle>
          <CardDescription className="text-gray-600">Follow these steps to configure your bed management system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">Create Wards</h4>
                  <Button
                    size="sm"
                    onClick={() => router.push('/bed-management/wards')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Ward
                  </Button>
                </div>
                <p className="text-sm text-gray-700">
                  Start by creating wards or departments that will contain your beds. Examples: ICU, General Medicine, Surgery, etc.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 text-white font-bold flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">Add Rooms (Optional)</h4>
                  <Button
                    size="sm"
                    onClick={() => router.push('/bed-management/wards')}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                </div>
                <p className="text-sm text-gray-700">
                  Organize beds into rooms for better management. You can also add beds directly to wards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 text-white font-bold flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">Add Beds</h4>
                  <Button
                    size="sm"
                    onClick={() => router.push('/bed-management/beds')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Bed
                  </Button>
                </div>
                <p className="text-sm text-gray-700">
                  Add individual beds to your wards or rooms. Specify bed types, capabilities, and equipment.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 text-white font-bold flex-shrink-0">
                4
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">Start Managing</h4>
                  <Button
                    size="sm"
                    onClick={() => router.push('/bed-management/floor-plan')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Bed className="h-3 w-3 mr-1" />
                    View Floor Plan
                  </Button>
                </div>
                <p className="text-sm text-gray-700">
                  Once configured, use the floor plan views to start managing bed assignments and patient admissions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Advanced Settings</CardTitle>
          <CardDescription className="text-gray-600">Configure advanced bed management options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="font-medium text-sm text-gray-900">Bed Types & Categories</div>
                  <div className="text-xs text-gray-600">Define custom bed types and capabilities</div>
                </div>
              </div>
              <Edit className="h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="font-medium text-sm text-gray-900">Status Workflow</div>
                  <div className="text-xs text-gray-600">Configure bed status transitions and rules</div>
                </div>
              </div>
              <Edit className="h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="font-medium text-sm text-gray-900">Notifications & Alerts</div>
                  <div className="text-xs text-gray-600">Set up automated alerts for bed availability</div>
                </div>
              </div>
              <Edit className="h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="font-medium text-sm text-gray-900">Permissions & Access Control</div>
                  <div className="text-xs text-gray-600">Manage user permissions for bed management</div>
                </div>
              </div>
              <Edit className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
