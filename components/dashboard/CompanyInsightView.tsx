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

interface PostDetailData {
  id: number
  title: string
  role: string
  experience: string
  employmentType: string
  daysLeft: number | null
  postedAt: {
    year: number
    month: number
    day: number
    hour: number
    minute: number
    second: number
  }
  closeAt: {
    year: number
    month: number
    day: number
    hour: number
    minute: number
    second: number
  } | null
  applyUrl: string
  screenShotUrl: string
  skills: string[]
  metaData: Record<string, any>
  company: {
    id: number
    name: string
    location: string
  }
}

interface PostDetailApiResponse {
  status: number
  code: string
  message: string
  data: PostDetailData
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
  
  // 상세 정보 상태
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const [postDetail, setPostDetail] = useState<PostDetailData | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [screenshotError, setScreenshotError] = useState<string | null>(null)
  const [screenshotRetryCount, setScreenshotRetryCount] = useState(0)

  // Debouncing을 위한 ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // 채용 공채 일정 시뮬레이션 인사이트 API 호출 (debouncing 적용)
  useEffect(() => {
    // 이전 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // 회사명이 없으면 API 호출하지 않음 (이전 데이터는 유지)
    if (!companyName) {
      setIsLoadingPosts(false)
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
        // 에러 발생 시에도 이전 데이터 유지 (공고가 사라지지 않도록)
        // setPostsData([]) 제거
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

  // 상세 정보 가져오기 함수
  const fetchPostDetail = async (postId: number) => {
    try {
      setIsLoadingDetail(true)
      setDetailError(null)
      
      const apiUrl = `/api/posts/${postId}`
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      })
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`)
      }
      
      const result: PostDetailApiResponse = await response.json()
      
      if (result.status === 200 && result.code === 'OK' && result.data) {
        setPostDetail(result.data)
        setSelectedPostId(postId)
        // 상세 정보 로드 시 스크린샷 에러 상태 초기화
        setScreenshotError(null)
        setScreenshotRetryCount(0)
      } else {
        throw new Error('상세 정보를 불러오는 중 오류가 발생했습니다.')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '상세 정보를 불러오는 중 오류가 발생했습니다.'
      setDetailError(errorMessage)
      setPostDetail(null)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  // 모달 닫기 함수
  const closeDetailModal = () => {
    setSelectedPostId(null)
    setPostDetail(null)
    setDetailError(null)
    setScreenshotError(null)
    setScreenshotRetryCount(0)
  }




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
      
      {/* 최근 채용 공고 목록 - 로딩 중에도 이전 데이터 표시 */}
      {postsData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 px-5 pt-4 pb-3">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            최근 채용 공고
            {isLoadingPosts && (
              <span className="text-xs text-gray-400 ml-2">(업데이트 중...)</span>
            )}
          </h3>
          <div className="space-y-2">
            {postsData.slice(0, 5).map((post) => (
              <div 
                key={post.id} 
                onClick={() => fetchPostDetail(post.id)}
                className="flex items-start justify-between text-sm py-2 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors rounded px-2 -mx-2"
              >
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

      {/* 상세 정보 모달 */}
      {selectedPostId !== null && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDetailModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">공고 상세 정보</h3>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="px-6 py-4">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">상세 정보를 불러오는 중...</span>
                </div>
              ) : detailError ? (
                <div className="text-red-500 text-center py-12">{detailError}</div>
              ) : postDetail ? (
                <div className="space-y-6">
                  {/* 제목 및 회사 정보 */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{postDetail.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium text-gray-900">{postDetail.company.name}</span>
                      <span>•</span>
                      <span>{postDetail.company.location}</span>
                    </div>
                  </div>

                  {/* 주요 정보 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">직무</p>
                      <p className="text-sm font-medium text-gray-900">{postDetail.role}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">경력</p>
                      <p className="text-sm font-medium text-gray-900">{postDetail.experience}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">고용형태</p>
                      <p className="text-sm font-medium text-gray-900">{postDetail.employmentType}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">마감일</p>
                      <p className="text-sm font-medium text-gray-900">
                        {postDetail.closeAt 
                          ? `${postDetail.closeAt.year}-${String(postDetail.closeAt.month).padStart(2, '0')}-${String(postDetail.closeAt.day).padStart(2, '0')}`
                          : '상시채용'
                        }
                      </p>
                    </div>
                  </div>

                  {/* 게시일 */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">게시일</p>
                    <p className="text-sm text-gray-900">
                      {postDetail.postedAt.year}-{String(postDetail.postedAt.month).padStart(2, '0')}-{String(postDetail.postedAt.day).padStart(2, '0')} {' '}
                      {String(postDetail.postedAt.hour).padStart(2, '0')}:{String(postDetail.postedAt.minute).padStart(2, '0')}
                    </p>
                  </div>

                  {/* 스크린샷 */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">공고 스크린샷</p>
                    {screenshotError ? (
                      <div className="border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">{screenshotError}</p>
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={
                            // screenShotUrl이 전체 URL인 경우에만 사용, 파일명만 있는 경우는 API 엔드포인트 사용
                            postDetail.screenShotUrl && 
                            (postDetail.screenShotUrl.startsWith('http://') || postDetail.screenShotUrl.startsWith('https://'))
                              ? postDetail.screenShotUrl
                              : `/api/posts/${postDetail.id}/screenshot`
                          }
                          alt={`${postDetail.title} 스크린샷`}
                          className="w-full h-auto"
                          onLoad={() => {
                            // 이미지 로드 성공 시 에러 상태 초기화
                            setScreenshotError(null)
                            setScreenshotRetryCount(0)
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            // 재시도 횟수 제한 (최대 1회)
                            if (screenshotRetryCount < 1 && !target.src.includes('/api/posts/')) {
                              // screenShotUrl이 실패하면 API 엔드포인트로 재시도
                              setScreenshotRetryCount(prev => prev + 1)
                              target.src = `/api/posts/${postDetail.id}/screenshot`
                            } else {
                              // 재시도 실패 시 에러 메시지 표시
                              setScreenshotError('스크린샷을 불러올 수 없습니다.')
                              target.style.display = 'none'
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* 스킬 */}
                  {postDetail.skills && postDetail.skills.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">필요 스킬</p>
                      <div className="flex flex-wrap gap-2">
                        {postDetail.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 지원 링크 */}
                  {postDetail.applyUrl && (
                    <div className="pt-4 border-t border-gray-200">
                      <a
                        href={postDetail.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <span>지원하기</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

