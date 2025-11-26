'use client';

import { ReactNode } from 'react';
import { ReportTemplate } from './ReportTemplate';
import { TableColumn } from './TableView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, CheckCircle } from 'lucide-react';

interface GenericReportPageProps {
  title: string;
  description: string;
  icon: ReactNode;
  kpis?: Array<{
    label: string;
    value: string | number;
    change?: string;
    icon: ReactNode;
  }>;
}

const sampleData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 }
];

// Sample table data
const generateTableData = (count: number = 15) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `REC-${10000 + i}`,
    name: `Record ${i + 1}`,
    value: Math.floor(Math.random() * 10000),
    status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Pending' : 'Completed',
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: ['Category A', 'Category B', 'Category C'][i % 3]
  }));
};

// Generic table columns
const tableColumns: TableColumn[] = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    width: '120px',
    render: (value) => (
      <span className="font-mono text-blue-600 font-medium">{value}</span>
    )
  },
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    width: '200px'
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
    width: '150px'
  },
  {
    key: 'value',
    label: 'Value',
    sortable: true,
    width: '120px',
    align: 'right',
    render: (value) => (
      <span className="font-semibold text-gray-900">${value.toLocaleString()}</span>
    )
  },
  {
    key: 'date',
    label: 'Date',
    sortable: true,
    width: '120px'
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '120px',
    align: 'center',
    render: (value) => (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        value === 'Active' ? 'bg-green-100 text-green-800' :
        value === 'Pending' ? 'bg-orange-100 text-orange-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {value === 'Active' && <CheckCircle className="h-3 w-3" />}
        {value}
      </span>
    )
  }
];

export function GenericReportPage({ title, description, icon, kpis }: GenericReportPageProps) {
  const tableData = generateTableData(25);
  return (
    <ReportTemplate
      title={title}
      description={description}
      icon={icon}
      onExport={() => console.log('Exporting...')}
      onRefresh={() => console.log('Refreshing...')}
      tableColumns={tableColumns}
      tableData={tableData}
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        {kpis && kpis.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {kpis.map((kpi, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">{kpi.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                      {kpi.change && (
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <TrendingUp className="h-3 w-3" />
                          {kpi.change}
                        </p>
                      )}
                    </div>
                    {kpi.icon}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Sample Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sample Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">
                This report is currently being configured. Detailed data will be displayed here once the report logic is implemented.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  );
}
