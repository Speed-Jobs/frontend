'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import jobPostingsData from '@/data/jobPostings.json'

interface PostedAt {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

interface Company {
  id: number
  name: string
}

interface MatchedJob {
  title: string
  description: string
  keywords: string[]
  similarity: number
}

interface JobPosting {
  id: number
  title: string
  role: string
  experience: string
  daysLeft: number | null
  postedAt: PostedAt | null
  closeAt: PostedAt | null
  applyUrl: string
  screenShotUrl?: string | null
  skills: string[]
  company: Company
  description?: string
  meta_data?: {
    tech_stack?: string[]
    job_category?: string
  }
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([])

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const jobId = params.id as string
        
        // 상세 공고 API 호출 시도
        const detailApiUrl = `http://speedjobs-spring.skala25a.project.skala-ai.com/api/v1/posts/${jobId}`
        
        console.log('=== 상세 공고 API 호출 ===')
        console.log('호출 URL:', detailApiUrl)
        console.log('호출 시각:', new Date().toISOString())
        
        try {
          const response = await fetch(detailApiUrl, {
            method: 'GET',
            headers: {
              'accept': '*/*',
              'Content-Type': 'application/json',
            },
            mode: 'cors',
            credentials: 'omit',
          })
          
          console.log('응답 상태:', response.status)
          console.log('응답 URL:', response.url)
          
          if (!response.ok) {
            // 404 등 에러인 경우 대시보드 API로 재시도
            if (response.status === 404) {
              throw new Error('NOT_FOUND')
            }
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const result = await response.json()
          console.log('백엔드에서 받은 상세 데이터:', result)
        
          // API 응답 형식: { status, code, message, data }
          if (result.status === 200 && result.code === 'OK' && result.data) {
            // 백엔드 데이터에 description이 없을 경우 기본 데이터에서 찾기
            const foundJob = jobPostingsData.find((j) => j.id === parseInt(jobId))
            if (foundJob && !result.data.description) {
              result.data.description = foundJob.description
            }
            if (foundJob && !result.data.meta_data) {
              result.data.meta_data = foundJob.meta_data
            }
            // 백엔드 데이터로 설정
            setJob(result.data)
            setIsLoading(false)
            return // API 성공 시 여기서 종료
          } else {
            console.warn('API 응답 형식이 올바르지 않습니다:', result)
            throw new Error(result.message || 'API 응답 형식이 올바르지 않습니다.')
          }
        } catch (fetchError: any) {
          console.error('=== 상세 공고 API 호출 에러 ===')
          console.error('에러 타입:', fetchError instanceof Error ? fetchError.constructor.name : typeof fetchError)
          console.error('에러 메시지:', fetchError instanceof Error ? fetchError.message : String(fetchError))
          
          // 상세 API 실패 시 대시보드 API에서 해당 공고 찾기 시도
          if (fetchError.message === 'NOT_FOUND' || fetchError.message.includes('404')) {
            try {
              console.log('대시보드 API에서 공고 찾기 시도...')
              const dashboardApiUrl = 'http://speedjobs-spring.skala25a.project.skala-ai.com/api/v1/dashboard/posts?limit=100'
              const dashboardResponse = await fetch(dashboardApiUrl, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': '*/*',
                },
                mode: 'cors',
                credentials: 'omit',
              })
              
              if (dashboardResponse.ok) {
                const dashboardResult = await dashboardResponse.json()
                if (dashboardResult.status === 200 && dashboardResult.code === 'OK' && dashboardResult.data?.posts) {
                  const foundPost = dashboardResult.data.posts.find((p: any) => p.id === parseInt(jobId))
                  if (foundPost) {
                    // 대시보드 API 데이터를 상세 페이지 형식으로 변환
                    const transformedJob: JobPosting = {
                      id: foundPost.id,
                      title: foundPost.title,
                      role: foundPost.role || '',
                      experience: '', // 대시보드 API에 없음
                      daysLeft: null, // 대시보드 API에 없음
                      postedAt: foundPost.registeredAt ? {
                        year: foundPost.registeredAt.year,
                        month: foundPost.registeredAt.month,
                        day: foundPost.registeredAt.day,
                        hour: 0,
                        minute: 0,
                        second: 0,
                      } : null,
                      closeAt: null, // 대시보드 API에 없음
                      applyUrl: '',
                      skills: foundPost.role ? [foundPost.role] : [],
                      company: {
                        id: 0,
                        name: foundPost.companyName || '',
                      },
                      description: '',
                      meta_data: undefined,
                    }
                    setJob(transformedJob)
                    setIsLoading(false)
                    return
                  }
                }
              }
            } catch (dashboardError) {
              console.error('대시보드 API 호출 실패:', dashboardError)
            }
          }
          
          // 모든 API 실패 시 기본 데이터에서 찾기
          const foundJob = jobPostingsData.find((j) => j.id === parseInt(jobId))
          if (foundJob) {
            const today = new Date()
            const postedDate = new Date(foundJob.posted_date)
            const expiredDate = foundJob.expired_date ? new Date(foundJob.expired_date) : null
            
            const transformedJob: JobPosting = {
              id: foundJob.id,
              title: foundJob.title,
              role: foundJob.meta_data?.job_category || '개발',
              experience: foundJob.experience,
              daysLeft: expiredDate ? Math.ceil((expiredDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null,
              postedAt: {
                year: postedDate.getFullYear(),
                month: postedDate.getMonth() + 1,
                day: postedDate.getDate(),
                hour: postedDate.getHours(),
                minute: postedDate.getMinutes(),
                second: postedDate.getSeconds(),
              },
              closeAt: expiredDate ? {
                year: expiredDate.getFullYear(),
                month: expiredDate.getMonth() + 1,
                day: expiredDate.getDate(),
                hour: expiredDate.getHours(),
                minute: expiredDate.getMinutes(),
                second: expiredDate.getSeconds(),
              } : null,
              applyUrl: '',
              skills: foundJob.meta_data?.tech_stack || [],
              company: {
                id: 0,
                name: foundJob.company.replace('(주)', '').trim(),
              },
              description: foundJob.description,
              meta_data: foundJob.meta_data,
            }
            setJob(transformedJob)
            setIsLoading(false)
          } else {
            // 모든 방법 실패 시 에러 표시
            setJob(null)
            setError('공고를 찾을 수 없습니다.')
            setIsLoading(false)
          }
        }
      } catch (err) {
        // 예상치 못한 에러
        console.error('=== 공고 상세 조회 에러 ===')
        console.error('에러 타입:', err instanceof Error ? err.constructor.name : typeof err)
        console.error('에러 메시지:', err instanceof Error ? err.message : String(err))
        
        setJob(null)
        setError('공고를 불러오는 중 오류가 발생했습니다.')
        setIsLoading(false)
      }
    }

    fetchJobDetail()
  }, [params.id])

  // 매칭된 직무 생성
  useEffect(() => {
    if (!job) return

    const techStack = job.meta_data?.tech_stack || job.skills || []
    const description = job.description?.toLowerCase() || ''
    
    // 기술 스택과 설명을 기반으로 매칭된 직무 생성
    const matched: MatchedJob[] = []
    
    // Kotlin/Spring Boot 관련 매칭
    if (techStack.some((tech: string) => tech.toLowerCase().includes('kotlin') || tech.toLowerCase().includes('spring'))) {
      matched.push({
        title: '핀테크 백엔드 개발자',
        description: '금융 시스템 개발 경험과 Kotlin/Spring Boot 기술 스택이 정확히 일치합니다.',
        keywords: ['Kotlin', 'Spring Boot', '금융 시스템', '안정성'],
        similarity: 93,
      })
    }
    
    // Kubernetes/인프라 관련 매칭
    if (techStack.some((tech: string) => tech.toLowerCase().includes('kubernetes') || tech.toLowerCase().includes('docker'))) {
      matched.push({
        title: '백엔드 플랫폼 엔지니어',
        description: 'Kubernetes 기반의 컨테이너 오케스트레이션 및 확장 가능한 시스템 개발 경험이 유사합니다.',
        keywords: ['Kotlin', 'PostgreSQL', 'Kubernetes', '확장성'],
        similarity: 87,
      })
    }
    
    // Redis/캐싱 관련 매칭
    if (techStack.some((tech: string) => tech.toLowerCase().includes('redis') || tech.toLowerCase().includes('cache'))) {
      matched.push({
        title: '서버 개발자 (Kotlin/Spring)',
        description: 'Kotlin 기반의 Spring Boot 애플리케이션 개발 및 Redis 캐싱 경험이 일치합니다.',
        keywords: ['Kotlin', 'Spring Boot', 'Redis'],
        similarity: 84,
      })
    }
    
    // 기본 매칭 (매칭이 없을 경우)
    if (matched.length === 0) {
      matched.push(
        {
          title: '핀테크 백엔드 개발자',
          description: '금융 시스템 개발 경험과 Kotlin/Spring Boot 기술 스택이 정확히 일치합니다.',
          keywords: ['Kotlin', 'Spring Boot', '금융 시스템', '안정성'],
          similarity: 93,
        },
        {
          title: '백엔드 플랫폼 엔지니어',
          description: 'Kubernetes 기반의 컨테이너 오케스트레이션 및 확장 가능한 시스템 개발 경험이 유사합니다.',
          keywords: ['Kotlin', 'PostgreSQL', 'Kubernetes', '확장성'],
          similarity: 87,
        },
        {
          title: '서버 개발자 (Kotlin/Spring)',
          description: 'Kotlin 기반의 Spring Boot 애플리케이션 개발 및 Redis 캐싱 경험이 일치합니다.',
          keywords: ['Kotlin', 'Spring Boot', 'Redis'],
          similarity: 84,
        }
      )
    }

    setMatchedJobs(matched)
  }, [job])

  // 날짜 객체를 문자열로 변환
  const formatDateFromObject = (dateObj: PostedAt | null | undefined) => {
    if (!dateObj || dateObj.year === 0) return '상시채용'
    return `${dateObj.year}년 ${dateObj.month}월 ${dateObj.day}일`
  }

  // 날짜 객체를 Date 객체로 변환
  const dateObjectToDate = (dateObj: PostedAt | null | undefined) => {
    if (!dateObj) return null
    return new Date(dateObj.year, dateObj.month - 1, dateObj.day, dateObj.hour, dateObj.minute, dateObj.second)
  }

  const formatDate = (dateObj: PostedAt | null | undefined) => {
    if (!dateObj || dateObj.year === 0) return '상시채용'
    const date = dateObjectToDate(dateObj)
    if (!date) return '상시채용'
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getDaysUntilExpiry = (daysLeft: number | null | undefined): string => {
    if (daysLeft === null || daysLeft === undefined) return '정보 없음'
    if (daysLeft < 0) return '마감'
    if (daysLeft === 0) return '오늘 마감'
    return `${daysLeft}일 남음`
  }

  // experience를 한글 형식으로 변환
  const formatExperience = (experience: string) => {
    const experienceMap: Record<string, string> = {
      'ENTRY': '신입',
      'JUNIOR': '경력 1~3년',
      'MID_SENIOR': '경력 3~5년',
      'SENIOR': '경력 5년 이상'
    }
    return experienceMap[experience] || experience
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-600">공고를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="px-8 py-16 max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-lg">공고를 찾을 수 없습니다.</p>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-sk-red text-white rounded-lg hover:bg-sk-red-dark border border-sk-red"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="px-8 py-8 max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          뒤로 가기
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
              <div className="flex items-center gap-4 text-lg text-gray-600">
                <span className="font-semibold">{job.company.name}</span>
                <span>•</span>
                <span>{job.role}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-4 py-2 rounded-lg font-semibold ${
                getDaysUntilExpiry(job.daysLeft).includes('마감')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {getDaysUntilExpiry(job.daysLeft)}
              </span>
              <span className="text-sm text-gray-500">
                {job.role}
              </span>
            </div>
          </div>

          {/* Job Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500 mb-1">직무</p>
              <p className="font-semibold text-gray-900">{job.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">경력</p>
              <p className="font-semibold text-gray-900">{formatExperience(job.experience)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">게시일</p>
              <p className="font-semibold text-gray-900">{formatDate(job.postedAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">마감일</p>
              <p className="font-semibold text-gray-900">{formatDate(job.closeAt)}</p>
            </div>
          </div>
        </div>

        {/* 공고 내용 */}
        {job.description && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">공고 내용</h2>
            <div className="space-y-2">
              <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed">{job.description}</p>
            </div>
          </div>
        )}

        {/* 스크린샷 이미지 */}
        {job.screenShotUrl && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">공고 스크린샷</h2>
            <div className="flex justify-center">
              <img
                src={job.screenShotUrl}
                alt={`${job.title} 공고 스크린샷`}
                className="max-w-full h-auto rounded-lg border border-gray-200"
              />
            </div>
          </div>
        )}

        {/* Tech Stack */}
        {job.skills && job.skills.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">기술 스택</h2>
            <div className="flex flex-wrap gap-3">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium border border-gray-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}


        {/* Additional Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">추가 정보</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">공고 게시일</span>
              <span className="font-semibold text-gray-900">{formatDate(job.postedAt)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">공고 마감일</span>
              <span className="font-semibold text-gray-900">{formatDate(job.closeAt)}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600">지원 링크</span>
              {job.applyUrl ? (
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sk-red hover:underline"
                >
                  지원 페이지로 이동 →
                </a>
              ) : (
                <span className="font-semibold text-gray-900">없음</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

