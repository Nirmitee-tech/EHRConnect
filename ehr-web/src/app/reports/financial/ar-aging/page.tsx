'use client';

import { ReportTemplate } from '@/components/reports/ReportTemplate';
import { TableColumn } from '@/components/reports/TableView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, DollarSign, TrendingUp, AlertTriangle, AlertCircle } from 'lucide-react';
import { generateARAgingData } from '@/lib/report-data-generators';

const reportData = generateARAgingData(30);

// Table columns
const tableColumns: TableColumn[] = [
  {
    key: 'id',
    label: 'AR ID',
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
    key: 'invoiceNumber',
    label: 'Invoice',
    sortable: true,
    width: '130px',
  },
  {
    key: 'invoiceDate',
    label: 'Date',
    sortable: true,
    width: '120px',
  },
  {
    key: 'payer',
    label: 'Payer',
    sortable: true,
    width: '150px',
  },
  {
    key: 'totalAmount',
    label: 'Total',
    sortable: true,
    width: '120px',
    align: 'right',
    render: (value) => <span className="font-semibold text-green-600">${value.toLocaleString()}</span>
  },
  {
    key: 'outstandingAmount',
    label: 'Outstanding',
    sortable: true,
    width: '130px',
    align: 'right',
    render: (value) => <span className="font-semibold text-green-600">${value.toLocaleString()}</span>
  },
  {
    key: 'agingBucket',
    label: 'Aging',
    sortable: true,
    width: '100px',
    align: 'center',
  },
  {
    key: 'lastContact',
    label: 'Last Contact',
    sortable: true,
    width: '120px',
  }
];

export default function ReportPage() {
  const totalAR = '$' + (reportData.reduce((sum, d) => sum + (d.outstandingAmount || 0), 0) / 1000).toFixed(1) + 'K';
  const bucket0_30 = '$' + (reportData.filter(d => d.agingBucket === '0-30').reduce((sum, d) => sum + (d.outstandingAmount || 0), 0) / 1000).toFixed(1) + 'K';
  const bucket31_90 = '$' + (reportData.filter(d => d.agingBucket === '31-60' || d.agingBucket === '61-90').reduce((sum, d) => sum + (d.outstandingAmount || 0), 0) / 1000).toFixed(1) + 'K';
  const bucket90Plus = '$' + (reportData.filter(d => d.agingBucket === '91-120' || d.agingBucket === '120+').reduce((sum, d) => sum + (d.outstandingAmount || 0), 0) / 1000).toFixed(1) + 'K';

  return (
    <ReportTemplate
      title="A/R Aging Report"
      description="Accounts receivable aging analysis and collection tracking"
      icon={<Clock className="h-6 w-6 text-blue-600" />}
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
              <CardTitle className="text-sm font-medium text-gray-600">Total A/R</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalAR}</div>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">0-30 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{bucket0_30}</div>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">31-90 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{bucket31_90}</div>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">90+ Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{bucket90Plus}</div>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-600" />
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
              <div className="text-xs mt-2">Charts, graphs, and detailed insights for A/R Aging Report</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  );
}
