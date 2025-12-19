'use client'

import { useState, useMemo, useEffect } from 'react'

// 반원형 게이지 차트 컴포넌트 (속도계 형태)
function GaugeChart({ 
  value, 
  label, 
  onClick,
  yoyScore,
  trend
}: { 
  value: number
  label: string
  onClick?: () => void
  yoyScore?: number // YoY 점수 (0-100, 과열도 표시용)
  trend?: string // 트렌드 ('냉각', '기준', '과열')
}) {
  const size = 200
  const strokeWidth = 20
  const radius = (size - strokeWidth) / 2
  const centerX = size / 2
  const centerY = size / 2
  
  // 반원형 호 (180도)
  const startAngle = -180 // 왼쪽 끝 (여유)
  const endAngle = 0 // 오른쪽 끝 (경쟁)
  
  // YoY 점수가 있으면 과열도로 사용, 없으면 기존 난이도 지수 사용
  const overheatPercentage = yoyScore !== undefined 
    ? Math.min(Math.max(yoyScore, 0), 100) // YoY 점수 그대로 사용 (0=여유, 100=경쟁)
    : Math.min(Math.max(value, 0), 100)
  
  // 바늘 각도 계산 (0% = -180도(여유), 100% = 0도(경쟁))
  const needleAngle = startAngle + (overheatPercentage / 100) * (endAngle - startAngle)
  
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
  
  // 그라데이션 색상 (과열도 기준: 초록(여유) -> 노랑(기준) -> 빨강(경쟁))
  const gradientId = `gauge-gradient-${label.replace(/\s+/g, '-')}-${overheatPercentage}`
  
  // 바늘 끝점 계산
  const needleLength = radius - 10
  const needleEndX = centerX + needleLength * Math.cos((needleAngle * Math.PI) / 180)
  const needleEndY = centerY + needleLength * Math.sin((needleAngle * Math.PI) / 180)
  
  // 4등분 구분선 각도 계산 (0%, 25%, 50%, 75%, 100%)
  const getDivisionAngle = (percentage: number) => {
    return startAngle + (percentage / 100) * (endAngle - startAngle)
  }
  
  // 구분선 끝점 계산 (호 바깥쪽)
  const getDivisionLineEnd = (angle: number, lineRadius: number) => {
    const angleRad = (angle * Math.PI) / 180
    return {
      x: centerX + lineRadius * Math.cos(angleRad),
      y: centerY + lineRadius * Math.sin(angleRad)
    }
  }
  
  // 구분선 라벨 위치 계산 (호 바깥쪽 더 멀리)
  const getLabelPosition = (angle: number, labelRadius: number) => {
    const angleRad = (angle * Math.PI) / 180
    return {
      x: centerX + labelRadius * Math.cos(angleRad),
      y: centerY + labelRadius * Math.sin(angleRad)
    }
  }
  
  const divisionRadius = radius + strokeWidth / 2 + 5 // 호 바깥쪽
  const labelRadius = radius + strokeWidth / 2 + 18 // 라벨 위치
  
  return (
    <div 
      className={`flex flex-col items-center py-4 pb-8 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={(e) => {
        // select 요소나 드롭다운 관련 요소를 클릭한 경우 이벤트 무시
        const target = e.target as HTMLElement
        if (target.tagName === 'SELECT' || target.closest('select') || target.closest('[class*="z-"]')) {
          return
        }
        if (onClick) {
          onClick()
        }
      }}
    >
      <div className="relative w-full max-w-[200px] mx-auto" style={{ aspectRatio: '2/1', maxHeight: '120px' }}>
        {/* 왼쪽 라벨 (여유) */}
        <div className="absolute left-0 top-0 text-xs font-semibold text-green-600">여유</div>
        {/* 오른쪽 라벨 (경쟁) */}
        <div className="absolute right-0 top-0 text-xs font-semibold text-red-600">경쟁</div>
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" /> {/* 초록 (여유) */}
              <stop offset="25%" stopColor="#84cc16" /> {/* 연두 */}
              <stop offset="50%" stopColor="#eab308" /> {/* 노랑 (기준) */}
              <stop offset="75%" stopColor="#f97316" /> {/* 주황 */}
              <stop offset="100%" stopColor="#dc2626" /> {/* 빨강 (경쟁) */}
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
          
          {/* 4등분 구분선 (0%, 25%, 50%, 75%, 100%) */}
          {[0, 25, 50, 75, 100].map((percentage) => {
            const divAngle = getDivisionAngle(percentage)
            const lineStart = getDivisionLineEnd(divAngle, radius - strokeWidth / 2)
            const lineEnd = getDivisionLineEnd(divAngle, divisionRadius)
            const labelPos = getLabelPosition(divAngle, labelRadius)
            
            return (
              <g key={percentage}>
                {/* 구분선 */}
                <line
                  x1={lineStart.x}
                  y1={lineStart.y}
                  x2={lineEnd.x}
                  y2={lineEnd.y}
                  stroke="#6b7280"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {/* 구분선 라벨 (숫자) */}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[10px] font-semibold fill-gray-700"
                  style={{ fontSize: '10px' }}
                >
                  {percentage}
                </text>
              </g>
            )
          })}
          
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
      {/* 타이틀 (계기판과 난이도 지수 사이) */}
      <div className="text-sm font-semibold text-gray-700 mt-2 mb-2 text-center px-2">{label}</div>
      {/* YoY 점수 또는 난이도 지수 표시 (차트 아래 별도 행) */}
      <div className="mt-0 mb-0">
        {yoyScore !== undefined ? (
          <div className="text-2xl font-bold text-gray-900">{yoyScore.toFixed(1)}</div>
        ) : (
          <div className="text-2xl font-bold text-gray-900">{overheatPercentage.toFixed(0)}</div>
        )}
        {trend && (
          <div className="text-xs text-gray-600 mt-1">
            {trend === '냉각' && <span className="text-green-600">수급 여유</span>}
            {trend === '과열' && <span className="text-red-600">수급 경쟁</span>}
            {trend === '기준' && <span className="text-yellow-600">수급 보통</span>}
          </div>
        )}
      </div>
    </div>
  )
}

interface JobDifficultyItem {
  name: string // 직군 이름 (예: Software Development)
  category?: 'Tech' | 'Biz' | 'BizSupporting'
  industries?: string[] // 직무 목록 (예: Front-end Development, Back-end Development)
  difficulty: number
  similarPostings: number
  competitorRatio: number
  recentGrowthRate: number
  avgHiringDuration: number
  yearOverYearChange: number
  insights: string[]
  yoyScore?: number // YoY 점수 (0-100, 과열도 표시용)
  trend?: string // 트렌드 ('냉각', '기준', '과열')
}

interface JobDifficultyGaugesProps {
  data: JobDifficultyItem[]
  onPositionChange?: (position: string) => void
  onIndustryChange?: (industry: string) => void
}

export default function JobDifficultyGauges({ 
  data,
  onPositionChange,
  onIndustryChange
}: JobDifficultyGaugesProps) {
  
  const [selectedGauge, setSelectedGauge] = useState<string | null>('overall')
  const [selectedJobRoleFilter, setSelectedJobRoleFilter] = useState<string>('전체') // 직군 필터 (Software Development 등)
  const [selectedSkillSetFilter, setSelectedSkillSetFilter] = useState<string>('전체') // 직무 필터 (Front-end Development 등)

  // 전체 평균 난이도 지수 및 YoY 점수 (항상 전체 시장 데이터만 사용)
  const overallDifficulty = useMemo(() => {
    if (!data || data.length === 0) return { difficulty: 0, yoyScore: undefined, trend: undefined }
    
    // 전체 시장 데이터만 찾기 (name이 정확히 '전체 시장'인 항목)
    const overallItem = data.find(item => item.name === '전체 시장')
    
    if (overallItem) {
      return {
        difficulty: overallItem.difficulty,
        yoyScore: overallItem.yoyScore,
        trend: overallItem.trend
      }
    }
    
    // 전체 시장 데이터가 없으면 기본값 반환
    return { difficulty: 0, yoyScore: undefined, trend: undefined }
  }, [data])

  // 전체 상세 정보 (API 인사이트만 사용)
  const overallDetails = useMemo(() => {
    if (data.length === 0) return null
    
    // 전체 시장 데이터 찾기 (API에서 제공하는 인사이트 사용)
    const overallItem = data.find(item => item.name === '전체 시장')
    
    const avgPostings = data.reduce((acc, item) => acc + item.similarPostings, 0) / data.length
    const avgCompetitorRatio = data.reduce((acc, item) => acc + item.competitorRatio, 0) / data.length
    const avgGrowthRate = data.reduce((acc, item) => acc + item.recentGrowthRate, 0) / data.length
    const avgHiringDuration = data.reduce((acc, item) => acc + item.avgHiringDuration, 0) / data.length
    const avgYearOverYearChange = data.reduce((acc, item) => acc + item.yearOverYearChange, 0) / data.length
    
    // API에서 제공하는 인사이트만 사용 (하드코딩 제거)
    const insights: string[] = overallItem?.insights || []
    const recommendations: string[] = [] // recommendations는 제거하거나 API에서 제공하는 경우에만 사용
    
    
    return {
      difficulty: overallDifficulty.difficulty, // 숫자 값만 사용
      similarPostings: Math.round(avgPostings),
      competitorRatio: Math.round(avgCompetitorRatio * 10) / 10,
      recentGrowthRate: Math.round(avgGrowthRate * 10) / 10,
      avgHiringDuration: Math.round(avgHiringDuration),
      yearOverYearChange: Math.round(avgYearOverYearChange * 10) / 10,
      insights, // API에서 제공하는 인사이트만 사용
      recommendations
    }
  }, [data, overallDifficulty])

  // 선택된 직군의 난이도 지수 및 YoY 점수
  const selectedJobRoleDifficulty = useMemo(() => {
    if (selectedJobRoleFilter === '전체') {
      // 전체 선택 시 전체 시장 데이터 사용 (직군별 평균이 아닌 전체 시장)
      const overallItem = data.find(item => item.name === '전체 시장')
      if (overallItem) {
        return {
          difficulty: overallItem.difficulty,
          yoyScore: overallItem.yoyScore,
          trend: overallItem.trend
        }
      }
      return { difficulty: 0, yoyScore: undefined, trend: undefined }
    } else {
      // 선택된 직군의 난이도 (산업별 데이터 제외)
      const selectedRole = data.find(item => 
        item.name === selectedJobRoleFilter && !item.name.includes(' - ')
      )
      return {
        difficulty: selectedRole?.difficulty || 0,
        yoyScore: selectedRole?.yoyScore,
        trend: selectedRole?.trend
      }
    }
  }, [data, selectedJobRoleFilter])

  // 선택된 직군의 상세 정보
  const selectedJobRoleDetails = useMemo(() => {
    let filteredItems: JobDifficultyItem[] = []
    let selectedRole: JobDifficultyItem | null = null
    
    if (selectedJobRoleFilter === '전체') {
      filteredItems = data
      // 전체 선택 시 전체 시장 데이터 사용
      selectedRole = data.find(item => item.name === '전체 시장') || null
    } else {
      // 직군 선택 시: 산업별 데이터가 아닌 직군 데이터만 찾기 (예: "Software Development", "Software Development - Front-end Development" 제외)
      selectedRole = data.find(item => 
        item.name === selectedJobRoleFilter && !item.name.includes(' - ')
      ) || null
      
      if (!selectedRole) return null
      filteredItems = [selectedRole]
    }

    if (filteredItems.length === 0) return null

    const avgPostings = filteredItems.reduce((acc, item) => acc + item.similarPostings, 0) / filteredItems.length
    const avgCompetitorRatio = filteredItems.reduce((acc, item) => acc + item.competitorRatio, 0) / filteredItems.length
    const avgGrowthRate = filteredItems.reduce((acc, item) => acc + item.recentGrowthRate, 0) / filteredItems.length
    const avgHiringDuration = filteredItems.reduce((acc, item) => acc + item.avgHiringDuration, 0) / filteredItems.length
    const avgYearOverYearChange = filteredItems.reduce((acc, item) => acc + item.yearOverYearChange, 0) / filteredItems.length

    // 선택된 직군 데이터에서 API 인사이트 가져오기
    // API에서 제공하는 인사이트만 사용 (하드코딩 제거)
    const insights: string[] = selectedRole?.insights || []
    const recommendations: string[] = []
    
    
    return {
      difficulty: selectedJobRoleDifficulty.difficulty, // 숫자 값만 사용
      similarPostings: Math.round(avgPostings),
      competitorRatio: Math.round(avgCompetitorRatio * 10) / 10,
      recentGrowthRate: Math.round(avgGrowthRate * 10) / 10,
      avgHiringDuration: Math.round(avgHiringDuration),
      yearOverYearChange: Math.round(avgYearOverYearChange * 10) / 10,
      insights, // API에서 제공하는 인사이트만 사용
      recommendations
    }
  }, [data, selectedJobRoleDifficulty, selectedJobRoleFilter])

  // 선택된 직무(Skill set)의 난이도 지수 및 YoY 점수
  const selectedSkillSetDifficulty = useMemo(() => {
    if (selectedSkillSetFilter === '전체') {
      // 전체 선택 시: 직군이 선택되어 있으면 해당 직군 데이터, 없으면 전체 시장 데이터
      if (selectedJobRoleFilter === '전체') {
        const overallItem = data.find(item => item.name === '전체 시장')
        if (overallItem) {
          return {
            difficulty: overallItem.difficulty,
            yoyScore: overallItem.yoyScore,
            trend: overallItem.trend
          }
        }
        return { difficulty: 0, yoyScore: undefined, trend: undefined }
      } else {
        // 직군이 선택되어 있으면 해당 직군 데이터 사용
        const selectedRole = data.find(item => 
          item.name === selectedJobRoleFilter && !item.name.includes(' - ')
        )
        return {
          difficulty: selectedRole?.difficulty || 0,
          yoyScore: selectedRole?.yoyScore,
          trend: selectedRole?.trend
        }
      }
    } else {
      // 선택된 직무의 데이터 찾기 (예: "Software Development - Front-end Development")
      const industryItem = data.find(item => 
        item.name.includes(' - ') && item.name.endsWith(selectedSkillSetFilter)
      )
      
      if (industryItem) {
        return {
          difficulty: industryItem.difficulty,
          yoyScore: industryItem.yoyScore,
          trend: industryItem.trend
        }
      }
      
      return { difficulty: 0, yoyScore: undefined, trend: undefined }
    }
  }, [data, selectedSkillSetFilter, selectedJobRoleFilter])

  // 선택된 직무(Skill set)의 상세 정보
  const selectedSkillSetDetails = useMemo(() => {
    let filteredItems: JobDifficultyItem[] = []
    
    if (selectedSkillSetFilter === '전체') {
      filteredItems = data
    } else {
      // 선택된 직무를 포함하는 직군들 찾기
      filteredItems = data.filter(item => 
        item.industries && item.industries.includes(selectedSkillSetFilter)
      )
    }

    if (filteredItems.length === 0) return null

    const avgPostings = filteredItems.reduce((acc, item) => acc + item.similarPostings, 0) / filteredItems.length
    const avgCompetitorRatio = filteredItems.reduce((acc, item) => acc + item.competitorRatio, 0) / filteredItems.length
    const avgGrowthRate = filteredItems.reduce((acc, item) => acc + item.recentGrowthRate, 0) / filteredItems.length
    const avgHiringDuration = filteredItems.reduce((acc, item) => acc + item.avgHiringDuration, 0) / filteredItems.length
    const avgYearOverYearChange = filteredItems.reduce((acc, item) => acc + item.yearOverYearChange, 0) / filteredItems.length

    // 선택된 직무 데이터에서 API 인사이트 가져오기
    const selectedIndustryItem = selectedSkillSetFilter !== '전체'
      ? filteredItems.find(item => 
          item.name.includes(' - ') && item.name.endsWith(selectedSkillSetFilter)
        )
      : null
    
    // API에서 제공하는 인사이트만 사용 (하드코딩 제거)
    const insights: string[] = selectedIndustryItem?.insights || []
    const recommendations: string[] = []
    
    return {
      difficulty: selectedSkillSetDifficulty.difficulty, // 숫자 값만 사용
      similarPostings: Math.round(avgPostings),
      competitorRatio: Math.round(avgCompetitorRatio * 10) / 10,
      recentGrowthRate: Math.round(avgGrowthRate * 10) / 10,
      avgHiringDuration: Math.round(avgHiringDuration),
      yearOverYearChange: Math.round(avgYearOverYearChange * 10) / 10,
      insights, // API에서 제공하는 인사이트만 사용
      recommendations
    }
  }, [data, selectedSkillSetDifficulty, selectedSkillSetFilter])

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
    
    if (selectedGauge === 'job-role') {
      return selectedJobRoleDetails
    }
    
    if (selectedGauge === 'skill-set') {
      return selectedSkillSetDetails
    }
    
    return null
  }

  const selectedDetails = getSelectedDetails()

  // 인사이트 텍스트에서 "냉각"/"과열"을 "여유"/"경쟁"으로 치환하는 함수
  const replaceInsightText = (text: string): string => {
    return text
      .replace(/냉각/g, '여유')
      .replace(/과열/g, '경쟁')
      .replace(/냉각 상태/g, '수급 여유')
      .replace(/과열 상태/g, '수급 경쟁')
  }

  const renderInsights = (gaugeType: string, details: typeof overallDetails) => {
    if (selectedGauge !== gaugeType || !details) return null

    // API에서 제공하는 인사이트만 사용 (하드코딩 제거)
    const apiInsights = details.insights || []

    return (
      <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
        <div className="text-lg font-bold text-gray-900 mb-4">상세 인사이트</div>
        
        {/* API에서 제공하는 인사이트만 표시 */}
        {apiInsights && Array.isArray(apiInsights) && apiInsights.length > 0 ? (
          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
            <div className="text-sm font-semibold text-gray-900 mb-3">현재 시장 상황 분석</div>
            <ul className="space-y-2">
              {apiInsights.map((insight, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{replaceInsightText(insight)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
            <div className="text-sm text-gray-500 italic">인사이트 생성 중...</div>
          </div>
        )}

        {/* 전략 제안 */}
        {details.recommendations && details.recommendations.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm font-semibold text-green-900 mb-2">리소스·보상 전략 제안</div>
            <ul className="space-y-2">
              {details.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-green-800 flex items-start">
                  <span className="text-green-600 mr-2">→</span>
                  <span>{replaceInsightText(rec)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  // 이미지 구조에 맞춘 직군별 직무 매핑 (직군 -> 직무 목록)
  const jobRoleToSkillSets = useMemo(() => {
    const mapping: Record<string, string[]> = {}
    data.forEach(item => {
      if (item.industries && item.industries.length > 0) {
        mapping[item.name] = item.industries
      }
    })
    return mapping
  }, [data])

  // 사용 가능한 직군 목록 (데이터에 있는 직군만) - 항상 모든 직군 표시
  const availableJobRoles = useMemo(() => {
    // 데이터에서 실제 직군 이름 추출 (산업별 데이터 제외)
    const jobRolesFromData = data
      .filter(item => {
        // '전체 시장' 제외, 산업별 데이터(이름에 '-' 포함) 제외
        return item.name !== '전체 시장' && !item.name.includes(' - ')
      })
      .map(item => item.name)
    
    // 이미지 순서대로 정렬 (데이터에 있는 것만)
    const orderedRoles = [
      'Software Development',
      'Factory AX Engineering',
      'Solution Development',
      'Cloud/Infra Engineering',
      'Architect',
      'Project Management',
      'Quality Management',
      'AI',
      '정보보호',
      'Sales',
      'Domain Expert',
      'Consulting',
      'Biz. Supporting',
    ]
    
    // 정렬된 순서대로 필터링하되, 데이터에 있는 것만
    const filteredRoles = orderedRoles.filter(role => jobRolesFromData.includes(role))
    
    // 정렬된 목록에 없는 직군도 추가 (데이터에만 있는 경우)
    const additionalRoles = jobRolesFromData.filter(role => !orderedRoles.includes(role))
    
    const result = [...filteredRoles, ...additionalRoles]
    
    
    // 항상 모든 직군을 반환 (선택 상태와 무관하게)
    return result
  }, [data])

  // 선택된 직군에 해당하는 직무(Skill set) 목록 (직군을 선택했을 때만 표시)
  const availableSkillSets = useMemo(() => {
    if (selectedJobRoleFilter === '전체') {
      // 전체 선택 시 빈 배열 반환 (직군을 선택해야 직무 필터 사용 가능)
      return []
    } else {
      // 선택된 직군의 직무만
      return jobRoleToSkillSets[selectedJobRoleFilter] || []
    }
  }, [data, selectedJobRoleFilter, jobRoleToSkillSets])

  // 초기화 함수
  const handleReset = () => {
    setSelectedJobRoleFilter('전체')
    setSelectedSkillSetFilter('전체')
    setSelectedGauge(null)
    // 부모 컴포넌트에 초기화 알림
    if (onPositionChange) {
      onPositionChange('')
    }
    if (onIndustryChange) {
      onIndustryChange('')
    }
  }

  // 직군 변경 시 직무 필터 리셋 및 부모 컴포넌트에 알림
  const handleJobRoleChange = (jobRole: string) => {
    const normalizedJobRole = jobRole === '전체' ? '' : jobRole
    // 직군 변경 시 항상 직무 선택 초기화
    setSelectedJobRoleFilter(jobRole)
    setSelectedSkillSetFilter('전체')
    // 부모 컴포넌트에 직군 변경 알림
    if (onPositionChange) {
      onPositionChange(normalizedJobRole)
    }
    // 직군 변경 시 항상 직무도 초기화
    if (onIndustryChange) {
      onIndustryChange('')
    }
  }

  // 직무 변경 시 부모 컴포넌트에 알림
  const handleSkillSetChange = (skillSet: string) => {
    const normalizedSkillSet = skillSet === '전체' ? '' : skillSet
    setSelectedSkillSetFilter(skillSet)
    // 부모 컴포넌트에 직무 변경 알림
    if (onIndustryChange) {
      onIndustryChange(normalizedSkillSet)
    }
  }

  // 컴포넌트 마운트 시 초기값 전달
  useEffect(() => {
    if (onPositionChange) {
      onPositionChange('') // 초기값은 전체 시장
    }
    if (onIndustryChange) {
      onIndustryChange('') // 초기값은 전체
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      {/* 초기화 버튼 */}
      {(selectedJobRoleFilter !== '전체' || selectedSkillSetFilter !== '전체') && (
        <div className="flex justify-end">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            초기화
          </button>
        </div>
      )}
      {/* 게이지 차트 반응형 배치 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 전체 난이도 지수 */}
        <div className="w-full md:flex-1 border border-gray-200 rounded-lg p-4 pb-8 bg-white flex flex-col min-w-0">
          <div className="mb-3 h-[28px] flex-shrink-0"></div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <GaugeChart
              value={overallDifficulty.difficulty}
              label="전체 경쟁 지수"
              onClick={() => handleGaugeClick('overall')}
              yoyScore={overallDifficulty.yoyScore}
              trend={overallDifficulty.trend}
            />
          </div>
        </div>

        {/* 직군 난이도 지수 */}
        <div className="w-full md:flex-1 border border-gray-200 rounded-lg p-4 pb-8 bg-white flex flex-col min-w-0 relative">
          <div 
            className="mb-3 flex items-center gap-2 flex-shrink-0 min-w-0 relative z-[100]" 
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          >
            <div className="text-xs font-semibold text-gray-700 whitespace-nowrap flex-shrink-0">직군 선택</div>
            <select
              value={selectedJobRoleFilter}
              onChange={(e) => {
                e.stopPropagation()
                const value = e.target.value
                handleJobRoleChange(value)
              }}
              className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-0 relative z-[100]"
              style={{ pointerEvents: 'auto' }}
              onClick={(e) => {
                e.stopPropagation()
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              onTouchStart={(e) => {
                e.stopPropagation()
              }}
              onFocus={(e) => {
                e.stopPropagation()
              }}
            >
              <option value="전체">전체</option>
              {/* 항상 모든 직군을 드롭다운에 표시 (선택 상태와 무관하게) */}
              {availableJobRoles.length > 0 ? (
                availableJobRoles.map(jobRole => (
                  <option key={jobRole} value={jobRole}>{jobRole}</option>
                ))
              ) : (
                <option value="" disabled>직군 데이터 없음</option>
              )}
            </select>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <GaugeChart
              value={selectedJobRoleDifficulty.difficulty}
              label={selectedJobRoleFilter === '전체' ? '전체 직군 경쟁 지수' : `${selectedJobRoleFilter} 경쟁 지수`}
              onClick={() => handleGaugeClick('job-role')}
              yoyScore={selectedJobRoleDifficulty.yoyScore}
              trend={selectedJobRoleDifficulty.trend}
            />
          </div>
        </div>

        {/* 직무(Skill set) 난이도 지수 */}
        <div className="w-full md:flex-1 border border-gray-200 rounded-lg p-4 pb-8 bg-white flex flex-col min-w-0 relative">
          <div 
            className="mb-3 flex items-center gap-2 flex-shrink-0 min-w-0 relative z-50"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-semibold text-gray-700 whitespace-nowrap flex-shrink-0">직무 선택</div>
            <select
              value={selectedSkillSetFilter}
              onChange={(e) => {
                e.stopPropagation()
                const value = e.target.value
                handleSkillSetChange(value)
              }}
              disabled={selectedJobRoleFilter === '전체'}
              className={`px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-0 relative z-50 ${
                selectedJobRoleFilter === '전체' ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation()
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              onTouchStart={(e) => {
                e.stopPropagation()
              }}
              onFocus={(e) => {
                e.stopPropagation()
              }}
            >
              <option value="전체">
                {selectedJobRoleFilter === '전체' ? '직군을 먼저 선택하세요' : '전체'}
              </option>
              {availableSkillSets.map(skillSet => (
                <option key={skillSet} value={skillSet}>{skillSet}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <GaugeChart
              value={selectedSkillSetDifficulty.difficulty}
              label={
                selectedJobRoleFilter === '전체' 
                  ? '직군을 선택하세요' 
                  : selectedSkillSetFilter === '전체' 
                    ? `${selectedJobRoleFilter} 직무 경쟁 지수` 
                    : `${selectedSkillSetFilter} 경쟁 지수`
              }
              onClick={() => selectedJobRoleFilter !== '전체' && handleGaugeClick('skill-set')}
              yoyScore={selectedSkillSetDifficulty.yoyScore}
              trend={selectedSkillSetDifficulty.trend}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

