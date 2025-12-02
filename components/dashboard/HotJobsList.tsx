'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import CompanyLogo from '@/components/CompanyLogo'

interface HotJobsListProps {
  jobs: Array<{
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
  }>
}

const ITEMS_PER_PAGE = 5 // 한 페이지에 표시할 공고 수 (회사별 금주 채용 현황 높이에 맞춤)

export default function HotJobsList({ jobs }: HotJobsListProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedJobs = jobs.slice(startIndex, endIndex)
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

  const getDaysUntilExpiry = (expiredDate: string | null): boolean => {
    if (!expiredDate) return false
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const expiry = new Date(expiredDate)
      expiry.setHours(0, 0, 0, 0)
      return expiry < today
    } catch {
      return false
    }
  }

  // 직무 추출 (제목, 기술 스택, 설명 기반)
  const extractPosition = (job: HotJobsListProps['jobs'][0]): string => {
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
        const isExpired = getDaysUntilExpiry(job.expiredDate || null)
        const position = extractPosition(job)
        const period = job.postedDate && job.expiredDate
          ? `기간: ${formatDate(job.postedDate)} ~ ${formatDate(job.expiredDate)}`
          : job.postedDate
          ? `기간: ${formatDate(job.postedDate)} ~`
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

                {/* 마감 버튼 */}
                <div className="flex-shrink-0 flex items-start">
                  <div
                    className={`px-2 py-1 rounded text-[10px] font-medium flex items-center ${
                      isExpired
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}
                  >
                    마감
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

