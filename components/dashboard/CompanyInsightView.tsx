'use client'

import { useState, useEffect, useMemo } from 'react'
import CompanyInsightAnalysis from './CompanyInsightAnalysis'

interface CompanyInsightViewProps {
  companyKey: string
  companyName: string
  companyColor: string
  timeframe: 'Daily' | 'Weekly' | 'Monthly'
  // 회사별 채용 활동 데이터 (해당 회사만 필터링된)
  recruitmentData: Array<{
    period: string
    count: number
  }>
  // 전체 채용 공고 수 추이 (비교용)
  totalTrendData: Array<{
    period: string
    count: number
  }>
  // 새로운 API 형식의 인사이트 데이터
  insightData?: any
  isLoading?: boolean
  error?: string | null
}

export default function CompanyInsightView({
  companyKey,
  companyName,
  companyColor,
  timeframe,
  recruitmentData,
  totalTrendData,
  insightData,
  isLoading,
  error,
}: CompanyInsightViewProps) {
  const [skillTrendData, setSkillTrendData] = useState<Array<{
    month: string
    [skill: string]: string | number
  }>>([])
  const [isLoadingSkillTrend, setIsLoadingSkillTrend] = useState(false)
  const [skillTrendError, setSkillTrendError] = useState<string | null>(null)

  // 회사별 스킬 트렌드 API 호출 (현재 key_findings만 사용하므로 비활성화)
  useEffect(() => {
    // key_findings만 표시하므로 스킬 트렌드 API 호출 비활성화
    setSkillTrendData([])
    setIsLoadingSkillTrend(false)
    setSkillTrendError(null)
  }, [companyName])



  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {/* 회사 정보 헤더 */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: companyColor }}
          />
          <h3 className="text-lg font-semibold text-gray-900">{companyName} 채용 인사이트</h3>
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>인사이트 생성 중...</span>
            </div>
          )}
        </div>
        {recruitmentData && recruitmentData.length > 0 && (
          <div className="flex gap-4 text-sm">
            <div className="text-gray-600">
              총 <span className="text-gray-900 font-medium">{recruitmentData.reduce((sum, d) => sum + d.count, 0)}</span> 건
            </div>
            <div className="text-gray-600">
              평균 <span className="text-gray-900 font-medium">{Math.round(recruitmentData.reduce((sum, d) => sum + d.count, 0) / recruitmentData.length)}</span> 건/{timeframe === 'Daily' ? '일' : timeframe === 'Weekly' ? '주' : '월'}
            </div>
          </div>
        )}
      </div>

      {/* 텍스트 기반 인사이트 분석 */}
      <CompanyInsightAnalysis
        recruitmentData={recruitmentData}
        totalTrendData={totalTrendData}
        skillTrendData={skillTrendData}
        companyName={companyName}
        timeframe={timeframe}
        insightData={insightData}
      />
    </div>
  )
}

