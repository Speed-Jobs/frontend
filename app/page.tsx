'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import CompanyLogo from '@/components/CompanyLogo'

export default function Home() {
  const [selectedJobCategory, setSelectedJobCategory] = useState('all')
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('all')

  const companies = [
    { name: 'SAMSUNG' },
    { name: 'LG' },
    { name: 'HYUNDAI' },
    { name: 'NAVER' },
    { name: 'kakao' },
    { name: '당근' },
  ]

  const jobCategories = ['모든 직군', '개발', '기획', '디자인', '마케팅', '데이터', 'AI/ML', '인프라', '보안']
  const employmentTypes = ['모든 고용형태', '정규직', '계약직', '인턴', '프리랜서', '파트타임']

  const features = [
    {
      title: '대시보드',
      subtitle: '실시간 경쟁사 공고와 트렌드를 한눈에',
      description:
        '주요 IT 기업들의 채용 공고를 수집하고 시각화하여, 직군별, 시기별, 기술 키워드별로 시장 동향을 한눈에 파악할 수 있습니다.',
    },
    {
      title: '분석 리포트 요약',
      subtitle: '채용 데이터를 인사이트로 전환',
      description:
        '다양한 리포트를 통해 종합적인 채용 현황을 제공하며, 데이터 요약 리포트를 자동으로 생성하여 빠르게 인사이트를 얻을 수 있습니다.',
    },
    {
      title: '자동 매칭 기능',
      subtitle: '경쟁사 공고를 우리 직무와 자동 연결',
      description:
        'AI가 경쟁사 공고를 우리 회사의 직무와 자동으로 매칭하여, 스킬셋 유사도와 격차를 시각화하여 HR 분석 시간을 절약할 수 있습니다.',
    },
    {
      title: '공고 품질 및 평가',
      subtitle: '지원자가 클릭하고 싶은 공고로 개선',
      description:
        'AI가 공고 품질(가독성, 구체성, 매력도)을 평가하고, 경쟁사 공고와 비교하여 개선 사항을 제안하며, 추천 예시를 생성합니다.',
    },
  ]

  const allJobPostings = [
    {
      id: 1,
      title: 'AI Engineer',
      deadline: 'D-7',
      category: 'Machine Learning',
      employmentType: '신입',
      company: '토스',
      jobCategory: 'AI/ML',
      employmentTypeValue: '정규직',
    },
    {
      id: 2,
      title: 'Backend Developer',
      deadline: 'D-3',
      category: 'Spring Boot',
      employmentType: '경력',
      company: '네이버',
      jobCategory: '개발',
      employmentTypeValue: '정규직',
    },
    {
      id: 3,
      title: 'Frontend Developer',
      deadline: 'D-5',
      category: 'React / TypeScript',
      employmentType: '신입',
      company: '카카오',
      jobCategory: '개발',
      employmentTypeValue: '정규직',
    },
    {
      id: 4,
      title: 'Data Engineer',
      deadline: 'D-10',
      category: 'Python / Spark',
      employmentType: '경력',
      company: '삼성',
      jobCategory: '데이터',
      employmentTypeValue: '정규직',
    },
    {
      id: 5,
      title: 'Product Manager',
      deadline: 'D-2',
      category: 'Product Strategy',
      employmentType: '경력',
      company: 'LG',
      jobCategory: '기획',
      employmentTypeValue: '정규직',
    },
    {
      id: 6,
      title: 'UI/UX Designer',
      deadline: 'D-8',
      category: 'Figma / Prototyping',
      employmentType: '경력',
      company: '당근',
      jobCategory: '디자인',
      employmentTypeValue: '정규직',
    },
    {
      id: 7,
      title: 'DevOps Engineer',
      deadline: 'D-4',
      category: 'Kubernetes / AWS',
      employmentType: '경력',
      company: '현대',
      jobCategory: '인프라',
      employmentTypeValue: '정규직',
    },
    {
      id: 8,
      title: 'Security Engineer',
      deadline: 'D-6',
      category: 'Security / Compliance',
      employmentType: '경력',
      company: '토스',
      jobCategory: '보안',
      employmentTypeValue: '정규직',
    },
    {
      id: 9,
      title: 'Marketing Manager',
      deadline: 'D-9',
      category: 'Digital Marketing',
      employmentType: '경력',
      company: '카카오',
      jobCategory: '마케팅',
      employmentTypeValue: '정규직',
    },
    {
      id: 10,
      title: 'ML Engineer',
      deadline: 'D-1',
      category: 'Deep Learning / PyTorch',
      employmentType: '신입',
      company: '네이버',
      jobCategory: 'AI/ML',
      employmentTypeValue: '인턴',
    },
    {
      id: 11,
      title: 'Full Stack Developer',
      deadline: 'D-5',
      category: 'Node.js / React',
      employmentType: '경력',
      company: '삼성',
      jobCategory: '개발',
      employmentTypeValue: '계약직',
    },
    {
      id: 12,
      title: 'Data Scientist',
      deadline: 'D-7',
      category: 'Python / R',
      employmentType: '경력',
      company: 'LG',
      jobCategory: '데이터',
      employmentTypeValue: '정규직',
    },
    {
      id: 13,
      title: 'Cloud Engineer',
      deadline: 'D-3',
      category: 'AWS / Terraform',
      employmentType: '경력',
      company: '당근',
      jobCategory: '인프라',
      employmentTypeValue: '정규직',
    },
    {
      id: 14,
      title: 'AI Researcher',
      deadline: 'D-12',
      category: 'NLP / Computer Vision',
      employmentType: '신입',
      company: '현대',
      jobCategory: 'AI/ML',
      employmentTypeValue: '정규직',
    },
  ]

  // 필터링된 공고 목록
  const filteredJobPostings = allJobPostings.filter((job) => {
    const jobCategoryMatch =
      selectedJobCategory === 'all' || job.jobCategory === selectedJobCategory
    const employmentTypeMatch =
      selectedEmploymentType === 'all' ||
      job.employmentTypeValue === selectedEmploymentType
    return jobCategoryMatch && employmentTypeMatch
  })

  const handleJobCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedJobCategory(e.target.value === '모든 직군' ? 'all' : e.target.value)
  }

  const handleEmploymentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmploymentType(e.target.value === '모든 고용형태' ? 'all' : e.target.value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="px-8 py-20 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            경쟁사 채용공고를
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              한눈에 파악하세요
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed">
            주요 IT 기업들의 채용 동량부터 스킬셋 트렌드까지 실시간으로 모니터링하고 분석합니다
          </p>
          
          {/* Company Logos */}
          <div className="flex justify-center items-center gap-8 mb-16 flex-wrap">
            {companies.map((company, index) => (
              <div
                key={index}
                className="flex flex-col items-center group cursor-pointer transform transition-all duration-300 hover:scale-110"
              >
                <div className="relative mb-3">
                  {/* Sparkle icon */}
                  <svg
                    className="w-6 h-6 text-purple-500 absolute -top-2 -right-2 animate-pulse"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {/* Logo container with shadow */}
                  <div className="w-20 h-20 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center p-3 border border-gray-100">
                    <CompanyLogo name={company.name} className="w-full h-full" />
                  </div>
                </div>
                <span className="text-sm text-gray-700 font-medium">{company.name}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Link
            href="/dashboard"
            className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            대시보드 보러가기 →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              강력한 기능으로
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                채용 인사이트를 제공합니다
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              우리 서비스는 다음과 같은 4가지 주요 기능으로 구성되어 있습니다. AI가 채용 데이터를 수집하고 분석해,
              기업의 인재 전략에 바로 활용할 수 있는 인사이트를 제공합니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-base text-blue-600 font-semibold mb-4">
                      {feature.subtitle}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor Job Postings Section */}
      <section className="px-8 py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              경쟁사 공고현황
            </h2>
            <p className="text-gray-600">
              실시간으로 업데이트되는 채용 공고를 확인하세요
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4 mb-8">
            <select
              value={selectedJobCategory === 'all' ? '모든 직군' : selectedJobCategory}
              onChange={handleJobCategoryChange}
              className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white hover:border-blue-500 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer shadow-sm"
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
              className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white hover:border-blue-500 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer shadow-sm"
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
              <span className="text-blue-600 font-bold">{filteredJobPostings.length}개</span>의 공고를 확인할 수 있어요.
            </p>
          </div>

          {/* Job Posting List */}
          <div className="space-y-4">
            {filteredJobPostings.length > 0 ? (
              filteredJobPostings.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform duration-300">
                      {job.jobCategory.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">
                        {job.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {job.category} / {job.employmentType}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200">
                      {job.deadline}
                    </span>
                  </div>
                  <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                    {job.company}
                  </button>
                </div>
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
      </section>
    </div>
  )
}

