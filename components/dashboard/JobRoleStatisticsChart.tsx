'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'

interface JobRoleStatisticsChartProps {
  data: Array<{
    name: string
    value: number
    previousValue: number
    industries: string[]
    skillSets?: Array<{
      name: string
      count: number
      previousCount: number
    }>
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
  selectedCompanyFilter?: string
  onCompanyFilterChange?: (company: string) => void
  availableCompanies?: Array<{ key: string; name: string }>
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

// 커스텀 Tooltip 컴포넌트
interface CustomTooltipProps extends TooltipProps<number, string> {
  data: Array<{
    name: string
    value: number
    previousValue: number
    industries: string[]
    skillSets?: Array<{
      name: string
      count: number
      previousCount: number
    }>
  }>
  chartTotal: number
  isCurrentPeriod: boolean
}

const CustomTooltip = ({ active, payload, data, chartTotal, isCurrentPeriod }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null
  }

  const entry = payload[0]
  const name = entry.name as string
  const value = entry.value as number
  
  const roleData = data.find(item => item.name === name)
  const currentValue = roleData?.value || 0
  
  // 퍼센테이지 계산
  const percentage = chartTotal > 0 ? ((value / chartTotal) * 100).toFixed(1) : '0.0'
  
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg px-3.5 py-2.5">
      <div className="text-xs font-medium text-gray-700 leading-tight">{name}</div>
      <div className="text-xs text-gray-600 mt-0.5">{percentage}%</div>
      <div className="text-sm font-bold text-gray-900 mt-0.5">{currentValue}건</div>
    </div>
  )
}

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
  error,
  selectedCompanyFilter = '전체',
  onCompanyFilterChange,
  availableCompanies = []
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
  
  const getQuarterLabel = (date: Date): string => {
    const quarter = Math.floor(date.getMonth() / 3) + 1
    return `${date.getFullYear()}년 ${quarter}분기`
  }
  
  const formatPeriodRange = (start: Date | undefined, end: Date | undefined, isPrevious: boolean = false): string => {
    if (!start || !end) {
      return viewMode === 'Weekly' ? (isPrevious ? '이전 분기' : '현재 분기') : (isPrevious ? '이전 달' : '이번 달')
    }
    
    if (viewMode === 'Weekly') {
      // QoQ: 분기 정보 표시
      return getQuarterLabel(start)
    } else {
      // MoM: 월 정보 표시
      return `${start.getFullYear()}. ${start.getMonth() + 1}.`
    }
  }
  
  const currentPeriodLabel = formatPeriodRange(currentPeriodStart, currentPeriodEnd, false)
  const previousPeriodLabel = formatPeriodRange(previousPeriodStart, previousPeriodEnd, true)
  
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
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">직무</h4>
        {onCompanyFilterChange && availableCompanies.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">경쟁사 선택:</span>
            <select
              value={selectedCompanyFilter}
              onChange={(e) => onCompanyFilterChange(e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="전체">전체</option>
              {availableCompanies.map((company) => (
                <option key={company.key} value={company.name}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* 두 개의 도넛 차트 나란히 표시 */}
      <div className="grid grid-cols-[1fr_auto_1.3fr] gap-4 mb-4 w-full items-start">
        {/* 첫 번째 차트 (이전 기간) */}
        <div className="w-full min-w-0">
          <div className="text-center mb-2">
            <p className="text-xs font-medium text-gray-500">{previousPeriodLabel}</p>
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
                    label={false}
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
                          opacity={isSelected ? 1 : 0.7}
                        />
                      )
                    })}
                  </Pie>
                  <Tooltip 
                    content={<CustomTooltip data={data} chartTotal={previousChartTotal} isCurrentPeriod={false} />}
                    allowEscapeViewBox={{ x: true, y: true }}
                    wrapperStyle={{ pointerEvents: 'none', zIndex: 1000 }}
                    cursor={false}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-xs">데이터가 없습니다</div>
              </div>
            )}
          </div>
        </div>
        
        {/* 화살표 (이전 기간 -> 현재 기간) */}
        <div className="flex items-center justify-center pt-12 px-2">
          <div className="flex flex-col items-center gap-2">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
              <path d="M13 7L18 12L13 17M6 12H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs font-semibold text-blue-600 whitespace-nowrap">현재</span>
          </div>
        </div>
        
        {/* 두 번째 차트 (현재 기간) - 더 크게 강조 */}
        <div className="w-full min-w-0">
          <div className="text-center mb-3">
            <p className="text-lg font-bold text-gray-900">{currentPeriodLabel}</p>
            <p className="text-xs text-blue-600 font-semibold mt-1">현재 기간</p>
          </div>
          <div className="relative" style={{ width: '100%', height: '450px' }}>
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
                            strokeWidth={isSelected ? 4 : 2.5}
                            opacity={isSelected ? 1 : 1}
                          />
                        )
                      })}
                    </Pie>
                    <Tooltip 
                      content={<CustomTooltip data={data} chartTotal={currentChartTotal} isCurrentPeriod={true} />}
                      allowEscapeViewBox={{ x: true, y: true }}
                      wrapperStyle={{ pointerEvents: 'none', zIndex: 1000 }}
                      cursor={false}
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
          {previousPeriodLabel} vs {currentPeriodLabel} 비교 인사이트
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


