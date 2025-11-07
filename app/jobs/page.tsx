'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import JobPostingCard from '@/components/JobPostingCard'
import jobPostingsData from '@/data/jobPostings.json'

export default function JobsPage() {
  const [selectedJobCategory, setSelectedJobCategory] = useState('all')
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('all')

  const jobCategories = ['모든 직군', '개발', '기획', '디자인', '마케팅', '데이터', 'AI/ML', '인프라', '보안']
  const employmentTypes = ['모든 고용형태', '정규직', '계약직', '인턴', '프리랜서', '파트타임']

  // 필터링된 공고 목록
  const filteredJobPostings = useMemo(() => {
    return jobPostingsData.filter((job) => {
      const jobCategoryMatch =
        selectedJobCategory === 'all' || job.meta_data?.job_category === selectedJobCategory
      const employmentTypeMatch =
        selectedEmploymentType === 'all' || job.employment_type === selectedEmploymentType
      return jobCategoryMatch && employmentTypeMatch
    })
  }, [selectedJobCategory, selectedEmploymentType])

  const handleJobCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedJobCategory(e.target.value === '모든 직군' ? 'all' : e.target.value)
  }

  const handleEmploymentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmploymentType(e.target.value === '모든 고용형태' ? 'all' : e.target.value)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            경쟁사 공고 전체 목록
          </h1>
          <p className="text-gray-600">
            실시간으로 업데이트되는 모든 채용 공고를 확인하세요
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <select
            value={selectedJobCategory === 'all' ? '모든 직군' : selectedJobCategory}
            onChange={handleJobCategoryChange}
            className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white hover:border-sk-red focus:outline-none focus:border-sk-red transition-colors cursor-pointer shadow-sm"
          >
            {jobCategories.map((category) => (
              <option key={category} value={category === '모든 직군' ? 'all' : category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={selectedEmploymentType === 'all' ? '모든 고용형태' : selectedEmploymentType}
            onChange={handleEmploymentTypeChange}
            className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white hover:border-sk-red focus:outline-none focus:border-sk-red transition-colors cursor-pointer shadow-sm"
          >
            {employmentTypes.map((type) => (
              <option key={type} value={type === '모든 고용형태' ? 'all' : type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-base text-gray-700 font-medium">
            <span className="text-sk-red font-bold">{filteredJobPostings.length}개</span>의 공고를 확인할 수 있어요.
          </p>
        </div>

        {/* Job Posting List */}
        <div className="space-y-4">
          {filteredJobPostings.length > 0 ? (
            filteredJobPostings.map((job) => (
              <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
                <JobPostingCard job={job} />
              </Link>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                선택한 조건에 맞는 공고가 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

