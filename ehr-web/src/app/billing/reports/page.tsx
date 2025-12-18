'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, FileText, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import billingService from '@/services/billing.service';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('week');

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [denialData, setDenialData] = useState<any[]>([]);
  const [kpis, setKPIs] = useState<any>(null);

  useEffect(() => {
    loadReports();
  }, [dateRange, groupBy]);

  const loadReports = async () => {
    try {
      setLoading(true);

      // Load KPIs
      const kpiData = await billingService.getDashboardKPIs(dateRange.startDate, dateRange.endDate);
      setKPIs(kpiData);

      // Load Revenue Report
      const revenue = await billingService.getRevenueReport(dateRange.startDate, dateRange.endDate, groupBy);
      setRevenueData(revenue);

      // Load Denials Report
      const denials = await billingService.getDenialsReport(dateRange.startDate, dateRange.endDate);
      setDenialData(denials);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              Billing Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Financial insights and performance metrics
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Date Range & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>

          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>

          <div>
            <Label>Group By</Label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button onClick={loadReports} className="w-full bg-blue-600 hover:bg-blue-700">
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 uppercase">Total Billed</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(kpis.totalBilled)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 uppercase">Total Collected</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(kpis.totalCollected)}</p>
            <p className="text-xs text-gray-600 mt-1">{kpis.collectionRate.toFixed(1)}% collection rate</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 uppercase">Denial Rate</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{kpis.denialRate.toFixed(1)}%</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 rounded-full p-3">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 uppercase">Avg Payment Lag</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">{kpis.avgPaymentLag} days</p>
          </div>
        </div>
      )}

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend - Billed vs Collected</h2>

        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="period"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="billed"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Billed"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="collected"
                stroke="#10b981"
                strokeWidth={2}
                name="Collected"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No revenue data available for selected period</p>
          </div>
        )}
      </div>

      {/* Denials Analysis */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Denial Reasons Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Denial Reasons</h2>

          {denialData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={denialData.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: '11px' }} />
                <YAxis
                  type="category"
                  dataKey="denial_reason"
                  stroke="#6b7280"
                  style={{ fontSize: '11px' }}
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No denial data available</p>
            </div>
          )}
        </div>

        {/* Claims Status Distribution */}
        {kpis && kpis.claimsByStatus && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Claims by Status</h2>

            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={kpis.claimsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count, percent }: any) =>
                    `${status}: ${count} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                >
                  {kpis.claimsByStatus.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Detailed Denial Table */}
      {denialData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Denial Details</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Denial Reason</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {denialData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.denial_reason}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{item.count}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                      {formatCurrency(parseFloat(item.total_amount))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {formatCurrency(parseFloat(item.total_amount) / item.count)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
