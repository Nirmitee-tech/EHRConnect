'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface FollicleDataPoint {
  stimDay: number;
  date: string;
  totalCount: number;
  bySize: {
    small: number;
    medium: number;
    large: number;
    mature: number;
  };
  avgSize: number;
  leadFollicleSize: number;
}

interface FollicleGrowthChartProps {
  data: FollicleDataPoint[];
  growthVelocity?: Array<{
    fromDay: number;
    toDay: number;
    mmPerDay: number;
  }>;
}

export default function FollicleGrowthChart({ data, growthVelocity }: FollicleGrowthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-500">
        No follicle growth data available
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = data.map(d => ({
    day: `D${d.stimDay}`,
    stimDay: d.stimDay,
    'Small (<10mm)': d.bySize.small,
    'Medium (10-14mm)': d.bySize.medium,
    'Large (14-18mm)': d.bySize.large,
    'Mature (≥18mm)': d.bySize.mature,
    'Avg Size': d.avgSize,
    'Lead Follicle': d.leadFollicleSize,
    total: d.totalCount
  }));

  // Calculate average growth velocity
  const avgGrowthVelocity = growthVelocity && growthVelocity.length > 0
    ? (growthVelocity.reduce((sum, v) => sum + v.mmPerDay, 0) / growthVelocity.length).toFixed(1)
    : null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
          <div className="font-semibold text-gray-900 mb-2">{label}</div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Total Follicles:</span>
              <span className="font-semibold text-gray-900">{data.total}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Small (&lt;10mm):</span>
              <span className="font-medium text-gray-600">{data['Small (<10mm)']}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-yellow-600">Medium (10-14mm):</span>
              <span className="font-medium text-yellow-700">{data['Medium (10-14mm)']}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-orange-600">Large (14-18mm):</span>
              <span className="font-medium text-orange-700">{data['Large (14-18mm)']}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-red-600">Mature (≥18mm):</span>
              <span className="font-semibold text-red-700">{data['Mature (≥18mm)']}</span>
            </div>
            <div className="border-t border-gray-200 mt-2 pt-2">
              <div className="flex justify-between gap-4">
                <span className="text-blue-600">Avg Size:</span>
                <span className="font-semibold text-blue-700">{data['Avg Size'].toFixed(1)}mm</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-pink-600">Lead Follicle:</span>
                <span className="font-semibold text-pink-700">{data['Lead Follicle']}mm</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="day"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Follicles / Size (mm)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />

          {/* Reference lines for size thresholds */}
          <ReferenceLine y={18} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Mature (18mm)', position: 'right', style: { fontSize: '10px', fill: '#dc2626' } }} />
          <ReferenceLine y={14} stroke="#ea580c" strokeDasharray="3 3" label={{ value: 'Large (14mm)', position: 'right', style: { fontSize: '10px', fill: '#ea580c' } }} />
          <ReferenceLine y={10} stroke="#ca8a04" strokeDasharray="3 3" label={{ value: 'Medium (10mm)', position: 'right', style: { fontSize: '10px', fill: '#ca8a04' } }} />

          {/* Follicle count lines */}
          <Line
            type="monotone"
            dataKey="Small (<10mm)"
            stroke="#9ca3af"
            strokeWidth={2}
            dot={{ fill: '#9ca3af', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Medium (10-14mm)"
            stroke="#eab308"
            strokeWidth={2}
            dot={{ fill: '#eab308', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Large (14-18mm)"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ fill: '#f97316', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Mature (≥18mm)"
            stroke="#dc2626"
            strokeWidth={3}
            dot={{ fill: '#dc2626', r: 5 }}
            activeDot={{ r: 7 }}
          />

          {/* Size trajectories */}
          <Line
            type="monotone"
            dataKey="Avg Size"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Lead Follicle"
            stroke="#ec4899"
            strokeWidth={3}
            dot={{ fill: '#ec4899', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Growth Velocity Summary */}
      {avgGrowthVelocity && (
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            <span className="text-gray-600">Average Growth Rate:</span>
            <span className="font-semibold text-gray-900">{avgGrowthVelocity} mm/day</span>
          </div>
          {growthVelocity && growthVelocity.length > 0 && (
            <div className="text-xs text-gray-500">
              {growthVelocity.length} measurement intervals
            </div>
          )}
        </div>
      )}

      {/* Legend Description */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-lg">
        <div>
          <div className="font-semibold text-gray-700 mb-1">Follicle Counts:</div>
          <div className="space-y-0.5 text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-gray-400"></div>
              <span>Small (&lt;10mm) - Starting cohort</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-yellow-500"></div>
              <span>Medium (10-14mm) - Growing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-orange-500"></div>
              <span>Large (14-18mm) - Maturing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-600"></div>
              <span>Mature (≥18mm) - Ready for trigger</span>
            </div>
          </div>
        </div>
        <div>
          <div className="font-semibold text-gray-700 mb-1">Size Trajectories:</div>
          <div className="space-y-0.5 text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-blue-500 border-dashed border-b-2"></div>
              <span>Average Size - Cohort average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-pink-500"></div>
              <span>Lead Follicle - Largest follicle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Insights */}
      {chartData.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm font-semibold text-blue-900 mb-1">Clinical Interpretation</div>
          <div className="text-xs text-blue-800 space-y-1">
            {chartData[chartData.length - 1]['Mature (≥18mm)'] >= 3 && (
              <div>✅ Good cohort of mature follicles ({chartData[chartData.length - 1]['Mature (≥18mm)']}) - consider trigger timing</div>
            )}
            {chartData[chartData.length - 1]['Lead Follicle'] >= 18 && (
              <div>✅ Lead follicle ready ({chartData[chartData.length - 1]['Lead Follicle']}mm)</div>
            )}
            {avgGrowthVelocity && parseFloat(avgGrowthVelocity) >= 1.5 && parseFloat(avgGrowthVelocity) <= 2.5 && (
              <div>✅ Optimal growth velocity ({avgGrowthVelocity} mm/day)</div>
            )}
            {avgGrowthVelocity && parseFloat(avgGrowthVelocity) < 1.5 && (
              <div>⚠️ Slower than expected growth - may need protocol adjustment</div>
            )}
            {avgGrowthVelocity && parseFloat(avgGrowthVelocity) > 2.5 && (
              <div>⚠️ Rapid growth - monitor for OHSS risk</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
