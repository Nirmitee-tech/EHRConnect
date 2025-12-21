'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';

interface E2DataPoint {
  stimDay: number;
  date: string;
  value: number;
  perFollicle: number;
}

interface E2TrendChartProps {
  data: E2DataPoint[];
  follicleCount?: number;
}

export default function E2TrendChart({ data, follicleCount }: E2TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-500">
        No E2 trend data available
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = data.map(d => ({
    day: `D${d.stimDay}`,
    stimDay: d.stimDay,
    'E2 (pg/mL)': d.value,
    'Per Follicle': d.perFollicle
  }));

  // Calculate peak E2 and status
  const peakE2 = Math.max(...data.map(d => d.value));
  const latestE2 = data[data.length - 1];
  const latestPerFollicle = latestE2.perFollicle;

  // Determine E2 status
  let e2Status = 'normal';
  let e2StatusText = 'Normal Response';
  let e2StatusColor = 'text-green-600';

  if (peakE2 > 3000) {
    e2Status = 'high';
    e2StatusText = 'OHSS Risk - High E2';
    e2StatusColor = 'text-red-600';
  } else if (peakE2 > 2500) {
    e2Status = 'moderate';
    e2StatusText = 'Moderate E2 - Monitor Closely';
    e2StatusColor = 'text-orange-600';
  } else if (peakE2 < 500 && data.length >= 5) {
    e2Status = 'low';
    e2StatusText = 'Low Response - Consider Adjustment';
    e2StatusColor = 'text-yellow-600';
  }

  // Per follicle status
  let perFollicleStatus = 'normal';
  let perFollicleStatusText = 'Optimal (50-200 pg/mL per follicle)';
  let perFollicleStatusColor = 'text-green-600';

  if (latestPerFollicle > 200) {
    perFollicleStatus = 'high';
    perFollicleStatusText = 'High per follicle (>200) - OHSS risk';
    perFollicleStatusColor = 'text-red-600';
  } else if (latestPerFollicle < 50 && latestE2.value > 500) {
    perFollicleStatus = 'low';
    perFollicleStatusText = 'Low per follicle (<50) - Check count';
    perFollicleStatusColor = 'text-yellow-600';
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
          <div className="font-semibold text-gray-900 mb-2">{label}</div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-blue-600">E2 Level:</span>
              <span className="font-semibold text-blue-700">{data['E2 (pg/mL)']} pg/mL</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-purple-600">Per Follicle:</span>
              <span className="font-semibold text-purple-700">{data['Per Follicle']} pg/mL</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div className={`p-3 rounded-lg ${
        e2Status === 'high' ? 'bg-red-50 border border-red-200' :
        e2Status === 'moderate' ? 'bg-orange-50 border border-orange-200' :
        e2Status === 'low' ? 'bg-yellow-50 border border-yellow-200' :
        'bg-green-50 border border-green-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-sm font-semibold ${e2StatusColor}`}>
              {e2StatusText}
            </div>
            <div className={`text-xs mt-0.5 ${e2StatusColor.replace('600', '700')}`}>
              Peak E2: {peakE2} pg/mL • Current: {latestE2.value} pg/mL
            </div>
          </div>
          <div className={`text-xs font-medium px-2 py-1 rounded ${
            e2Status === 'high' ? 'bg-red-100 text-red-700' :
            e2Status === 'moderate' ? 'bg-orange-100 text-orange-700' :
            e2Status === 'low' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {e2Status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {/* Gradient for E2 area */}
            <linearGradient id="e2Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>

            {/* OHSS Risk Zone (>3000) */}
            <linearGradient id="ohssZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0.05}/>
            </linearGradient>

            {/* Expected Range Zone (per follicle 50-200) */}
            <linearGradient id="expectedZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="day"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'E2 (pg/mL)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />

          {/* OHSS Risk Zone */}
          <ReferenceArea y1={3000} y2={5000} fill="url(#ohssZone)" fillOpacity={1} />
          <ReferenceLine
            y={3000}
            stroke="#dc2626"
            strokeDasharray="3 3"
            label={{
              value: '⚠️ OHSS Risk (>3000)',
              position: 'right',
              style: { fontSize: '10px', fill: '#dc2626', fontWeight: 'bold' }
            }}
          />

          {/* Moderate Zone */}
          <ReferenceLine
            y={2500}
            stroke="#f97316"
            strokeDasharray="3 3"
            label={{
              value: 'High (2500)',
              position: 'right',
              style: { fontSize: '10px', fill: '#f97316' }
            }}
          />

          {/* Expected Range Indicators */}
          <ReferenceLine
            y={1500}
            stroke="#10b981"
            strokeDasharray="3 3"
            label={{
              value: 'Good Range',
              position: 'right',
              style: { fontSize: '10px', fill: '#10b981' }
            }}
          />

          {/* E2 Trend */}
          <Area
            type="monotone"
            dataKey="E2 (pg/mL)"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#e2Gradient)"
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Per Follicle Analysis */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-purple-900">
            Per Follicle Analysis
          </div>
          <div className={`text-xs font-medium ${perFollicleStatusColor}`}>
            {latestPerFollicle} pg/mL per follicle
          </div>
        </div>
        <div className={`text-xs ${perFollicleStatusColor.replace('600', '700')}`}>
          {perFollicleStatusText}
        </div>
        {follicleCount && (
          <div className="text-xs text-purple-700 mt-1">
            Calculation: {latestE2.value} pg/mL ÷ {follicleCount} follicles = {latestPerFollicle} pg/mL
          </div>
        )}
      </div>

      {/* Clinical Guidelines */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-lg">
        <div>
          <div className="font-semibold text-gray-700 mb-1">E2 Zones:</div>
          <div className="space-y-0.5 text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>&lt;2500: Normal response</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
              <span>2500-3000: High, monitor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span>&gt;3000: OHSS risk</span>
            </div>
          </div>
        </div>
        <div>
          <div className="font-semibold text-gray-700 mb-1">Per Follicle:</div>
          <div className="space-y-0.5 text-gray-600">
            <div>&lt;50: Low (check count)</div>
            <div className="text-green-600 font-medium">50-200: Optimal ✓</div>
            <div>&gt;200: High (OHSS risk)</div>
          </div>
        </div>
      </div>

      {/* Clinical Actions */}
      {(e2Status === 'high' || e2Status === 'moderate' || perFollicleStatus === 'high') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-sm font-semibold text-red-900 mb-1">⚠️ OHSS Prevention Strategies</div>
          <div className="text-xs text-red-800 space-y-1">
            <div>• Consider GnRH agonist trigger (instead of hCG)</div>
            <div>• Freeze all embryos (avoid fresh transfer)</div>
            <div>• Coasting if E2 continues to rise</div>
            <div>• Cabergoline 0.5mg daily × 8 days post-retrieval</div>
            <div>• Close monitoring Days 3, 5, 7 post-retrieval</div>
          </div>
        </div>
      )}

      {e2Status === 'low' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-sm font-semibold text-yellow-900 mb-1">Protocol Adjustment Considerations</div>
          <div className="text-xs text-yellow-800 space-y-1">
            <div>• Verify medication compliance</div>
            <div>• Consider increasing FSH dose</div>
            <div>• Extend stimulation duration if needed</div>
            <div>• Check for premature LH surge</div>
          </div>
        </div>
      )}
    </div>
  );
}
