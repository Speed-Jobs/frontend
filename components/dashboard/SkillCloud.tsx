'use client'

import { useState, useMemo, useCallback } from 'react'

interface SkillCloudProps {
  skills: Array<{
    name: string
    count: number
    percentage?: number
    change?: number
    relatedSkills?: string[] | Array<{
      name: string
      count?: number
      percentage?: number
      change?: number
      similarity?: number
    }>
  }>
  selectedCompany?: string
}

const getSkillSize = (count: number, index: number, maxCount: number) => {
  if (index === 0) {
    return { 
      width: 'w-32', 
      height: 'h-14', 
      text: 'text-base', 
      padding: 'px-8 py-3', 
      pixelWidth: 128,
      pixelHeight: 56
    }
  }
  
  if (count >= maxCount * 0.8) {
    return { width: 'w-28', height: 'h-12', text: 'text-sm', padding: 'px-7 py-3', pixelWidth: 112, pixelHeight: 48 }
  } else if (count >= maxCount * 0.6) {
    return { width: 'w-24', height: 'h-10', text: 'text-sm', padding: 'px-6 py-2', pixelWidth: 96, pixelHeight: 40 }
  } else if (count >= maxCount * 0.4) {
    return { width: 'w-20', height: 'h-9', text: 'text-xs', padding: 'px-5 py-2', pixelWidth: 80, pixelHeight: 36 }
  } else if (count >= maxCount * 0.25) {
    return { width: 'w-18', height: 'h-8', text: 'text-xs', padding: 'px-4 py-1.5', pixelWidth: 72, pixelHeight: 32 }
  } else {
    return { width: 'w-16', height: 'h-7', text: 'text-xs', padding: 'px-3 py-1', pixelWidth: 64, pixelHeight: 28 }
  }
}

const getFinalSkillPosition = (index: number) => {
  if (index === 0) {
    return { x: 0, y: 0 }
  } else if (index <= 6) {
    const angle = ((index - 1) / 6) * Math.PI * 2 - Math.PI / 2
    const radius = 120
    return { 
      x: Math.cos(angle) * radius, 
      y: Math.sin(angle) * radius
    }
  } else {
    const angle = ((index - 7) / 6) * Math.PI * 2 - Math.PI / 2 + Math.PI / 6
    const radius = 200
    return { 
      x: Math.cos(angle) * radius, 
      y: Math.sin(angle) * radius
    }
  }
}

const generateSkillInsight = (skillData: {
  name: string
  count: number
  percentage?: number
  change?: number
  relatedSkills?: string[]
}, selectedCompany: string): string => {
  const companyText = selectedCompany !== '전체' ? `${selectedCompany}의 ` : ''
  const skillName = skillData.name.charAt(0).toUpperCase() + skillData.name.slice(1)
  
  let insight = `${companyText}${skillName} 스킬은 총 ${skillData.count}건의 채용 공고에서 요구되고 있습니다. `
  
  if (skillData.percentage !== undefined) {
    insight += `이는 전체 공고의 약 ${skillData.percentage.toFixed(1)}%에 해당하는 비중입니다. `
  }
  
  if (skillData.change !== undefined) {
    if (skillData.change > 0) {
      insight += `최근 ${Math.abs(skillData.change).toFixed(1)}% 증가한 추세를 보이고 있어, 시장에서의 수요가 높아지고 있음을 알 수 있습니다. `
    } else if (skillData.change < 0) {
      insight += `최근 ${Math.abs(skillData.change).toFixed(1)}% 감소한 추세를 보이고 있습니다. `
    } else {
      insight += `최근 변화율이 안정적인 수준을 유지하고 있습니다. `
    }
  }
  
  // relatedSkills를 문자열 배열로 변환
  const relatedSkillsStrings = skillData.relatedSkills 
    ? (Array.isArray(skillData.relatedSkills) && skillData.relatedSkills.length > 0 && typeof skillData.relatedSkills[0] === 'string'
        ? skillData.relatedSkills as string[]
        : (skillData.relatedSkills as Array<{ name: string }>).map(rs => rs.name))
    : []
  
  if (relatedSkillsStrings.length > 0) {
    const relatedSkillsText = relatedSkillsStrings.slice(0, 3).join(', ')
    insight += `${skillName}과 함께 자주 언급되는 관련 스킬로는 ${relatedSkillsText} 등이 있으며, 이러한 기술 스택을 함께 보유한 개발자에 대한 수요가 높은 것으로 분석됩니다. `
  }
  
  if (skillData.count >= 200) {
    insight += `전체적으로 매우 높은 수요를 보이는 핵심 스킬로 평가됩니다. `
  } else if (skillData.count >= 100) {
    insight += `상당한 수요를 보이는 주요 스킬로 평가됩니다. `
  }
  
  return insight
}

export default function SkillCloud({ skills, selectedCompany = '전체' }: SkillCloudProps) {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [expandedRelatedSkills, setExpandedRelatedSkills] = useState<Set<string>>(new Set())
  const [detailViewSkill, setDetailViewSkill] = useState<string | null>(null) // 상세 정보에 표시할 스킬

  const skillsToUse = useMemo(() => {
    return skills.slice(0, 13).sort((a, b) => b.count - a.count)
  }, [skills])

  const maxCount = skillsToUse[0]?.count || 1
  
  // relatedSkills를 문자열 배열로 변환하는 헬퍼 함수
  const getRelatedSkillsAsStrings = useCallback((relatedSkills?: string[] | Array<{ name: string; [key: string]: any }>): string[] => {
    if (!relatedSkills) return []
    if (Array.isArray(relatedSkills) && relatedSkills.length > 0) {
      if (typeof relatedSkills[0] === 'string') {
        return relatedSkills as string[]
      } else if (typeof relatedSkills[0] === 'object' && 'name' in relatedSkills[0]) {
        return (relatedSkills as Array<{ name: string }>).map(rs => rs.name)
      }
    }
    return []
  }, [])

  // relatedSkills에 특정 스킬이 포함되어 있는지 확인하는 헬퍼 함수
  const hasRelatedSkill = useCallback((relatedSkills: string[] | Array<{ name: string; [key: string]: any }> | undefined, skillName: string): boolean => {
    if (!relatedSkills) return false
    if (Array.isArray(relatedSkills) && relatedSkills.length > 0) {
      if (typeof relatedSkills[0] === 'string') {
        return (relatedSkills as string[]).includes(skillName)
      } else if (typeof relatedSkills[0] === 'object' && 'name' in relatedSkills[0]) {
        return (relatedSkills as Array<{ name: string }>).some(rs => rs.name === skillName)
      }
    }
    return false
  }, [])

  // 선택된 스킬 데이터 찾기 (메인 스킬 또는 관련 스킬)
  const selectedSkillData = useMemo(() => {
    if (!selectedSkill) return null
    
    // 먼저 메인 스킬 목록에서 찾기
    const mainSkill = skillsToUse.find(s => s.name === selectedSkill)
    if (mainSkill) return mainSkill
    
    // 전체 skills 배열에서 찾기 (관련 스킬이 메인 목록에 없을 수 있음)
    const fullSkill = skills.find(s => s.name === selectedSkill)
    if (fullSkill) return fullSkill
    
    // 관련 스킬 목록에서 찾기 (데이터가 없는 경우 기본 정보만 표시)
    for (const skill of skillsToUse) {
      if (hasRelatedSkill(skill.relatedSkills, selectedSkill)) {
        // 관련 스킬이 메인 스킬 목록에 없으면, 해당 스킬의 기본 정보를 생성
        return {
          name: selectedSkill,
          count: 0,
          percentage: undefined,
          change: undefined,
          relatedSkills: []
        }
      }
    }
    
    // 전체 skills 배열의 relatedSkills에서도 찾기
    for (const skill of skills) {
      if (hasRelatedSkill(skill.relatedSkills, selectedSkill)) {
        return {
          name: selectedSkill,
          count: 0,
          percentage: undefined,
          change: undefined,
          relatedSkills: []
        }
      }
    }
    
    return null
  }, [selectedSkill, skillsToUse, skills, hasRelatedSkill])

  // 상세 정보에 표시할 스킬 데이터 찾기 (detailViewSkill이 있으면 그것을, 없으면 selectedSkill 사용)
  const detailViewSkillData = useMemo(() => {
    const skillToShow = detailViewSkill || selectedSkill
    if (!skillToShow) return null
    
    // 먼저 메인 스킬 목록에서 찾기
    const mainSkill = skillsToUse.find(s => s.name === skillToShow)
    if (mainSkill) return mainSkill
    
    // 전체 skills 배열에서 찾기 (대소문자 구분 없이, 부분 일치도 시도)
    let fullSkill = skills.find(s => s.name === skillToShow)
    if (fullSkill) return fullSkill
    
    // 대소문자 무시하고 찾기
    fullSkill = skills.find(s => s.name.toLowerCase() === skillToShow.toLowerCase())
    if (fullSkill) return fullSkill
    
    // 관련 스킬이 다른 스킬의 relatedSkills에 포함되어 있는 경우,
    // 해당 스킬의 정보를 기반으로 관련 스킬 정보를 찾기
    // 전체 skills 배열에서 해당 스킬이 직접 포함되어 있는지 다시 한 번 확인
    const directSkill = skills.find(s => {
      // 정확히 일치하는 경우
      if (s.name === skillToShow) return true
      // 대소문자 무시하고 일치하는 경우
      if (s.name.toLowerCase() === skillToShow.toLowerCase()) return true
      return false
    })
    if (directSkill) return directSkill
    
    // 관련 스킬 목록에서 찾기 (데이터가 없는 경우 기본 정보만 표시)
    // 하지만 가능한 한 다른 스킬의 relatedSkills에서 정보를 찾아서 반환
    for (const skill of skills) {
      if (hasRelatedSkill(skill.relatedSkills, skillToShow)) {
        // 관련 스킬이 skills 배열에 직접 있는지 확인
        const relatedSkillData = skills.find(s => s.name === skillToShow)
        if (relatedSkillData) {
          return relatedSkillData
        }
        // 없으면 기본 정보 반환 (하지만 relatedSkills는 포함)
        const relatedSkillsStrings = getRelatedSkillsAsStrings(skill.relatedSkills)
        return {
          name: skillToShow,
          count: 0,
          percentage: undefined,
          change: undefined,
          relatedSkills: relatedSkillsStrings.filter(rs => rs === skillToShow || skills.some(s => s.name === rs))
        }
      }
    }
    
    // 마지막으로 skillsToUse에서도 확인
    for (const skill of skillsToUse) {
      if (hasRelatedSkill(skill.relatedSkills, skillToShow)) {
        const relatedSkillData = skills.find(s => s.name === skillToShow)
        if (relatedSkillData) {
          return relatedSkillData
        }
        return {
          name: skillToShow,
          count: 0,
          percentage: undefined,
          change: undefined,
          relatedSkills: []
        }
      }
    }
    
    return null
  }, [detailViewSkill, selectedSkill, skillsToUse, skills, hasRelatedSkill, getRelatedSkillsAsStrings])

  if (!skills || skills.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-8">
        스킬 데이터가 없습니다.
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full min-h-[500px] ${selectedSkill ? 'overflow-visible' : 'overflow-hidden'}`}>
      {/* 스킬 클라우드 영역 */}
      <div 
        className={`relative w-full flex items-center justify-center transition-all duration-300 ${
          selectedSkill ? 'bg-gray-100/50' : ''
        }`}
        style={{ 
          height: selectedSkill ? '600px' : '500px',
          maxWidth: '100%',
          margin: '0 auto',
          padding: selectedSkill ? '40px' : '20px',
          minHeight: selectedSkill ? '600px' : '500px',
        }}
      >
        {/* 배경 오버레이 */}
        {selectedSkill && (
          <div
            className="absolute inset-0 z-0"
            onClick={() => {
              setSelectedSkill(null)
              setExpandedRelatedSkills(new Set())
              setDetailViewSkill(null)
            }}
          />
        )}
        
        {/* SVG를 사용한 가지치기 선 그리기 - 모든 expanded 스킬의 가지치기 표시 */}
        {Array.from(expandedRelatedSkills.size > 0 ? expandedRelatedSkills : (selectedSkill ? [selectedSkill] : [])).map((expandedSkillName) => {
          const expandedSkillData = skillsToUse.find(s => s.name === expandedSkillName) || skills.find(s => s.name === expandedSkillName)
          if (!expandedSkillData || !expandedSkillData.relatedSkills) return null
          
          const expandedIndex = skillsToUse.findIndex(s => s.name === expandedSkillName)
          const expandedPosition = expandedIndex >= 0 
            ? getFinalSkillPosition(expandedIndex)
            : { x: 0, y: 0 }
          const radius = 130
          const containerCenterX = 300
          const containerCenterY = 300
          const expandedX = containerCenterX + expandedPosition.x
          const expandedY = containerCenterY + expandedPosition.y
          
          return (
            <svg 
              key={`lines-${expandedSkillName}`}
              className="absolute inset-0 pointer-events-none z-5"
              style={{ width: '100%', height: '100%' }}
              viewBox="0 0 600 600"
              preserveAspectRatio="xMidYMid meet"
            >
              {(() => {
                const relatedSkillsStrings = getRelatedSkillsAsStrings(expandedSkillData.relatedSkills).slice(0, 3)
                return relatedSkillsStrings.map((relatedSkillName, idx) => {
                  const isTopSkill = expandedSkillName === 'go' || expandedSkillName === 'kotlin'
                  const baseAngle = (idx / Math.max(relatedSkillsStrings.length, 1)) * Math.PI * 2 - Math.PI / 2
                  const adjustedAngle = isTopSkill && expandedPosition.y < -30
                    ? baseAngle + Math.PI / 4
                    : baseAngle
                  
                  const relatedX = Math.cos(adjustedAngle) * radius
                  const relatedY = Math.sin(adjustedAngle) * radius
                  
                  // SVG viewBox 경계 내에 위치하도록 제한 (패딩 고려)
                  const padding = 40
                  const maxX = 600 - padding
                  const maxY = 600 - padding
                  const minX = padding
                  const minY = padding
                  
                  let lineEndX = expandedX + relatedX
                  let lineEndY = expandedY + relatedY
                  
                  // 경계 체크 및 조정
                  if (lineEndX > maxX) lineEndX = maxX
                  if (lineEndX < minX) lineEndX = minX
                  if (lineEndY > maxY) lineEndY = maxY
                  if (lineEndY < minY) lineEndY = minY
                  
                  return (
                    <line
                      key={`${expandedSkillName}-${relatedSkillName}`}
                      x1={expandedX}
                      y1={expandedY}
                      x2={lineEndX}
                      y2={lineEndY}
                      stroke="#9ca3af"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      opacity="0.5"
                    />
                  )
                })
              })()}
            </svg>
          )
        })}
        
        {/* 메인 스킬들 */}
        {skillsToUse.map((skill, index) => {
          const size = getSkillSize(skill.count, index, maxCount)
          const finalPosition = getFinalSkillPosition(index)
          const isMain = index === 0
          const isSelected = selectedSkill === skill.name
          const isExpanded = expandedRelatedSkills.has(skill.name)
          
          let shouldBlur = false
          let shouldHide = false
          
          // selectedSkill을 기준으로 블러 처리하여 관련 스킬 클릭 시에도 블러 상태 유지
          // expandedRelatedSkills에 포함된 스킬도 selectedSkill의 관련 스킬이면 표시, 아니면 블러 처리
          if (selectedSkill) {
            // 원래 선택된 메인 스킬의 데이터 찾기 (selectedSkill 유지)
            const currentSelectedSkillData = skillsToUse.find(s => s.name === selectedSkill) || skills.find(s => s.name === selectedSkill)
            
            if (currentSelectedSkillData) {
              const relatedSkillsStrings = getRelatedSkillsAsStrings(currentSelectedSkillData.relatedSkills)
              const relatedSkillsSet = new Set(relatedSkillsStrings)
              
              if (isSelected) {
                // 선택된 메인 스킬은 항상 표시
                shouldBlur = false
                shouldHide = false
              } else if (relatedSkillsSet.has(skill.name)) {
                // 관련 스킬은 표시 (블러 없음)
                shouldBlur = false
                shouldHide = true
              } else {
                // 나머지 스킬은 블러 처리
                shouldBlur = true
                shouldHide = false
              }
            }
          }
          
          if (shouldHide) {
            return null
          }
          
          return (
            <button
              key={skill.name}
              onClick={(e) => {
                e.stopPropagation()
                if (selectedSkill === skill.name) {
                  setSelectedSkill(null)
                  setExpandedRelatedSkills(new Set())
                } else {
                  setSelectedSkill(skill.name)
                  setExpandedRelatedSkills(new Set([skill.name]))
                }
              }}
              className={`absolute ${size.padding} ${size.height} rounded-full flex items-center justify-center ${size.text} font-bold cursor-pointer whitespace-nowrap transition-all duration-300 ${
                isMain ? 'z-30' : 'z-10'
              } ${
                isMain && !shouldBlur
                  ? 'bg-gray-900 text-white shadow-2xl hover:shadow-gray-900/50 hover:scale-110 border-2 border-gray-700/30'
                  : isSelected
                  ? 'bg-gray-800 text-white shadow-xl hover:scale-110 border-2 border-gray-700 z-30'
                  : shouldBlur
                  ? 'bg-gray-100 text-gray-400 border-2 border-gray-300 shadow-lg opacity-20 blur-md pointer-events-none'
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-600 hover:scale-105 shadow-lg'
              }`}
              style={{
                left: `calc(50% + ${finalPosition.x}px)`,
                top: `calc(50% + ${finalPosition.y}px)`,
                transform: `translate(-50%, -50%)`,
                transition: 'all 0.3s ease',
                minWidth: size.pixelWidth,
                filter: shouldBlur ? 'blur(6px)' : 'none',
                pointerEvents: shouldBlur ? 'none' : 'auto',
              }}
            >
              {skill.name}
            </button>
          )
        })}
        
        {/* 관련 스킬들을 가지치기 형태로 표시 - 모든 expanded 스킬의 관련 스킬 표시 */}
        {Array.from(expandedRelatedSkills.size > 0 ? expandedRelatedSkills : (selectedSkill ? [selectedSkill] : [])).map((expandedSkillName) => {
          const expandedSkillData = skillsToUse.find(s => s.name === expandedSkillName) || skills.find(s => s.name === expandedSkillName)
          if (!expandedSkillData || !expandedSkillData.relatedSkills) return null
          
          const expandedIndex = skillsToUse.findIndex(s => s.name === expandedSkillName)
          const expandedPosition = expandedIndex >= 0 
            ? getFinalSkillPosition(expandedIndex)
            : { x: 0, y: 0 }
          const radius = 130
          
          // relatedSkills를 문자열 배열로 변환하고 3개로 제한
          const relatedSkillsStrings = getRelatedSkillsAsStrings(expandedSkillData.relatedSkills).slice(0, 3)
          
          return relatedSkillsStrings.map((relatedSkillName, idx) => {
            const isTopSkill = expandedSkillName === 'go' || expandedSkillName === 'kotlin'
            const baseAngle = (idx / Math.max(relatedSkillsStrings.length, 1)) * Math.PI * 2 - Math.PI / 2
            const adjustedAngle = isTopSkill && expandedPosition.y < -30
              ? baseAngle + Math.PI / 4
              : baseAngle
            
            const relatedX = Math.cos(adjustedAngle) * radius
            const relatedY = Math.sin(adjustedAngle) * radius
            
            // 컨테이너 경계 내에 위치하도록 제한 (패딩 고려)
            const containerWidth = 600
            const containerHeight = 600
            const padding = 40
            const maxX = (containerWidth / 2) - padding
            const maxY = (containerHeight / 2) - padding
            const minX = -(containerWidth / 2) + padding
            const minY = -(containerHeight / 2) + padding
            
            let finalRelatedX = expandedPosition.x + relatedX
            let finalRelatedY = expandedPosition.y + relatedY
            
            // 경계 체크 및 조정
            if (finalRelatedX > maxX) finalRelatedX = maxX
            if (finalRelatedX < minX) finalRelatedX = minX
            if (finalRelatedY > maxY) finalRelatedY = maxY
            if (finalRelatedY < minY) finalRelatedY = minY
            
            const visibleSkills = skillsToUse
            const relatedSkillData = visibleSkills.find(s => s.name === relatedSkillName)
            const isRelatedSkillInData = !!relatedSkillData
            
            const buttonSize = isRelatedSkillInData 
              ? 'px-4 py-2 h-8 text-sm' 
              : 'px-3 py-1.5 h-7 text-xs'
            
            return (
              <button
                key={`${expandedSkillName}-${relatedSkillName}`}
                onClick={(e) => {
                  e.stopPropagation()
                  // 관련 스킬을 클릭하면 해당 스킬의 상세 정보만 표시 (클라우드는 초기화하지 않음)
                  // selectedSkill은 그대로 유지하고, detailViewSkill만 변경
                  // 관련 스킬의 가지치기는 표시하지 않음 (expandedRelatedSkills에 추가하지 않음)
                  setDetailViewSkill(relatedSkillName)
                }}
                className={`absolute ${buttonSize} rounded-full flex items-center justify-center font-semibold cursor-pointer whitespace-nowrap z-40 transition-colors duration-300 ${
                  isRelatedSkillInData
                    ? 'bg-gray-900/20 text-gray-700 border-2 border-gray-700/50 hover:bg-gray-900/30 shadow-md'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-50 shadow-sm'
                }`}
                style={{
                  left: `calc(50% + ${finalRelatedX}px)`,
                  top: `calc(50% + ${finalRelatedY}px)`,
                  transform: `translate(-50%, -50%)`,
                  position: 'absolute',
                  willChange: 'auto',
                }}
              >
                {relatedSkillName}
              </button>
            )
          })
        })}
      </div>

      {/* 스킬 상세 정보 */}
      {detailViewSkillData && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="mb-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-900 rounded-xl mb-2 shadow-lg">
              <span className="text-lg font-bold text-white uppercase">
                {detailViewSkillData.name.charAt(0)}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1 capitalize">
              {detailViewSkillData.name}
            </h3>
            <p className="text-xs text-gray-500">스킬 상세 정보</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1 uppercase">총 공고 수</p>
              <p className="text-2xl font-bold text-gray-900">{detailViewSkillData.count || 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">건</p>
            </div>
            
            {detailViewSkillData.percentage !== undefined && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-1 uppercase">비율</p>
                <p className="text-2xl font-bold text-gray-900">{detailViewSkillData.percentage}</p>
                <p className="text-xs text-gray-500 mt-0.5">%</p>
              </div>
            )}

            {detailViewSkillData.change !== undefined && (
              <div className={`p-3 rounded-lg border ${
                detailViewSkillData.change >= 0 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className="text-xs font-medium text-gray-600 mb-1">전월 대비 변화</p>
                <div className="flex items-center gap-2">
                  <p className={`text-xl font-bold ${
                    detailViewSkillData.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {detailViewSkillData.change >= 0 ? '+' : ''}{detailViewSkillData.change}%
                  </p>
                  {detailViewSkillData.change >= 0 ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6" />
                    </svg>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 관련 스킬 */}
          {detailViewSkillData.relatedSkills && getRelatedSkillsAsStrings(detailViewSkillData.relatedSkills).length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">관련 스킬</p>
              <div className="flex flex-wrap gap-2">
                {getRelatedSkillsAsStrings(detailViewSkillData.relatedSkills).slice(0, 3).map((relatedSkill) => (
                  <span
                    key={relatedSkill}
                    className="px-2 py-1 text-xs bg-gray-50 text-gray-700 border border-gray-200 rounded"
                  >
                    {relatedSkill}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}


