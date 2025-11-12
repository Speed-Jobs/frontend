'use client'

import Link from 'next/link'
import CompanyLogo from '@/components/CompanyLogo'

interface JobPosting {
  id: number
  title: string
  company: string
  location?: string
  employment_type: string
  experience: string
  crawl_date: string
  posted_date: string
  expired_date: string | null
  description?: string
  meta_data?: {
    job_category?: string
    salary?: string
    benefits?: string[]
    tech_stack?: string[]
  }
}

interface JobPostingCardProps {
  job: JobPosting
  showDetail?: boolean
  onClick?: () => void
  isExpanded?: boolean
}

export default function JobPostingCard({ job, showDetail = false, onClick, isExpanded = false }: JobPostingCardProps) {
  // 마감일까지 남은 일수 계산
  const getDaysUntilExpiry = (expiredDate: string | null): string => {
    if (!expiredDate) return '상시채용'
    const today = new Date()
    const expiry = new Date(expiredDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return '마감'
    if (diffDays === 0) return '오늘 마감'
    return `D-${diffDays}`
  }

  const deadline = getDaysUntilExpiry(job.expired_date)
  const companyName = job.company.replace('(주)', '').trim()

  const cardContent = (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all duration-300 group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-6 flex-1">
        {/* 회사 로고 */}
        <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 flex-shrink-0 overflow-hidden">
          <CompanyLogo name={companyName} className="w-full h-full p-2" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-lg mb-1 truncate">
            {job.title}
          </h4>
          <p className="text-sm text-gray-600 truncate">
            {job.meta_data?.tech_stack?.slice(0, 3).join(', ') || ''} / {job.experience}
          </p>
        </div>
        <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex-shrink-0 ${
          deadline === '마감' || deadline === '오늘 마감'
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-blue-50 text-blue-700 border-blue-200'
        }`}>
          {deadline}
        </span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <button className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 border border-gray-300">
          {companyName}
        </button>
        {onClick && (
          <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )

  if (showDetail && onClick) {
    return cardContent
  }

  if (showDetail) {
    return (
      <Link href={`/dashboard/jobs/${job.id}`} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}

