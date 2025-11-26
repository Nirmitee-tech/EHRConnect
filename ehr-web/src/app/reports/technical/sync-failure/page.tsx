'use client';

import { ReportTemplate } from '@/components/reports/ReportTemplate';
import { TableColumn } from '@/components/reports/TableView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCcw, XCircle, CheckCircle, Clock } from 'lucide-react';
import { generateInterfaceData } from '@/lib/report-data-generators';

const reportData = generateInterfaceData(30);



export default function ReportPage() {
  const failedCount = reportData.filter(d => d.status === 'Failed' || d.status === 'Unauthorized' || d.status === 'Denied').length;
  const retryingCount = reportData.filter(d => d.attempts > 1 && d.status !== 'Success').length;
  const successRate = ((reportData.filter(d => d.status === 'Success' || (d.status === 'Success' || d.status === 'Completed')).length / reportData.length) * 100).toFixed(0);
  const avgProcessing = (reportData.reduce((sum, d) => sum + (d.processingTime || 0), 0) / reportData.length).toFixed(0);

  return (
    <ReportTemplate
      title="Synchronization Failures"
      description="Failed data sync operations and retry status"
      icon={<RefreshCcw className="h-6 w-6 text-blue-600" />}
      onExport={() => console.log('Exporting...')}
      onRefresh={() => console.log('Refreshing...')}
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card key="0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Failed Syncs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{failedCount}</div>
                </div>
                <XCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Retry Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{retryingCount}</div>
                </div>
                <RefreshCcw className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{successRate}%</div>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Retry Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{avgProcessing}ms</div>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics & Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <div className="text-sm">Data visualizations and trend analysis will be displayed here</div>
              <div className="text-xs mt-2">Charts, graphs, and detailed insights for Synchronization Failures</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  );
}
