'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import CompanyLogo from '@/components/CompanyLogo'
import JobPostingCard from '@/components/JobPostingCard'
import jobPostingsData from '@/data/jobPostings.json'

export default function Home() {

  const companies = [
    { name: '삼성SDS' },
    { name: 'LGCNS' },
    { name: '현대 오토에버' },
    { name: '한화 시스템' },
    { name: 'KT' },
    { name: '네이버' },
    { name: '카카오' },
    { name: '라인' },
    { name: '쿠팡' },
    { name: '배민' },
    { name: '토스' },
    { name: 'KPMG' },
  ]

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

  // 대표 경쟁사 공고 미리보기 (로고가 있는 회사만, 최대 10개)
  const previewJobPostings = useMemo(() => {
    return jobPostingsData
      .filter((job) => {
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
        return hasLogo
      })
      .slice(0, 10) // 최대 10개만 표시
  }, [companiesWithLogo])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="px-8 py-20 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-sk-red rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-sk-red/50 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            경쟁사 채용공고를
            <br />
            <span className="text-sk-red">
              한눈에 파악하세요
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed">
            주요 IT 기업들의 채용 동량부터 스킬셋 트렌드까지 실시간으로 모니터링하고 분석합니다
          </p>
          
          {/* Company Logos - Infinite Scroll Animation */}
          <div className="relative mb-16 overflow-hidden w-full">
            <div className="flex animate-scroll gap-12 items-center whitespace-nowrap">
              {/* 첫 번째 세트 */}
              {companies.map((company, index) => (
                <div
                  key={`first-${index}`}
                  className="flex flex-col items-center group cursor-pointer transform transition-all duration-300 hover:scale-110 flex-shrink-0 min-w-[120px]"
                >
                  <div className="relative mb-3">
                    {/* Logo container with shadow */}
                    <div className="w-20 h-20 bg-white rounded-xl shadow-lg hover:shadow-xl hover:border-sk-red transition-all duration-300 flex items-center justify-center p-3 border border-gray-200 opacity-75">
                      <CompanyLogo name={company.name} className="w-full h-full" />
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 font-medium opacity-70 whitespace-nowrap">{company.name}</span>
                </div>
              ))}
              {/* 두 번째 세트 (무한 반복을 위한 복사본) */}
              {companies.map((company, index) => (
                <div
                  key={`second-${index}`}
                  className="flex flex-col items-center group cursor-pointer transform transition-all duration-300 hover:scale-110 flex-shrink-0 min-w-[120px]"
                >
                  <div className="relative mb-3">
                    {/* Logo container with shadow */}
                    <div className="w-20 h-20 bg-white rounded-xl shadow-lg hover:shadow-xl hover:border-sk-red transition-all duration-300 flex items-center justify-center p-3 border border-gray-200 opacity-75">
                      <CompanyLogo name={company.name} className="w-full h-full" />
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 font-medium opacity-70 whitespace-nowrap">{company.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/dashboard"
            className="inline-block px-10 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-900"
          >
            대시보드 보러가기 →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              강력한 기능으로
              <span className="block mt-2 text-sk-red">
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
                className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl hover:border-sk-red transition-all duration-300 border border-gray-200 group hover:-translate-y-1"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-base text-sk-red font-semibold mb-4">
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
      <section className="px-8 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                경쟁사 공고현황 미리보기
              </h2>
              <p className="text-gray-600">
                대표 경쟁사의 최신 채용 공고를 확인하세요
              </p>
            </div>
            <Link
              href="/jobs"
              className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              전체 공고 보기 →
            </Link>
          </div>

          {/* Job Posting List */}
          {previewJobPostings.length > 0 ? (
            <div className="space-y-4">
              {previewJobPostings.map((job) => (
                <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
                  <JobPostingCard job={job} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                공고가 없습니다.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

