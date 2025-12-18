'use client';

import { ReportTemplate } from '@/components/reports/ReportTemplate';
import { TableColumn } from '@/components/reports/TableView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck, FileText, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { generateClaimsData } from '@/lib/report-data-generators';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

const reportData = generateClaimsData(30);

// Table columns
const tableColumns: TableColumn[] = [
  {
    key: 'id',
    label: 'Claim ID',
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
    key: 'serviceDate',
    label: 'Service',
    sortable: true,
    width: '120px',
  },
  {
    key: 'submissionDate',
    label: 'Submitted',
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
    key: 'provider',
    label: 'Provider',
    sortable: true,
    width: '180px',
  },
  {
    key: 'claimAmount',
    label: 'Claim',
    sortable: true,
    width: '120px',
    align: 'right',
    render: (value) => <span className="font-semibold text-green-600">${value.toLocaleString()}</span>
  },
  {
    key: 'paidAmount',
    label: 'Paid',
    sortable: true,
    width: '120px',
    align: 'right',
    render: (value) => <span className="font-semibold text-green-600">${value.toLocaleString()}</span>
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '120px',
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
  const totalClaims = reportData.length;
  const approvalRate = ((reportData.filter(d => d.status === 'Approved' || d.status === 'Paid').length / reportData.length) * 100).toFixed(0);
  const pendingCount = reportData.filter(d => d.status === 'Pending' || d.status === 'Pending Review' || d.status === 'Scheduled').length;
  const totalAmount = '$' + (reportData.reduce((sum, d) => sum + (d.claimAmount || 0), 0) / 1000).toFixed(1) + 'K';

  return (
    <ReportTemplate
      title="Claims Submission"
      description="Insurance claim submissions, status tracking, and processing metrics"
      icon={<FileCheck className="h-6 w-6 text-blue-600" />}
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
              <CardTitle className="text-sm font-medium text-gray-600">Total Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalClaims}</div>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Approval Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{approvalRate}%</div>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalAmount}</div>
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
              <div className="text-xs mt-2">Charts, graphs, and detailed insights for Claims Submission</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  );
}
