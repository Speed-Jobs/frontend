'use client'

import { useState, useMemo } from 'react'

interface SkillCloudProps {
  skills: Array<{
    name: string
    count: number
    percentage?: number
    change?: number
    relatedSkills?: string[]
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
  
  if (skillData.relatedSkills && skillData.relatedSkills.length > 0) {
    const relatedSkillsText = skillData.relatedSkills.slice(0, 3).join(', ')
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

  const skillsToUse = useMemo(() => {
    return skills.slice(0, 13).sort((a, b) => b.count - a.count)
  }, [skills])

  const maxCount = skillsToUse[0]?.count || 1
  const selectedSkillData = skillsToUse.find(s => s.name === selectedSkill) || skillsToUse[0]

  if (!skills || skills.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-8">
        스킬 데이터가 없습니다.
      </div>
    )
  }

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden">
      {/* 스킬 클라우드 영역 */}
      <div 
        className={`relative w-full flex items-center justify-center transition-all duration-300 ${
          selectedSkill ? 'bg-gray-100/50' : ''
        }`}
        style={{ 
          height: '500px',
          maxWidth: '100%',
          margin: '0 auto',
          padding: '20px',
        }}
      >
        {/* 배경 오버레이 */}
        {selectedSkill && (
          <div
            className="absolute inset-0 z-0"
            onClick={() => {
              setSelectedSkill(null)
              setExpandedRelatedSkills(new Set())
            }}
          />
        )}
        
        {/* SVG를 사용한 가지치기 선 그리기 */}
        {selectedSkill && (() => {
          const selectedIndex = skillsToUse.findIndex(s => s.name === selectedSkill)
          if (selectedIndex === -1) return null
          
          const selectedPosition = getFinalSkillPosition(selectedIndex)
          const radius = 130
          const containerCenterX = 250
          const containerCenterY = 250
          const selectedX = containerCenterX + selectedPosition.x
          const selectedY = containerCenterY + selectedPosition.y
          
          return (
            <svg 
              className="absolute inset-0 pointer-events-none z-5"
              style={{ width: '100%', height: '100%' }}
              viewBox="0 0 500 500"
              preserveAspectRatio="xMidYMid meet"
            >
              {selectedSkillData.relatedSkills?.map((relatedSkillName, idx) => {
                const isTopSkill = selectedSkill === 'go' || selectedSkill === 'kotlin'
                const baseAngle = (idx / (selectedSkillData.relatedSkills?.length || 1)) * Math.PI * 2 - Math.PI / 2
                const adjustedAngle = isTopSkill && selectedPosition.y < -30
                  ? baseAngle + Math.PI / 4
                  : baseAngle
                
                const relatedX = Math.cos(adjustedAngle) * radius
                const relatedY = Math.sin(adjustedAngle) * radius
                const lineEndX = selectedX + relatedX
                const lineEndY = selectedY + relatedY
                
                return (
                  <line
                    key={relatedSkillName}
                    x1={selectedX}
                    y1={selectedY}
                    x2={lineEndX}
                    y2={lineEndY}
                    stroke="#9ca3af"
                    opacity="0.3"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    opacity="0.5"
                  />
                )
              })}
            </svg>
          )
        })()}
        
        {/* 메인 스킬들 */}
        {skillsToUse.map((skill, index) => {
          const size = getSkillSize(skill.count, index, maxCount)
          const finalPosition = getFinalSkillPosition(index)
          const isMain = index === 0
          const isSelected = selectedSkill === skill.name
          
          let shouldBlur = false
          let shouldHide = false
          
          if (selectedSkill) {
            const selectedSkillData = skillsToUse.find(s => s.name === selectedSkill)
            if (selectedSkillData) {
              const relatedSkillsSet = new Set(selectedSkillData.relatedSkills || [])
              
              if (isSelected) {
                shouldBlur = false
                shouldHide = false
              } else if (relatedSkillsSet.has(skill.name)) {
                shouldBlur = false
                shouldHide = true
              } else {
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
        
        {/* 관련 스킬들을 가지치기 형태로 표시 */}
        {selectedSkill && (() => {
          const selectedIndex = skillsToUse.findIndex(s => s.name === selectedSkill)
          if (selectedIndex === -1) return null
          
          const selectedPosition = getFinalSkillPosition(selectedIndex)
          const radius = 130
          
          return selectedSkillData.relatedSkills?.map((relatedSkillName, idx) => {
            const isTopSkill = selectedSkill === 'go' || selectedSkill === 'kotlin'
            const baseAngle = (idx / (selectedSkillData.relatedSkills?.length || 1)) * Math.PI * 2 - Math.PI / 2
            const adjustedAngle = isTopSkill && selectedPosition.y < -30
              ? baseAngle + Math.PI / 4
              : baseAngle
            
            const relatedX = Math.cos(adjustedAngle) * radius
            const relatedY = Math.sin(adjustedAngle) * radius
            
            const visibleSkills = skillsToUse
            const relatedSkillData = visibleSkills.find(s => s.name === relatedSkillName)
            const isRelatedSkillInData = !!relatedSkillData
            
            const buttonSize = isRelatedSkillInData 
              ? 'px-4 py-2 h-8 text-sm' 
              : 'px-3 py-1.5 h-7 text-xs'
            
            return (
              <button
                key={relatedSkillName}
                onClick={(e) => {
                  e.stopPropagation()
                  if (isRelatedSkillInData) {
                    setSelectedSkill(relatedSkillName)
                    setExpandedRelatedSkills(prev => new Set([...Array.from(prev), relatedSkillName]))
                  }
                }}
                className={`absolute ${buttonSize} rounded-full flex items-center justify-center font-semibold cursor-pointer whitespace-nowrap z-40 transition-all duration-300 ${
                  isRelatedSkillInData
                    ? 'bg-gray-900/20 text-gray-700 border-2 border-gray-700/50 hover:bg-gray-900/30 hover:scale-110 shadow-md'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-50 hover:scale-105 shadow-sm'
                }`}
                style={{
                  left: `calc(50% + ${selectedPosition.x + relatedX}px)`,
                  top: `calc(50% + ${selectedPosition.y + relatedY}px)`,
                  transform: `translate(-50%, -50%) scale(0)`,
                  opacity: 0,
                  animation: `fadeInScale 0.3s ease forwards`,
                  animationDelay: `${idx * 0.05}s`,
                }}
              >
                {relatedSkillName}
              </button>
            )
          })
        })()}
      </div>

      {/* 스킬 상세 정보 */}
      {selectedSkill && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="mb-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-900 rounded-xl mb-2 shadow-lg">
              <span className="text-lg font-bold text-white uppercase">
                {selectedSkillData.name.charAt(0)}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1 capitalize">
              {selectedSkillData.name}
            </h3>
            <p className="text-xs text-gray-500">스킬 상세 정보</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1 uppercase">총 공고 수</p>
              <p className="text-2xl font-bold text-gray-900">{selectedSkillData.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">건</p>
            </div>
            
            {selectedSkillData.percentage !== undefined && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-1 uppercase">비율</p>
                <p className="text-2xl font-bold text-gray-900">{selectedSkillData.percentage}</p>
                <p className="text-xs text-gray-500 mt-0.5">%</p>
              </div>
            )}

            {selectedSkillData.change !== undefined && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs font-medium text-gray-600 mb-1">전월 대비 변화</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-green-400">
                    +{selectedSkillData.change}%
                  </p>
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* 관련 스킬 */}
          {selectedSkillData.relatedSkills && selectedSkillData.relatedSkills.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">관련 스킬</p>
              <div className="flex flex-wrap gap-2">
                {selectedSkillData.relatedSkills.map((relatedSkill) => (
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

          {/* 스킬 인사이트 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">스킬 인사이트</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {generateSkillInsight(selectedSkillData, selectedCompany)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}


