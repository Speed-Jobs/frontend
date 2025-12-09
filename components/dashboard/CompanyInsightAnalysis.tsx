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
    
    // key_findings는 insight 객체의 최상위에 있음 - 항상 표시
    let keyFindings: string[] = []
    
    if (insightData.key_findings) {
      if (Array.isArray(insightData.key_findings)) {
        keyFindings = insightData.key_findings
      } else if (typeof insightData.key_findings === 'string') {
        keyFindings = [insightData.key_findings]
      } else if (typeof insightData.key_findings === 'object') {
        keyFindings = Object.values(insightData.key_findings).filter((v): v is string => typeof v === 'string')
      }
    }
    
    const finalKeyFindings = keyFindings
    
    return {
      summary: insightData.summary,
      keyFindings: finalKeyFindings,
      causeAnalysis: insightData.cause_analysis,
      strategicInsights: insightData.strategic_insights || [],
      competitorComparison: insightData.competitor_comparison || [],
      marketRank: insightData.market_rank,
      totalPostings: insightData.total_postings,
      averageDailyPostings: insightData.average_daily_postings,
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
    (apiInsights.strategicInsights && apiInsights.strategicInsights.length > 0) ||
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
      {apiInsights.summary && (
        <div className="bg-white rounded-lg border border-gray-200 px-5 pt-4 pb-3">
          <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            요약
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            {typeof apiInsights.summary === 'string' ? apiInsights.summary : String(apiInsights.summary)}
          </p>
        </div>
      )}
      
      {/* 주요 발견사항 */}
      {apiInsights.keyFindings && apiInsights.keyFindings.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 px-5 pt-4 pb-3">
          <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            주요 발견사항
          </h3>
          <ul className="space-y-1.5">
            {apiInsights.keyFindings.map((finding: any, index: number) => (
              <li key={index} className="text-gray-700 text-sm leading-relaxed flex items-start gap-2.5">
                <span className="text-blue-500 mt-1 font-bold flex-shrink-0">•</span>
                <span>{typeof finding === 'string' ? finding : String(finding)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
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
                {apiInsights.causeAnalysis.news_evidence && (
                  <div>
                    <p className="font-medium mb-1">뉴스 증거:</p>
                    {Array.isArray(apiInsights.causeAnalysis.news_evidence) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {apiInsights.causeAnalysis.news_evidence.map((evidence: string, idx: number) => (
                          <li key={idx}>{evidence}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{String(apiInsights.causeAnalysis.news_evidence)}</p>
                    )}
                  </div>
                )}
                {apiInsights.causeAnalysis.confidence && (
                  <div>
                    <p className="font-medium mb-1">신뢰도:</p>
                    <p>{String(apiInsights.causeAnalysis.confidence)}</p>
                  </div>
                )}
              </div>
            ) : (
              <p>{String(apiInsights.causeAnalysis)}</p>
            )}
          </div>
        </div>
      )}
      
      {/* 전략적 인사이트 */}
      {apiInsights.strategicInsights && apiInsights.strategicInsights.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 px-5 pt-4 pb-3">
          <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            전략적 인사이트
          </h3>
          <ul className="space-y-1.5">
            {apiInsights.strategicInsights.map((insight: any, index: number) => (
              <li key={index} className="text-gray-700 text-sm leading-relaxed flex items-start gap-2.5">
                <span className="text-yellow-500 mt-1 font-bold flex-shrink-0">•</span>
                <span>{typeof insight === 'string' ? insight : String(insight)}</span>
              </li>
            ))}
          </ul>
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

