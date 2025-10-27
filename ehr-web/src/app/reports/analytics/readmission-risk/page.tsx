'use client';

import { ReportTemplate } from '@/components/reports/ReportTemplate';
import { TableColumn } from '@/components/reports/TableView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingDown, Clock, Shield } from 'lucide-react';
import { generateReadmissionData } from '@/lib/report-data-generators';

const reportData = generateReadmissionData(30);

// Table columns
const tableColumns: TableColumn[] = [
  {
    key: 'id',
    label: 'ID',
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
    key: 'initialAdmit',
    label: 'Initial',
    sortable: true,
    width: '120px',
  },
  {
    key: 'discharge',
    label: 'Discharge',
    sortable: true,
    width: '120px',
  },
  {
    key: 'readmitDate',
    label: 'Readmit',
    sortable: true,
    width: '120px',
  },
  {
    key: 'daysToReadmit',
    label: 'Days',
    sortable: true,
    width: '80px',
    align: 'right',
  },
  {
    key: 'diagnosis',
    label: 'Diagnosis',
    sortable: true,
    width: '180px',
  },
  {
    key: 'provider',
    label: 'Provider',
    sortable: true,
    width: '180px',
  },
  {
    key: 'riskScore',
    label: 'Risk',
    sortable: true,
    width: '90px',
    align: 'right',
  },
  {
    key: 'preventable',
    label: 'Preventable',
    sortable: true,
    width: '110px',
    align: 'center',
  }
];

export default function ReportPage() {
  const totalReadmissions = reportData.length;
  const readmissionRate = ((reportData.length / 200) * 100).toFixed(1);
  const avgDaysToReadmit = (reportData.reduce((sum, d) => sum + (d.daysToReadmit || 0), 0) / reportData.length).toFixed(0);
  const preventableCount = reportData.filter(d => d.preventable === 'Yes').length;

  return (
    <ReportTemplate
      title="Readmission Risk Analysis"
      description="30-day readmission tracking and risk prediction"
      icon={<AlertCircle className="h-6 w-6 text-blue-600" />}
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
              <CardTitle className="text-sm font-medium text-gray-600">Readmissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalReadmissions}</div>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Readmission Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{readmissionRate}%</div>
                </div>
                <TrendingDown className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Days to Readmit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{avgDaysToReadmit}days</div>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Preventable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{preventableCount}</div>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
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
              <div className="text-xs mt-2">Charts, graphs, and detailed insights for Readmission Risk Analysis</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  );
}
