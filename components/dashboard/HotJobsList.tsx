'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import CompanyLogo from '@/components/CompanyLogo'

interface Job {
  id: number
  rank: number
  company: string
  title: string
  salary: string
  location: string
  views: number
  experience?: string
  techStack?: string[]
  postedDate?: string
  expiredDate?: string | null
  description?: string
  employmentType?: string
}

interface HotJobsListProps {
  jobs?: Job[] // 선택적: 외부에서 데이터를 전달할 수도 있음
  itemsPerPage?: number // 동적으로 한 페이지에 표시할 공고 수 조정
  limit?: number // API에서 가져올 공고 수
  companyNames?: string[] // 경쟁사 공고 API용: 회사명 목록
  positionName?: string // 경쟁사 공고 API용: 직군명
}

const DEFAULT_ITEMS_PER_PAGE = 5 // 기본 한 페이지에 표시할 공고 수
const DEFAULT_LIMIT = 10 // 기본 API limit

export default function HotJobsList({ 
  jobs: externalJobs, 
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE, 
  limit = DEFAULT_LIMIT,
  companyNames,
  positionName
}: HotJobsListProps) {
  const [jobs, setJobs] = useState<Job[]>(externalJobs || [])
  const [isLoading, setIsLoading] = useState(!externalJobs)
  const [error, setError] = useState<string | null>(null)
  
  // 외부에서 jobs가 전달되면 사용하고, 없으면 자체적으로 데이터 페칭
  useEffect(() => {
    // 외부에서 jobs가 전달되면 사용
    if (externalJobs && externalJobs.length > 0) {
      setJobs(externalJobs)
      setIsLoading(false)
      return
    }
    
    // 자체적으로 데이터 페칭
    const fetchJobs = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // 항상 경쟁사 공고 API 사용 (대시보드 전용 엔드포인트)
        const params = new URLSearchParams()
        
        // 필수 파라미터 - 새로운 API는 limit 사용
        params.append('limit', String(limit))
        
        // 회사명 필터 (배열) - 있으면 추가
        if (companyNames && companyNames.length > 0) {
          companyNames.forEach(name => {
            params.append('companyNames', name)
          })
        }
        
        // 직군 필터 - 있으면 추가
        if (positionName) {
          params.append('positionName', positionName)
        }
        
        // API URL - Next.js API 라우트 프록시 사용 (CORS 문제 해결)
        const apiUrl = `/api/posts?${params.toString()}`
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
          },
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        // 경쟁사 공고 API 응답 형식 처리 (새로운 대시보드 API 형식 우선)
        let posts = null
        if (result.data?.posts && Array.isArray(result.data.posts)) {
          // 새로운 대시보드 API 형식: { status: 200, code: "OK", data: { posts: [...] } }
          posts = result.data.posts
        } else if (result.content && Array.isArray(result.content)) {
          // 기존 형식: { content: [...] }
          posts = result.content
        } else if (Array.isArray(result)) {
          // 배열 직접 반환
          posts = result
        } else if (result.data?.content && Array.isArray(result.data.content)) {
          // 기존 형식: { data: { content: [...] } }
          posts = result.data.content
        } else if (result.data && Array.isArray(result.data)) {
          // 기존 형식: { data: [...] }
          posts = result.data
        }
        
        if (posts && Array.isArray(posts) && posts.length > 0) {
          // API 응답을 Job 형식으로 변환
          const convertedJobs: Job[] = posts.map((post: any, index: number) => {
            let registeredDate = ''
            if (post.registeredAt) {
              if (post.registeredAt.year && post.registeredAt.month && post.registeredAt.day) {
                registeredDate = `${post.registeredAt.year}-${String(post.registeredAt.month).padStart(2, '0')}-${String(post.registeredAt.day).padStart(2, '0')}`
              }
            } else if (post.crawledAt) {
              if (post.crawledAt.year && post.crawledAt.month && post.crawledAt.day) {
                registeredDate = `${post.crawledAt.year}-${String(post.crawledAt.month).padStart(2, '0')}-${String(post.crawledAt.day).padStart(2, '0')}`
              }
            } else if (post.postedDate) {
              registeredDate = post.postedDate
            } else if (post.postAt) {
              // postAt 필드도 확인
              registeredDate = post.postAt
            } else {
              const today = new Date()
              registeredDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
            }
            
            return {
              id: post.id || index,
              rank: index + 1,
              company: post.companyName || post.company || '',
              title: post.title || post.postTitle || '',
              salary: '협의',
              location: '',
              views: 0,
              experience: '',
              techStack: post.positionName || post.role ? [post.positionName || post.role] : [],
              postedDate: registeredDate,
              expiredDate: null,
              description: post.positionName || post.role || '',
              employmentType: post.employmentType || '정규직',
            }
          }).filter((item: Job) => item.title && item.company)
          
          setJobs(convertedJobs)
        } else {
          setJobs([])
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : '데이터를 불러오는 중 오류가 발생했습니다.')
        setJobs([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchJobs()
  }, [externalJobs, limit, companyNames, positionName])
  const [currentPage, setCurrentPage] = useState(1)

  // itemsPerPage가 변경되면 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  const totalPages = Math.ceil(jobs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedJobs = jobs.slice(startIndex, endIndex)
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 text-sm">데이터를 불러오는 중...</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-red-500 text-sm text-center py-8">
        {error}
      </div>
    )
  }
  
  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-8">
        데이터가 없습니다.
      </div>
    )
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}.${month}.${day}`
    } catch {
      return dateString
    }
  }

  // 직무 추출 (제목, 기술 스택, 설명 기반)
  const extractPosition = (job: Job): string => {
    const title = (job.title || '').toLowerCase()
    const description = (job.description || '').toLowerCase()
    const techStack = (job.techStack || []).join(' ').toLowerCase()
    const combinedText = `${title} ${description} ${techStack}`

    // AI/ML 관련
    if (combinedText.includes('ai') || combinedText.includes('ml') || combinedText.includes('인공지능') || 
        combinedText.includes('machine learning') || combinedText.includes('딥러닝') || 
        combinedText.includes('tensorflow') || combinedText.includes('pytorch')) {
      return 'ML Engineer'
    }
    
    // 마케팅 관련
    if (combinedText.includes('marketing') || combinedText.includes('마케팅') || 
        combinedText.includes('marketing manager')) {
      return 'Marketing Manager'
    }
    
    // 개발자 관련
    if (combinedText.includes('backend') || combinedText.includes('백엔드') || 
        combinedText.includes('django') || combinedText.includes('spring')) {
      return 'Backend Engineer'
    }
    if (combinedText.includes('frontend') || combinedText.includes('프론트엔드') || 
        combinedText.includes('react') || combinedText.includes('vue')) {
      return 'Frontend Engineer'
    }
    if (combinedText.includes('developer') || combinedText.includes('개발자') || 
        combinedText.includes('engineer')) {
      return 'Engineer'
    }
    
    // 데이터 관련
    if (combinedText.includes('data') || combinedText.includes('데이터') || 
        combinedText.includes('spark') || combinedText.includes('hadoop')) {
      return 'Data Engineer'
    }
    
    // 매니저 관련
    if (combinedText.includes('manager') || combinedText.includes('매니저') || 
        combinedText.includes('pm') || combinedText.includes('product')) {
      return 'Manager'
    }
    
    // 기술 스택이 있으면 첫 번째 기술을 직무로 사용
    if (job.techStack && job.techStack.length > 0) {
      const firstTech = job.techStack[0]
      if (firstTech.includes('Python') || firstTech.includes('Java') || firstTech.includes('JavaScript')) {
        return `${firstTech} Engineer`
      }
      return firstTech
    }
    
    return 'Engineer'
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="space-y-2 h-full">
          {paginatedJobs.map((job) => {
        const position = extractPosition(job)
        const period = job.postedDate
          ? `등록일: ${formatDate(job.postedDate)}`
          : ''
        const employmentType = job.employmentType || '정규직'
        
        return (
          <Link
            key={job.id}
            href={`/dashboard/jobs/${job.id}`}
            className="block"
          >
            <div className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                {/* 회사 로고 */}
                <div className="flex-shrink-0 w-12 h-12 bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                  <CompanyLogo name={job.company} className="w-full h-full p-1" />
                </div>

                {/* 공고 정보 */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 mb-0.5">{job.company}</p>
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5 line-clamp-1">{job.title}</h3>
                  <p className="text-xs text-gray-700 mb-2">{position}</p>
                  
                  <div className="space-y-0.5 text-[10px] text-gray-600">
                    {period && (
                      <p className="line-clamp-1">{period}</p>
                    )}
                    <p>고용형태: {employmentType}</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
        </div>
      </div>
      
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            이전
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                  currentPage === page
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}

