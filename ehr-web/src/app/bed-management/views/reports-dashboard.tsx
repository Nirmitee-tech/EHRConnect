'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, PieChart, Download, Calendar, FileText, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReportsDashboardProps {
  orgId?: string;
  userId?: string;
}

export default function ReportsDashboard({ orgId, userId }: ReportsDashboardProps = {}) {
  const router = useRouter();

  const reportTypes = [
    {
      title: 'Occupancy Trends',
      description: 'Historical bed occupancy rates and trends over time',
      icon: TrendingUp,
      color: 'blue',
      available: true,
    },
    {
      title: 'Utilization Reports',
      description: 'Detailed analysis of bed and ward utilization metrics',
      icon: BarChart3,
      color: 'green',
      available: true,
    },
    {
      title: 'Patient Flow Analysis',
      description: 'Admission, discharge, and transfer patterns',
      icon: Activity,
      color: 'purple',
      available: true,
    },
    {
      title: 'Length of Stay Analysis',
      description: 'Average and median length of stay by department',
      icon: Calendar,
      color: 'orange',
      available: true,
    },
    {
      title: 'Bed Turnover Rate',
      description: 'Time between discharge and next admission',
      icon: PieChart,
      color: 'indigo',
      available: true,
    },
    {
      title: 'Custom Reports',
      description: 'Build custom reports with specific date ranges and filters',
      icon: FileText,
      color: 'pink',
      available: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">
            View detailed analytics and generate reports for bed management
          </p>
        </div>
        <Button
          onClick={() => router.push('/bed-management/reports')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <FileText className="h-4 w-4 mr-2" />
          View All Reports
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600 border-blue-200',
            green: 'bg-green-100 text-green-600 border-green-200',
            purple: 'bg-purple-100 text-purple-600 border-purple-200',
            orange: 'bg-orange-100 text-orange-600 border-orange-200',
            indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
            pink: 'bg-pink-100 text-pink-600 border-pink-200',
          };

          return (
            <Card
              key={report.title}
              className={`hover:shadow-lg transition-all ${
                report.available ? 'cursor-pointer' : 'opacity-60'
              }`}
              onClick={() => report.available && router.push('/bed-management/reports')}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                  colorClasses[report.color as keyof typeof colorClasses]
                } border-2`}>
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg text-gray-900">{report.title}</CardTitle>
                <CardDescription className="text-gray-600">{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {report.available ? (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => router.push('/bed-management/reports')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-gray-400 text-white cursor-not-allowed"
                    disabled
                  >
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Quick Insights</CardTitle>
          <CardDescription className="text-gray-600">Key metrics and performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">85.2%</div>
              <div className="text-sm text-gray-700 mt-1">Avg Occupancy</div>
              <div className="text-xs text-gray-600 mt-1">Last 30 days</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">4.3</div>
              <div className="text-sm text-gray-700 mt-1">Avg Length of Stay</div>
              <div className="text-xs text-gray-600 mt-1">Days</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">2.1</div>
              <div className="text-sm text-gray-700 mt-1">Bed Turnover</div>
              <div className="text-xs text-gray-600 mt-1">Hours avg</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">92.5%</div>
              <div className="text-sm text-gray-700 mt-1">Bed Utilization</div>
              <div className="text-xs text-gray-600 mt-1">Efficiency score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Export Options</CardTitle>
          <CardDescription className="text-gray-600">Download reports in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => router.push('/bed-management/reports')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export to PDF
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => router.push('/bed-management/reports')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push('/bed-management/reports')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
