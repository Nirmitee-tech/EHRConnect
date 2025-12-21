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
  ReferenceDot,
  Label
} from 'recharts';

interface CumulativeSuccessChartProps {
  totalEmbryos: number;
  topQualityCount?: number;
  perTransferSuccessRate: number; // Live birth rate per transfer (%)
  currentTransferNumber?: number;
}

export default function CumulativeSuccessChart({
  totalEmbryos,
  topQualityCount = 0,
  perTransferSuccessRate,
  currentTransferNumber = 0
}: CumulativeSuccessChartProps) {
  if (!totalEmbryos || totalEmbryos === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-500">
        No embryo data available for cumulative success calculation
      </div>
    );
  }

  // Calculate cumulative success for each transfer number
  // Formula: P(at least one success) = 1 - P(all fail) = 1 - (1-p)^n
  const failureRate = 1 - (perTransferSuccessRate / 100);

  const maxTransfers = Math.min(totalEmbryos, 6); // Cap at 6 transfers for visualization
  const chartData = [];

  for (let i = 0; i <= maxTransfers; i++) {
    const cumulativeSuccess = i === 0 ? 0 : (1 - Math.pow(failureRate, i)) * 100;
    chartData.push({
      transfer: i,
      transferLabel: i === 0 ? 'Start' : `${i}`,
      'Cumulative Live Birth %': Math.round(cumulativeSuccess),
      isCurrent: i === currentTransferNumber
    });
  }

  // Determine status color based on probability
  const currentProbability = currentTransferNumber > 0
    ? chartData[currentTransferNumber]['Cumulative Live Birth %']
    : chartData[1]['Cumulative Live Birth %'];

  let statusColor = 'text-green-600';
  let statusBg = 'bg-green-50';
  let statusBorder = 'border-green-200';
  let statusText = 'Excellent Prognosis';

  if (currentProbability >= 80) {
    statusColor = 'text-green-600';
    statusBg = 'bg-green-50';
    statusBorder = 'border-green-200';
    statusText = 'Excellent Prognosis';
  } else if (currentProbability >= 60) {
    statusColor = 'text-blue-600';
    statusBg = 'bg-blue-50';
    statusBorder = 'border-blue-200';
    statusText = 'Good Prognosis';
  } else if (currentProbability >= 40) {
    statusColor = 'text-yellow-600';
    statusBg = 'bg-yellow-50';
    statusBorder = 'border-yellow-200';
    statusText = 'Fair Prognosis';
  } else {
    statusColor = 'text-orange-600';
    statusBg = 'bg-orange-50';
    statusBorder = 'border-orange-200';
    statusText = 'Guarded Prognosis';
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
          <div className="font-semibold text-gray-900 mb-2">
            {data.transfer === 0 ? 'Starting Point' : `After Transfer ${data.transfer}`}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-purple-600">Cumulative Success:</span>
              <span className="font-semibold text-purple-700">
                {data['Cumulative Live Birth %']}%
              </span>
            </div>
            {data.isCurrent && (
              <div className="text-pink-600 font-medium mt-2 pt-2 border-t border-gray-200">
                ← You are here
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div className={`p-3 rounded-lg border ${statusBg} ${statusBorder}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-sm font-semibold ${statusColor}`}>
              {statusText}
            </div>
            <div className={`text-xs mt-0.5 ${statusColor.replace('600', '700')}`}>
              {totalEmbryos} embryo{totalEmbryos > 1 ? 's' : ''} available
              {topQualityCount > 0 && ` (${topQualityCount} top quality)`}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-700">
              {currentProbability}%
            </div>
            <div className="text-xs text-purple-600">
              {currentTransferNumber > 0 ? `After ${currentTransferNumber} transfer${currentTransferNumber > 1 ? 's' : ''}` : 'First transfer'}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="transferLabel"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          >
            <Label value="Number of Embryo Transfers" offset={-10} position="insideBottom" style={{ fontSize: '12px', fill: '#6b7280' }} />
          </XAxis>
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            label={{ value: 'Cumulative Live Birth Probability (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Area for cumulative success */}
          <Area
            type="monotone"
            dataKey="Cumulative Live Birth %"
            stroke="#8b5cf6"
            strokeWidth={3}
            fill="url(#successGradient)"
            dot={(props: any) => {
              if (props.payload.isCurrent) {
                return (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={8}
                    fill="#ec4899"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                );
              }
              return <circle {...props} fill="#8b5cf6" r={5} />;
            }}
            activeDot={{ r: 7 }}
          />

          {/* Mark current position */}
          {currentTransferNumber > 0 && currentTransferNumber <= maxTransfers && (
            <ReferenceDot
              x={currentTransferNumber}
              y={chartData[currentTransferNumber]['Cumulative Live Birth %']}
              r={10}
              fill="#ec4899"
              stroke="#fff"
              strokeWidth={2}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {/* Transfer-by-Transfer Breakdown */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="text-sm font-semibold text-gray-900 mb-2">Transfer-by-Transfer Probability</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {chartData.slice(1, maxTransfers + 1).map((data, idx) => (
            <div
              key={idx}
              className={`flex justify-between p-2 rounded ${
                data.isCurrent
                  ? 'bg-pink-100 border border-pink-300'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <span className={`font-medium ${data.isCurrent ? 'text-pink-700' : 'text-gray-600'}`}>
                {data.isCurrent && '→ '}Transfer {data.transfer}:
              </span>
              <span className={`font-semibold ${
                data['Cumulative Live Birth %'] >= 80 ? 'text-green-600' :
                data['Cumulative Live Birth %'] >= 60 ? 'text-blue-600' :
                data['Cumulative Live Birth %'] >= 40 ? 'text-yellow-600' :
                'text-orange-600'
              }`}>
                {data['Cumulative Live Birth %']}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Financial & Timeline Perspective */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-blue-900 mb-1">💰 Financial Perspective</div>
          <div className="text-xs text-blue-800 space-y-0.5">
            <div>• No additional retrieval cost</div>
            <div>• FET cycles more affordable</div>
            <div>• High success within supply</div>
            {chartData[Math.min(3, maxTransfers)]['Cumulative Live Birth %'] >= 85 && (
              <div className="font-medium mt-1">✓ 85%+ success by transfer 3</div>
            )}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-purple-900 mb-1">⏱️ Timeline Flexibility</div>
          <div className="text-xs text-purple-800 space-y-0.5">
            <div>• Space pregnancies as desired</div>
            <div>• No urgency for immediate transfers</div>
            <div>• Multiple children possible</div>
            {totalEmbryos >= 5 && (
              <div className="font-medium mt-1">✓ Sufficient for multiple children</div>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Interpretation */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
        <div className="text-sm font-semibold text-purple-900 mb-2">Clinical Interpretation</div>
        <div className="text-xs text-purple-800 space-y-1">
          {chartData[1]['Cumulative Live Birth %'] >= 60 && (
            <div>✅ Strong first transfer probability - consider single embryo transfer to reduce twin risk</div>
          )}
          {chartData[Math.min(2, maxTransfers)]['Cumulative Live Birth %'] >= 80 && (
            <div>✅ Very likely to succeed within first 2 transfers</div>
          )}
          {totalEmbryos >= 4 && chartData[Math.min(3, maxTransfers)]['Cumulative Live Birth %'] >= 85 && (
            <div>✅ Excellent embryo bank - sufficient for multiple pregnancies</div>
          )}
          {topQualityCount >= 2 && (
            <div>⭐ {topQualityCount} top-quality embryos provide best success rates</div>
          )}
          <div className="mt-2 pt-2 border-t border-purple-300 font-medium">
            Recommendation: Single embryo transfer recommended for optimal outcomes while preserving embryos for future pregnancies
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="text-xs text-gray-500 text-center">
        Calculations based on {perTransferSuccessRate}% live birth rate per embryo transfer (FET)
      </div>
    </div>
  );
}
