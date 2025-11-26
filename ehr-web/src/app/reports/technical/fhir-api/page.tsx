'use client';

import { ReportTemplate } from '@/components/reports/ReportTemplate';
import { TableColumn } from '@/components/reports/TableView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Activity, CheckCircle, Zap, AlertTriangle } from 'lucide-react';
import { generateAPIUsageData } from '@/lib/report-data-generators';

const reportData = generateAPIUsageData(30);

// Table columns
const tableColumns: TableColumn[] = [
  {
    key: 'id',
    label: 'Request ID',
    sortable: true,
    width: '120px',
    render: (value) => <span className="font-mono text-blue-600 font-medium">{value}</span>
  },
  {
    key: 'timestamp',
    label: 'Timestamp',
    sortable: true,
    width: '180px',
  },
  {
    key: 'endpoint',
    label: 'Endpoint',
    sortable: true,
    width: '200px',
  },
  {
    key: 'method',
    label: 'Method',
    sortable: true,
    width: '80px',
  },
  {
    key: 'statusCode',
    label: 'Status',
    sortable: true,
    width: '80px',
    align: 'center',
    render: (value) => (
      <span className={`font-mono text-xs ${
        value >= 200 && value < 300 ? 'text-green-600' :
        value >= 400 && value < 500 ? 'text-orange-600' :
        value >= 500 ? 'text-red-600' :
        'text-gray-600'
      }`}>
        {value}
      </span>
    )
  },
  {
    key: 'responseTime',
    label: 'Time (ms)',
    sortable: true,
    width: '100px',
    align: 'right',
  },
  {
    key: 'requestSize',
    label: 'Req Size',
    sortable: true,
    width: '100px',
    align: 'right',
  },
  {
    key: 'responseSize',
    label: 'Res Size',
    sortable: true,
    width: '100px',
    align: 'right',
  },
  {
    key: 'clientId',
    label: 'Client',
    sortable: true,
    width: '120px',
  }
];

export default function ReportPage() {
  const totalRequests = reportData.length;
  const successRate = ((reportData.filter(d => d.statusCode >= 200 && d.statusCode < 300).length / reportData.length) * 100).toFixed(0);
  const avgResponseTime = (reportData.reduce((sum, d) => sum + (d.responseTime || 0), 0) / reportData.length).toFixed(1);
  const errorRate = ((reportData.filter(d => d.statusCode >= 400).length / reportData.length) * 100).toFixed(1);

  return (
    <ReportTemplate
      title="FHIR API Usage"
      description="API endpoint performance, usage patterns, and error rates"
      icon={<Code className="h-6 w-6 text-blue-600" />}
      onExport={() => console.log('Exporting...')}
      onRefresh={() => console.log('Refreshing...')}
      tableColumns={tableColumns}
      tableData={reportData}
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card key="0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalRequests}</div>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
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
              <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{avgResponseTime}ms</div>
                </div>
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{errorRate}%</div>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-600" />
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
              <div className="text-xs mt-2">Charts, graphs, and detailed insights for FHIR API Usage</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  );
}
