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

  // 회사별 스킬 트렌드 API 호출
  useEffect(() => {
    // 전체 선택 시에는 스킬 트렌드 API 호출하지 않음
    if (companyName === '전체' || companyKey === 'all') {
      setSkillTrendData([])
      setIsLoadingSkillTrend(false)
      return
    }

    const fetchSkillTrend = async () => {
      try {
        setIsLoadingSkillTrend(true)
        setSkillTrendError(null)

        // 회사명을 API에 맞게 변환 (한글 -> 영문 키 또는 그대로)
        const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/companies/${encodeURIComponent(companyName)}/skill-trend`
        console.log('=== 회사별 스킬 트렌드 API 호출 ===')
        console.log('호출 URL:', apiUrl)

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('백엔드에서 받은 회사별 스킬 트렌드 데이터:', result)

        if (result.status === 200 && result.code === 'SUCCESS' && result.data) {
          const { trends } = result.data
          if (Array.isArray(trends)) {
            setSkillTrendData(trends)
          } else {
            setSkillTrendData([])
          }
        } else {
          setSkillTrendData([])
        }
      } catch (err) {
        console.error('=== 회사별 스킬 트렌드 API 호출 에러 ===')
        console.error('에러:', err)
        setSkillTrendError(err instanceof Error ? err.message : '스킬 트렌드를 불러오는 중 오류가 발생했습니다.')
        setSkillTrendData([])
      } finally {
        setIsLoadingSkillTrend(false)
      }
    }

    fetchSkillTrend()
  }, [companyName])



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

  return (
    <div className="space-y-6">
      {/* 회사 정보 헤더 */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: companyColor }}
          />
          <h3 className="text-xl font-semibold text-gray-900">{companyName} 채용 인사이트</h3>
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
      />
    </div>
  )
}

