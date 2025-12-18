'use client';

import { ReportTemplate } from '@/components/reports/ReportTemplate';
import { TableColumn } from '@/components/reports/TableView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, TrendingUp, Minus, TrendingDown } from 'lucide-react';
import { generateProviderProductivityData } from '@/lib/report-data-generators';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

const reportData = generateProviderProductivityData(30);



export default function ReportPage() {
  const aboveBenchmark = (40 + Math.random() * 20).toFixed(0);
  const atBenchmark = (20 + Math.random() * 10).toFixed(0);
  const belowBenchmark = (30 + Math.random() * 15).toFixed(0);
  const totalProviders = reportData.length;

  return (
    <ReportTemplate
      title="Performance Benchmarking"
      description="Comparison to national standards and peer organizations"
      icon={<BarChart2 className="h-6 w-6 text-blue-600" />}
      onExport={() => console.log('Exporting...')}
      onRefresh={() => console.log('Refreshing...')}
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card key="0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Above Benchmark</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{aboveBenchmark}%</div>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">At Benchmark</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{atBenchmark}%</div>
                </div>
                <Minus className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Below Benchmark</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{belowBenchmark}%</div>
                </div>
                <TrendingDown className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card key="3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Metrics Tracked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalProviders}</div>
                </div>
                <BarChart2 className="h-8 w-8 text-blue-600" />
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
              <div className="text-xs mt-2">Charts, graphs, and detailed insights for Performance Benchmarking</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportTemplate>
  );
}
