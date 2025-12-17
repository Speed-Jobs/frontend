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
  // API 응답 메시지 및 에러 메시지 필터링 함수 - 모든 API 응답 메시지를 차단
  const filterApiMessage = (text: string | null | undefined): boolean => {
    if (!text || typeof text !== 'string') return false
    
    const textTrimmed = text.trim()
    if (!textTrimmed) return false
    
    // API 응답 메시지 패턴 (성공/완료 메시지)
    const apiMessagePatterns = [
      /대시보드.*공고.*조회.*성공/i,
      /대시보드 공고 조회 성공/i,
      /공고.*조회.*성공/i,
      /조회.*성공/i,
      /대시보드.*조회.*성공/i,
      /공고.*조회/i,
      /조회.*완료/i,
      /데이터.*조회.*성공/i,
      /성공적으로.*조회/i,
      /조회.*처리.*완료/i,
      /성공/i,
      /완료/i,
      /처리.*완료/i,
      /요청.*성공/i,
      /요청.*완료/i,
    ]
    
    // 에러 메시지 패턴
    const errorMessagePatterns = [
      /API.*호출.*실패/i,
      /API.*call.*failed/i,
      /API.*error/i,
      /API.*응답/i,
      /\d{3}.*Not.*Found/i,
      /\d{3}.*Internal.*Server.*Error/i,
      /\d{3}.*Bad.*Request/i,
      /\d{3}.*Unauthorized/i,
      /\d{3}.*Forbidden/i,
      /\d{3}.*Error/i,
      /HTTP.*\d{3}/i,
      /에러.*발생/i,
      /오류.*발생/i,
      /오류가.*발생/i,
      /에러가.*발생/i,
      /실패/i,
      /Failed/i,
      /Error/i,
      /Exception/i,
      /예외.*발생/i,
      /네트워크.*오류/i,
      /네트워크.*에러/i,
      /연결.*실패/i,
      /연결.*오류/i,
      /타임아웃/i,
      /Timeout/i,
      /데이터.*불러오기.*실패/i,
      /데이터.*로드.*실패/i,
      /데이터.*조회.*실패/i,
      /데이터.*가져오기.*실패/i,
    ]
    
    // API 응답 관련 키워드 패턴 (더 포괄적으로 차단)
    const apiResponseKeywords = [
      /^API/i,
      /^응답/i,
      /^메시지/i,
      /^상태/i,
      /^코드/i,
      /^status/i,
      /^code/i,
      /^message/i,
      /^result/i,
      /^response/i,
    ]
    
    const exactMatches = [
      '대시보드 공고 조회 성공',
      '공고 조회 성공',
      '조회 성공',
      '대시보드 조회 성공',
      '조회 완료',
      '데이터 조회 성공',
      'API 호출 실패',
      '에러 발생',
      '오류 발생',
      'API',
      '응답',
      '메시지',
    ]
    
    // API 응답 메시지 패턴 체크
    for (const pattern of apiMessagePatterns) {
      if (pattern.test(textTrimmed)) {
        return true // 필터링 대상
      }
    }
    
    // 에러 메시지 패턴 체크
    for (const pattern of errorMessagePatterns) {
      if (pattern.test(textTrimmed)) {
        return true // 필터링 대상
      }
    }
    
    // API 응답 키워드로 시작하는 경우 차단
    for (const pattern of apiResponseKeywords) {
      if (pattern.test(textTrimmed)) {
        return true // 필터링 대상
      }
    }
    
    // 정확한 텍스트 매칭 체크
    if (exactMatches.some(match => textTrimmed === match || textTrimmed.includes(match))) {
      return true // 필터링 대상
    }
    
    // HTTP 상태 코드 패턴 체크 (404, 500, 400 등)
    if (/\b(40[0-9]|50[0-9]|30[0-9])\b/.test(textTrimmed)) {
      return true // 필터링 대상
    }
    
    // 매우 짧은 텍스트(1-3자)이고 API 관련 키워드인 경우 차단
    if (textTrimmed.length <= 3 && /^(API|응답|메시지|상태|코드)$/i.test(textTrimmed)) {
      return true
    }
    
    return false // 필터링 불필요
  }

  // API에서 제공하는 인사이트 데이터만 사용 - data.insights만 사용 (message 등 개발자용 메타데이터는 절대 사용하지 않음)
  const apiInsights = useMemo(() => {
    if (!insightData) return null
    
    // insightData가 객체이고 data.insights가 있는 경우에만 사용
    let insightsData: any = null
    
    if (typeof insightData === 'object' && insightData !== null) {
      // data.insights가 있는 경우 (일반적인 API 응답 구조)
      if (insightData.data && insightData.data.insights) {
        insightsData = insightData.data.insights
      }
      // data.insights가 없고 직접 insights 필드가 있는 경우
      else if (insightData.insights) {
        insightsData = insightData.insights
      }
      // data 필드가 직접 insights인 경우
      else if (insightData.data && typeof insightData.data === 'object' && !insightData.data.insights) {
        // data 자체가 insights인 경우 (data가 이미 insights 객체인 경우)
        insightsData = insightData.data
      }
      // 최상위 레벨에 이미 인사이트 필드들이 있는 경우 (하위 호환성)
      else if (insightData.key_findings || insightData.summary || insightData.cause_analysis) {
        insightsData = insightData
      }
    }
    
    // insights 데이터가 없으면 null 반환
    if (!insightsData) return null
    
    // key_findings 처리
    let keyFindings: string[] = []
    
    if (insightsData.key_findings) {
      if (Array.isArray(insightsData.key_findings)) {
        keyFindings = insightsData.key_findings
      } else if (typeof insightsData.key_findings === 'string') {
        keyFindings = [insightsData.key_findings]
      } else if (typeof insightsData.key_findings === 'object') {
        keyFindings = Object.values(insightsData.key_findings).filter((v): v is string => typeof v === 'string')
      }
    }
    
    // keyFindings에서 API 응답 메시지 완전히 제거
    const finalKeyFindings = keyFindings.filter(finding => {
      if (typeof finding === 'string') {
        const findingText = finding.trim()
        if (!findingText) return false
        
        // API 메시지 패턴 필터링
        if (filterApiMessage(findingText)) {
          return false
        }
      }
      return true
    })
    
    // summary에서 API 응답 메시지 제거
    let summary = insightsData.summary
    if (typeof summary === 'string') {
      const summaryText = summary.trim()
      if (filterApiMessage(summaryText)) {
        summary = null
      }
    }
    
    // cause_analysis에서도 API 메시지 제거
    let causeAnalysis = insightsData.cause_analysis
    if (typeof causeAnalysis === 'string') {
      const causeText = causeAnalysis.trim()
      if (filterApiMessage(causeText)) {
        causeAnalysis = null
      }
    } else if (causeAnalysis && typeof causeAnalysis === 'object' && causeAnalysis !== null) {
      // 객체 형태인 경우 possible_causes 배열도 필터링
      if (causeAnalysis.possible_causes && Array.isArray(causeAnalysis.possible_causes)) {
        causeAnalysis = {
          ...causeAnalysis,
          possible_causes: causeAnalysis.possible_causes.filter((cause: any) => {
            const causeText = typeof cause === 'string' ? cause.trim() : String(cause).trim()
            return !filterApiMessage(causeText)
          })
        }
        // 필터링 후 possible_causes가 비어있으면 null로 설정
        if (causeAnalysis.possible_causes.length === 0) {
          causeAnalysis = null
        }
      }
    }
    
    // competitor_comparison에서도 API 메시지 필터링
    let competitorComparison = insightsData.competitor_comparison || []
    if (Array.isArray(competitorComparison)) {
      competitorComparison = competitorComparison.filter((competitor: any) => {
        // 회사명이나 다른 필드에 API 메시지가 포함되어 있으면 제거
        if (competitor && typeof competitor === 'object') {
          const companyName = competitor.company_name || competitor.name || ''
          if (companyName && filterApiMessage(String(companyName))) {
            return false
          }
        }
        return true
      })
    }
    
    return {
      summary: summary,
      keyFindings: finalKeyFindings,
      causeAnalysis: causeAnalysis,
      competitorComparison: competitorComparison,
      marketRank: insightsData.market_rank,
      totalPostings: insightsData.total_postings,
      averageDailyPostings: insightsData.average_daily_postings,
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
        const summaryText = typeof apiInsights.summary === 'string' ? apiInsights.summary.trim() : String(apiInsights.summary).trim()
        if (!summaryText || filterApiMessage(summaryText)) return null
        
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
        const filteredFindings = apiInsights.keyFindings.filter((finding: any) => {
          const findingText = typeof finding === 'string' ? finding.trim() : String(finding).trim()
          if (!findingText) return false
          return !filterApiMessage(findingText)
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
      {apiInsights.causeAnalysis && (() => {
        // 원인 분석도 필터링 체크
        if (typeof apiInsights.causeAnalysis === 'string') {
          const causeText = apiInsights.causeAnalysis.trim()
          if (!causeText || filterApiMessage(causeText)) return null
        }
        
        return (
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
                          {apiInsights.causeAnalysis.possible_causes
                            .filter((cause: any) => {
                              const causeText = typeof cause === 'string' ? cause.trim() : String(cause).trim()
                              return causeText && !filterApiMessage(causeText)
                            })
                            .map((cause: string, idx: number) => (
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
        )
      })()}
      
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

