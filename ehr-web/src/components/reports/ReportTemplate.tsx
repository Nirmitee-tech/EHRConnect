'use client';

import { ReactNode, useState } from 'react';
import { Download, Filter, Calendar, RefreshCw, LayoutGrid, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TableView, TableColumn } from './TableView';
import { cn } from '@/lib/utils';

interface ReportTemplateProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  onExport?: () => void;
  onRefresh?: () => void;
  showDateFilter?: boolean;
  showCustomFilters?: boolean;
  customFilters?: ReactNode;
  // Table view props
  tableColumns?: TableColumn[];
  tableData?: any[];
}

export function ReportTemplate({
  title,
  description,
  icon,
  children,
  onExport,
  onRefresh,
  showDateFilter = true,
  showCustomFilters = false,
  customFilters,
  tableColumns,
  tableData = []
}: ReportTemplateProps) {
  const [viewMode, setViewMode] = useState<'dashboard' | 'table'>('dashboard');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Show table view if enabled and table data is available
  if (viewMode === 'table' && tableColumns && tableColumns.length > 0) {
    return (
      <TableView
        title={title}
        description={description}
        columns={tableColumns}
        data={tableData}
        onRefresh={onRefresh}
        onExport={onExport}
        searchPlaceholder={`Search ${title.toLowerCase()}...`}
      />
    );
  }

  // Dashboard view
  return (
    <div className="p-6 space-y-6 bg-white min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          {tableColumns && tableColumns.length > 0 && (
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mr-2">
              <Button
                size="sm"
                onClick={() => setViewMode('dashboard')}
                className={cn(
                  "h-8 px-3 text-xs",
                  viewMode === 'dashboard'
                    ? 'bg-white text-gray-900 shadow-sm hover:bg-white'
                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                Dashboard
              </Button>
              <Button
                size="sm"
                onClick={() => setViewMode('table')}
                className={cn(
                  "h-8 px-3 text-xs",
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm hover:bg-white'
                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
                )}
              >
                <Table2 className="h-3.5 w-3.5 mr-1.5" />
                Table
              </Button>
            </div>
          )}

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {(showDateFilter || showCustomFilters) && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <CardTitle className="text-base">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {showDateFilter && (
                <>
                  <div>
                    <Label htmlFor="startDate" className="text-sm">Start Date</Label>
                    <div className="relative mt-1">
                      <Input
                        id="startDate"
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        className="pl-9"
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="endDate" className="text-sm">End Date</Label>
                    <div className="relative mt-1">
                      <Input
                        id="endDate"
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        className="pl-9"
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </>
              )}

              {showCustomFilters && customFilters}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Content */}
      <div>
        {children}
      </div>
    </div>
  );
}
