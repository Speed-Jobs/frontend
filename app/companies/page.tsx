'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import CompanyLogo from '@/components/CompanyLogo'
import jobPostingsData from '@/data/jobPostings.json'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'

interface CompanyStats {
  company: string
  count: number
  percentage: number
  trend: number // 전월 대비 증감률
  recentJobs: number // 최근 30일 공고 수
  oldestDate: Date
  newestDate: Date
  jobs: any[]
}

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'count' | 'name' | 'trend' | 'oldest' | 'newest'>('count')
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '30days' | '90days' | '6months' | '1year' | '2years'>('all')
  const [selectedJobRole, setSelectedJobRole] = useState('전체')
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // 회사별 공고 통계 계산
  const companyStats = useMemo(() => {
    const companyMap = new Map<string, { count: number; jobs: any[]; oldestDate: Date; newestDate: Date }>()
    const now = new Date()
    const periodFilters = {
      '30days': 30,
      '90days': 90,
      '6months': 180,
      '1year': 365,
      '2years': 730,
    }

    jobPostingsData.forEach((job) => {
      const postedDate = new Date(job.posted_date)
      const daysDiff = Math.floor((now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24))

      // 기간 필터 적용
      if (selectedPeriod !== 'all' && daysDiff > periodFilters[selectedPeriod]) {
        return
      }

      // 직무 필터 적용
      if (selectedJobRole !== '전체') {
        const title = job.title.toLowerCase()
        const normalizedJobRole = selectedJobRole.toLowerCase()
        const jobCategory = job.meta_data?.job_category?.toLowerCase() || ''
        
        let jobRoleMatch = false
        
        // 1. 제목에 직무명이 직접 포함되어 있는지 확인 (대소문자 무시)
        if (title.includes(normalizedJobRole) || job.title.includes(selectedJobRole)) {
          jobRoleMatch = true
        }
        // 2. job_category와 직무명 매칭
        else if (jobCategory && (
          jobCategory.includes(normalizedJobRole) ||
          normalizedJobRole.includes(jobCategory)
        )) {
          jobRoleMatch = true
        }
        // 3. 각 직무별 세부 매칭 로직
        else if (selectedJobRole === 'Software Development') {
          jobRoleMatch = 
            title.includes('개발') || 
            title.includes('developer') ||
            title.includes('engineer') ||
            jobCategory === '개발' ||
            jobCategory.includes('software') ||
            jobCategory.includes('development')
        }
        else if (selectedJobRole === 'Factory AX Engineering') {
          jobRoleMatch = 
            title.includes('factory') ||
            title.includes('ax') ||
            title.includes('제조') ||
            title.includes('공장') ||
            title.includes('simulation') ||
            title.includes('기구설계') ||
            title.includes('전장') ||
            jobCategory.includes('factory')
        }
        else if (selectedJobRole === 'Solution Development') {
          jobRoleMatch = 
            title.includes('solution') ||
            title.includes('erp') ||
            title.includes('시스템') ||
            jobCategory === '기획' ||
            jobCategory.includes('solution')
        }
        else if (selectedJobRole === 'Cloud/Infra Engineering') {
          jobRoleMatch = 
            title.includes('cloud') ||
            title.includes('클라우드') ||
            title.includes('infra') ||
            title.includes('인프라') ||
            title.includes('devops') ||
            jobCategory === '인프라' ||
            jobCategory.includes('cloud') ||
            jobCategory.includes('infra')
        }
        else if (selectedJobRole === 'Architect') {
          jobRoleMatch = 
            title.includes('architect') ||
            title.includes('아키텍트') ||
            title.includes('설계') ||
            jobCategory.includes('architect')
        }
        else if (selectedJobRole === 'Project Management') {
          jobRoleMatch = 
            title.includes('pm') ||
            title.includes('project') ||
            title.includes('프로젝트') ||
            title.includes('관리') ||
            jobCategory === '기획' ||
            jobCategory.includes('project') ||
            jobCategory.includes('management')
        }
        else if (selectedJobRole === 'Quality Management') {
          jobRoleMatch = 
            title.includes('quality') ||
            title.includes('품질') ||
            title.includes('qa') ||
            title.includes('테스트') ||
            jobCategory.includes('quality')
        }
        else if (selectedJobRole === 'AI') {
          jobRoleMatch = 
            title.includes('ai') ||
            title.includes('ml') ||
            title.includes('머신러닝') ||
            title.includes('인공지능') ||
            jobCategory === 'ai/ml' ||
            jobCategory.includes('ai')
        }
        else if (selectedJobRole === '정보보호') {
          jobRoleMatch = 
            title.includes('보안') ||
            title.includes('security') ||
            title.includes('정보보호') ||
            jobCategory === '보안' ||
            jobCategory.includes('보안')
        }
        else if (selectedJobRole === 'Sales') {
          jobRoleMatch = 
            title.includes('sales') ||
            title.includes('영업') ||
            title.includes('세일즈') ||
            jobCategory === '마케팅' ||
            jobCategory.includes('sales')
        }
        else if (selectedJobRole === 'Domain Expert') {
          jobRoleMatch = 
            title.includes('domain') ||
            title.includes('도메인') ||
            title.includes('전문가') ||
            jobCategory === '기획' ||
            jobCategory.includes('domain') ||
            jobCategory.includes('expert')
        }
        else if (selectedJobRole === 'Consulting') {
          jobRoleMatch = 
            title.includes('consulting') ||
            title.includes('컨설팅') ||
            title.includes('esg') ||
            title.includes('crm') ||
            title.includes('scm') ||
            jobCategory.includes('consulting')
        }
        else if (selectedJobRole === 'Biz. Supporting') {
          jobRoleMatch = 
            title.includes('supporting') ||
            title.includes('지원') ||
            title.includes('strategy') ||
            title.includes('전략') ||
            jobCategory === '기획' ||
            jobCategory.includes('supporting') ||
            jobCategory.includes('biz')
        }
        
        if (!jobRoleMatch) {
          return
        }
      }

      const companyName = job.company.replace('(주)', '').trim()
      const existing = companyMap.get(companyName) || {
        count: 0,
        jobs: [],
        oldestDate: postedDate,
        newestDate: postedDate,
      }

      companyMap.set(companyName, {
        count: existing.count + 1,
        jobs: [...existing.jobs, job],
        oldestDate: postedDate < existing.oldestDate ? postedDate : existing.oldestDate,
        newestDate: postedDate > existing.newestDate ? postedDate : existing.newestDate,
      })
    })

    const total = Array.from(companyMap.values()).reduce((sum, data) => sum + data.count, 0)
    const now30DaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    return Array.from(companyMap.entries())
      .map(([company, data]) => {
        const recentJobs = data.jobs.filter(
          (job) => new Date(job.posted_date).getTime() >= now30DaysAgo.getTime()
        ).length

        // 증감률 계산 (간단한 예시 - 실제로는 전월 대비 계산 필요)
        const oldJobs = data.jobs.filter(
          (job) => new Date(job.posted_date).getTime() < now30DaysAgo.getTime()
        ).length
        const trend = oldJobs > 0 ? ((recentJobs - oldJobs) / oldJobs) * 100 : 0

        return {
          company,
          count: data.count,
          percentage: (data.count / total) * 100,
          trend,
          recentJobs,
          oldestDate: data.oldestDate,
          newestDate: data.newestDate,
          jobs: data.jobs,
        }
      })
      .filter((stat) => stat.company.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [searchQuery, selectedPeriod, selectedJobRole])

  // 정렬 적용
  const sortedStats = useMemo(() => {
    const sorted = [...companyStats].sort((a, b) => {
      switch (sortBy) {
        case 'count':
          return b.count - a.count
        case 'name':
          return a.company.localeCompare(b.company, 'ko')
        case 'trend':
          return b.trend - a.trend
        case 'newest':
          return b.newestDate.getTime() - a.newestDate.getTime()
        case 'oldest':
          return a.oldestDate.getTime() - b.oldestDate.getTime()
        default:
          return 0
      }
    })
    return sorted
  }, [companyStats, sortBy])

  // 선택된 회사의 공고 목록
  const selectedCompanyJobs = useMemo(() => {
    if (!selectedCompany) return []
    const companyStat = companyStats.find((stat) => stat.company === selectedCompany)
    if (!companyStat) return []
    return companyStat.jobs.sort((a, b) => {
      const dateA = new Date(a.posted_date).getTime()
      const dateB = new Date(b.posted_date).getTime()
      return dateB - dateA // 최신순
    })
  }, [selectedCompany, companyStats])

  // 페이지네이션
  const paginatedStats = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedStats.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedStats, currentPage])

  const totalPages = Math.ceil(sortedStats.length / itemsPerPage)

  // 차트 데이터
  const top10ChartData = sortedStats.slice(0, 10).map((stat) => ({
    name: stat.company.length > 8 ? stat.company.substring(0, 8) + '...' : stat.company,
    value: stat.count,
    fullName: stat.company,
  }))

  const COLORS = ['#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6']

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">회사별 누적 공고</h1>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">전체 회사 수</p>
                <p className="text-2xl font-bold text-gray-900">{companyStats.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">전체 공고 수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {companyStats.reduce((sum, stat) => sum + stat.count, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">평균 공고 수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {companyStats.length > 0
                    ? Math.round(companyStats.reduce((sum, stat) => sum + stat.count, 0) / companyStats.length)
                    : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">최고 공고 수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sortedStats.length > 0 ? sortedStats[0].count.toLocaleString() : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {sortedStats.length > 0 ? sortedStats[0].company : '-'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 및 검색 섹션 */}
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* 검색 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">회사명 검색</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="회사명을 입력하세요"
                  className="w-full px-4 py-2 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* 기간 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
              <select
                value={selectedPeriod}
                onChange={(e) => {
                  setSelectedPeriod(e.target.value as any)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
              >
                <option value="all">전체 기간</option>
                <option value="30days">최근 30일</option>
                <option value="90days">최근 90일</option>
                <option value="6months">최근 6개월</option>
                <option value="1year">최근 1년</option>
                <option value="2years">최근 2년</option>
              </select>
            </div>

            {/* 직무 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">직무</label>
              <select
                value={selectedJobRole}
                onChange={(e) => {
                  setSelectedJobRole(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
              >
                <option value="전체">전체</option>
                <option value="Software Development">Software Development</option>
                <option value="Factory AX Engineering">Factory AX Engineering</option>
                <option value="Solution Development">Solution Development</option>
                <option value="Cloud/Infra Engineering">Cloud/Infra Engineering</option>
                <option value="Architect">Architect</option>
                <option value="Project Management">Project Management</option>
                <option value="Quality Management">Quality Management</option>
                <option value="AI">AI</option>
                <option value="정보보호">정보보호</option>
                <option value="Sales">Sales</option>
                <option value="Domain Expert">Domain Expert</option>
                <option value="Consulting">Consulting</option>
                <option value="Biz. Supporting">Biz. Supporting</option>
              </select>
            </div>

            {/* 정렬 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">정렬</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
              >
                <option value="count">공고 수 (많은 순)</option>
                <option value="name">회사명 (가나다순)</option>
                <option value="trend">증감률</option>
                <option value="newest">최신 공고 순</option>
                <option value="oldest">오래된 공고 순</option>
              </select>
            </div>
          </div>

          {/* 뷰 모드 토글 */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              테이블
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'chart'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              차트
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">순위</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">회사</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">공고 수</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">비율</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">최근 30일</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">공고 기간</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">증감률</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedStats.map((stat, index) => {
                    const rank = (currentPage - 1) * itemsPerPage + index + 1
                    const maxCount = sortedStats[0]?.count || 1
                    return (
                      <tr key={stat.company} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-sm font-bold ${
                                rank <= 3 ? 'text-gray-900' : 'text-gray-500'
                              }`}
                            >
                              {rank}
                            </span>
                            {rank <= 3 && (
                              <span className="text-yellow-500">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
                              <CompanyLogo name={stat.company} className="w-full h-full" />
                            </div>
                            <button
                              onClick={() => setSelectedCompany(stat.company)}
                              className="text-sm font-medium text-gray-900 hover:text-gray-600 hover:underline text-left"
                            >
                              {stat.company}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900">{stat.count.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gray-900 h-2 rounded-full"
                                style={{ width: `${(stat.count / maxCount) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {stat.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-700">{stat.recentJobs.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs text-gray-500">
                              {stat.oldestDate.toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="text-xs text-gray-400">~</span>
                            <span className="text-xs text-gray-500">
                              {stat.newestDate.toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {stat.trend > 0 ? (
                              <>
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-green-600">+{stat.trend.toFixed(1)}%</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-red-600">{stat.trend.toFixed(1)}%</span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {currentPage} / {totalPages} 페이지
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 막대 차트 */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">상위 10개 회사 공고 수</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={top10ChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, payload: any) => [
                      `${value}건`,
                      payload.payload.fullName,
                    ]}
                  />
                  <Bar dataKey="value" fill="#6b7280" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 파이 차트 */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">상위 5개 회사 비율</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={top10ChartData.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {top10ChartData.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 회사별 공고 목록 모달 */}
        {selectedCompany && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
                    <CompanyLogo name={selectedCompany} className="w-full h-full" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedCompany}</h2>
                    <p className="text-sm text-gray-600">
                      총 {selectedCompanyJobs.length}개의 공고
                      {selectedCompanyJobs.length > 0 && (
                        <>
                          {' '}
                          (가장 오래된 공고: {new Date(selectedCompanyJobs[selectedCompanyJobs.length - 1]?.posted_date || '').toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })} ~ 가장 최신 공고: {new Date(selectedCompanyJobs[0]?.posted_date || '').toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })})
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {selectedCompanyJobs.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">공고가 없습니다.</p>
                  ) : (
                    selectedCompanyJobs.map((job) => (
                      <div
                        key={job.id}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                            {new Date(job.posted_date).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {job.experience}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {job.employment_type}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {job.location}
                          </span>
                          {job.meta_data?.tech_stack?.slice(0, 5).map((tech: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                        {job.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {job.description.substring(0, 200)}...
                          </p>
                        )}
                        {job.expired_date && (
                          <p className="text-xs text-gray-500 mt-2">
                            마감일: {new Date(job.expired_date).toLocaleDateString('ko-KR')}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

