'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface JobRoleStatisticsChartProps {
  data: Array<{
    name: string
    value: number
  }>
  selectedRole: string | null
  onRoleClick: (roleName: string | null) => void
  isLoading?: boolean
  error?: string | null
}

const pieColors = [
  '#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171',
  '#fb7185', '#818cf8', '#f472b6', '#38bdf8', '#22d3ee'
]

export default function JobRoleStatisticsChart({ 
  data, 
  selectedRole, 
  onRoleClick,
  isLoading, 
  error 
}: JobRoleStatisticsChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[380px]">
        <div className="text-gray-400">데이터를 불러오는 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[380px]">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[380px]">
        <div className="text-gray-400 text-sm">데이터가 없습니다.</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={380}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="42%"
          labelLine={false}
          label={({ name, percent }) =>
            percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
          }
          outerRadius={100}
          innerRadius={40}
          fill="#6b7280"
          dataKey="value"
          onClick={(data: any) => {
            if (selectedRole === data.name) {
              onRoleClick(null)
            } else {
              onRoleClick(data.name)
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={pieColors[index % pieColors.length]}
              stroke={selectedRole === entry.name ? '#60a5fa' : '#1a2d47'}
              strokeWidth={selectedRole === entry.name ? 3 : 1}
            />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1a2d47', 
            border: '1px solid #2a3f5f', 
            borderRadius: '8px', 
            color: '#e5e7eb',
            fontSize: '13px'
          }}
          formatter={(value: number, name: string) => [
            `${value}건`,
            name
          ]}
        />
        <Legend 
          verticalAlign="bottom" 
          height={80}
          wrapperStyle={{ paddingTop: '20px', color: '#9ca3af' }}
          formatter={(value) => <span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{value}</span>}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  )
}


