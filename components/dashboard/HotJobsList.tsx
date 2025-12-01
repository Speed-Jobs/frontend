'use client'

import Link from 'next/link'

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
      <div className="text-gray-400 text-sm text-center py-8">
        데이터가 없습니다.
      </div>
    )
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/20 border-yellow-400 text-yellow-400'
      case 2:
        return 'bg-gray-400/20 border-gray-400 text-gray-300'
      case 3:
        return 'bg-orange-500/20 border-orange-400 text-orange-400'
      default:
        return 'bg-blue-500/20 border-blue-400 text-blue-300'
    }
  }

  const getDaysUntilExpiry = (expiredDate: string | null): string => {
    if (!expiredDate) return '상시채용'
    const today = new Date()
    const expiry = new Date(expiredDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return '마감'
    if (diffDays === 0) return '오늘 마감'
    return `${diffDays}일 남음`
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const deadline = getDaysUntilExpiry(job.expiredDate || null)
        
        return (
          <Link
            key={job.id}
            href={`/dashboard/jobs/${job.id}`}
            className="block"
          >
            <div className="p-4 bg-[#0f1e35] rounded-lg border border-[#2a3f5f] hover:border-orange-500/50 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                {/* 순위 배지 */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${getRankColor(job.rank)}`}>
                  {job.rank}
                </div>

                {/* 공고 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                        {job.title}
                      </h3>
                      <p className="text-gray-400 text-xs mb-2">{job.company}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                      <span>👁</span>
                      <span>{job.views.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* 기술 스택 */}
                  {job.techStack && job.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {job.techStack.slice(0, 3).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                      {job.techStack.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-gray-500">
                          +{job.techStack.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    {job.experience && (
                      <span className="flex items-center gap-1">
                        <span>💼</span>
                        <span>{job.experience}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span>💰</span>
                      <span>{job.salary}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>📍</span>
                      <span>{job.location}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      deadline === '마감' || deadline === '오늘 마감'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : deadline === '상시채용'
                        ? 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    }`}>
                      {deadline}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

