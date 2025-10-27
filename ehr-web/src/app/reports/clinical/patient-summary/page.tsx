'use client';

import { ReportTemplate } from '@/components/reports/ReportTemplate';
import { TableColumn } from '@/components/reports/TableView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users, AlertTriangle, Calendar, Activity } from 'lucide-react';
import { generatePatientSummaryData } from '@/lib/report-data-generators';

const reportData = generatePatientSummaryData(30);

// Table columns
const tableColumns: TableColumn[] = [
  {
    key: 'id',
    label: 'Patient ID',
    sortable: true,
    width: '120px',
    render: (value) => <span className="font-mono text-blue-600 font-medium">{value}</span>
  },
  {
    key: 'patientName',
    label: 'Patient Name',
    sortable: true,
    width: '200px',
    render: (value) => <span className="font-medium text-gray-900">{value}</span>
  },
  {
    key: 'age',
    label: 'Age',
    sortable: true,
    width: '80px',
    align: 'center',
  },
  {
    key: 'gender',
    label: 'Gender',
    sortable: true,
    width: '100px',
  },
  {
    key: 'condition',
    label: 'Primary Condition',
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
    key: 'lastVisit',
    label: 'Last Visit',
    sortable: true,
    width: '120px',
  },
  {
    key: 'riskScore',
    label: 'Risk',
    sortable: true,
    width: '80px',
    align: 'center',
    render: (value) => <span className={`font-semibold ${value >= 7 ? 'text-red-600' : value >= 4 ? 'text-orange-600' : 'text-green-600'}`}>{value}/10</span>
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
  const totalPatients = reportData.length;
  const highRiskCount = reportData.filter(d => d.riskScore >= 7).length;
  const avgAge = (reportData.reduce((sum, d) => sum + (d.age || 0), 0) / reportData.length).toFixed(0);
  const activeCount = reportData.filter(d => d.status === 'Active' || d.status === 'Stable').length;

  return (
    <ReportTemplate
      title="Patient Summary Reports"
      description="Comprehensive patient demographics, medical history, and current status"
      icon={<User className="h-6 w-6 text-blue-600" />}
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
              <CardTitle className="text-sm font-medium text-gray-600">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalPatients}</div>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">High Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{highRiskCount}</div>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Age</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{avgAge}years</div>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
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
              <div className="text-xs mt-2">Charts, graphs, and detailed insights for Patient Summary Reports</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  );
}
