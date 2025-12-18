'use client';

import { ReportTemplate } from '@/components/reports/ReportTemplate';
import { TableColumn } from '@/components/reports/TableView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, FileText, AlertTriangle, XCircle } from 'lucide-react';
import { generateMedicationData } from '@/lib/report-data-generators';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

const reportData = generateMedicationData(30);

// Table columns
const tableColumns: TableColumn[] = [
  {
    key: 'id',
    label: 'Order ID',
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
    key: 'medication',
    label: 'Medication',
    sortable: true,
    width: '180px',
  },
  {
    key: 'dosage',
    label: 'Dosage',
    sortable: true,
    width: '100px',
  },
  {
    key: 'frequency',
    label: 'Frequency',
    sortable: true,
    width: '140px',
  },
  {
    key: 'prescriber',
    label: 'Prescriber',
    sortable: true,
    width: '180px',
  },
  {
    key: 'startDate',
    label: 'Start Date',
    sortable: true,
    width: '120px',
  },
  {
    key: 'refillsRemaining',
    label: 'Refills',
    sortable: true,
    width: '80px',
    align: 'center',
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
  const activeCount = reportData.filter(d => d.status === 'Active' || d.status === 'Stable').length;
  const totalMeds = reportData.length;
  const refillsNeeded = reportData.filter(d => d.refillsRemaining === 0).length;
  const discontinuedCount = reportData.filter(d => d.status === 'Discontinued' || d.status === 'Inactive').length;

  return (
    <ReportTemplate
      title="Medication Orders"
      description="Prescriptions, medication administration records, and pharmacy orders"
      icon={<Pill className="h-6 w-6 text-blue-600" />}
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
              <CardTitle className="text-sm font-medium text-gray-600">Active Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
                </div>
                <Pill className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalMeds}</div>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Refills Needed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{refillsNeeded}</div>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Discontinued</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{discontinuedCount}</div>
                </div>
                <XCircle className="h-8 w-8 text-blue-600" />
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
              <div className="text-xs mt-2">Charts, graphs, and detailed insights for Medication Orders</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  );
}
