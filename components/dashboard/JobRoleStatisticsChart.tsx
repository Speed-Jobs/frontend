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

// 회색 계열 색상 (사진과 유사하게)
const pieColors = [
  '#1f2937', // 가장 어두운 회색 (Software Development)
  '#4b5563', // 중간 어두운 회색 (Solution Development)
  '#111827', // 거의 검은색 (AI)
  '#374151', // 중간 회색 (Factory AX Engineering)
  '#6b7280', // 밝은 회색 (Cloud/Infra Engineering)
  '#9ca3af', // 더 밝은 회색 (Architect)
  '#d1d5db', // 매우 밝은 회색 (Project Management)
  '#e5e7eb', // 가장 밝은 회색 (Quality Management)
  '#f3f4f6', // 거의 흰색 (정보보호)
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
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-gray-500">데이터를 불러오는 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-gray-500 text-sm">데이터가 없습니다.</div>
      </div>
    )
  }

  // 총합 계산
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div>
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">직무</h4>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={({ name, value }) => {
              const percent = (value / total) * 100
              return percent >= 5 ? `${(percent).toFixed(0)}%` : ''
            }}
            outerRadius={110}
            innerRadius={50}
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
            {data.map((entry, index) => {
              const isSelected = selectedRole === entry.name
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={pieColors[index % pieColors.length]}
                  stroke={isSelected ? '#111827' : '#ffffff'}
                  strokeWidth={isSelected ? 3 : 2}
                  opacity={isSelected ? 1 : 0.9}
                />
              )
            })}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px', 
              color: '#374151',
              fontSize: '13px'
            }}
            formatter={(value: number, name: string) => {
              const percent = ((value as number) / total * 100).toFixed(1)
              return [`${name}: ${percent}%`, '']
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={100}
            wrapperStyle={{ paddingTop: '20px', color: '#6b7280', fontSize: '12px' }}
            formatter={(value) => <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{value}</span>}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}


