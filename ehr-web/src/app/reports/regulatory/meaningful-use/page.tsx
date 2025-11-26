'use client';

import { ReportTemplate } from '@/components/reports/ReportTemplate';
import { TableColumn } from '@/components/reports/TableView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, CheckCircle, XCircle, Clock } from 'lucide-react';
import { generateComplianceData } from '@/lib/report-data-generators';

const reportData = generateComplianceData(30);

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
    key: 'requirement',
    label: 'Requirement',
    sortable: true,
    width: '200px',
  },
  {
    key: 'department',
    label: 'Department',
    sortable: true,
    width: '150px',
  },
  {
    key: 'lastAudit',
    label: 'Last Audit',
    sortable: true,
    width: '120px',
  },
  {
    key: 'nextAudit',
    label: 'Next Audit',
    sortable: true,
    width: '120px',
  },
  {
    key: 'owner',
    label: 'Owner',
    sortable: true,
    width: '180px',
  },
  {
    key: 'findings',
    label: 'Findings',
    sortable: true,
    width: '100px',
    align: 'center',
  },
  {
    key: 'riskLevel',
    label: 'Risk',
    sortable: true,
    width: '100px',
    render: (value) => (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        value === 'Low' ? 'bg-green-100 text-green-800' :
        value === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
        value === 'High' ? 'bg-orange-100 text-orange-800' :
        'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    )
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
  const complianceRate = ((reportData.filter(d => d.status === 'Compliant').length / reportData.length) * 100).toFixed(0);
  const compliantCount = reportData.filter(d => d.status === 'Compliant').length;
  const nonCompliantCount = reportData.filter(d => d.status === 'Non-Compliant' || d.status === 'Inactive').length;
  const pendingCount = reportData.filter(d => d.status === 'Pending' || d.status === 'Pending Review' || d.status === 'Scheduled').length;

  return (
    <ReportTemplate
      title="Meaningful Use Compliance"
      description="EHR meaningful use measures and attestation readiness"
      icon={<Award className="h-6 w-6 text-blue-600" />}
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
              <CardTitle className="text-sm font-medium text-gray-600">Compliance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{complianceRate}%</div>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{compliantCount}</div>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Non-Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{nonCompliantCount}</div>
                </div>
                <XCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
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
        </div>

        {/* Visualization placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics & Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <div className="text-sm">Data visualizations and trend analysis will be displayed here</div>
              <div className="text-xs mt-2">Charts, graphs, and detailed insights for Meaningful Use Compliance</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  );
}
