'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface SkillTrendChartProps {
  data: Array<{
    month: string
    [skill: string]: string | number
  }>
  isLoading?: boolean
  error?: string | null
}

export default function SkillTrendChart({ data, isLoading, error }: SkillTrendChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-gray-400">데이터를 불러오는 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-gray-400 text-sm">데이터가 없습니다.</div>
      </div>
    )
  }

  // 상위 5개 스킬 추출
  const skillKeys = Object.keys(data[0] || {}).filter(key => key !== 'month')
  const skillCounts: Array<{ name: string; total: number }> = skillKeys.map(skill => {
    const total = data.reduce((sum, item) => sum + Number(item[skill] || 0), 0)
    return { name: skill, total }
  })
  const topSkills = skillCounts.sort((a, b) => b.total - a.total).slice(0, 5).map(s => s.name)

  const colors = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171']

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ fill: '#9ca3af', fontSize: 12 }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1a2d47', 
            border: '1px solid #2a3f5f', 
            borderRadius: '8px', 
            color: '#e5e7eb',
            fontSize: '13px'
          }}
          formatter={(value: number) => [`${value}건`, '']}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#9ca3af' }}
        />
        {topSkills.map((skill, index) => (
          <Line 
            key={skill}
            type="monotone" 
            dataKey={skill} 
            stroke={colors[index % colors.length]} 
            strokeWidth={2} 
            dot={false}
            name={skill}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

