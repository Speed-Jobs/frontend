'use client'

import { useState, useMemo } from 'react'

// 반원형 게이지 차트 컴포넌트 (속도계 형태)
function GaugeChart({ 
  value, 
  label, 
  onClick 
}: { 
  value: number
  label: string
  onClick?: () => void
}) {
  const size = 200
  const strokeWidth = 20
  const radius = (size - strokeWidth) / 2
  const centerX = size / 2
  const centerY = size / 2
  
  // 반원형 호 (180도)
  const startAngle = -180 // 왼쪽 끝
  const endAngle = 0 // 오른쪽 끝
  const percentage = Math.min(Math.max(value, 0), 100)
  
  // 바늘 각도 계산 (0% = -180도, 100% = 0도)
  const needleAngle = startAngle + (percentage / 100) * (endAngle - startAngle)
  
  // 호 경로 생성
  const createArcPath = (start: number, end: number, radius: number) => {
    const startRad = (start * Math.PI) / 180
    const endRad = (end * Math.PI) / 180
    const x1 = centerX + radius * Math.cos(startRad)
    const y1 = centerY + radius * Math.sin(startRad)
    const x2 = centerX + radius * Math.cos(endRad)
    const y2 = centerY + radius * Math.sin(endRad)
    const largeArcFlag = end - start > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`
  }
  
  // 그라데이션 색상 (빨강 -> 주황 -> 노랑 -> 연두 -> 초록)
  const gradientId = `gauge-gradient-${label.replace(/\s+/g, '-')}-${value}`
  
  // 바늘 끝점 계산
  const needleLength = radius - 10
  const needleEndX = centerX + needleLength * Math.cos((needleAngle * Math.PI) / 180)
  const needleEndY = centerY + needleLength * Math.sin((needleAngle * Math.PI) / 180)
  
  return (
    <div 
      className={`flex flex-col items-center py-4 pb-8 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <div className="text-sm font-semibold text-gray-700 mb-2">{label}</div>
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" /> {/* 빨강 */}
              <stop offset="25%" stopColor="#f97316" /> {/* 주황 */}
              <stop offset="50%" stopColor="#eab308" /> {/* 노랑 */}
              <stop offset="75%" stopColor="#84cc16" /> {/* 연두 */}
              <stop offset="100%" stopColor="#22c55e" /> {/* 초록 */}
            </linearGradient>
          </defs>
          
          {/* 배경 호 (회색) */}
          <path
            d={createArcPath(startAngle, endAngle, radius)}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* 값에 따른 색상 호 */}
          <path
            d={createArcPath(startAngle, needleAngle, radius)}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          
          {/* 바늘 */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleEndX}
            y2={needleEndY}
            stroke="#374151"
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          
          {/* 바늘 중심점 */}
          <circle
            cx={centerX}
            cy={centerY}
            r="8"
            fill="#374151"
          />
        </svg>
      </div>
      {/* 난이도 지수 표시 (차트 아래 별도 행) */}
      <div className="mt-4 mb-0 text-2xl font-bold text-gray-900">{percentage.toFixed(0)}</div>
    </div>
  )
}

interface JobDifficultyItem {
  name: string
  category?: 'Tech' | 'Biz' | 'BizSupporting'
  difficulty: number
  similarPostings: number
  competitorRatio: number
  recentGrowthRate: number
  avgHiringDuration: number
  yearOverYearChange: number
  insights: string[]
}

interface JobDifficultyGaugesProps {
  data: JobDifficultyItem[]
}

export default function JobDifficultyGauges({ 
  data
}: JobDifficultyGaugesProps) {
  const [selectedGauge, setSelectedGauge] = useState<string | null>(null)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'Tech' | 'Biz' | 'BizSupporting' | '전체'>('전체')
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('전체')

  // 전체 평균 난이도 지수
  const overallDifficulty = useMemo(() => {
    if (data.length === 0) return 0
    const sum = data.reduce((acc, item) => acc + item.difficulty, 0)
    return Math.round(sum / data.length)
  }, [data])

  // 전체 상세 정보
  const overallDetails = useMemo(() => {
    if (data.length === 0) return null
    
    const avgPostings = data.reduce((acc, item) => acc + item.similarPostings, 0) / data.length
    const avgCompetitorRatio = data.reduce((acc, item) => acc + item.competitorRatio, 0) / data.length
    const avgGrowthRate = data.reduce((acc, item) => acc + item.recentGrowthRate, 0) / data.length
    const avgHiringDuration = data.reduce((acc, item) => acc + item.avgHiringDuration, 0) / data.length
    const avgYearOverYearChange = data.reduce((acc, item) => acc + item.yearOverYearChange, 0) / data.length
    
    // 과열도 지수 기반 인사이트 생성
    const insights: string[] = []
    const recommendations: string[] = []
    
    // 유사 공고량 분석
    if (avgPostings < 15) {
      insights.push(`시장에서 유사 공고가 평균 ${avgPostings.toFixed(0)}개로 매우 부족합니다. 이는 해당 인재의 공급이 제한적임을 의미합니다.`)
      recommendations.push(`• 보상 수준을 시장 상위 20% 수준으로 상향 조정 검토`)
      recommendations.push(`• 채용 채널 다각화 및 헤드헌팅 활용 검토`)
    } else if (avgPostings < 30) {
      insights.push(`유사 공고 수가 평균 ${avgPostings.toFixed(0)}개로 적은 편입니다. 인재 확보에 어려움이 예상됩니다.`)
      recommendations.push(`• 경쟁력 있는 보상 패키지 제공 필요`)
    }
    
    // 경쟁사 공고 비중 분석
    if (avgCompetitorRatio > 70) {
      insights.push(`경쟁사 공고 비중이 평균 ${avgCompetitorRatio.toFixed(1)}%로 매우 높습니다. 동일한 인재를 놓고 경쟁이 치열합니다.`)
      recommendations.push(`• 차별화된 복지 및 성장 기회 강조 필요`)
      recommendations.push(`• 채용 프로세스 단축으로 우수 인재 선점 전략`)
    } else if (avgCompetitorRatio > 50) {
      insights.push(`경쟁사 공고 비중이 평균 ${avgCompetitorRatio.toFixed(1)}%로 높습니다. 경쟁이 심화되고 있습니다.`)
      recommendations.push(`• 보상 및 복지 경쟁력 강화 필요`)
    }
    
    // 최근 증가율 분석
    if (avgGrowthRate > 40) {
      insights.push(`최근 ${avgGrowthRate.toFixed(1)}% 급증하여 수요가 폭발적으로 증가하고 있습니다. 시장이 과열 상태입니다.`)
      recommendations.push(`• 채용 예산 및 리소스 사전 확보 필요`)
      recommendations.push(`• 장기 채용 계획 수립 및 파이프라인 구축`)
    } else if (avgGrowthRate > 25) {
      insights.push(`최근 ${avgGrowthRate.toFixed(1)}% 증가하여 수요가 빠르게 증가하고 있습니다.`)
      recommendations.push(`• 채용 계획 선제적 수립 필요`)
    }
    
    // 채용 소요기간 분석
    if (avgHiringDuration > 30) {
      insights.push(`평균 채용 소요기간이 ${Math.round(avgHiringDuration)}일로 매우 깁니다. 채용 프로세스 최적화가 필요합니다.`)
      recommendations.push(`• 채용 프로세스 단축 (목표: 20일 이내)`)
      recommendations.push(`• 면접 일정 조율 효율화 및 의사결정 속도 개선`)
    } else if (avgHiringDuration > 25) {
      insights.push(`평균 채용 소요기간이 ${Math.round(avgHiringDuration)}일로 다소 깁니다.`)
      recommendations.push(`• 채용 프로세스 효율화 검토`)
    }
    
    // 작년 대비 변화 분석
    if (avgYearOverYearChange > 10) {
      insights.push(`작년 대비 난이도가 ${avgYearOverYearChange.toFixed(1)}점 상승했습니다. 채용 환경이 악화되고 있습니다.`)
      recommendations.push(`• 채용 예산 및 보상 수준 재검토 필요`)
    } else if (avgYearOverYearChange < -5) {
      insights.push(`작년 대비 난이도가 ${Math.abs(avgYearOverYearChange).toFixed(1)}점 하락했습니다. 채용 환경이 개선되고 있습니다.`)
    }
    
    if (insights.length === 0) {
      insights.push('현재 시장 상황이 비교적 안정적입니다.')
      recommendations.push('• 기존 채용 전략 유지')
    }
    
    return {
      difficulty: overallDifficulty,
      similarPostings: Math.round(avgPostings),
      competitorRatio: Math.round(avgCompetitorRatio * 10) / 10,
      recentGrowthRate: Math.round(avgGrowthRate * 10) / 10,
      avgHiringDuration: Math.round(avgHiringDuration),
      yearOverYearChange: Math.round(avgYearOverYearChange * 10) / 10,
      insights,
      recommendations
    }
  }, [data, overallDifficulty])

  // 전체 직군 평균 난이도 지수 (필터링된 직군의 평균)
  const allCategoriesDifficulty = useMemo(() => {
    const categories: Record<string, JobDifficultyItem[]> = {}
    
    data.forEach(item => {
      if (!item.category) return
      if (!categories[item.category]) {
        categories[item.category] = []
      }
      categories[item.category].push(item)
    })

    // 필터링된 직군의 항목들
    let filteredCategoryItems: JobDifficultyItem[] = []
    
    if (selectedCategoryFilter === '전체') {
      // 모든 직군의 평균 계산
      Object.values(categories).forEach(items => {
        filteredCategoryItems.push(...items)
      })
    } else {
      // 선택된 직군만
      filteredCategoryItems = categories[selectedCategoryFilter] || []
    }

    if (filteredCategoryItems.length === 0) return 0
    
    const avgDifficulty = filteredCategoryItems.reduce((acc, item) => acc + item.difficulty, 0) / filteredCategoryItems.length
    
    return Math.round(avgDifficulty)
  }, [data, selectedCategoryFilter])

  // 전체 직군 상세 정보
  const allCategoriesDetails = useMemo(() => {
    const categories: Record<string, JobDifficultyItem[]> = {}
    
    data.forEach(item => {
      if (!item.category) return
      if (!categories[item.category]) {
        categories[item.category] = []
      }
      categories[item.category].push(item)
    })

    // 필터링된 직군의 항목들
    let filteredCategoryItems: JobDifficultyItem[] = []
    
    if (selectedCategoryFilter === '전체') {
      Object.values(categories).forEach(items => {
        filteredCategoryItems.push(...items)
      })
    } else {
      filteredCategoryItems = categories[selectedCategoryFilter] || []
    }

    if (filteredCategoryItems.length === 0) return null

    const avgPostings = filteredCategoryItems.reduce((acc, item) => acc + item.similarPostings, 0) / filteredCategoryItems.length
    const avgCompetitorRatio = filteredCategoryItems.reduce((acc, item) => acc + item.competitorRatio, 0) / filteredCategoryItems.length
    const avgGrowthRate = filteredCategoryItems.reduce((acc, item) => acc + item.recentGrowthRate, 0) / filteredCategoryItems.length
    const avgHiringDuration = filteredCategoryItems.reduce((acc, item) => acc + item.avgHiringDuration, 0) / filteredCategoryItems.length
    const avgYearOverYearChange = filteredCategoryItems.reduce((acc, item) => acc + item.yearOverYearChange, 0) / filteredCategoryItems.length

    // 과열도 지수 기반 인사이트 생성
    const insights: string[] = []
    const recommendations: string[] = []
    
    if (avgPostings < 15) {
      insights.push(`전체 직군의 유사 공고가 평균 ${avgPostings.toFixed(0)}개로 매우 부족합니다. 인재 공급이 제한적입니다.`)
      recommendations.push(`• 직군별 차별화된 보상 전략 수립`)
      recommendations.push(`• 채용 채널 다각화 및 파이프라인 구축`)
    } else if (avgPostings < 30) {
      insights.push(`유사 공고 수가 평균 ${avgPostings.toFixed(0)}개로 적은 편입니다.`)
      recommendations.push(`• 경쟁력 있는 보상 패키지 제공`)
    }
    
    if (avgCompetitorRatio > 70) {
      insights.push(`경쟁사 공고 비중이 평균 ${avgCompetitorRatio.toFixed(1)}%로 매우 높습니다. 동일 인재 풀을 놓고 경쟁이 치열합니다.`)
      recommendations.push(`• 차별화된 복지 및 성장 기회 강조`)
      recommendations.push(`• 채용 프로세스 단축으로 우수 인재 선점`)
    } else if (avgCompetitorRatio > 50) {
      insights.push(`경쟁사 공고 비중이 평균 ${avgCompetitorRatio.toFixed(1)}%로 높습니다.`)
      recommendations.push(`• 보상 및 복지 경쟁력 강화`)
    }
    
    if (avgGrowthRate > 40) {
      insights.push(`최근 ${avgGrowthRate.toFixed(1)}% 급증하여 수요가 폭발적으로 증가하고 있습니다.`)
      recommendations.push(`• 채용 예산 및 리소스 사전 확보`)
      recommendations.push(`• 장기 채용 계획 수립`)
    } else if (avgGrowthRate > 25) {
      insights.push(`최근 ${avgGrowthRate.toFixed(1)}% 증가하여 수요가 빠르게 증가하고 있습니다.`)
      recommendations.push(`• 채용 계획 선제적 수립`)
    }
    
    if (avgHiringDuration > 30) {
      insights.push(`평균 채용 소요기간이 ${Math.round(avgHiringDuration)}일로 매우 깁니다.`)
      recommendations.push(`• 채용 프로세스 단축 (목표: 20일 이내)`)
      recommendations.push(`• 면접 일정 조율 효율화`)
    } else if (avgHiringDuration > 25) {
      insights.push(`평균 채용 소요기간이 ${Math.round(avgHiringDuration)}일로 다소 깁니다.`)
      recommendations.push(`• 채용 프로세스 효율화 검토`)
    }
    
    if (avgYearOverYearChange > 10) {
      insights.push(`작년 대비 난이도가 ${avgYearOverYearChange.toFixed(1)}점 상승했습니다.`)
      recommendations.push(`• 채용 예산 및 보상 수준 재검토`)
    }
    
    if (insights.length === 0) {
      insights.push('전체 직군의 시장 상황이 비교적 안정적입니다.')
      recommendations.push('• 기존 채용 전략 유지')
    }
    
    return {
      difficulty: allCategoriesDifficulty,
      similarPostings: Math.round(avgPostings),
      competitorRatio: Math.round(avgCompetitorRatio * 10) / 10,
      recentGrowthRate: Math.round(avgGrowthRate * 10) / 10,
      avgHiringDuration: Math.round(avgHiringDuration),
      yearOverYearChange: Math.round(avgYearOverYearChange * 10) / 10,
      insights,
      recommendations
    }
  }, [data, allCategoriesDifficulty, selectedCategoryFilter])

  // 전체 직무 평균 난이도 지수 (필터링된 직무의 평균)
  const allJobsDifficulty = useMemo(() => {
    if (data.length === 0) return 0
    
    let filteredJobs = data
    if (selectedJobFilter !== '전체') {
      filteredJobs = data.filter(item => item.name === selectedJobFilter)
    }
    
    if (filteredJobs.length === 0) return 0
    const sum = filteredJobs.reduce((acc, item) => acc + item.difficulty, 0)
    return Math.round(sum / filteredJobs.length)
  }, [data, selectedJobFilter])

  // 전체 직무 상세 정보
  const allJobsDetails = useMemo(() => {
    if (data.length === 0) return null
    
    let filteredJobs = data
    if (selectedJobFilter !== '전체') {
      filteredJobs = data.filter(item => item.name === selectedJobFilter)
    }
    
    if (filteredJobs.length === 0) return null
    
    const avgPostings = filteredJobs.reduce((acc, item) => acc + item.similarPostings, 0) / filteredJobs.length
    const avgCompetitorRatio = filteredJobs.reduce((acc, item) => acc + item.competitorRatio, 0) / filteredJobs.length
    const avgGrowthRate = filteredJobs.reduce((acc, item) => acc + item.recentGrowthRate, 0) / filteredJobs.length
    const avgHiringDuration = filteredJobs.reduce((acc, item) => acc + item.avgHiringDuration, 0) / filteredJobs.length
    const avgYearOverYearChange = filteredJobs.reduce((acc, item) => acc + item.yearOverYearChange, 0) / filteredJobs.length
    
    // 과열도 지수 기반 인사이트 생성
    const insights: string[] = []
    const recommendations: string[] = []
    
    if (avgPostings < 15) {
      insights.push(`전체 직무의 유사 공고가 평균 ${avgPostings.toFixed(0)}개로 매우 부족합니다. 인재 공급이 제한적입니다.`)
      recommendations.push(`• 직무별 차별화된 보상 전략 수립`)
      recommendations.push(`• 채용 채널 다각화 및 파이프라인 구축`)
    } else if (avgPostings < 30) {
      insights.push(`유사 공고 수가 평균 ${avgPostings.toFixed(0)}개로 적은 편입니다.`)
      recommendations.push(`• 경쟁력 있는 보상 패키지 제공`)
    }
    
    if (avgCompetitorRatio > 70) {
      insights.push(`경쟁사 공고 비중이 평균 ${avgCompetitorRatio.toFixed(1)}%로 매우 높습니다. 동일 인재 풀을 놓고 경쟁이 치열합니다.`)
      recommendations.push(`• 차별화된 복지 및 성장 기회 강조`)
      recommendations.push(`• 채용 프로세스 단축으로 우수 인재 선점`)
    } else if (avgCompetitorRatio > 50) {
      insights.push(`경쟁사 공고 비중이 평균 ${avgCompetitorRatio.toFixed(1)}%로 높습니다.`)
      recommendations.push(`• 보상 및 복지 경쟁력 강화`)
    }
    
    if (avgGrowthRate > 40) {
      insights.push(`최근 ${avgGrowthRate.toFixed(1)}% 급증하여 수요가 폭발적으로 증가하고 있습니다.`)
      recommendations.push(`• 채용 예산 및 리소스 사전 확보`)
      recommendations.push(`• 장기 채용 계획 수립`)
    } else if (avgGrowthRate > 25) {
      insights.push(`최근 ${avgGrowthRate.toFixed(1)}% 증가하여 수요가 빠르게 증가하고 있습니다.`)
      recommendations.push(`• 채용 계획 선제적 수립`)
    }
    
    if (avgHiringDuration > 30) {
      insights.push(`평균 채용 소요기간이 ${Math.round(avgHiringDuration)}일로 매우 깁니다.`)
      recommendations.push(`• 채용 프로세스 단축 (목표: 20일 이내)`)
      recommendations.push(`• 면접 일정 조율 효율화`)
    } else if (avgHiringDuration > 25) {
      insights.push(`평균 채용 소요기간이 ${Math.round(avgHiringDuration)}일로 다소 깁니다.`)
      recommendations.push(`• 채용 프로세스 효율화 검토`)
    }
    
    if (avgYearOverYearChange > 10) {
      insights.push(`작년 대비 난이도가 ${avgYearOverYearChange.toFixed(1)}점 상승했습니다.`)
      recommendations.push(`• 채용 예산 및 보상 수준 재검토`)
    }
    
    if (insights.length === 0) {
      insights.push('전체 직무의 시장 상황이 비교적 안정적입니다.')
      recommendations.push('• 기존 채용 전략 유지')
    }
    
    return {
      difficulty: allJobsDifficulty,
      similarPostings: Math.round(avgPostings),
      competitorRatio: Math.round(avgCompetitorRatio * 10) / 10,
      recentGrowthRate: Math.round(avgGrowthRate * 10) / 10,
      avgHiringDuration: Math.round(avgHiringDuration),
      yearOverYearChange: Math.round(avgYearOverYearChange * 10) / 10,
      insights,
      recommendations
    }
  }, [data, allJobsDifficulty, selectedJobFilter])

  const handleGaugeClick = (gaugeType: string, item?: JobDifficultyItem) => {
    if (selectedGauge === gaugeType) {
      setSelectedGauge(null)
    } else {
      setSelectedGauge(gaugeType)
    }
  }

  const getSelectedDetails = () => {
    if (!selectedGauge) return null
    
    if (selectedGauge === 'overall') {
      return overallDetails
    }
    
    if (selectedGauge === 'all-categories') {
      return allCategoriesDetails
    }
    
    if (selectedGauge === 'all-jobs') {
      return allJobsDetails
    }
    
    return null
  }

  const selectedDetails = getSelectedDetails()

  const renderInsights = (gaugeType: string, details: typeof overallDetails) => {
    if (selectedGauge !== gaugeType || !details) return null

    // 모든 지표를 텍스트 인사이트로 변환
    const allInsights: string[] = []
    
    // 난이도 지수 인사이트
    if (details.difficulty >= 80) {
      allInsights.push(`난이도 지수가 ${details.difficulty}점으로 매우 높아 인재 확보가 매우 어려운 상황입니다.`)
    } else if (details.difficulty >= 60) {
      allInsights.push(`난이도 지수가 ${details.difficulty}점으로 높아 인재 확보에 어려움이 예상됩니다.`)
    } else if (details.difficulty >= 40) {
      allInsights.push(`난이도 지수가 ${details.difficulty}점으로 보통 수준입니다.`)
    } else {
      allInsights.push(`난이도 지수가 ${details.difficulty}점으로 낮아 상대적으로 인재 확보가 용이한 상황입니다.`)
    }
    
    // 유사 공고 수 인사이트
    if (details.similarPostings < 10) {
      allInsights.push(`시장에서 유사 공고가 ${details.similarPostings}개로 매우 부족하여 인재 공급이 극히 제한적입니다.`)
    } else if (details.similarPostings < 20) {
      allInsights.push(`유사 공고 수가 ${details.similarPostings}개로 적어 인재 확보가 어렵습니다.`)
    } else if (details.similarPostings < 40) {
      allInsights.push(`유사 공고 수가 ${details.similarPostings}개로 보통 수준입니다.`)
    } else {
      allInsights.push(`유사 공고 수가 ${details.similarPostings}개로 충분하여 인재 확보가 상대적으로 용이합니다.`)
    }
    
    // 경쟁사 비중 인사이트
    if (details.competitorRatio >= 70) {
      allInsights.push(`경쟁사 공고 비중이 ${details.competitorRatio}%로 매우 높아 동일한 인재 풀을 놓고 경쟁이 매우 치열합니다.`)
    } else if (details.competitorRatio >= 50) {
      allInsights.push(`경쟁사 공고 비중이 ${details.competitorRatio}%로 높아 경쟁이 심화되고 있습니다.`)
    } else if (details.competitorRatio >= 30) {
      allInsights.push(`경쟁사 공고 비중이 ${details.competitorRatio}%로 보통 수준입니다.`)
    } else {
      allInsights.push(`경쟁사 공고 비중이 ${details.competitorRatio}%로 낮아 경쟁이 상대적으로 완화된 상태입니다.`)
    }
    
    // 최근 성장률 인사이트
    if (details.recentGrowthRate >= 50) {
      allInsights.push(`최근 ${details.recentGrowthRate}% 급증하여 수요가 폭발적으로 증가하고 있어 시장이 과열 상태입니다.`)
    } else if (details.recentGrowthRate >= 30) {
      allInsights.push(`최근 ${details.recentGrowthRate}% 증가하여 수요가 빠르게 증가하고 있습니다.`)
    } else if (details.recentGrowthRate >= 10) {
      allInsights.push(`최근 ${details.recentGrowthRate}% 증가하여 수요가 점진적으로 증가하고 있습니다.`)
    } else if (details.recentGrowthRate > 0) {
      allInsights.push(`최근 ${details.recentGrowthRate}% 소폭 증가하여 수요가 안정적으로 증가하고 있습니다.`)
    } else if (details.recentGrowthRate === 0) {
      allInsights.push(`최근 성장률이 0%로 수요가 안정적인 상태입니다.`)
    } else {
      allInsights.push(`최근 ${Math.abs(details.recentGrowthRate)}% 감소하여 수요가 하락하고 있습니다.`)
    }
    
    // 평균 채용 기간 인사이트
    if (details.avgHiringDuration >= 35) {
      allInsights.push(`평균 채용 소요기간이 ${details.avgHiringDuration}일로 매우 길어 채용 프로세스 최적화가 시급합니다.`)
    } else if (details.avgHiringDuration >= 25) {
      allInsights.push(`평균 채용 소요기간이 ${details.avgHiringDuration}일로 다소 길어 채용이 지연되고 있습니다.`)
    } else if (details.avgHiringDuration >= 20) {
      allInsights.push(`평균 채용 소요기간이 ${details.avgHiringDuration}일로 보통 수준입니다.`)
    } else {
      allInsights.push(`평균 채용 소요기간이 ${details.avgHiringDuration}일로 짧아 채용 프로세스가 효율적으로 운영되고 있습니다.`)
    }
    
    // 작년 대비 변화 인사이트
    if (details.yearOverYearChange >= 15) {
      allInsights.push(`작년 대비 난이도가 ${details.yearOverYearChange}점 크게 상승하여 채용 환경이 크게 악화되었습니다.`)
    } else if (details.yearOverYearChange >= 5) {
      allInsights.push(`작년 대비 난이도가 ${details.yearOverYearChange}점 상승하여 채용 환경이 악화되고 있습니다.`)
    } else if (details.yearOverYearChange > 0) {
      allInsights.push(`작년 대비 난이도가 ${details.yearOverYearChange}점 소폭 상승하여 채용 난이도가 약간 증가했습니다.`)
    } else if (details.yearOverYearChange === 0) {
      allInsights.push(`작년 대비 난이도 변화가 없어 채용 환경이 안정적인 상태입니다.`)
    } else if (details.yearOverYearChange >= -5) {
      allInsights.push(`작년 대비 난이도가 ${Math.abs(details.yearOverYearChange)}점 소폭 하락하여 채용 환경이 약간 개선되었습니다.`)
    } else {
      allInsights.push(`작년 대비 난이도가 ${Math.abs(details.yearOverYearChange)}점 하락하여 채용 환경이 크게 개선되었습니다.`)
    }

    return (
      <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
        <div className="text-lg font-bold text-gray-900 mb-4">상세 인사이트</div>
        
        {/* 모든 지표를 텍스트 인사이트로 표시 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
          <div className="text-sm font-semibold text-gray-900 mb-3">현재 시장 상황 분석</div>
          <ul className="space-y-2">
            {allInsights.map((insight, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 전략 제안 */}
        {details.recommendations && details.recommendations.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm font-semibold text-green-900 mb-2">리소스·보상 전략 제안</div>
            <ul className="space-y-2">
              {details.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-green-800 flex items-start">
                  <span className="text-green-600 mr-2">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  // 사용 가능한 직군 목록
  const availableCategories = useMemo(() => {
    const categories = new Set<string>()
    data.forEach(item => {
      if (item.category) {
        categories.add(item.category)
      }
    })
    return Array.from(categories)
  }, [data])

  // 사용 가능한 직무 목록
  const availableJobs = useMemo(() => {
    return data.map(item => item.name)
  }, [data])

  return (
    <div className="space-y-6">
      {/* 게이지 차트 가로 배치 */}
      <div className="flex flex-row gap-4">
        {/* 전체 난이도 지수 */}
        <div className="flex-1 border border-gray-200 rounded-lg p-4 pb-8 bg-white flex flex-col">
          <GaugeChart
            value={overallDifficulty}
            label="전체 난이도 지수"
            onClick={() => handleGaugeClick('overall')}
          />
        </div>

        {/* 전체 직군 난이도 지수 */}
        <div className="flex-1 border border-gray-200 rounded-lg p-4 pb-8 bg-white flex flex-col">
          <div className="mb-3 flex flex-col gap-2">
            <div className="text-xs font-semibold text-gray-700">직군 선택</div>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value as 'Tech' | 'Biz' | 'BizSupporting' | '전체')}
              className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="전체">전체</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex flex-col">
            <GaugeChart
              value={allCategoriesDifficulty}
              label={selectedCategoryFilter === '전체' ? '전체 직군 난이도 지수' : `${selectedCategoryFilter} 직군 난이도 지수`}
              onClick={() => handleGaugeClick('all-categories')}
            />
          </div>
        </div>

        {/* 전체 직무 난이도 지수 */}
        <div className="flex-1 border border-gray-200 rounded-lg p-4 pb-8 bg-white flex flex-col">
          <div className="mb-3 flex flex-col gap-2">
            <div className="text-xs font-semibold text-gray-700">직무 선택</div>
            <select
              value={selectedJobFilter}
              onChange={(e) => setSelectedJobFilter(e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="전체">전체</option>
              {availableJobs.map(job => (
                <option key={job} value={job}>{job}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex flex-col">
            <GaugeChart
              value={allJobsDifficulty}
              label={selectedJobFilter === '전체' ? '전체 직무 난이도 지수' : `${selectedJobFilter} 난이도 지수`}
              onClick={() => handleGaugeClick('all-jobs')}
            />
          </div>
        </div>
      </div>

      {/* 선택한 게이지 차트의 인사이트 표시 */}
      {selectedGauge && (
        <>
          {selectedGauge === 'overall' && renderInsights('overall', overallDetails)}
          {selectedGauge === 'all-categories' && renderInsights('all-categories', allCategoriesDetails)}
          {selectedGauge === 'all-jobs' && renderInsights('all-jobs', allJobsDetails)}
        </>
      )}
    </div>
  )
}

