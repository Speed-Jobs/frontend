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

interface CompanyRecruitmentChartProps {
  data: Array<{
    period: string
    [key: string]: string | number
  }>
  companies: Array<{
    key: string
    name: string
    color: string
  }>
  selectedCompanies: string[]
  isLoading?: boolean
  error?: string | null
}

export default function CompanyRecruitmentChart({ 
  data, 
  companies, 
  selectedCompanies,
  isLoading, 
  error 
}: CompanyRecruitmentChartProps) {
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

  const maxValue = Math.max(
    ...data.flatMap(item => 
      companies
        .filter(c => selectedCompanies.includes(c.key))
        .map(c => Number(item[c.key] || 0))
    ),
    1
  )

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
        <XAxis 
          dataKey="period" 
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          domain={[0, maxValue * 1.1]}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1a2d47', 
            border: '1px solid #2a3f5f', 
            borderRadius: '8px', 
            color: '#e5e7eb',
            fontSize: '13px'
          }}
          formatter={(value: number, name: string) => {
            const company = companies.find(c => c.key === name)
            return [`${value}건`, company ? company.name : name]
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#9ca3af' }}
          iconType="line"
          formatter={(value: string) => {
            const company = companies.find(c => c.key === value)
            return company ? company.name : value
          }}
        />
        {companies.map((company) => {
          if (selectedCompanies.includes(company.key)) {
            return (
              <Line 
                key={company.key}
                type="monotone" 
                dataKey={company.key} 
                stroke={company.color} 
                strokeWidth={2} 
                dot={false}
                name={company.name}
              />
            )
          }
          return null
        })}
      </LineChart>
    </ResponsiveContainer>
  )
}



