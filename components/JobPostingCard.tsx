'use client'

import Link from 'next/link'

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
}

export default function JobPostingCard({ job, showDetail = false }: JobPostingCardProps) {
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
  const jobCategory = job.meta_data?.job_category || '개발'
  const categoryInitial = jobCategory.charAt(0)

  const cardContent = (
    <div className="flex items-center justify-between p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-sk-red hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center gap-6 flex-1">
        <div className="w-12 h-12 bg-sk-red rounded-lg flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
          {categoryInitial}
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
      <button className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4 border border-gray-300">
        {job.company.replace('(주)', '').trim()}
      </button>
    </div>
  )

  if (showDetail) {
    return (
      <Link href={`/dashboard/jobs/${job.id}`} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}

