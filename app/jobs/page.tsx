'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import JobPostingCard from '@/components/JobPostingCard'
import jobPostingsData from '@/data/jobPostings.json'

export default function JobsPage() {
  const router = useRouter()
  const [selectedJobRole, setSelectedJobRole] = useState('all')
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('all')
  const [sortBy, setSortBy] = useState<'latest' | 'company' | 'deadline'>('latest')

  // 로고가 있는 회사 목록 (CompanyLogo의 companyNameMap 기반 + 실제 데이터의 회사명)
  const companiesWithLogo = [
    '삼성SDS', 'SAMSUNG', '삼성전자', '삼성', 'LGCNS', 'LG', 'LG전자',
    '현대 오토에버', 'HYUNDAI', '현대자동차', '현대',
    '한화 시스템', '한화',
    'KT',
    '네이버', 'NAVER',
    '카카오', 'kakao',
    '라인', 'LINE',
    '쿠팡', 'Coupang',
    '배민', 'Baemin',
    '토스', 'Toss',
    'KPMG',
    '당근마켓', '당근', 'Daangn'
  ]

  // 직군별 통계의 직무 목록
  const jobRoles = [
    '모든 직무',
    'Software Development',
    'Factory AX Engineering',
    'Solution Development',
    'Cloud/Infra Engineering',
    'Architect',
    'Project Management',
    'Quality Management',
    'AI',
    '정보보호',
    'Sales',
    'Domain Expert',
    'Consulting',
    'Biz. Supporting'
  ]

  const employmentTypes = ['모든 고용형태', '정규직', '계약직', '인턴', '프리랜서', '파트타임']

  // 필터링된 공고 목록 (로고가 있는 회사만 + 직무 필터)
  const filteredJobPostings = useMemo(() => {
    const filtered = jobPostingsData.filter((job) => {
      // 로고가 있는 회사만 필터링 (더 유연한 매칭)
      const companyName = job.company.replace('(주)', '').trim().toLowerCase()
      const normalizedCompanyName = companyName.replace(/\s+/g, '')
      const hasLogo = companiesWithLogo.some(company => {
        const normalizedLogoCompany = company.toLowerCase().replace(/\s+/g, '')
        return companyName.includes(normalizedLogoCompany) || 
               normalizedLogoCompany.includes(companyName) ||
               normalizedCompanyName.includes(normalizedLogoCompany) ||
               normalizedLogoCompany.includes(normalizedCompanyName) ||
               // 부분 매칭 (예: "삼성전자"와 "삼성" 매칭)
               companyName.startsWith(normalizedLogoCompany) ||
               normalizedLogoCompany.startsWith(companyName)
      })
      if (!hasLogo) return false

      // 직무 필터링 (job_category 또는 title에서 매칭)
      const jobRoleMatch = selectedJobRole === 'all' || 
        job.meta_data?.job_category?.includes(selectedJobRole) ||
        job.title.includes(selectedJobRole) ||
        // Software Development 매칭
        (selectedJobRole === 'Software Development' && (
          job.title.includes('개발') || 
          job.title.includes('Developer') ||
          job.title.includes('Engineer') ||
          job.meta_data?.job_category === '개발'
        )) ||
        // Factory AX Engineering 매칭
        (selectedJobRole === 'Factory AX Engineering' && (
          job.title.includes('Factory') ||
          job.title.includes('AX') ||
          job.title.includes('제조') ||
          job.title.includes('공장') ||
          job.title.includes('Simulation') ||
          job.title.includes('기구설계') ||
          job.title.includes('전장')
        )) ||
        // Solution Development 매칭
        (selectedJobRole === 'Solution Development' && (
          job.title.includes('Solution') ||
          job.title.includes('ERP') ||
          job.title.includes('시스템') ||
          job.meta_data?.job_category === '기획'
        )) ||
        // Cloud/Infra Engineering 매칭
        (selectedJobRole === 'Cloud/Infra Engineering' && (
          job.title.includes('Cloud') ||
          job.title.includes('클라우드') ||
          job.title.includes('Infra') ||
          job.title.includes('인프라') ||
          job.title.includes('DevOps') ||
          job.meta_data?.job_category === '인프라'
        )) ||
        // Architect 매칭
        (selectedJobRole === 'Architect' && (
          job.title.includes('Architect') ||
          job.title.includes('아키텍트') ||
          job.title.includes('설계')
        )) ||
        // Project Management 매칭
        (selectedJobRole === 'Project Management' && (
          job.title.includes('PM') ||
          job.title.includes('Project') ||
          job.title.includes('프로젝트') ||
          job.title.includes('관리') ||
          job.meta_data?.job_category === '기획'
        )) ||
        // Quality Management 매칭
        (selectedJobRole === 'Quality Management' && (
          job.title.includes('Quality') ||
          job.title.includes('품질') ||
          job.title.includes('QA') ||
          job.title.includes('테스트')
        )) ||
        // AI 매칭
        (selectedJobRole === 'AI' && (
          job.title.includes('AI') ||
          job.title.includes('ML') ||
          job.title.includes('Machine Learning') ||
          job.title.includes('머신러닝') ||
          job.title.includes('딥러닝') ||
          job.meta_data?.job_category === 'AI/ML'
        )) ||
        // 정보보호 매칭
        (selectedJobRole === '정보보호' && (
          job.title.includes('보안') ||
          job.title.includes('Security') ||
          job.title.includes('정보보호') ||
          job.meta_data?.job_category === '보안'
        )) ||
        // Sales 매칭
        (selectedJobRole === 'Sales' && (
          job.title.includes('Sales') ||
          job.title.includes('영업') ||
          job.title.includes('세일즈') ||
          job.meta_data?.job_category === '마케팅'
        )) ||
        // Domain Expert 매칭
        (selectedJobRole === 'Domain Expert' && (
          job.title.includes('Expert') ||
          job.title.includes('전문가') ||
          job.title.includes('Consultant') ||
          job.meta_data?.job_category === '기획'
        )) ||
        // Consulting 매칭
        (selectedJobRole === 'Consulting' && (
          job.title.includes('Consulting') ||
          job.title.includes('컨설팅') ||
          job.title.includes('Advisory')
        )) ||
        // Biz. Supporting 매칭
        (selectedJobRole === 'Biz. Supporting' && (
          job.title.includes('Strategy') ||
          job.title.includes('전략') ||
          job.title.includes('Planning') ||
          job.title.includes('기획') ||
          job.title.includes('HR') ||
          job.title.includes('인사') ||
          job.meta_data?.job_category === '기획'
        ))

      const employmentTypeMatch =
        selectedEmploymentType === 'all' || job.employment_type === selectedEmploymentType
      
      return jobRoleMatch && employmentTypeMatch
    })

    // 정렬 적용
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          // 최신공고순: posted_date 기준 내림차순
          return new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime()
        case 'company':
          // 회사이름순: company 기준 오름차순
          const companyA = a.company.replace('(주)', '').trim()
          const companyB = b.company.replace('(주)', '').trim()
          return companyA.localeCompare(companyB, 'ko')
        case 'deadline':
          // 마감순: expired_date 기준 오름차순 (null은 맨 뒤로)
          if (!a.expired_date && !b.expired_date) return 0
          if (!a.expired_date) return 1
          if (!b.expired_date) return -1
          return new Date(a.expired_date).getTime() - new Date(b.expired_date).getTime()
        default:
          return 0
      }
    })

    return sorted
  }, [selectedJobRole, selectedEmploymentType, companiesWithLogo, sortBy])

  const handleJobRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedJobRole(e.target.value === '모든 직무' ? 'all' : e.target.value)
  }

  const handleEmploymentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmploymentType(e.target.value === '모든 고용형태' ? 'all' : e.target.value)
  }

  return ( 
    <div className="min-h-screen bg-white">
      <Header />
      <div className="px-8 py-8 max-w-7xl mx-auto">
        {/* 이전으로 돌아가기 버튼 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">이전으로</span>
          </button>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            경쟁사 공고 전체 목록
          </h1>
          <p className="text-gray-600">
            실시간으로 업데이트되는 모든 채용 공고를 확인하세요
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <select
            value={selectedJobRole === 'all' ? '모든 직무' : selectedJobRole}
            onChange={handleJobRoleChange}
            className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white hover:border-gray-400 focus:outline-none focus:border-gray-900 transition-colors cursor-pointer shadow-sm"
          >
            {jobRoles.map((role) => (
              <option key={role} value={role === '모든 직무' ? 'all' : role}>
                {role}
              </option>
            ))}
          </select>
          <select
            value={selectedEmploymentType === 'all' ? '모든 고용형태' : selectedEmploymentType}
            onChange={handleEmploymentTypeChange}
            className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white hover:border-gray-400 focus:outline-none focus:border-gray-900 transition-colors cursor-pointer shadow-sm"
          >
            {employmentTypes.map((type) => (
              <option key={type} value={type === '모든 고용형태' ? 'all' : type}>
                {type}
              </option>
            ))}
          </select>
          
          {/* 정렬 라디오 버튼 */}
          <div className="ml-auto inline-flex items-center gap-1">
            <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="sortBy"
                value="latest"
                checked={sortBy === 'latest'}
                onChange={() => setSortBy('latest')}
                className="w-4 h-4 text-sk-red focus:ring-sk-red focus:ring-2 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">최신공고순</span>
            </label>
            <div className="w-px h-6 bg-gray-300"></div>
            <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="sortBy"
                value="company"
                checked={sortBy === 'company'}
                onChange={() => setSortBy('company')}
                className="w-4 h-4 text-sk-red focus:ring-sk-red focus:ring-2 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">회사이름순</span>
            </label>
            <div className="w-px h-6 bg-gray-300"></div>
            <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="sortBy"
                value="deadline"
                checked={sortBy === 'deadline'}
                onChange={() => setSortBy('deadline')}
                className="w-4 h-4 text-sk-red focus:ring-sk-red focus:ring-2 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">마감순</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-base text-gray-700 font-medium">
            <span className="text-gray-900 font-bold">{filteredJobPostings.length}개</span>의 공고를 확인할 수 있어요.
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

