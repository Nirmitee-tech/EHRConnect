'use client'

import { DashboardChart } from '@/types/dashboard'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface DashboardChartComponentProps {
  chart: DashboardChart
}

export function DashboardChartComponent({ chart }: DashboardChartComponentProps) {
  const { type, data, options } = chart

  // Transform data for Recharts
  const chartData = data.labels.map((label, index) => {
    const point: Record<string, string | number> = { name: label }
    data.datasets.forEach((dataset) => {
      point[dataset.label] = dataset.data[index]
    })
    return point
  })

  // Default colors for charts
  const COLORS = [
    'rgb(59, 130, 246)',   // blue
    'rgb(34, 197, 94)',    // green
    'rgb(251, 146, 60)',   // orange
    'rgb(239, 68, 68)',    // red
    'rgb(168, 85, 247)',   // purple
    'rgb(148, 163, 184)',  // gray
    'rgb(236, 72, 153)',   // pink
    'rgb(14, 165, 233)'    // cyan
  ]

  if (type === 'line' || type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}K`
              }
              return value.toString()
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px'
            }}
            formatter={(value: number) => {
              if (value >= 1000) {
                return value.toLocaleString()
              }
              return value
            }}
          />
          <Legend />
          {data.datasets.map((dataset, index) => {
            const strokeColor = Array.isArray(dataset.borderColor) 
              ? dataset.borderColor[0] 
              : (dataset.borderColor || COLORS[index % COLORS.length])
            const fillColor = Array.isArray(dataset.backgroundColor)
              ? dataset.backgroundColor[0]
              : (dataset.backgroundColor || COLORS[index % COLORS.length])
            
            return (
              <Line
                key={dataset.label}
                type="monotone"
                dataKey={dataset.label}
                stroke={strokeColor}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                fill={dataset.fill ? fillColor : 'none'}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}K`
              }
              return value.toString()
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px'
            }}
            formatter={(value: number) => {
              if (value >= 1000) {
                return value.toLocaleString()
              }
              return value
            }}
          />
          <Legend />
          {data.datasets.map((dataset, index) => {
            const fillColor = Array.isArray(dataset.backgroundColor)
              ? dataset.backgroundColor[0]
              : (dataset.backgroundColor || COLORS[index % COLORS.length])
            
            return (
              <Bar
                key={dataset.label}
                dataKey={dataset.label}
                fill={fillColor}
                radius={[4, 4, 0, 0]}
              />
            )
          })}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'pie' || type === 'doughnut') {
    // For pie/doughnut, we need to transform data differently
    const pieData = data.labels.map((label, index) => ({
      name: label,
      value: data.datasets[0].data[index]
    }))

    const colors = Array.isArray(data.datasets[0].backgroundColor)
      ? data.datasets[0].backgroundColor
      : COLORS

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => 
              `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`
            }
            outerRadius={type === 'doughnut' ? 100 : 120}
            innerRadius={type === 'doughnut' ? 60 : 0}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px'
            }}
            formatter={(value: number) => {
              if (value >= 1000) {
                return value.toLocaleString()
              }
              return value
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <p>Chart type &quot;{type}&quot; not yet supported</p>
    </div>
  )
}
