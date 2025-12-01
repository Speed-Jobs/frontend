'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import SkillCloud from './SkillCloud'

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
  isLoadingTrend,
  isLoadingCloud,
  trendError,
  cloudError,
}: SkillTrendAndCloudProps) {
  // 연도별로 데이터 집계 (스택 바 차트용)
  const yearlyData = useMemo(() => {
    console.log('=== yearlyData 계산 시작 ===')
    console.log('skillTrendData:', skillTrendData)
    console.log('skillTrendData 길이:', skillTrendData?.length || 0)
    
    if (!skillTrendData || skillTrendData.length === 0) {
      console.log('skillTrendData가 비어있습니다')
      console.log('selectedCompany:', selectedCompany)
      return []
    }

    // 모든 스킬 추출
    const allSkills = new Set<string>()
    skillTrendData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'month' && key !== 'quarter') {
          allSkills.add(key)
        }
      })
    })

    console.log('추출된 스킬들:', Array.from(allSkills))

    // 연도별로 집계
    const yearMap = new Map<string, Map<string, number>>()

    skillTrendData.forEach(item => {
      const monthStr = item.month
      if (!monthStr) {
        console.warn('month 필드가 없습니다:', item)
        return
      }
      
      // "2025.09" 또는 "2025 Q3" 형식에서 연도 추출
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
        console.warn('연도를 추출할 수 없습니다:', monthStr)
        return
      }
      
      if (!yearMap.has(year)) {
        yearMap.set(year, new Map())
      }

      const yearSkills = yearMap.get(year)!
      allSkills.forEach(skill => {
        const count = Number(item[skill] || 0)
        if (count > 0) {
          yearSkills.set(skill, (yearSkills.get(skill) || 0) + count)
        }
      })
    })

    console.log('연도별 집계 결과:', yearMap)
    console.log('데이터가 있는 연도:', Array.from(yearMap.keys()))

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
    
    console.log('상위 10개 스킬:', top10Skills)
    
    const result = allYears.map(year => {
      const yearSkills = yearMap.get(year) || new Map()
      const data: any = { year }
      
      // 상위 10개 스킬만 포함 (데이터가 없는 연도는 모두 0)
      top10Skills.forEach(skill => {
        data[skill] = yearSkills.get(skill) || 0
      })
      
      // 데이터가 있는지 확인
      const hasData = top10Skills.some(skill => (yearSkills.get(skill) || 0) > 0)
      console.log(`연도 ${year}: 데이터 ${hasData ? '있음' : '없음'}`, data)
      
      return data
    })

    console.log('최종 yearlyData:', result)
    return result
  }, [skillTrendData])

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

    console.log('상위 스킬 목록:', sortedSkills)
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

  return (
    <div className="flex gap-4">
      {/* 스택 바 차트 */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
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
              {selectedCompany === '전체' || !selectedCompany ? '회사를 선택하면 해당 회사의 스킬 트렌드를 확인할 수 있습니다.' : '데이터가 없습니다.'}
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
            <BarChart data={yearlyData}>
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
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  color: '#374151',
                  fontSize: '13px'
                }}
                formatter={(value: number) => [`${value}회`, '']}
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
      </div>

      {/* 스킬 클라우드 */}
      <div className="w-[600px] bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          스킬 클라우드{selectedCloudCompany !== '전체' ? ` - ${selectedCloudCompany}` : ''}
        </h4>
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

