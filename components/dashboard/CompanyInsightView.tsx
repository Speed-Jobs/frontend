'use client'

import { useState, useEffect } from 'react'
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

interface PostData {
  id: number
  title: string
  employmentType: string
  crawledAt: {
    year: number
    month: number
    day: number
  }
}

interface PostsApiResponse {
  status: number
  code: string
  message: string
  data: {
    page: number
    size: number
    totalPages: number
    content: PostData[]
  }
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
  
  // 채용 공채 일정 시뮬레이션 인사이트 API 상태
  const [postsData, setPostsData] = useState<PostData[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [postsError, setPostsError] = useState<string | null>(null)

  // 채용 공채 일정 시뮬레이션 인사이트 API 호출
  useEffect(() => {
    const fetchPostsData = async () => {
      try {
        setIsLoadingPosts(true)
        setPostsError(null)
        
        const currentDate = new Date()
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1 // 1-12
        
        // API 파라미터 설정
        const params = new URLSearchParams({
          sort: 'POST_AT',
          isAscending: 'false',
          year: year.toString(),
          month: month.toString(),
          postTitle: companyName, // 회사명을 postTitle로 사용
          positionName: 'software development',
          page: '0',
          size: '20',
        })
        
        const apiUrl = `http://speedjobs-spring.skala25a.project.skala-ai.com/api/v1/posts?${params.toString()}`
        
        console.log(`[채용 공채 일정 인사이트 API] 호출 시작: ${companyName}`, { apiUrl })
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
          },
          mode: 'cors',
          credentials: 'omit',
        })
        
        console.log(`[채용 공채 일정 인사이트 API] 응답 상태: ${companyName}`, { status: response.status, ok: response.ok })
        
        if (!response.ok) {
          throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`)
        }
        
        const result: PostsApiResponse = await response.json()
        console.log(`[채용 공채 일정 인사이트 API] 응답 데이터: ${companyName}`, result)
        
        if (result.status === 200 && result.code === 'OK' && result.data?.content) {
          setPostsData(result.data.content)
          console.log(`[채용 공채 일정 인사이트 API] 공고 개수: ${result.data.content.length}`)
        } else {
          throw new Error(result.message || '데이터 형식 오류')
        }
      } catch (error) {
        console.error(`[채용 공채 일정 인사이트 API] 호출 실패: ${companyName}`, error)
        setPostsError(error instanceof Error ? error.message : '채용 공고 데이터를 불러오는 중 오류가 발생했습니다.')
        setPostsData([])
      } finally {
        setIsLoadingPosts(false)
      }
    }
    
    // 회사명이 있을 때만 API 호출
    if (companyName) {
      fetchPostsData()
    }
  }, [companyName])

  // 회사별 스킬 트렌드 API 호출 (현재 key_findings만 사용하므로 비활성화)
  useEffect(() => {
    // key_findings만 표시하므로 스킬 트렌드 API 호출 비활성화
    setSkillTrendData([])
    setIsLoadingSkillTrend(false)
    setSkillTrendError(null)
  }, [companyName])

  // 디버깅: 인사이트 데이터 확인
  useEffect(() => {
    console.log(`[CompanyInsightView] ${companyName} 인사이트 데이터:`, {
      insightData,
      isLoading,
      isLoadingPosts,
      recruitmentDataLength: recruitmentData?.length,
      totalTrendDataLength: totalTrendData?.length,
    })
  }, [companyName, insightData, isLoading, isLoadingPosts, recruitmentData, totalTrendData])



  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    )
  }

  // 로딩 중일 때 전체 로딩 메시지 표시 (메인 인사이트 로딩만 체크)
  const isMainInsightLoading = isLoading

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
          {isMainInsightLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>인사이트 생성 중...</span>
            </div>
          )}
          {isLoadingPosts && !isMainInsightLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
              <span className="text-xs">공고 데이터 로딩 중...</span>
            </div>
          )}
        </div>
        {!isMainInsightLoading && (
          <div className="flex gap-4 text-sm">
            {recruitmentData && recruitmentData.length > 0 && (
              <>
                <div className="text-gray-600">
                  총 <span className="text-gray-900 font-medium">{recruitmentData.reduce((sum, d) => sum + d.count, 0)}</span> 건
                </div>
                <div className="text-gray-600">
                  평균 <span className="text-gray-900 font-medium">{Math.round(recruitmentData.reduce((sum, d) => sum + d.count, 0) / recruitmentData.length)}</span> 건/{timeframe === 'Daily' ? '일' : timeframe === 'Weekly' ? '주' : '월'}
                </div>
              </>
            )}
            {postsData.length > 0 && (
              <div className="text-gray-600">
                최근 공고 <span className="text-gray-900 font-medium">{postsData.length}</span> 건
              </div>
            )}
          </div>
        )}
      </div>

      {/* 메인 인사이트 로딩 중일 때만 전체 로딩 메시지 표시 */}
      {isMainInsightLoading && (
        <div className="bg-white rounded-lg border border-gray-200 px-5 py-8">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 text-sm font-medium">인사이트 생성 중...</p>
            <p className="text-gray-400 text-xs">잠시만 기다려주세요</p>
          </div>
        </div>
      )}

      {/* 메인 인사이트 로딩이 완료되면 인사이트 내용 표시 (posts 로딩은 별도로 처리) */}
      {!isMainInsightLoading && (
        <>
          {/* 채용 공고 데이터 에러 표시 */}
          {postsError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <p className="text-yellow-800 text-sm">{postsError}</p>
            </div>
          )}

          {/* 텍스트 기반 인사이트 분석 - 항상 표시 */}
          <CompanyInsightAnalysis
            recruitmentData={recruitmentData}
            totalTrendData={totalTrendData}
            skillTrendData={skillTrendData}
            companyName={companyName}
            timeframe={timeframe}
            insightData={insightData}
          />
          
          {/* 최근 채용 공고 목록 - posts 로딩 완료 후 표시 */}
          {!isLoadingPosts && postsData.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 px-5 pt-4 pb-3">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                최근 채용 공고
              </h3>
              <div className="space-y-2">
                {postsData.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-start justify-between text-sm py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{post.title}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {post.employmentType} • {post.crawledAt.year}-{String(post.crawledAt.month).padStart(2, '0')}-{String(post.crawledAt.day).padStart(2, '0')}
                      </p>
                    </div>
                  </div>
                ))}
                {postsData.length > 5 && (
                  <p className="text-gray-500 text-xs text-center pt-2">
                    외 {postsData.length - 5}건의 공고가 더 있습니다
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

