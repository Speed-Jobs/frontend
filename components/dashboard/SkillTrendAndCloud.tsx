'use client'

import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import SkillCloud from './SkillCloud'

// 커스텀 Tooltip 컴포넌트 (스킬 이름과 값 표시)
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-700 font-medium">{entry.name}:</span>
              <span className="text-xs text-gray-900 font-semibold">{entry.value}회</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

interface SkillTrendAndCloudProps {
  // 스킬 트렌드 데이터 (월별)
  skillTrendData: Array<{
    month: string
    [skill: string]: string | number
  }>
  // 스킬 통계 데이터 (스킬 클라우드용)
  skillCloudData: Array<{
    name: string
    count: number
    percentage?: number
    change?: number
    relatedSkills?: string[]
  }>
  selectedCompany: string
  selectedCloudCompany?: string
  selectedYear: string
  selectedCloudYear?: string
  onYearSelect?: (year: string) => void
  isLoadingTrend?: boolean
  isLoadingCloud?: boolean
  trendError?: string | null
  cloudError?: string | null
}

export default function SkillTrendAndCloud({
  skillTrendData,
  skillCloudData,
  selectedCompany,
  selectedCloudCompany = '전체',
  selectedYear,
  selectedCloudYear = '전체',
  onYearSelect,
  isLoadingTrend,
  isLoadingCloud,
  trendError,
  cloudError,
}: SkillTrendAndCloudProps) {
  // 더미 데이터 (API 연동 전 UI 확인용)
  const dummyTrendData = useMemo(() => {
    const years = ['2021', '2022', '2023', '2024', '2025']
    const skills = ['python', 'java', 'react', 'typescript', 'spring', 'sql', 'docker', 'kubernetes', 'aws', 'nodejs']
    const dummy: Array<{ month: string; [skill: string]: string | number }> = []
    
    years.forEach(year => {
      for (let month = 1; month <= 12; month++) {
        const monthStr = `${year}.${String(month).padStart(2, '0')}`
        const data: any = { month: monthStr }
        skills.forEach(skill => {
          // 랜덤한 값 생성 (월별로 약간씩 변화)
          data[skill] = Math.floor(Math.random() * 50) + 10 + (parseInt(year) - 2021) * 5
        })
        dummy.push(data)
      }
    })
    
    return dummy
  }, [])

  // 연도별로 데이터 집계 (스택 바 차트용)
  const yearlyData = useMemo(() => {
    // API 데이터가 없으면 더미 데이터 사용
    const dataToUse = (!skillTrendData || skillTrendData.length === 0) ? dummyTrendData : skillTrendData
    
    if (!dataToUse || dataToUse.length === 0) {
      return []
    }

    // 모든 스킬 추출
    const allSkills = new Set<string>()
    dataToUse.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'month' && key !== 'quarter') {
          allSkills.add(key)
        }
      })
    })

    // 연도별로 집계 (분기별 데이터를 연도별로 합산)
    const yearMap = new Map<string, Map<string, number>>()

    dataToUse.forEach(item => {
      const monthStr = item.month
      if (!monthStr) {
        return
      }
      
      // "2025.01" 또는 "2025 Q3" 형식에서 연도 추출
      let year = ''
      if (monthStr.includes('.')) {
        year = monthStr.split('.')[0]
      } else if (monthStr.includes('Q')) {
        const match = monthStr.match(/(\d{4})/)
        year = match ? match[1] : ''
      } else {
        year = monthStr.substring(0, 4)
      }
      
      if (!year) {
        return
      }
      
      if (!yearMap.has(year)) {
        yearMap.set(year, new Map())
      }

      const yearSkills = yearMap.get(year)!
      // 모든 스킬에 대해 연도별로 합산
      allSkills.forEach(skill => {
        const count = Number(item[skill] || 0)
        if (count > 0) {
          yearSkills.set(skill, (yearSkills.get(skill) || 0) + count)
        }
      })
    })

    // 연도별 데이터 배열로 변환 (2021-2025 모든 연도 포함)
    const allYears = ['2021', '2022', '2023', '2024', '2025']
    
    // 전체 연도에서 상위 10개 스킬 추출
    const allSkillTotals = new Map<string, number>()
    Array.from(yearMap.values()).forEach(yearSkills => {
      yearSkills.forEach((count, skill) => {
        allSkillTotals.set(skill, (allSkillTotals.get(skill) || 0) + count)
      })
    })
    
    const top10Skills = Array.from(allSkillTotals.entries())
      .map(([skill, total]) => ({ skill, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map(item => item.skill)
    
    const result = allYears.map(year => {
      const yearSkills = yearMap.get(year) || new Map()
      const data: any = { year }
      
      // 상위 10개 스킬만 포함 (데이터가 없는 연도는 모두 0)
      top10Skills.forEach(skill => {
        data[skill] = yearSkills.get(skill) || 0
      })
      
      return data
    })

    return result
  }, [skillTrendData, dummyTrendData])

  // 스택 바 차트에 사용할 상위 스킬 목록 (전체 연도에서 가장 많이 언급된 스킬, 상위 10개)
  const topSkills = useMemo(() => {
    if (yearlyData.length === 0) return []

    const skillTotals = new Map<string, number>()
    
    yearlyData.forEach(yearData => {
      Object.keys(yearData).forEach(key => {
        if (key !== 'year') {
          skillTotals.set(key, (skillTotals.get(key) || 0) + Number(yearData[key] || 0))
        }
      })
    })

    const sortedSkills = Array.from(skillTotals.entries())
      .map(([skill, total]) => ({ skill, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map(item => item.skill)

    return sortedSkills
  }, [yearlyData])

  // 스킬 색상 매핑 (더 많은 스킬 지원)
  const skillColors: Record<string, string> = {
    python: '#3b82f6',      // blue
    sql: '#f97316',         // orange
    java: '#22c55e',        // green
    kubernetes: '#eab308',  // yellow
    docker: '#a855f7',      // purple
    react: '#06b6d4',       // cyan
    typescript: '#6366f1',  // indigo
    aws: '#ec4899',         // pink
    spring: '#14b8a6',      // teal
    nodejs: '#d97706',      // amber
    javascript: '#f59e0b',  // amber-500
    kotlin: '#8b5cf6',      // violet-500
    go: '#10b981',          // emerald-500
    mysql: '#ef4444',       // red-500
    postgresql: '#06b6d4',  // cyan-500
    redis: '#dc2626',       // red-600
    mongodb: '#059669',     // emerald-600
    elasticsearch: '#7c3aed', // violet-600
    graphql: '#db2777',     // pink-600
    terraform: '#0891b2',   // cyan-600
  }

  // 색상이 없는 스킬을 위한 기본 색상 팔레트
  const defaultColors = [
    '#3b82f6', '#f97316', '#22c55e', '#eab308', '#a855f7',
    '#06b6d4', '#6366f1', '#ec4899', '#14b8a6', '#d97706',
    '#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#06b6d4',
    '#dc2626', '#059669', '#7c3aed', '#db2777', '#0891b2',
  ]

  // 스킬에 색상 할당 함수
  const getSkillColor = (skill: string, index: number): string => {
    return skillColors[skill.toLowerCase()] || defaultColors[index % defaultColors.length]
  }

  // 연도 클릭 시 모달 상태
  const [selectedYearForModal, setSelectedYearForModal] = useState<string | null>(null)
  // 선택된 분기 상태
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q4')

  // 분기별 데이터 집계 (선택된 연도와 분기 기준)
  const quarterlyData = useMemo(() => {
    if (!selectedYearForModal) {
      return { current: null, previous: null }
    }

    const year = parseInt(selectedYearForModal)
    const currentQuarter = selectedQuarter // 예: 'Q4'
    
    // 동기간 비교: 전년도 동일 분기
    const previousYear = year - 1
    const previousQuarter = currentQuarter

    // 분기별 시작일과 종료일 계산 함수
    const getQuarterDates = (y: number, q: string, isCurrentPeriod: boolean = false) => {
      let startMonth = 0
      let endMonth = 0
      
      if (q === 'Q1') {
        startMonth = 0  // 1월
        endMonth = 2     // 3월
      } else if (q === 'Q2') {
        startMonth = 3   // 4월
        endMonth = 5     // 6월
      } else if (q === 'Q3') {
        startMonth = 6   // 7월
        endMonth = 8     // 9월
      } else if (q === 'Q4') {
        startMonth = 9   // 10월
        endMonth = 11    // 12월
      }
      
      const startDate = new Date(y, startMonth, 1)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // 현재 분기이고 오늘이 분기 기간 내에 있으면 오늘 날짜를 종료일로 사용
      let endDate: Date
      if (isCurrentPeriod && y === today.getFullYear()) {
        const quarterEndDate = new Date(y, endMonth + 1, 0) // 해당 분기의 마지막 날
        endDate = today < quarterEndDate ? today : quarterEndDate
      } else {
        endDate = new Date(y, endMonth + 1, 0) // 해당 월의 마지막 날
      }
      
      return {
        start: `${y}-${String(startMonth + 1).padStart(2, '0')}-01`,
        end: `${y}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
      }
    }

    const currentQuarterDates = getQuarterDates(year, currentQuarter, true)
    // 동기간 비교: 전년도 동일 분기의 동일 기간
    const previousQuarterDates = getQuarterDates(previousYear, previousQuarter, false)
    
    // 현재 분기가 오늘 날짜까지라면, 전년도도 같은 일수만큼만 표시
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentStartDate = new Date(currentQuarterDates.start)
    const currentEndDate = new Date(currentQuarterDates.end)
    const daysDiff = Math.floor((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // 전년도 동일 분기의 시작일부터 같은 일수만큼 계산
    const previousStartDate = new Date(previousQuarterDates.start)
    const previousEndDate = new Date(previousStartDate)
    previousEndDate.setDate(previousStartDate.getDate() + daysDiff)
    
    // 전년도 분기의 마지막 날을 넘지 않도록 제한
    const previousQuarterEndDate = new Date(previousYear, 
      currentQuarter === 'Q1' ? 2 : currentQuarter === 'Q2' ? 5 : currentQuarter === 'Q3' ? 8 : 11, 
      currentQuarter === 'Q1' ? 31 : currentQuarter === 'Q2' ? 30 : currentQuarter === 'Q3' ? 30 : 31
    )
    
    if (previousEndDate > previousQuarterEndDate) {
      previousEndDate.setTime(previousQuarterEndDate.getTime())
    }
    
    const adjustedPreviousQuarterDates = {
      start: previousQuarterDates.start,
      end: `${previousYear}-${String(previousEndDate.getMonth() + 1).padStart(2, '0')}-${String(previousEndDate.getDate()).padStart(2, '0')}`
    }

    // API 데이터가 없으면 더미 데이터 사용
    const dataToUse = (!skillTrendData || skillTrendData.length === 0) ? dummyTrendData : skillTrendData
    
    // 현재 분기 데이터
    const currentQuarterMap = new Map<string, number>()
    // 이전 분기 데이터
    const previousQuarterMap = new Map<string, number>()

    if (dataToUse && dataToUse.length > 0) {
      dataToUse.forEach(item => {
        const monthStr = item.month
        if (!monthStr) return

        let itemYear = ''
        let quarter = ''

        // "2025.01" 형식에서 연도와 분기 추출 (분기별 데이터는 Q1=1월, Q2=4월, Q3=7월, Q4=10월로 저장됨)
        if (monthStr.includes('.')) {
          const parts = monthStr.split('.')
          itemYear = parts[0]
          const month = parseInt(parts[1])
          // 분기별 데이터는 첫 번째 월로 저장되므로 (Q1=1월, Q2=4월, Q3=7월, Q4=10월)
          if (month === 1) quarter = 'Q1'
          else if (month === 4) quarter = 'Q2'
          else if (month === 7) quarter = 'Q3'
          else if (month === 10) quarter = 'Q4'
          // 일반 월별 데이터인 경우
          else if (month >= 1 && month <= 3) quarter = 'Q1'
          else if (month >= 4 && month <= 6) quarter = 'Q2'
          else if (month >= 7 && month <= 9) quarter = 'Q3'
          else if (month >= 10 && month <= 12) quarter = 'Q4'
        } else if (monthStr.includes('Q')) {
          // "2025 Q3" 형식
          const match = monthStr.match(/(\d{4})\s*Q(\d)/)
          if (match) {
            itemYear = match[1]
            quarter = `Q${match[2]}`
          }
        }

        if (!itemYear || !quarter) return

        // 현재 분기 데이터 수집 (해당 연도의 해당 분기)
        if (parseInt(itemYear) === year && quarter === currentQuarter) {
          Object.keys(item).forEach(key => {
            if (key !== 'month' && key !== 'quarter') {
              const count = Number(item[key] || 0)
              if (count > 0) {
                // 분기별 데이터는 이미 집계된 값이므로 그대로 사용
                currentQuarterMap.set(key, count)
              }
            }
          })
        }

        // 이전 분기 데이터 수집 (전년도 동일 분기)
        if (parseInt(itemYear) === previousYear && quarter === previousQuarter) {
          Object.keys(item).forEach(key => {
            if (key !== 'month' && key !== 'quarter') {
              const count = Number(item[key] || 0)
              if (count > 0) {
                // 분기별 데이터는 이미 집계된 값이므로 그대로 사용
                previousQuarterMap.set(key, count)
              }
            }
          })
        }
      })
    }

    // 더미 데이터가 없거나 데이터가 비어있으면 더미 데이터 생성
    const skills = ['python', 'java', 'react', 'typescript', 'spring', 'sql', 'docker', 'kubernetes', 'aws', 'nodejs']
    
    if (currentQuarterMap.size === 0 && previousQuarterMap.size === 0) {
      // 분기별 더미 데이터 생성
      skills.forEach(skill => {
        // 현재 분기 더미 데이터 (랜덤 값)
        const currentValue = Math.floor(Math.random() * 100) + 50
        currentQuarterMap.set(skill, currentValue)
        
        // 이전 분기 더미 데이터 (현재보다 약간 낮은 값)
        const previousValue = Math.floor(currentValue * (0.7 + Math.random() * 0.3))
        previousQuarterMap.set(skill, previousValue)
      })
    }

    // 모든 스킬 수집
    const allSkills = new Set<string>()
    currentQuarterMap.forEach((_, skill) => allSkills.add(skill))
    previousQuarterMap.forEach((_, skill) => allSkills.add(skill))
    
    // skills 배열도 추가 (더미 데이터용)
    skills.forEach(skill => allSkills.add(skill))

    // 단일 데이터 포인트로 변환
    const currentData: any = { quarter: `${year} ${currentQuarter}` }
    const previousData: any = { quarter: `${previousYear} ${previousQuarter}` }
    
    allSkills.forEach(skill => {
      currentData[skill] = currentQuarterMap.get(skill) || 0
      previousData[skill] = previousQuarterMap.get(skill) || 0
    })

    return { 
      current: currentData, 
      previous: previousData,
      currentLabel: `${year} ${currentQuarter}`,
      previousLabel: `${previousYear} ${previousQuarter}`,
      currentPeriod: currentQuarterDates,
      previousPeriod: adjustedPreviousQuarterDates
    }
  }, [selectedYearForModal, selectedQuarter, skillTrendData, dummyTrendData])

  // 분기별 차트에 사용할 상위 스킬 목록
  const quarterlyTopSkills = useMemo(() => {
    if (!quarterlyData.current || !quarterlyData.previous) {
      return []
    }
    
    const skillTotals = new Map<string, number>()
    
    // 현재 분기 스킬 합계
    Object.keys(quarterlyData.current).forEach(key => {
      if (key !== 'quarter') {
        skillTotals.set(key, (skillTotals.get(key) || 0) + Number(quarterlyData.current[key] || 0))
      }
    })
    
    // 이전 분기 스킬 합계
    Object.keys(quarterlyData.previous).forEach(key => {
      if (key !== 'quarter') {
        skillTotals.set(key, (skillTotals.get(key) || 0) + Number(quarterlyData.previous[key] || 0))
      }
    })

    return Array.from(skillTotals.entries())
      .map(([skill, total]) => ({ skill, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map(item => item.skill)
  }, [quarterlyData])

  return (
    <div className="flex gap-4">
      {/* 스택 바 차트 */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 relative">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedCompany !== '전체' ? `${selectedCompany} 상위 스킬 연도별 트렌드 (최근 5년)` : '상위 스킬 연도별 트렌드 (최근 5년)'}
        </h4>
        {isLoadingTrend ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-gray-500">데이터를 불러오는 중...</div>
          </div>
        ) : trendError ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-red-500 text-sm">{trendError}</div>
          </div>
        ) : yearlyData.length === 0 || topSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <div className="text-gray-500 text-sm mb-2">
              {!selectedCompany || selectedCompany === '' ? '회사를 선택하면 해당 회사의 스킬 트렌드를 확인할 수 있습니다.' : '데이터가 없습니다.'}
            </div>
            {skillTrendData.length === 0 && (
              <div className="text-xs text-gray-400 mt-2">
                API에서 데이터를 가져오지 못했습니다. 브라우저 콘솔을 확인해주세요.
              </div>
            )}
            {skillTrendData.length > 0 && (
              <div className="text-xs text-gray-400 mt-2">
                데이터는 있지만 연도별 집계에 실패했습니다. (데이터 개수: {skillTrendData.length})
              </div>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={yearlyData}
              onClick={(data: any) => {
                if (data && data.activePayload && data.activePayload[0]) {
                  const year = data.activePayload[0].payload.year
                  setSelectedYearForModal(year)
                  if (onYearSelect) {
                    onYearSelect(year)
                  }
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="year" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                domain={['2021', '2025']}
                type="category"
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{ value: '스킬 언급 횟수', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#6b7280' }}
                iconType="square"
              />
              {topSkills.map((skill, index) => (
                <Bar 
                  key={skill}
                  dataKey={skill} 
                  stackId="1"
                  fill={getSkillColor(skill, index)}
                  name={skill}
                  radius={index === topSkills.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {/* 회사별 차트 인사이트 */}
        {selectedCompany && selectedCompany !== '전체' && yearlyData.length > 0 && topSkills.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-lg mt-0.5">💡</span>
              <div className="flex-1">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {(() => {
                    // 최근 연도와 이전 연도 비교
                    const recentYear = yearlyData[yearlyData.length - 1]
                    const previousYear = yearlyData[yearlyData.length - 2]
                    
                    if (!recentYear || !previousYear) {
                      return `${selectedCompany}의 스킬 트렌드를 분석한 결과, 최근 5년간 ${topSkills[0]} 스킬이 가장 높은 수요를 보이고 있습니다.`
                    }
                    
                    // 최근 연도에서 가장 많이 언급된 스킬
                    const topSkillInRecentYear = topSkills.reduce((max, skill) => {
                      const recentCount = Number(recentYear[skill] || 0)
                      const maxCount = Number(recentYear[max] || 0)
                      return recentCount > maxCount ? skill : max
                    }, topSkills[0])
                    
                    const recentCount = Number(recentYear[topSkillInRecentYear] || 0)
                    const previousCount = Number(previousYear[topSkillInRecentYear] || 0)
                    
                    if (previousCount > 0) {
                      const changeRate = ((recentCount - previousCount) / previousCount) * 100
                      if (changeRate > 20) {
                        return `${selectedCompany}의 ${topSkillInRecentYear} 스킬 수요가 전년 대비 ${changeRate.toFixed(1)}% 증가하여, 해당 기술 스택에 대한 채용 수요가 크게 늘어나고 있습니다.`
                      } else if (changeRate < -20) {
                        return `${selectedCompany}의 ${topSkillInRecentYear} 스킬 수요가 전년 대비 ${Math.abs(changeRate).toFixed(1)}% 감소하여, 기술 스택 전환 또는 채용 전략 변화가 있을 수 있습니다.`
                      } else {
                        return `${selectedCompany}의 ${topSkillInRecentYear} 스킬이 최근 연도에 ${recentCount}건 언급되어 가장 높은 수요를 보이며, 안정적인 기술 스택으로 유지되고 있습니다.`
                      }
                    } else {
                      return `${selectedCompany}의 ${topSkillInRecentYear} 스킬이 최근 연도에 ${recentCount}건 언급되어 가장 높은 수요를 보이고 있습니다.`
                    }
                  })()}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* 분기별 비교 모달 - 스택 바 차트 위에 오버레이 */}
        {selectedYearForModal && (
          <div className="absolute inset-0 bg-white rounded-lg border-2 border-blue-500 shadow-2xl z-50 p-4 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-gray-900">
                {selectedYearForModal}년 분기별 스킬 트렌드 비교
              </h3>
              <button
                onClick={() => {
                  setSelectedYearForModal(null)
                  setSelectedQuarter('Q4')
                }}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            {/* 분기 선택 UI */}
            <div className="mb-3 flex items-center gap-3 justify-center">
              <span className="text-xs font-medium text-gray-700">분기 선택:</span>
              <div className="flex gap-1">
                {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuarter(q)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedQuarter === q
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
              {/* 이전 분기 차트 (왼쪽) */}
              <div className="flex flex-col min-h-0">
                <div className="mb-2 text-center">
                  <h4 className="text-sm font-semibold text-gray-800">
                    {quarterlyData.previousLabel || '이전 분기'} 트렌드
                  </h4>
                  {quarterlyData.previousPeriod && (
                    <p className="text-xs text-gray-500 mt-1">
                      {quarterlyData.previousPeriod.start} ~ {quarterlyData.previousPeriod.end}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-h-0">
                  {quarterlyData.previous && quarterlyTopSkills.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[quarterlyData.previous]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="quarter" 
                          tick={{ fill: '#6b7280', fontSize: 10 }}
                        />
                        <YAxis 
                          tick={{ fill: '#6b7280', fontSize: 10 }}
                          label={{ value: '스킬 언급 횟수', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 10 } }}
                        />
                        <Tooltip 
                          content={<CustomTooltip />}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '10px', paddingTop: '5px', color: '#6b7280' }}
                          iconType="square"
                        />
                        {quarterlyTopSkills.map((skill, index) => (
                          <Bar 
                            key={skill}
                            dataKey={skill} 
                            stackId="1"
                            fill={getSkillColor(skill, index)}
                            name={skill}
                            radius={index === quarterlyTopSkills.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                      데이터가 없습니다.
                    </div>
                  )}
                </div>
              </div>

              {/* 현재 분기 차트 (오른쪽) */}
              <div className="flex flex-col min-h-0">
                <div className="mb-2 text-center">
                  <h4 className="text-sm font-semibold text-gray-800">
                    {quarterlyData.currentLabel || '현재 분기'} 트렌드
                  </h4>
                  {quarterlyData.currentPeriod && (
                    <p className="text-xs text-gray-500 mt-1">
                      {quarterlyData.currentPeriod.start} ~ {quarterlyData.currentPeriod.end}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-h-0">
                  {quarterlyData.current && quarterlyTopSkills.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[quarterlyData.current]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="quarter" 
                          tick={{ fill: '#6b7280', fontSize: 10 }}
                        />
                        <YAxis 
                          tick={{ fill: '#6b7280', fontSize: 10 }}
                          label={{ value: '스킬 언급 횟수', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 10 } }}
                        />
                        <Tooltip 
                          content={<CustomTooltip />}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '10px', paddingTop: '5px', color: '#6b7280' }}
                          iconType="square"
                        />
                        {quarterlyTopSkills.map((skill, index) => (
                          <Bar 
                            key={skill}
                            dataKey={skill} 
                            stackId="1"
                            fill={getSkillColor(skill, index)}
                            name={skill}
                            radius={index === quarterlyTopSkills.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                      데이터가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 스킬 클라우드 */}
      <div className="w-[600px] bg-white rounded-lg border border-gray-200 p-4">
        <div className="mb-4">
          <h4 className="text-lg font-bold text-gray-900">
            <span className="text-red-600 font-bold">
              {selectedCloudYear !== '전체' ? selectedCloudYear : selectedYear}
            </span>
            {' '}
            <span className="text-blue-600 font-bold">
              {selectedCloudCompany === '전체' ? '전체' : selectedCloudCompany}
            </span>
            {' '}스킬 클라우드
          </h4>
        </div>
        {isLoadingCloud ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-gray-500">데이터를 불러오는 중...</div>
          </div>
        ) : cloudError && skillCloudData.length === 0 ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-red-500 text-sm">{cloudError}</div>
          </div>
        ) : (
          <SkillCloud skills={skillCloudData} selectedCompany={selectedCloudCompany} />
        )}
      </div>
    </div>
  )
}

