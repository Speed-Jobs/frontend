'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import jobPostingsData from '@/data/jobPostings.json'

interface JobPosting {
  id: number
  title: string
  company: string
  location: string
  employment_type: string
  experience: string
  crawl_date: string
  posted_date: string
  expired_date: string | null
  description: string
  meta_data: {
    job_category?: string
    salary?: string
    benefits?: string[]
    tech_stack?: string[]
  }
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<JobPosting | null>(null)

  useEffect(() => {
    const jobId = parseInt(params.id as string)
    const foundJob = jobPostingsData.find((j) => j.id === jobId) as JobPosting | undefined
    setJob(foundJob || null)
  }, [params.id])

  if (!job) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="px-8 py-16 max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-lg">공고를 찾을 수 없습니다.</p>
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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
                <span className="font-semibold">{job.company}</span>
                <span>•</span>
                <span>{job.location}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-4 py-2 rounded-lg font-semibold ${
                getDaysUntilExpiry(job.expired_date).includes('마감')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {getDaysUntilExpiry(job.expired_date)}
              </span>
              <span className="text-sm text-gray-500">
                {job.meta_data?.job_category || '개발'}
              </span>
            </div>
          </div>

          {/* Job Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500 mb-1">고용형태</p>
              <p className="font-semibold text-gray-900">{job.employment_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">경력</p>
              <p className="font-semibold text-gray-900">{job.experience}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">급여</p>
              <p className="font-semibold text-gray-900">{job.meta_data?.salary || '면접 후 결정'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">게시일</p>
              <p className="font-semibold text-gray-900">{formatDate(job.posted_date)}</p>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">상세 내용</h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
              {job.description}
            </pre>
          </div>
        </div>

        {/* Tech Stack */}
        {job.meta_data?.tech_stack && job.meta_data.tech_stack.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">기술 스택</h2>
            <div className="flex flex-wrap gap-3">
              {job.meta_data.tech_stack.map((tech, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium border border-gray-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Benefits */}
        {job.meta_data?.benefits && job.meta_data.benefits.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">복리후생</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {job.meta_data.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <svg
                    className="w-5 h-5 text-sk-red"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">추가 정보</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">크롤링 날짜</span>
              <span className="font-semibold text-gray-900">{formatDate(job.crawl_date)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">공고 게시일</span>
              <span className="font-semibold text-gray-900">{formatDate(job.posted_date)}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600">공고 마감일</span>
              <span className="font-semibold text-gray-900">
                {job.expired_date ? formatDate(job.expired_date) : '상시채용'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

