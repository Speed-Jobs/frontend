'use client'

import { useState, useEffect, useRef } from 'react'
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
  data: {
    page: number
    size: number
    totalPages: number
    content: PostData[]
  }
  // message 필드는 개발자용 메타데이터이므로 타입 정의에서 제외
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

  // Debouncing을 위한 ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // 채용 공채 일정 시뮬레이션 인사이트 API 호출 (debouncing 적용)
  useEffect(() => {
    // 이전 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // 회사명이 없으면 API 호출하지 않음
    if (!companyName) {
      return
    }
    
    // Debouncing: 300ms 후에 API 호출
    debounceTimerRef.current = setTimeout(async () => {
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
        
        // Next.js API 라우트 프록시 사용 (CORS 문제 해결)
        const apiUrl = `/api/posts?${params.toString()}`
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
          },
        })
        
        if (!response.ok) {
          throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`)
        }
        
        const result: PostsApiResponse = await response.json()
        
        if (result.status === 200 && result.code === 'OK' && result.data?.content) {
          setPostsData(result.data.content)
          // 성공 시 에러 상태 초기화 (API 응답의 message는 개발자용이므로 사용자에게 보여주지 않음)
          setPostsError(null)
        } else {
          // result.message는 개발자용 메타데이터이므로 절대 사용하지 않음
          // 실제 에러 상황만 처리
          throw new Error('데이터를 불러오는 중 오류가 발생했습니다.')
        }
      } catch (error) {
        // 네트워크 에러나 실제 에러만 사용자에게 표시
        // API 응답의 message 필드는 절대 사용하지 않음
        const errorMessage = error instanceof Error ? error.message : '채용 공고 데이터를 불러오는 중 오류가 발생했습니다.'
        
        // API 응답 메시지 패턴 필터링 (개발자용 메시지는 사용자에게 보여주지 않음)
        const apiMessagePatterns = [
          /대시보드.*공고.*조회.*성공/i,
          /대시보드 공고 조회 성공/i,
          /공고.*조회.*성공/i,
          /조회.*성공/i,
          /조회.*완료/i,
        ]
        
        const isApiMessage = apiMessagePatterns.some(pattern => pattern.test(errorMessage))
        
        if (!isApiMessage) {
          setPostsError(errorMessage)
        } else {
          setPostsError(null) // API 응답 메시지는 무시
        }
        setPostsData([])
      } finally {
        setIsLoadingPosts(false)
      }
    }, 300)
    
    // Cleanup 함수: 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [companyName])

  // 회사별 스킬 트렌드 API 호출 (현재 key_findings만 사용하므로 비활성화)
  useEffect(() => {
    // key_findings만 표시하므로 스킬 트렌드 API 호출 비활성화
    setSkillTrendData([])
    setIsLoadingSkillTrend(false)
    setSkillTrendError(null)
  }, [companyName])




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
      </div>

      {/* 텍스트 기반 인사이트 분석 - 항상 표시 */}
      {/* CompanyInsightAnalysis에서 data.insights만 사용하므로 여기서는 개발자용 메타데이터 필드 제거 */}
      <CompanyInsightAnalysis
        recruitmentData={recruitmentData}
        totalTrendData={totalTrendData}
        skillTrendData={skillTrendData}
        companyName={companyName}
        timeframe={timeframe}
        insightData={insightData && typeof insightData === 'object' ? (() => {
          // 개발자용 메타데이터 필드 완전히 제거 (message, status, code 등은 사용자에게 보여지지 않음)
          const { 
            message, 
            status, 
            code, 
            result, 
            response,
            success,
            error,
            ...rest 
          } = insightData as any
          return rest
        })() : insightData}
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
    </div>
  )
}

