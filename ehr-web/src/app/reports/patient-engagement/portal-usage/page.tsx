'use client';

import { ReportTemplate } from '@/components/reports/ReportTemplate';
import { TableColumn } from '@/components/reports/TableView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Users, TrendingUp, Activity, MessageSquare } from 'lucide-react';
import { generatePortalUsageData } from '@/lib/report-data-generators';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

const reportData = generatePortalUsageData(30);

// Table columns
const tableColumns: TableColumn[] = [
  {
    key: 'id',
    label: 'User ID',
    sortable: true,
    width: '120px',
    render: (value) => <span className="font-mono text-blue-600 font-medium">{value}</span>
  },
  {
    key: 'patientName',
    label: 'Patient',
    sortable: true,
    width: '180px',
    render: (value) => <span className="font-medium text-gray-900">{value}</span>
  },
  {
    key: 'enrollmentDate',
    label: 'Enrolled',
    sortable: true,
    width: '120px',
  },
  {
    key: 'lastLogin',
    label: 'Last Login',
    sortable: true,
    width: '120px',
  },
  {
    key: 'loginCount',
    label: 'Logins',
    sortable: true,
    width: '80px',
    align: 'right',
  },
  {
    key: 'messagesExchanged',
    label: 'Messages',
    sortable: true,
    width: '100px',
    align: 'right',
  },
  {
    key: 'appointmentsBooked',
    label: 'Appts',
    sortable: true,
    width: '80px',
    align: 'right',
  },
  {
    key: 'activity',
    label: 'Last Activity',
    sortable: true,
    width: '160px',
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '130px',
    render: (value) => (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        value === 'Active' || value === 'Completed' || value === 'Success' || value === 'Approved' || value === 'Paid' || value === 'Final' ? 'bg-green-100 text-green-800' :
        value === 'Pending' || value === 'Scheduled' || value === 'Submitted' || value === 'Preliminary' ? 'bg-blue-100 text-blue-800' :
        value === 'Failed' || value === 'Denied' || value === 'Cancelled' ? 'bg-red-100 text-red-800' :
        'bg-orange-100 text-orange-800'
      }`}>
        {value}
      </span>
    )
  }
];

export default function ReportPage() {
  const activeUsers = reportData.filter(d => d.status === 'Active').length;
  const enrollmentRate = ((reportData.filter(d => d.status === 'Active').length / reportData.length) * 100).toFixed(0);
  const avgLogins = (reportData.reduce((sum, d) => sum + (d.loginCount || 0), 0) / reportData.length).toFixed(1);
  const totalMessages = reportData.length;

  return (
    <ReportTemplate
      title="Patient Portal Usage"
      description="Portal adoption rates, feature usage, and patient engagement metrics"
      icon={<Globe className="h-6 w-6 text-blue-600" />}
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
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{activeUsers}</div>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Enrollment Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{enrollmentRate}%</div>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Logins/User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{avgLogins}</div>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Messages Sent</CardTitle>
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
        </div>

        {/* Visualization placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics & Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <div className="text-sm">Data visualizations and trend analysis will be displayed here</div>
              <div className="text-xs mt-2">Charts, graphs, and detailed insights for Patient Portal Usage</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  );
}
