'use client';

import React from 'react';

interface DataPoint {
  value: number;
  timestamp: string;
  label?: string;
}

interface TrendChartProps {
  data: DataPoint[];
  label: string;
  unit: string;
  color?: 'blue' | 'green' | 'red' | 'purple';
  height?: number;
}

export function TrendChart({
  data,
  label,
  unit,
  color = 'blue',
  height = 100
}: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
        No trend data available
      </div>
    );
  }

  const colorStyles = {
    blue: { line: 'stroke-blue-600', fill: 'fill-blue-100', point: 'fill-blue-600' },
    green: { line: 'stroke-green-600', fill: 'fill-green-100', point: 'fill-green-600' },
    red: { line: 'stroke-red-600', fill: 'fill-red-100', point: 'fill-red-600' },
    purple: { line: 'stroke-purple-600', fill: 'fill-purple-100', point: 'fill-purple-600' }
  };

  const styles = colorStyles[color];

  // Calculate min/max for scaling
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // Generate SVG path
  const width = 400;
  const padding = 20;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d.value - minValue) / valueRange) * chartHeight;
    return { x, y, value: d.value, timestamp: d.timestamp };
  });

  const linePath = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-sm font-semibold text-gray-700 mb-2">{label}</div>
      <svg width={width} height={height} className="w-full">
        {/* Area under the curve */}
        <path d={areaPath} className={`${styles.fill} opacity-20`} />

        {/* Line */}
        <path
          d={linePath}
          className={styles.line}
          fill="none"
          strokeWidth="2"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              className={styles.point}
            />
            <title>{`${p.value} ${unit} - ${p.timestamp}`}</title>
          </g>
        ))}

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
          const y = padding + chartHeight * (1 - fraction);
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        })}
      </svg>

      {/* Latest reading */}
      <div className="mt-2 text-xs text-gray-600 flex justify-between">
        <span>Latest: <span className="font-semibold">{data[data.length - 1].value} {unit}</span></span>
        <span>Range: {minValue.toFixed(1)} - {maxValue.toFixed(1)} {unit}</span>
      </div>
    </div>
  );
}
