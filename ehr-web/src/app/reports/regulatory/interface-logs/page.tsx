'use client';

import { ReportTemplate } from '@/components/reports/ReportTemplate';
import { TableColumn } from '@/components/reports/TableView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network, MessageSquare, CheckCircle, XCircle, Zap } from 'lucide-react';
import { generateInterfaceData } from '@/lib/report-data-generators';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

const reportData = generateInterfaceData(30);



export default function ReportPage() {
  const totalMessages = reportData.length;
  const successRate = ((reportData.filter(d => d.status === 'Success' || d.status === 'Completed').length / reportData.length) * 100).toFixed(0);
  const failedCount = reportData.filter(d => d.status === 'Failed' || d.status === 'Unauthorized' || d.status === 'Denied').length;
  const avgProcessing = (reportData.reduce((sum, d) => sum + (d.processingTime || 0), 0) / reportData.length).toFixed(0);

  return (
    <ReportTemplate
      title="Interface Transaction Logs"
      description="System integration logs and data exchange monitoring"
      icon={<Network className="h-6 w-6 text-blue-600" />}
      onExport={() => console.log('Exporting...')}
      onRefresh={() => console.log('Refreshing...')}
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card key="0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalMessages}</div>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="1">
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
          <Card key="2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
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
          <Card key="3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{avgProcessing}ms</div>
                </div>
                <Zap className="h-8 w-8 text-blue-600" />
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
              <div className="text-xs mt-2">Charts, graphs, and detailed insights for Interface Transaction Logs</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  );
}
