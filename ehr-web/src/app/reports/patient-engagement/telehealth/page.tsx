'use client';

import { ReportTemplate } from '@/components/reports/ReportTemplate';
import { TableColumn } from '@/components/reports/TableView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, CheckCircle, Clock, Star } from 'lucide-react';
import { generateTelehealthData } from '@/lib/report-data-generators';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

const reportData = generateTelehealthData(30);

// Table columns
const tableColumns: TableColumn[] = [
  {
    key: 'id',
    label: 'Visit ID',
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
    key: 'provider',
    label: 'Provider',
    sortable: true,
    width: '180px',
  },
  {
    key: 'scheduledDate',
    label: 'Date',
    sortable: true,
    width: '120px',
  },
  {
    key: 'platform',
    label: 'Platform',
    sortable: true,
    width: '120px',
  },
  {
    key: 'duration',
    label: 'Duration',
    sortable: true,
    width: '100px',
    align: 'right',
  },
  {
    key: 'satisfaction',
    label: 'Rating',
    sortable: true,
    width: '80px',
    align: 'center',
    render: (value) => <span className="text-gray-900">{value}/5 ⭐</span>
  },
  {
    key: 'followUpRequired',
    label: 'Follow-up',
    sortable: true,
    width: '100px',
    align: 'center',
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '140px',
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
  const totalVisits = reportData.length;
  const completionRate = ((reportData.filter(d => d.status === 'Completed').length / reportData.length) * 100).toFixed(0);
  const avgDuration = (reportData.reduce((sum, d) => sum + (d.duration || 0), 0) / reportData.length).toFixed(0);
  const avgSatisfaction = (reportData.reduce((sum, d) => sum + (d.satisfaction || 0), 0) / reportData.length).toFixed(1);

  return (
    <ReportTemplate
      title="Telehealth Visits"
      description="Virtual visit statistics, platform usage, and patient satisfaction"
      icon={<Video className="h-6 w-6 text-blue-600" />}
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
              <CardTitle className="text-sm font-medium text-gray-600">Total Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalVisits}</div>
                </div>
                <Video className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{avgDuration}min</div>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{avgSatisfaction}/5</div>
                </div>
                <Star className="h-8 w-8 text-blue-600" />
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
              <div className="text-xs mt-2">Charts, graphs, and detailed insights for Telehealth Visits</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  );
}
