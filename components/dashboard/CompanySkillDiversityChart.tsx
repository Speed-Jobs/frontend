'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface CompanySkillDiversityChartProps {
  data: Array<{
    company: string
    skills: number
  }>
  isLoading?: boolean
  error?: string | null
}

export default function CompanySkillDiversityChart({ data, isLoading, error }: CompanySkillDiversityChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-gray-400">데이터를 불러오는 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-gray-400 text-sm">데이터가 없습니다.</div>
      </div>
    )
  }

  const sortedData = [...data].sort((a, b) => b.skills - a.skills).slice(0, 10)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sortedData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
        <XAxis 
          type="number"
          tick={{ fill: '#9ca3af', fontSize: 12 }}
        />
        <YAxis 
          dataKey="company" 
          type="category"
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          width={100}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1a2d47', 
            border: '1px solid #2a3f5f', 
            borderRadius: '8px', 
            color: '#e5e7eb',
            fontSize: '13px'
          }}
          formatter={(value: number) => [`${value}개`, '스킬 수']}
        />
        <Bar 
          dataKey="skills" 
          fill="#60a5fa"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}






