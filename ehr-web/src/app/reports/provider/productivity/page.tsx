'use client';

import { ReportTemplate } from '@/components/reports/ReportTemplate';
import { TableColumn } from '@/components/reports/TableView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, UserCheck, DollarSign } from 'lucide-react';
import { generateProviderProductivityData } from '@/lib/report-data-generators';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

const reportData = generateProviderProductivityData(30);

// Table columns
const tableColumns: TableColumn[] = [
  {
    key: 'id',
    label: 'Provider ID',
    sortable: true,
    width: '120px',
    render: (value) => <span className="font-mono text-blue-600 font-medium">{value}</span>
  },
  {
    key: 'provider',
    label: 'Provider',
    sortable: true,
    width: '200px',
    render: (value) => <span className="font-medium text-gray-900">{value}</span>
  },
  {
    key: 'specialty',
    label: 'Specialty',
    sortable: true,
    width: '150px',
  },
  {
    key: 'patients',
    label: 'Patients',
    sortable: true,
    width: '100px',
    align: 'right',
  },
  {
    key: 'encounters',
    label: 'Encounters',
    sortable: true,
    width: '110px',
    align: 'right',
  },
  {
    key: 'hours',
    label: 'Hours',
    sortable: true,
    width: '90px',
    align: 'right',
  },
  {
    key: 'revenue',
    label: 'Revenue',
    sortable: true,
    width: '130px',
    align: 'right',
    render: (value) => <span className="font-semibold text-green-600">${value.toLocaleString()}</span>
  },
  {
    key: 'satisfaction',
    label: 'Rating',
    sortable: true,
    width: '90px',
    align: 'center',
    render: (value) => <span className="text-gray-900">{value}/5 ⭐</span>
  },
  {
    key: 'noShowRate',
    label: 'No-Show %',
    sortable: true,
    width: '110px',
    align: 'right',
  }
];

export default function ReportPage() {
  const totalProviders = reportData.length;
  const totalPatients = reportData.length;
  const avgPatients = (reportData.reduce((sum, d) => sum + (d.patients || 0), 0) / reportData.length).toFixed(0);
  const totalRevenue = '$' + (reportData.reduce((sum, d) => sum + (d.revenue || 0), 0) / 1000).toFixed(1) + 'K';

  return (
    <ReportTemplate
      title="Provider Productivity"
      description="Provider performance metrics, patient encounters, and revenue generation"
      icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
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
              <CardTitle className="text-sm font-medium text-gray-600">Total Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalProviders}</div>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalPatients}</div>
                </div>
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Patients/Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{avgPatients}</div>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalRevenue}</div>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
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
              <div className="text-xs mt-2">Charts, graphs, and detailed insights for Provider Productivity</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  );
}
