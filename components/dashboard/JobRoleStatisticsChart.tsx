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
    industries: Array<{
      name: string
      current_count: number
      previous_count: number
    }>
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
  isLoadingInsights?: boolean // 인사이트 로딩 상태 (별도 관리)
  error?: string | null
  selectedCompanyFilter?: string
  onCompanyFilterChange?: (company: string) => void
  availableCompanies?: Array<{ key: string; name: string }>
  insights?: {
    summary?: string
    current_period?: {
      start_date: string
      end_date: string
      total_count?: number
    }
    previous_period?: {
      start_date: string
      end_date: string
      total_count?: number
    }
    job_role_insights?: Array<{
      job_role_name: string
      insight: string
      change_description: string
      external_factors: string
    }>
  } | null
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

// 직군 이름을 색상 인덱스로 매핑하는 함수 (일관된 색상 유지)
const getRoleColorIndex = (roleName: string, allRoleNames: string[]): number => {
  const index = allRoleNames.indexOf(roleName)
  return index >= 0 ? index : 0
}

// 커스텀 Tooltip 컴포넌트
interface CustomTooltipProps extends TooltipProps<number, string> {
  data: Array<{
    name: string
    value: number
    previousValue: number
    industries: Array<{
      name: string
      current_count: number
      previous_count: number
    }>
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
  const previousValue = roleData?.previousValue || 0
  
  // 퍼센테이지 계산
  const percentage = chartTotal > 0 ? ((value / chartTotal) * 100).toFixed(1) : '0.0'
  
  // 현재 기간 차트인 경우에만 변화율 계산
  const changeRate = isCurrentPeriod && previousValue > 0 
    ? (((currentValue - previousValue) / previousValue) * 100).toFixed(1)
    : isCurrentPeriod && currentValue > 0 ? '100.0' : '0.0'
  const isIncrease = parseFloat(changeRate) > 0
  const isDecrease = parseFloat(changeRate) < 0
  
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-xl px-4 py-3 min-w-[180px] max-w-[250px] relative z-[10000]" style={{ pointerEvents: 'auto' }}>
      <div className="space-y-1.5">
        <div className="text-sm font-semibold text-gray-900 leading-tight break-words">
          {name}
        </div>
        {isCurrentPeriod ? (
          // 현재 기간 차트: 현재 기간과 이전 기간 비교 정보 표시
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-gray-200">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">현재 기간</span>
              <span className="text-base font-bold text-gray-900">{currentValue.toLocaleString()}건</span>
              <span className="text-xs text-gray-600 mt-0.5">{percentage}%</span>
            </div>
            {previousValue > 0 && (
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500">이전 기간</span>
                <span className="text-sm font-medium text-gray-700">{previousValue.toLocaleString()}건</span>
                <span className={`text-xs font-medium mt-0.5 ${
                  isIncrease ? 'text-green-600' : isDecrease ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {isIncrease ? '↑' : isDecrease ? '↓' : ''} {Math.abs(parseFloat(changeRate))}%
                </span>
              </div>
            )}
          </div>
        ) : (
          // 이전 기간 차트: 이전 기간 정보만 표시
          <div className="pt-1 border-t border-gray-200">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">이전 기간</span>
              <span className="text-base font-bold text-gray-900">{value.toLocaleString()}건</span>
              <span className="text-xs text-gray-600 mt-0.5">{percentage}%</span>
            </div>
          </div>
        )}
      </div>
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
  isLoadingInsights = false, // 인사이트 로딩 상태
  error,
  selectedCompanyFilter = '전체',
  onCompanyFilterChange,
  availableCompanies = [],
  insights = null
}: JobRoleStatisticsChartProps) {
  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    )
  }

  // 데이터가 없고 로딩 중일 때만 전체 로딩 표시
  if ((!data || data.length === 0) && isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          <span>데이터를 불러오는 중...</span>
        </div>
      </div>
    )
  }

  // 데이터가 없으면 표시할 내용 없음
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-gray-500 text-sm">데이터가 없습니다.</div>
      </div>
    )
  }

  // 현재 기간과 이전 기간 데이터 분리
  const currentData = data.map(item => ({ name: item.name, value: item.value }))
  const previousData = data.map(item => ({ name: item.name, value: item.previousValue }))
  
  // 차트에 표시할 데이터 (0보다 큰 값만) - 0개 공고수를 가진 직군은 제외
  const currentChartData = currentData.filter(item => item.value > 0)
  const previousChartData = previousData.filter(item => item.value > 0)
  
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
  
  // 상세 날짜 범위 포맷팅 (insights의 날짜 정보 사용)
  const formatDetailedDateRange = (startDate: string | undefined, endDate: string | undefined): string => {
    if (!startDate || !endDate) return ''
    
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      const startYear = start.getFullYear()
      const startMonth = start.getMonth() + 1
      const startDay = start.getDate()
      
      const endYear = end.getFullYear()
      const endMonth = end.getMonth() + 1
      const endDay = end.getDate()
      
      // 같은 년도, 같은 월인 경우
      if (startYear === endYear && startMonth === endMonth) {
        return `${startYear}년 ${startMonth}월 ${startDay}일부터 ${endDay}일까지`
      }
      // 같은 년도, 다른 월인 경우
      if (startYear === endYear) {
        return `${startYear}년 ${startMonth}월 ${startDay}일부터 ${endMonth}월 ${endDay}일까지`
      }
      // 다른 년도인 경우
      return `${startYear}년 ${startMonth}월 ${startDay}일부터 ${endYear}년 ${endMonth}월 ${endDay}일까지`
    } catch (error) {
      return ''
    }
  }
  
  // 인사이트 제목용 상세 기간 레이블 생성
  const getDetailedPeriodLabel = () => {
    // insights에서 날짜 정보가 있으면 사용
    if (insights?.current_period && insights?.previous_period) {
      try {
        const previousStart = new Date(insights.previous_period.start_date)
        const currentStart = new Date(insights.current_period.start_date)
        
        // QoQ (Weekly) 모드인 경우 분기 형식으로 표시
        if (viewMode === 'Weekly') {
          const getQuarterLabel = (date: Date): string => {
            const quarter = Math.floor(date.getMonth() / 3) + 1
            return `${date.getFullYear()}년 ${quarter}분기`
          }
          
          const previousQuarter = getQuarterLabel(previousStart)
          const currentQuarter = getQuarterLabel(currentStart)
          
          if (previousQuarter && currentQuarter) {
            return `${previousQuarter} vs ${currentQuarter} 비교 인사이트`
          }
        } else {
          // MoM (Monthly) 모드인 경우 월 형식으로 표시
          const getMonthLabel = (date: Date): string => {
            return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
          }
          
          const previousMonth = getMonthLabel(previousStart)
          const currentMonth = getMonthLabel(currentStart)
          
          if (previousMonth && currentMonth) {
            return `${previousMonth} vs ${currentMonth} 비교 인사이트`
          }
        }
        
        // 분기/월 형식이 안 되면 상세 날짜 범위 사용
        const previousRange = formatDetailedDateRange(
          insights.previous_period.start_date,
          insights.previous_period.end_date
        )
        const currentRange = formatDetailedDateRange(
          insights.current_period.start_date,
          insights.current_period.end_date
        )
        
        if (previousRange && currentRange) {
          return `${previousRange} vs ${currentRange} 비교 인사이트`
        }
      } catch (error) {
        // 날짜 파싱 실패 시 fallback
      }
    }
    
    // insights 날짜 정보가 없으면 기존 레이블 사용
    return `${previousPeriodLabel} vs ${currentPeriodLabel} 비교 인사이트`
  }
  
  // 전체 인사이트 가져오기 (API의 summary만 사용)
  const getSummaryInsight = () => {
    // API에서 받은 summary가 있으면 사용
    if (insights) {
      // summary가 존재하는지 확인 (undefined, null이 아니고)
      if (insights.summary !== undefined && insights.summary !== null) {
        const summary = typeof insights.summary === 'string' ? insights.summary : String(insights.summary)
        
        // 빈 문자열이 아닌 경우 반환
        if (summary && summary.trim().length > 0) {
          return summary
        }
      }
    }
    
    // summary가 없으면 null 반환
    return null
  }
  
  const summaryInsight = getSummaryInsight()
  const hasSummary = summaryInsight !== null
  const hasJobRoleInsights = insights?.job_role_insights && insights.job_role_insights.length > 0
  
  // 선택된 직군의 인사이트 가져오기
  const getSelectedRoleInsight = () => {
    if (!selectedRole) {
      return null
    }
    
    if (!insights?.job_role_insights) {
      return null
    }
    
    // 정확히 일치하는 경우 찾기
    let roleInsight = insights.job_role_insights.find(
      (item) => item.job_role_name === selectedRole
    )
    
    // 정확히 일치하지 않으면 대소문자 무시하고 공백 제거 후 비교
    if (!roleInsight) {
      roleInsight = insights.job_role_insights.find(
        (item) => item.job_role_name.trim().toLowerCase() === selectedRole.trim().toLowerCase()
      )
    }
    
    return roleInsight || null
  }
  
  const selectedRoleInsight = getSelectedRoleInsight()

  // 타이틀 생성
  const getTitle = () => {
    const modeText = viewMode === 'Weekly' ? 'QoQ (전분기 대비)' : 'MoM (전월 대비)'
    if (selectedCompanyFilter && selectedCompanyFilter !== '전체') {
      return `${selectedCompanyFilter} ${modeText} 직군 비중 변화`
    }
    return `${modeText} 직군 비중 변화`
  }

  return (
    <div className="relative z-10" style={{ overflow: 'visible' }}>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h4 className="text-sm font-semibold text-gray-700">
          {getTitle()}
        </h4>
        {onCompanyFilterChange && availableCompanies.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 whitespace-nowrap">경쟁사 선택:</span>
            <select
              value={selectedCompanyFilter}
              onChange={(e) => onCompanyFilterChange(e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
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
      
      {/* 두 개의 도넛 차트 나란히 표시 - 반응형, 중앙 정렬 */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 mb-4 w-full overflow-visible">
        {/* 첫 번째 차트 (이전 기간) */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative z-10 min-w-0">
          <div className="text-center mb-2">
            <p className="text-xs font-medium text-gray-500">{previousPeriodLabel}</p>
          </div>
          <div className="w-full max-w-[320px] lg:max-w-[280px] aspect-square relative overflow-visible mx-auto">
            {previousChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={previousChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius="80%"
                    innerRadius="35%"
                    fill="#6b7280"
                    dataKey="value"
                    onClick={(data: any, index: number, e: any) => {
                      const roleName = data.name || data.payload?.name
                      if (roleName) {
                        if (selectedRole === roleName) {
                          onRoleClick(null)
                        } else {
                          onRoleClick(roleName)
                        }
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {previousChartData.map((entry, index) => {
                      const isSelected = selectedRole === entry.name
                      const roleIndex = getRoleColorIndex(entry.name, allRoleNames)
                      return (
                        <Cell 
                          key={`cell-1-${index}`} 
                          fill={pieColors[roleIndex % pieColors.length]}
                          stroke={isSelected ? '#111827' : '#ffffff'}
                          strokeWidth={isSelected ? 3 : 2}
                          opacity={isSelected ? 1 : 1}
                        />
                      )
                    })}
                  </Pie>
                  <Tooltip 
                    content={<CustomTooltip data={data} chartTotal={previousChartTotal} isCurrentPeriod={false} />}
                    allowEscapeViewBox={{ x: true, y: true }}
                    wrapperStyle={{ 
                      pointerEvents: 'none', 
                      zIndex: 10000,
                      outline: 'none'
                    }}
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
        
        {/* 화살표 (이전 기간 -> 현재 기간) - 모바일에서는 세로로, 데스크톱에서는 가로로 */}
        <div className="flex lg:flex-col items-center justify-center px-2 py-4 lg:py-0 flex-shrink-0 self-center">
          <div className="flex lg:flex-col items-center gap-2">
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="text-blue-500 rotate-90 lg:rotate-0"
            >
              <path d="M13 7L18 12L13 17M6 12H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs font-semibold text-blue-600 whitespace-nowrap">현재</span>
          </div>
        </div>
        
        {/* 두 번째 차트 (현재 기간) - 더 크게 강조 */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative z-10 min-w-0">
          <div className="text-center mb-3">
            <p className="text-base lg:text-lg font-bold text-gray-900">{currentPeriodLabel}</p>
            <p className="text-xs text-blue-600 font-semibold mt-1">현재 기간</p>
          </div>
          <div className="w-full max-w-[360px] lg:max-w-[320px] aspect-square relative overflow-visible mx-auto">
              {currentChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius="85%"
                      innerRadius="45%"
                      fill="#6b7280"
                      dataKey="value"
                      onClick={(data: any, index: number, e: any) => {
                        const roleName = data.name || data.payload?.name
                        if (roleName) {
                          if (selectedRole === roleName) {
                            onRoleClick(null)
                          } else {
                            onRoleClick(roleName)
                          }
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {currentChartData.map((entry, index) => {
                        const isSelected = selectedRole === entry.name
                        const roleIndex = getRoleColorIndex(entry.name, allRoleNames)
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
                      wrapperStyle={{ 
                        pointerEvents: 'none', 
                        zIndex: 10000,
                        outline: 'none'
                      }}
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
      <div className="flex flex-wrap justify-center gap-x-3 sm:gap-x-6 gap-y-2 px-2">
        {allRoleNames.map((roleName, index) => {
          const hasCurrent = currentChartData.some(d => d.name === roleName)
          const hasPrevious = previousChartData.some(d => d.name === roleName)
          if (!hasCurrent && !hasPrevious) return null
          
          const isSelected = selectedRole === roleName
          return (
            <div 
              key={roleName} 
              className={`flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-opacity ${
                isSelected ? 'opacity-100 font-semibold' : 'opacity-70 hover:opacity-100'
              }`}
              onClick={() => {
                if (isSelected) {
                  onRoleClick(null)
                } else {
                  onRoleClick(roleName)
                }
              }}
            >
              <div 
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: pieColors[index % pieColors.length] }}
              />
              <span className="text-xs text-gray-600 whitespace-nowrap break-keep">{roleName}</span>
            </div>
          )
        })}
      </div>
      
      {/* 선택된 직군의 직무 상세 정보 */}
      {selectedRole && (() => {
        const selectedRoleData = data.find(item => item.name === selectedRole)
        const industries = selectedRoleData?.industries || []
        
        if (industries.length > 0) {
          return (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-base sm:text-lg">📊</span>
                <span className="break-words">
                  {selectedRole} 직무별 상세 정보
                </span>
              </h4>
              <div className="space-y-2">
                {industries.map((industry, index) => {
                  const changeRate = industry.previous_count > 0 
                    ? (((industry.current_count - industry.previous_count) / industry.previous_count) * 100).toFixed(1)
                    : industry.current_count > 0 ? '100.0' : '0.0'
                  const isIncrease = parseFloat(changeRate) > 0
                  const isDecrease = parseFloat(changeRate) < 0
                  
                  return (
                    <div 
                      key={index}
                      className="p-2 sm:p-3 bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 break-words">
                            {industry.name}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                            <div>
                              <span className="text-gray-500">현재 기간: </span>
                              <span className="font-medium text-gray-900">{industry.current_count.toLocaleString()}건</span>
                            </div>
                            {industry.previous_count > 0 && (
                              <div>
                                <span className="text-gray-500">이전 기간: </span>
                                <span className="font-medium text-gray-700">{industry.previous_count.toLocaleString()}건</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {industry.previous_count > 0 && (
                          <div className="flex-shrink-0">
                            <span className={`text-xs font-medium ${
                              isIncrease ? 'text-green-600' : isDecrease ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {isIncrease ? '↑' : isDecrease ? '↓' : ''} {Math.abs(parseFloat(changeRate))}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }
        return null
      })()}
      
      {/* 인사이트 섹션 */}
      {(() => {
        // 인사이트가 준비되었는지 확인하는 함수
        const hasInsightsReady = () => {
          // insights가 없으면 false
          if (!insights || insights === null || insights === undefined) return false
          
          // insights가 빈 객체면 false
          if (typeof insights === 'object' && Object.keys(insights).length === 0) return false
          
          // 선택된 직군이 있는 경우
          if (selectedRole) {
            // 선택된 직군의 인사이트가 있으면 true
            return selectedRoleInsight !== null
          }
          
          // 선택된 직군이 없는 경우: summary나 job_role_insights가 있으면 true
          return hasSummary || hasJobRoleInsights
        }
        
        // 인사이트가 로딩 중이면 "인사이트 생성 중" 메시지 표시
        if (isLoadingInsights) {
          return (
            <div className="mt-8 sm:mt-10 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs sm:text-sm text-blue-600 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>인사이트 생성 중...</span>
              </div>
            </div>
          )
        }
        
        // 인사이트가 준비되지 않았으면 아무것도 렌더링하지 않음
        if (!hasInsightsReady()) {
          return null
        }
        
        // 인사이트가 준비되었으면 표시
        return (
          <div className="mt-8 sm:mt-10 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            {selectedRole ? (
              // 선택된 직군의 인사이트 표시
              selectedRoleInsight ? (
                <>
                  <h4 className="text-xs sm:text-sm font-semibold text-blue-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <span className="text-base sm:text-lg">💡</span>
                    <span className="break-words">
                      {selectedRole} 인사이트
                    </span>
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="text-xs sm:text-sm text-blue-800">
                      <div className="font-medium mb-1">인사이트:</div>
                      <div className="text-blue-700">{selectedRoleInsight.insight}</div>
                    </div>
                    <div className="text-xs sm:text-sm text-blue-800">
                      <div className="font-medium mb-1">변화 설명:</div>
                      <div className="text-blue-700">{selectedRoleInsight.change_description}</div>
                    </div>
                    {selectedRoleInsight.external_factors && (
                      <div className="text-xs sm:text-sm text-blue-800">
                        <div className="font-medium mb-1">외부 요인:</div>
                        <div className="text-blue-700">{selectedRoleInsight.external_factors}</div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onRoleClick(null)}
                    className="mt-3 text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    전체 인사이트 보기
                  </button>
                </>
              ) : null
            ) : (
              // 전체 인사이트 표시 (summary) - selectedRole이 null일 때
              <>
                <h4 className="text-xs sm:text-sm font-semibold text-blue-900 mb-2 sm:mb-3 flex items-center gap-2">
                  <span className="text-base sm:text-lg">💡</span>
                  <span className="break-words">
                    {getDetailedPeriodLabel()}
                  </span>
                </h4>
                {(() => {
                  // summary가 있으면 표시
                  if (hasSummary && summaryInsight) {
                    return (
                      <>
                        <div className="text-xs sm:text-sm text-blue-800">
                          <div className="break-words">{summaryInsight}</div>
                        </div>
                        {hasJobRoleInsights && (
                          <div className="mt-3 text-xs text-blue-600">
                            💡 차트의 직군을 클릭하면 해당 직군의 상세 인사이트를 확인할 수 있습니다.
                          </div>
                        )}
                      </>
                    )
                  } else if (hasJobRoleInsights) {
                    // summary가 없지만 job_role_insights가 있는 경우
                    return (
                      <>
                        <div className="text-xs sm:text-sm text-blue-800">
                          <div className="mb-2">직군별 상세 인사이트를 확인하려면 차트의 직군을 클릭하세요.</div>
                        </div>
                        <div className="mt-3 text-xs text-blue-600">
                          💡 {(insights?.job_role_insights?.length ?? 0)}개의 직군에 대한 인사이트가 준비되어 있습니다.
                        </div>
                      </>
                    )
                  }
                  return null
                })()}
              </>
            )}
          </div>
        )
      })()}
    </div>
  )
}


