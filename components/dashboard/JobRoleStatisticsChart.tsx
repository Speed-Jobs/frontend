'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface JobRoleStatisticsChartProps {
  data: Array<{
    name: string
    value: number
    previousValue: number
    industries: string[]
  }>
  selectedRole: string | null
  onRoleClick: (roleName: string | null) => void
  viewMode: 'Weekly' | 'Monthly'
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  previousPeriodStart?: Date
  previousPeriodEnd?: Date
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
  viewMode,
  currentPeriodStart,
  currentPeriodEnd,
  previousPeriodStart,
  previousPeriodEnd,
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

  // 현재 기간과 이전 기간 데이터 분리 (모든 데이터 포함, 0도 포함)
  const currentData = data.map(item => ({ name: item.name, value: item.value }))
  const previousData = data.map(item => ({ name: item.name, value: item.previousValue }))
  
  // 차트에 표시할 데이터 (0보다 큰 값만)
  const currentChartData = currentData.filter(item => item.value > 0)
  const previousChartData = previousData.filter(item => item.value > 0)
  
  // 현재 기간 데이터가 모두 0인 경우에도 최소한 하나의 직무는 표시 (첫 번째 직무를 1로 설정)
  if (currentChartData.length === 0 && currentData.length > 0) {
    currentChartData.push({ name: currentData[0].name, value: 1 })
  }
  
  // 이전 기간 데이터가 모두 0인 경우: 모든 직군을 균등하게 표시 (각각 1씩)
  // 이렇게 하면 실제 데이터가 없을 때도 모든 직군이 표시되고, 실제 데이터가 있으면 정상적으로 표시됨
  if (previousChartData.length === 0 && previousData.length > 0) {
    // 모든 직군을 균등하게 표시 (각각 1씩)
    previousChartData.push(...previousData.map(item => ({ name: item.name, value: 1 })))
  }
  
  // 총합 계산
  const currentTotal = currentData.reduce((sum, item) => sum + item.value, 0)
  const previousTotal = previousData.reduce((sum, item) => sum + item.value, 0)
  
  // 차트에 표시할 총합
  const currentChartTotal = currentChartData.reduce((sum, item) => sum + item.value, 0)
  const previousChartTotal = previousChartData.reduce((sum, item) => sum + item.value, 0)
  
  // 모든 직군 목록 (비교를 위해)
  const allRoleNames = data.map(item => item.name)
  
  // 기간 레이블 및 날짜 포맷팅
  const formatDate = (date: Date | undefined): string => {
    if (!date) return ''
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`
  }
  
  const formatPeriodRange = (start: Date | undefined, end: Date | undefined): string => {
    if (!start || !end) {
      return viewMode === 'Weekly' ? '이번주' : '이번달'
    }
    return `${formatDate(start)} ~ ${formatDate(end)}`
  }
  
  const currentPeriodLabel = formatPeriodRange(currentPeriodStart, currentPeriodEnd)
  const previousPeriodLabel = formatPeriodRange(previousPeriodStart, previousPeriodEnd)
  
  // 인사이트 생성
  const generateInsights = () => {
    const insights: string[] = []
    
    // 전체 변화율
    if (previousTotal > 0) {
      const totalChange = ((currentTotal - previousTotal) / previousTotal) * 100
      if (totalChange > 10) {
        insights.push(`전체 채용 공고가 ${totalChange.toFixed(1)}% 증가했습니다.`)
      } else if (totalChange < -10) {
        insights.push(`전체 채용 공고가 ${Math.abs(totalChange).toFixed(1)}% 감소했습니다.`)
      } else {
        insights.push(`전체 채용 공고가 안정적으로 유지되고 있습니다.`)
      }
    }
    
    // 가장 증가한 직군
    const increasedRoles = data
      .filter(item => item.previousValue > 0)
      .map(item => ({
        name: item.name,
        change: ((item.value - item.previousValue) / item.previousValue) * 100,
        changeCount: item.value - item.previousValue
      }))
      .filter(item => item.change > 0)
      .sort((a, b) => b.change - a.change)
    
    if (increasedRoles.length > 0) {
      const topIncreased = increasedRoles[0]
      insights.push(`${topIncreased.name} 직군이 ${topIncreased.change.toFixed(1)}% 증가하여 가장 큰 성장세를 보였습니다.`)
    }
    
    // 가장 감소한 직군
    const decreasedRoles = data
      .filter(item => item.previousValue > 0)
      .map(item => ({
        name: item.name,
        change: ((item.value - item.previousValue) / item.previousValue) * 100,
        changeCount: item.value - item.previousValue
      }))
      .filter(item => item.change < 0)
      .sort((a, b) => a.change - b.change)
    
    if (decreasedRoles.length > 0) {
      const topDecreased = decreasedRoles[0]
      insights.push(`${topDecreased.name} 직군이 ${Math.abs(topDecreased.change).toFixed(1)}% 감소했습니다.`)
    }
    
    // 가장 많은 공고를 차지하는 직군
    const topRole = currentData.sort((a, b) => b.value - a.value)[0]
    if (topRole && currentTotal > 0) {
      const topRolePercent = (topRole.value / currentTotal) * 100
      insights.push(`${topRole.name} 직군이 전체의 ${topRolePercent.toFixed(1)}%를 차지하며 가장 많은 공고를 보유하고 있습니다.`)
    }
    
    return insights.length > 0 ? insights : ['변화가 미미합니다.']
  }
  
  const insights = generateInsights()

  return (
    <div>
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">직무</h4>
      </div>
      
      {/* 두 개의 도넛 차트 나란히 표시 */}
      <div className="grid grid-cols-2 gap-8 mb-4 w-full">
        {/* 첫 번째 차트 (지난주/지난달) */}
        <div className="w-full">
          <div className="text-center mb-2">
            <p className="text-sm font-medium text-gray-700">{previousPeriodLabel}</p>
          </div>
          <div style={{ width: '100%', height: '380px' }}>
            {previousChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={previousChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => {
                      const percent = previousChartTotal > 0 ? (value / previousChartTotal) * 100 : 0
                      return percent >= 3 ? `${(percent).toFixed(0)}%` : ''
                    }}
                    outerRadius={100}
                    innerRadius={45}
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
                    {previousChartData.map((entry, index) => {
                      const isSelected = selectedRole === entry.name
                      const roleIndex = allRoleNames.indexOf(entry.name)
                      return (
                        <Cell 
                          key={`cell-1-${index}`} 
                          fill={pieColors[roleIndex % pieColors.length]}
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
                      const percent = previousChartTotal > 0 ? ((value as number) / previousChartTotal * 100).toFixed(1) : '0.0'
                      return [`${name}: ${percent}% (${value}건)`, '']
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-sm">데이터가 없습니다</div>
              </div>
            )}
          </div>
        </div>
        
        {/* 두 번째 차트 (이번주/이번달) - 더 크게 강조 */}
        <div className="w-full">
          <div className="text-center mb-2">
            <p className="text-sm font-semibold text-gray-900">{currentPeriodLabel}</p>
          </div>
          <div style={{ width: '100%', height: '450px' }}>
            {currentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => {
                      const percent = currentChartTotal > 0 ? (value / currentChartTotal) * 100 : 0
                      return percent >= 3 ? `${(percent).toFixed(0)}%` : ''
                    }}
                    outerRadius={130}
                    innerRadius={60}
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
                    {currentChartData.map((entry, index) => {
                      const isSelected = selectedRole === entry.name
                      const roleIndex = allRoleNames.indexOf(entry.name)
                      return (
                        <Cell 
                          key={`cell-2-${index}`} 
                          fill={pieColors[roleIndex % pieColors.length]}
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
                      const percent = currentChartTotal > 0 ? ((value as number) / currentChartTotal * 100).toFixed(1) : '0.0'
                      return [`${name}: ${percent}% (${value}건)`, '']
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-sm">데이터가 없습니다</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 범례 */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        {allRoleNames.map((roleName, index) => {
          const hasCurrent = currentChartData.some(d => d.name === roleName)
          const hasPrevious = previousChartData.some(d => d.name === roleName)
          if (!hasCurrent && !hasPrevious) return null
          
          return (
            <div key={roleName} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: pieColors[index % pieColors.length] }}
              />
              <span className="text-xs text-gray-600 whitespace-nowrap">{roleName}</span>
            </div>
          )
        })}
      </div>
      
      {/* 인사이트 섹션 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <span className="text-lg">💡</span>
          {currentPeriodLabel} vs {previousPeriodLabel} 비교 인사이트
        </h4>
        <ul className="space-y-2">
          {insights.map((insight, index) => (
            <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}


