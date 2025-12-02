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
  // 1. 채용 활동 트렌드 분석
  const recruitmentTrend = useMemo(() => {
    if (!recruitmentData || recruitmentData.length < 2) return null

    const counts = recruitmentData.map(d => d.count)
    const recent = counts.slice(-3)
    const previous = counts.slice(-6, -3)
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const previousAvg = previous.length > 0 
      ? previous.reduce((a, b) => a + b, 0) / previous.length 
      : recentAvg

    const changeRate = previousAvg > 0 
      ? ((recentAvg - previousAvg) / previousAvg) * 100 
      : 0

    const total = counts.reduce((a, b) => a + b, 0)
    const avg = total / counts.length
    const max = Math.max(...counts)
    const min = Math.min(...counts)
    const maxPeriod = recruitmentData[counts.indexOf(max)].period
    const minPeriod = recruitmentData[counts.indexOf(min)].period

    return {
      trend: changeRate > 10 ? 'up' : changeRate < -10 ? 'down' : 'stable',
      changeRate: Math.abs(changeRate),
      total,
      avg: Math.round(avg),
      max,
      min,
      maxPeriod,
      minPeriod,
      recentAvg: Math.round(recentAvg),
    }
  }, [recruitmentData])

  // 2. 시장 점유율 및 경쟁력 분석
  const marketAnalysis = useMemo(() => {
    if (!recruitmentData || !totalTrendData || recruitmentData.length === 0) return null

    const companyTotal = recruitmentData.reduce((sum, d) => sum + d.count, 0)
    const marketTotal = totalTrendData.reduce((sum, d) => sum + d.count, 0)
    
    const marketShare = marketTotal > 0 ? (companyTotal / marketTotal) * 100 : 0

    // 최근 기간 비교
    const recentCompany = recruitmentData.slice(-3).reduce((sum, d) => sum + d.count, 0)
    const recentMarket = totalTrendData.slice(-3).reduce((sum, d) => sum + d.count, 0)
    const recentShare = recentMarket > 0 ? (recentCompany / recentMarket) * 100 : 0

    const shareChange = marketShare - recentShare

    return {
      marketShare: Math.round(marketShare * 10) / 10,
      recentShare: Math.round(recentShare * 10) / 10,
      shareChange: Math.round(shareChange * 10) / 10,
      companyTotal,
      marketTotal,
    }
  }, [recruitmentData, totalTrendData])

  // 3. 스킬 트렌드 분석
  const skillAnalysis = useMemo(() => {
    if (!skillTrendData || skillTrendData.length < 2) return null

    const latest = skillTrendData[skillTrendData.length - 1]
    const previous = skillTrendData[skillTrendData.length - 2]

    // 상위 스킬 추출
    const skillCounts: Array<{ name: string; count: number; change: number }> = []
    
    Object.keys(latest).forEach(skill => {
      if (skill !== 'month') {
        const current = Number(latest[skill] || 0)
        const prev = Number(previous[skill] || 0)
        const change = prev > 0 ? ((current - prev) / prev) * 100 : current > 0 ? 100 : 0
        
        skillCounts.push({
          name: skill,
          count: current,
          change,
        })
      }
    })

    // 상위 5개 스킬
    const topSkills = skillCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 급증 스킬 (50% 이상 증가)
    const surgingSkills = skillCounts
      .filter(s => s.change > 50 && s.count > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 3)

    return {
      topSkills,
      surgingSkills,
      latestMonth: latest.month,
    }
  }, [skillTrendData])

  // 4. 채용 패턴 분석
  const recruitmentPattern = useMemo(() => {
    if (!recruitmentData || recruitmentData.length < 7) return null

    const counts = recruitmentData.map(d => d.count)
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length
    
    // 변동성 계산 (표준편차)
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / counts.length
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = (stdDev / avg) * 100

    // 일관성 평가
    const consistency = coefficientOfVariation < 30 ? 'high' 
      : coefficientOfVariation < 50 ? 'medium' 
      : 'low'

    return {
      consistency,
      coefficientOfVariation: Math.round(coefficientOfVariation),
      avg: Math.round(avg),
    }
  }, [recruitmentData])

  // 새로운 API 형식의 인사이트 데이터 활용
  const apiInsights = useMemo(() => {
    if (!insightData) return null
    
    return {
      summary: insightData.summary,
      keyFindings: insightData.key_findings || [],
      causeAnalysis: insightData.cause_analysis,
      strategicInsights: insightData.strategic_insights || [],
      competitorComparison: insightData.competitor_comparison || [],
      marketRank: insightData.market_rank,
      totalPostings: insightData.total_postings,
      averageDailyPostings: insightData.average_daily_postings,
    }
  }, [insightData])

  return (
    <div className="space-y-6">
      {/* 새로운 API 형식의 요약 및 주요 발견사항 */}
      {apiInsights && (
        <>
          {apiInsights.summary && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                요약
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">{apiInsights.summary}</p>
            </div>
          )}
          
          {apiInsights.keyFindings && apiInsights.keyFindings.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                주요 발견사항
              </h3>
              <ul className="space-y-2">
                {apiInsights.keyFindings.map((finding: string, index: number) => (
                  <li key={index} className="text-gray-700 text-sm leading-relaxed flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {apiInsights.causeAnalysis && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                원인 분석
              </h3>
              {apiInsights.causeAnalysis.possible_causes && apiInsights.causeAnalysis.possible_causes.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">가능한 원인:</p>
                  <ul className="space-y-1">
                    {apiInsights.causeAnalysis.possible_causes.map((cause: string, index: number) => (
                      <li key={index} className="text-gray-700 text-sm leading-relaxed flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {apiInsights.causeAnalysis.news_evidence && apiInsights.causeAnalysis.news_evidence.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">뉴스 근거:</p>
                  <div className="space-y-2">
                    {apiInsights.causeAnalysis.news_evidence.map((news: any, index: number) => (
                      <a
                        key={index}
                        href={news.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900 mb-1">{news.title}</p>
                        {news.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">{news.description}</p>
                        )}
                        {news.pub_date && (
                          <p className="text-xs text-gray-500 mt-1">{new Date(news.pub_date).toLocaleDateString('ko-KR')}</p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {apiInsights.strategicInsights && apiInsights.strategicInsights.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                전략적 인사이트
              </h3>
              <div className="space-y-4">
                {apiInsights.strategicInsights.map((insight: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700 text-sm leading-relaxed mb-2">{insight.description}</p>
                    {insight.implications && insight.implications.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-gray-600 mb-1">시사점:</p>
                        <ul className="space-y-1">
                          {insight.implications.map((implication: string, impIndex: number) => (
                            <li key={impIndex} className="text-xs text-gray-600 flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              <span>{implication}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {apiInsights.competitorComparison && apiInsights.competitorComparison.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                경쟁사 비교
              </h3>
              {apiInsights.marketRank && (
                <p className="text-gray-700 text-sm mb-4">
                  <span className="font-semibold text-gray-900">{companyName}</span>은(는) 시장에서 <span className="text-purple-400 font-medium">{apiInsights.marketRank}위</span>를 차지하고 있습니다.
                </p>
              )}
              <div className="space-y-2">
                {apiInsights.competitorComparison.slice(0, 5).map((comp: any, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      comp.company_name === companyName
                        ? 'bg-purple-50 border-purple-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          comp.company_name === companyName ? 'text-purple-700' : 'text-gray-700'
                        }`}>
                          {comp.rank}위. {comp.company_name}
                        </span>
                        {comp.company_name === companyName && (
                          <span className="text-xs px-2 py-0.5 bg-purple-200 text-purple-700 rounded">현재 회사</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">{comp.total_count}건</span>
                        <span className="text-gray-500">{comp.market_share.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {/* 1. 채용 활동 트렌드 요약 */}
      {recruitmentTrend && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            채용 활동 트렌드 분석
          </h3>
          <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <p>
              <span className="font-semibold text-gray-900">{companyName}</span>은(는) 최근 {timeframe === 'Daily' ? '일간' : timeframe === 'Weekly' ? '주간' : '월간'} 평균 <span className="text-blue-400 font-medium">{recruitmentTrend.avg}건</span>의 채용 공고를 게시하고 있으며, 
              {recruitmentTrend.trend === 'up' ? (
                <span className="text-green-400 font-medium"> 전 기간 대비 {recruitmentTrend.changeRate.toFixed(1)}% 증가</span>
              ) : recruitmentTrend.trend === 'down' ? (
                <span className="text-red-400 font-medium"> 전 기간 대비 {recruitmentTrend.changeRate.toFixed(1)}% 감소</span>
              ) : (
                <span className="text-gray-600 font-medium"> 안정적인 채용 활동</span>
              )}을 보이고 있습니다.
            </p>
            <p>
              분석 기간 동안 총 <span className="text-blue-400 font-medium">{recruitmentTrend.total}건</span>의 공고가 게시되었으며, 
              최대 채용 활동은 <span className="text-yellow-400 font-medium">{recruitmentTrend.maxPeriod}</span>에 <span className="text-yellow-400 font-medium">{recruitmentTrend.max}건</span>으로 집중되었습니다.
            </p>
            {recruitmentTrend.trend === 'up' && (
              <p className="text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg p-3">
                💡 <span className="font-semibold">인사이트:</span> 채용 활동이 증가 추세에 있어 신규 프로젝트나 조직 확장이 진행 중일 가능성이 높습니다.
              </p>
            )}
            {recruitmentTrend.trend === 'down' && (
              <p className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                ⚠️ <span className="font-semibold">주의:</span> 채용 활동 감소는 채용 계획 조정이나 시장 상황 변화를 의미할 수 있습니다.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 2. 시장 점유율 및 경쟁력 분석 */}
      {marketAnalysis && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            시장 점유율 및 경쟁력 분석
          </h3>
          <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <p>
              전체 시장 대비 <span className="font-semibold text-gray-900">{companyName}</span>의 채용 공고 점유율은 <span className="text-purple-400 font-medium">{marketAnalysis.marketShare}%</span>입니다.
              {marketAnalysis.shareChange > 0 ? (
                <span> 최근 기간 점유율이 <span className="text-green-400 font-medium">{marketAnalysis.shareChange.toFixed(1)}%p 상승</span>하여 시장에서의 영향력이 증가하고 있습니다.</span>
              ) : marketAnalysis.shareChange < 0 ? (
                <span> 최근 기간 점유율이 <span className="text-red-400 font-medium">{Math.abs(marketAnalysis.shareChange).toFixed(1)}%p 하락</span>하여 경쟁사 대비 채용 활동이 상대적으로 감소했습니다.</span>
              ) : (
                <span> 점유율이 안정적으로 유지되고 있습니다.</span>
              )}
            </p>
            <p>
              분석 기간 동안 <span className="text-purple-400 font-medium">{marketAnalysis.companyTotal}건</span>의 공고를 게시했으며, 
              이는 전체 시장 공고 <span className="text-purple-400 font-medium">{marketAnalysis.marketTotal}건</span> 중 상당한 비중을 차지합니다.
            </p>
            {marketAnalysis.marketShare > 5 && (
              <p className="text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-lg p-3">
                🎯 <span className="font-semibold">경쟁력:</span> 시장 점유율이 높아 해당 업계에서 주요 채용 주체로 활동하고 있습니다.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3. 스킬 트렌드 분석 */}
      {skillAnalysis && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            주요 스킬 트렌드 분석
          </h3>
          <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <p>
              <span className="font-semibold text-gray-900">{companyName}</span>이(가) 가장 많이 요구하는 기술 스택은{' '}
              <span className="text-green-400 font-medium">{skillAnalysis.topSkills.map((s, i) => 
                i === skillAnalysis.topSkills.length - 1 ? s.name : `${s.name}, `
              ).join('')}</span>입니다.
            </p>
            {skillAnalysis.surgingSkills.length > 0 && (
              <p>
                특히 <span className="text-yellow-400 font-medium">{skillAnalysis.surgingSkills.map(s => s.name).join(', ')}</span> 스킬의 요구가 급증하고 있어 
                {skillAnalysis.surgingSkills.length === 1 ? '이 기술에 대한' : '이러한 기술들에 대한'} 집중 투자가 이루어지고 있음을 시사합니다.
              </p>
            )}
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">상위 요구 스킬 Top 5:</p>
              <div className="grid grid-cols-2 gap-2">
                {skillAnalysis.topSkills.map((skill, index) => (
                  <div key={skill.name} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-200">
                    <span className="text-gray-700 text-xs">
                      <span className="text-yellow-400 font-medium">{index + 1}위</span> {skill.name}
                    </span>
                    <span className="text-blue-400 text-xs font-medium">{skill.count}건</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 채용 패턴 분석 */}
      {recruitmentPattern && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            채용 패턴 분석
          </h3>
          <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <p>
              채용 활동의 일관성은 <span className={`font-medium ${
                recruitmentPattern.consistency === 'high' ? 'text-green-400' :
                recruitmentPattern.consistency === 'medium' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {recruitmentPattern.consistency === 'high' ? '높은' : 
                 recruitmentPattern.consistency === 'medium' ? '중간' : 
                 '낮은'}
              </span> 수준입니다 
              (변동계수: {recruitmentPattern.coefficientOfVariation}%).
            </p>
            {recruitmentPattern.consistency === 'high' && (
              <p className="text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg p-3">
                ✅ <span className="font-semibold">안정적 채용:</span> 일정한 페이스로 채용을 진행하고 있어 체계적인 인력 확보 전략을 보유하고 있습니다.
              </p>
            )}
            {recruitmentPattern.consistency === 'low' && (
              <p className="text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3">
                📊 <span className="font-semibold">변동성 높음:</span> 채용 활동의 변동이 크며, 프로젝트 기반 또는 계절적 채용 패턴을 보일 수 있습니다.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 종합 인사이트 */}
      {recruitmentTrend && marketAnalysis && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">💡</span>
            종합 인사이트
          </h3>
          <div className="space-y-2 text-gray-700 text-sm leading-relaxed">
            {recruitmentTrend.trend === 'up' && marketAnalysis.shareChange > 0 && (
              <p>
                <span className="font-semibold text-gray-900">{companyName}</span>은(는) 현재 <span className="text-green-400 font-medium">성장 단계</span>에 있으며, 
                채용 활동 증가와 시장 점유율 상승이 동시에 나타나고 있습니다. 이는 신규 사업 확장이나 조직 성장을 위한 적극적인 인력 확보 전략으로 해석됩니다.
              </p>
            )}
            {recruitmentTrend.trend === 'down' && marketAnalysis.shareChange < 0 && (
              <p>
                <span className="font-semibold text-gray-900">{companyName}</span>의 채용 활동이 감소하고 있으며, 
                시장 점유율도 하락하고 있습니다. 이는 채용 계획 조정이나 시장 상황 변화에 따른 전략적 변화로 보입니다.
              </p>
            )}
            {skillAnalysis && skillAnalysis.surgingSkills.length > 0 && (
              <p className="mt-3 pt-3 border-t border-blue-500/20">
                기술 스택 측면에서는 <span className="text-yellow-400 font-medium">{skillAnalysis.surgingSkills.map(s => s.name).join(', ')}</span>에 대한 
                집중 투자가 이루어지고 있어, 해당 기술 영역의 역량 강화를 위한 전략적 채용이 진행 중임을 알 수 있습니다.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

