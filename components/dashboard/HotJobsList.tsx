'use client'

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

export default function HotJobsList({ jobs }: HotJobsListProps) {
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
    <div className="space-y-3">
      {jobs.map((job) => {
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
            <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
              <div className="flex items-start gap-4">
                {/* 회사 로고 */}
                <div className="flex-shrink-0 w-14 h-14 bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                  <CompanyLogo name={job.company} className="w-full h-full p-1" />
                </div>

                {/* 공고 정보 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">{job.company}</p>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{job.title}</h3>
                  <p className="text-sm text-gray-700 mb-3">{position}</p>
                  
                  <div className="space-y-0.5 text-xs text-gray-600">
                    {period && (
                      <p>{period}</p>
                    )}
                    <p>고용형태: {employmentType}</p>
                  </div>
                </div>

                {/* 마감 버튼 */}
                <div className="flex-shrink-0 flex items-start">
                  <button
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                      isExpired
                        ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                    }}
                  >
                    마감
                    <span className="text-[10px]">▼</span>
                  </button>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

