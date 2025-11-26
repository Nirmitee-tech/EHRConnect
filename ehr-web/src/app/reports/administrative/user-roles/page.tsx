'use client';

import { ReportTemplate } from '@/components/reports/ReportTemplate';
import { TableColumn } from '@/components/reports/TableView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Lock } from 'lucide-react';
import { generateUserActivityData } from '@/lib/report-data-generators';

const reportData = generateUserActivityData(30);

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
    key: 'userName',
    label: 'Username',
    sortable: true,
    width: '220px',
    render: (value) => <span className="font-medium text-gray-900">{value}</span>
  },
  {
    key: 'role',
    label: 'Role',
    sortable: true,
    width: '130px',
  },
  {
    key: 'department',
    label: 'Department',
    sortable: true,
    width: '150px',
  },
  {
    key: 'lastLogin',
    label: 'Last Login',
    sortable: true,
    width: '120px',
  },
  {
    key: 'sessionsCount',
    label: 'Sessions',
    sortable: true,
    width: '90px',
    align: 'right',
  },
  {
    key: 'avgSessionDuration',
    label: 'Avg Session',
    sortable: true,
    width: '120px',
    align: 'right',
  },
  {
    key: 'recordsAccessed',
    label: 'Records',
    sortable: true,
    width: '90px',
    align: 'right',
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '100px',
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
  const totalUsers = reportData.length;
  const activeUsers = reportData.filter(d => d.status === 'Active').length;
  const inactiveUsers = reportData.filter(d => d.status === 'Inactive').length;
  const lockedUsers = reportData.filter(d => d.status === 'Locked').length;

  return (
    <ReportTemplate
      title="User Roles & Permissions"
      description="User account management, role assignments, and access control"
      icon={<Users className="h-6 w-6 text-blue-600" />}
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
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{activeUsers}</div>
                </div>
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{inactiveUsers}</div>
                </div>
                <UserX className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Locked Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{lockedUsers}</div>
                </div>
                <Lock className="h-8 w-8 text-blue-600" />
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
              <div className="text-xs mt-2">Charts, graphs, and detailed insights for User Roles & Permissions</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  );
}
