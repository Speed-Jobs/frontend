'use client'

import { useMemo } from 'react'

interface InsightData {
  // 채용 활동 데이터
  recruitmentData: Array<{
    period: string
    count: number
  }>
  // 전체 시장 데이터
  totalTrendData: Array<{
    period: string
    count: number
  }>
  // 스킬 트렌드 데이터
  skillTrendData: Array<{
    month: string
    [skill: string]: string | number
  }>
  companyName: string
  timeframe: 'Daily' | 'Weekly' | 'Monthly'
  // 새로운 API 형식의 인사이트 데이터
  insightData?: any
}

export default function CompanyInsightAnalysis({
  recruitmentData,
  totalTrendData,
  skillTrendData,
  companyName,
  timeframe,
  insightData,
}: InsightData) {
  // API에서 제공하는 인사이트 데이터만 사용
  const apiInsights = useMemo(() => {
    if (!insightData) return null
    
    // message 필드가 있으면 제거 (노란색 박스로 표시되지 않도록)
    const { message, ...dataWithoutMessage } = insightData as any
    
    // key_findings는 insight 객체의 최상위에 있음 - 항상 표시
    let keyFindings: string[] = []
    
    if (dataWithoutMessage.key_findings) {
      if (Array.isArray(dataWithoutMessage.key_findings)) {
        keyFindings = dataWithoutMessage.key_findings
      } else if (typeof dataWithoutMessage.key_findings === 'string') {
        keyFindings = [dataWithoutMessage.key_findings]
      } else if (typeof dataWithoutMessage.key_findings === 'object') {
        keyFindings = Object.values(dataWithoutMessage.key_findings).filter((v): v is string => typeof v === 'string')
      }
    }
    
    // message 필드가 keyFindings에 포함되어 있으면 제거
    if (message && typeof message === 'string') {
      keyFindings = keyFindings.filter(finding => {
        const findingText = typeof finding === 'string' ? finding.trim() : String(finding).trim()
        const messageText = message.trim()
        return findingText !== messageText && !findingText.includes(messageText)
      })
    }
    
    // API 응답 메시지 패턴 제거 (더 강화된 필터링)
    const apiMessagePatterns = [
      /대시보드.*공고.*조회.*성공/i,
      /대시보드 공고 조회 성공/i,
      /공고.*조회.*성공/i,
      /조회.*성공/i,
      /대시보드.*조회.*성공/i,
      /공고.*조회/i,
      /조회.*완료/i,
      /데이터.*조회.*성공/i,
    ]
    
    const exactMatches = [
      '대시보드 공고 조회 성공',
      '공고 조회 성공',
      '조회 성공',
      '대시보드 조회 성공',
    ]
    
    // keyFindings에서 API 응답 메시지 필터링
    const finalKeyFindings = keyFindings.filter(finding => {
      if (typeof finding === 'string') {
        const findingText = finding.trim()
        if (!findingText) return false
        
        // 패턴 체크
        for (const pattern of apiMessagePatterns) {
          if (pattern.test(findingText)) {
            return false
          }
        }
        
        // 정확한 텍스트 매칭 체크
        if (exactMatches.some(match => findingText === match || findingText.includes(match))) {
          return false
        }
      }
      return true
    })
    
    // summary에서도 API 응답 메시지 제거
    let summary = dataWithoutMessage.summary
    if (typeof summary === 'string') {
      const summaryText = summary.trim()
      for (const pattern of apiMessagePatterns) {
        if (pattern.test(summaryText)) {
          summary = null
          break
        }
      }
      if (summary && exactMatches.some(match => summaryText === match || summaryText.includes(match))) {
        summary = null
      }
      // message 필드와 동일한 내용이면 제거
      if (message && typeof message === 'string' && summaryText === message.trim()) {
        summary = null
      }
    }
    
    return {
      summary: summary,
      keyFindings: finalKeyFindings,
      causeAnalysis: dataWithoutMessage.cause_analysis,
      strategicInsights: dataWithoutMessage.strategic_insights || [],
      competitorComparison: dataWithoutMessage.competitor_comparison || [],
      marketRank: dataWithoutMessage.market_rank,
      totalPostings: dataWithoutMessage.total_postings,
      averageDailyPostings: dataWithoutMessage.average_daily_postings,
    }
  }, [insightData, companyName])

  // API 데이터가 없으면 안내 메시지 표시
  if (!apiInsights) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
        <p className="text-gray-500 text-sm text-center">
          인사이트 데이터를 불러오는 중입니다...
        </p>
      </div>
    )
  }

  // 모든 필드가 비어있으면 안내 메시지 표시
  const hasAnyData = apiInsights.summary || 
    (apiInsights.keyFindings && apiInsights.keyFindings.length > 0) ||
    apiInsights.causeAnalysis ||
    (apiInsights.competitorComparison && apiInsights.competitorComparison.length > 0) ||
    apiInsights.marketRank ||
    apiInsights.totalPostings ||
    apiInsights.averageDailyPostings

  if (!hasAnyData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
        <p className="text-gray-500 text-sm text-center">
          인사이트 데이터가 아직 준비되지 않았습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 요약 - 가장 먼저 표시 */}
      {apiInsights.summary && (() => {
        // 렌더링 시점에서도 한 번 더 필터링
        const summaryText = typeof apiInsights.summary === 'string' ? apiInsights.summary.trim() : String(apiInsights.summary).trim()
        if (!summaryText) return null
        
        const apiMessagePatterns = [
          /대시보드.*공고.*조회.*성공/i,
          /대시보드 공고 조회 성공/i,
          /공고.*조회.*성공/i,
          /조회.*성공/i,
          /대시보드.*조회.*성공/i,
          /공고.*조회/i,
          /조회.*완료/i,
          /데이터.*조회.*성공/i,
        ]
        
        const exactMatches = [
          '대시보드 공고 조회 성공',
          '공고 조회 성공',
          '조회 성공',
          '대시보드 조회 성공',
        ]
        
        // 패턴 체크
        for (const pattern of apiMessagePatterns) {
          if (pattern.test(summaryText)) {
            return null
          }
        }
        
        // 정확한 텍스트 매칭 체크
        if (exactMatches.some(match => summaryText === match || summaryText.includes(match))) {
          return null
        }
        
        return (
          <div className="bg-white rounded-lg border border-gray-200 px-5 pt-4 pb-3">
            <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              요약
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {summaryText}
            </p>
          </div>
        )
      })()}
      
      {/* 주요 발견사항 */}
      {apiInsights.keyFindings && apiInsights.keyFindings.length > 0 && (() => {
        // 렌더링 시점에서도 한 번 더 필터링
        const apiMessagePatterns = [
          /대시보드.*공고.*조회.*성공/i,
          /대시보드 공고 조회 성공/i,
          /공고.*조회.*성공/i,
          /조회.*성공/i,
          /대시보드.*조회.*성공/i,
          /공고.*조회/i,
          /조회.*완료/i,
          /데이터.*조회.*성공/i,
        ]
        
        const exactMatches = [
          '대시보드 공고 조회 성공',
          '공고 조회 성공',
          '조회 성공',
          '대시보드 조회 성공',
        ]
        
        const filteredFindings = apiInsights.keyFindings.filter((finding: any) => {
          const findingText = typeof finding === 'string' ? finding.trim() : String(finding).trim()
          if (!findingText) return false
          
          // 패턴 체크
          for (const pattern of apiMessagePatterns) {
            if (pattern.test(findingText)) {
              return false
            }
          }
          
          // 정확한 텍스트 매칭 체크
          if (exactMatches.some(match => findingText === match || findingText.includes(match))) {
            return false
          }
          
          return true
        })
        
        if (filteredFindings.length === 0) return null
        
        return (
          <div className="bg-white rounded-lg border border-gray-200 px-5 pt-4 pb-3">
            <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              주요 발견사항
            </h3>
            <ul className="space-y-1.5">
              {filteredFindings.map((finding: any, index: number) => (
                <li key={index} className="text-gray-700 text-sm leading-relaxed flex items-start gap-2.5">
                  <span className="text-blue-500 mt-1 font-bold flex-shrink-0">•</span>
                  <span>{typeof finding === 'string' ? finding : String(finding)}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      })()}
      
      {/* 원인 분석 */}
      {apiInsights.causeAnalysis && (
        <div className="bg-white rounded-lg border border-gray-200 px-5 pt-4 pb-3">
          <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            원인 분석
          </h3>
          <div className="text-gray-700 text-sm leading-relaxed">
            {typeof apiInsights.causeAnalysis === 'string' ? (
              <p>{apiInsights.causeAnalysis}</p>
            ) : typeof apiInsights.causeAnalysis === 'object' && apiInsights.causeAnalysis !== null ? (
              <div className="space-y-2">
                {apiInsights.causeAnalysis.possible_causes && (
                  <div>
                    <p className="font-medium mb-1">가능한 원인:</p>
                    {Array.isArray(apiInsights.causeAnalysis.possible_causes) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {apiInsights.causeAnalysis.possible_causes.map((cause: string, idx: number) => (
                          <li key={idx}>{cause}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{String(apiInsights.causeAnalysis.possible_causes)}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p>{String(apiInsights.causeAnalysis)}</p>
            )}
          </div>
        </div>
      )}
      
      {/* 경쟁사 비교 */}
      {apiInsights.competitorComparison && apiInsights.competitorComparison.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 px-5 pt-4 pb-3">
          <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            경쟁사 비교
          </h3>
          <div className="space-y-2">
            {apiInsights.competitorComparison.map((competitor: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{competitor.company_name || competitor.name}</span>
                <span className="text-gray-900 font-medium">
                  {competitor.market_share ? `${competitor.market_share}%` : ''}
                  {competitor.total_count ? ` (${competitor.total_count}건)` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 시장 순위 및 통계 */}
      {(apiInsights.marketRank || apiInsights.totalPostings || apiInsights.averageDailyPostings) && (
        <div className="bg-white rounded-lg border border-gray-200 px-5 pt-4 pb-3">
          <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            시장 통계
          </h3>
          <div className="space-y-2 text-sm">
            {apiInsights.marketRank && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700">시장 순위</span>
                <span className="text-gray-900 font-medium">{apiInsights.marketRank}위</span>
              </div>
            )}
            {apiInsights.totalPostings && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700">총 공고 수</span>
                <span className="text-gray-900 font-medium">{apiInsights.totalPostings}건</span>
              </div>
            )}
            {apiInsights.averageDailyPostings && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700">평균 일일 공고 수</span>
                <span className="text-gray-900 font-medium">{apiInsights.averageDailyPostings}건</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

