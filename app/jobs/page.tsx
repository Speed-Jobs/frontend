'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import JobPostingCard from '@/components/JobPostingCard'
import jobPostingsData from '@/data/jobPostings.json'

export default function JobsPage() {
  const [selectedJobRole, setSelectedJobRole] = useState('all')
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('all')

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
    return jobPostingsData.filter((job) => {
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
  }, [selectedJobRole, selectedEmploymentType, companiesWithLogo])

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

