'use client'

import { useState, useMemo, useEffect } from 'react'
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
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [selectedJobRole, setSelectedJobRole] = useState('전체')
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string; date: string } | null>(null)
  const [imageZoom, setImageZoom] = useState(1)
  const [imageGalleryPage, setImageGalleryPage] = useState(1)
  const imagesPerPage = 2 // 갤러리에서 한 페이지에 표시할 이미지 수


  // 회사별 공고 통계 계산
  const companyStats = useMemo(() => {
    const companyMap = new Map<string, { count: number; jobs: any[]; oldestDate: Date; newestDate: Date }>()
    const now = new Date()

    jobPostingsData.forEach((job) => {
      const postedDate = new Date(job.posted_date)

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
  }, [selectedJobRole])

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

  // 검색 핸들러
  const handleSearch = () => {
    if (!searchQuery.trim()) return
    
    const filtered = companyStats.filter((stat) => 
      stat.company.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    if (filtered.length > 0) {
      setSelectedCompany(filtered[0].company)
      setImageGalleryPage(1)
    } else {
      alert('검색 결과가 없습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">옛날 공고 검색</h1>
          <p className="text-gray-600">회사명과 직무를 검색하여 과거 공고 이미지를 확인하세요</p>
        </div>

        {/* 검색 섹션 */}
        <div className="bg-white p-8 rounded-xl border-2 border-gray-200 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 회사명 검색 */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">회사명</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                  placeholder="예: 토스, 카카오, 네이버"
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 text-base"
                />
                <svg
                  className="w-6 h-6 text-gray-400 absolute left-4 top-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* 직무 선택 */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">직무</label>
              <select
                value={selectedJobRole}
                onChange={(e) => {
                  setSelectedJobRole(e.target.value)
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 text-base"
              >
                <option value="전체">전체 직무</option>
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

            {/* 검색 버튼 */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                className="w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
              >
                공고 검색
              </button>
            </div>
          </div>

          {/* 검색 결과 요약 */}
          {selectedCompany && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white">
                    <CompanyLogo name={selectedCompany} className="w-full h-full" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedCompany}
                      {selectedJobRole !== '전체' && (
                        <span className="text-gray-600 font-normal ml-2">· {selectedJobRole}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedCompanyJobs.length}개의 공고 이미지를 확인할 수 있습니다
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCompany(null)
                    setSearchQuery('')
                    setSelectedJobRole('전체')
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  초기화
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 검색 안내 */}
        {!selectedCompany && (
          <div className="bg-white p-8 rounded-xl border-2 border-gray-200 shadow-sm">
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">회사명과 직무를 검색하세요</h3>
              <p className="text-gray-600 text-sm">
                위 검색창에 회사명을 입력하고 직무를 선택한 후 검색 버튼을 클릭하면<br />
                해당 회사의 옛날 공고 이미지를 확인할 수 있습니다.
              </p>
            </div>
          </div>
        )}
        
        {/* 회사별 공고 이미지 갤러리 모달 */}
        {selectedCompany && (() => {
          // 회사명을 파일명으로 변환하는 매핑
          const companyNameMap: Record<string, string> = {
            '토스': 'toss',
            '(주)토스': 'toss',
            '카카오': 'kakao',
            '(주)카카오': 'kakao',
            '네이버': 'naver',
            '(주)네이버': 'naver',
            'LG전자': 'lg',
            '(주)LG전자': 'lg',
            'LG': 'lg',
            'LGCNS': 'lg',
            '라인': 'line',
            '(주)라인': 'line',
            'LINE': 'line',
            '당근마켓': 'daangn',
            '(주)당근마켓': 'daangn',
            '삼성전자': 'samsung-electronics',
            '(주)삼성전자': 'samsung-electronics',
            '삼성SDS': 'samsung-sds',
            '현대자동차': 'hyundai-motor',
            '(주)현대자동차': 'hyundai-motor',
            '현대 오토에버': 'hyundai-autoever',
            '쿠팡': 'coupang',
            '배민': 'baemin',
            '한화 시스템': 'hanwha-system',
            'KT': 'kt',
            'KPMG': 'kpmg',
          }
          
          const normalizedCompany = selectedCompany.replace('(주)', '').trim()
          let companySlug = companyNameMap[selectedCompany] || companyNameMap[normalizedCompany]
          
          if (!companySlug) {
            companySlug = normalizedCompany
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')
          }
          
          // 이미지 ID 범위 설정 (예: 1부터 100까지, 필요에 따라 조정)
          const maxImageId = 100
          const imageIds = Array.from({ length: maxImageId }, (_, i) => i + 1)
          
          // 페이지네이션 계산
          const totalImagePages = Math.ceil(imageIds.length / imagesPerPage)
          const startIndex = (imageGalleryPage - 1) * imagesPerPage
          const endIndex = startIndex + imagesPerPage
          const currentPageImages = imageIds.slice(startIndex, endIndex)
          
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
                      <CompanyLogo name={selectedCompany} className="w-full h-full" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedCompany}</h2>
                      <p className="text-sm text-gray-600">
                        옛날 공고 이미지 ({startIndex + 1}-{Math.min(endIndex, imageIds.length)} / 총 {imageIds.length}개)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCompany(null)
                      setImageGalleryPage(1)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {currentPageImages.map((imageId) => {
                      const imagePath = `/job-postings/${companySlug}/${imageId}.png`
                      const altText = `${selectedCompany} - 공고 이미지 ${imageId}`
                      const relatedJob = selectedCompanyJobs.find(job => job.id === imageId) || selectedCompanyJobs[0]
                      
                      return (
                        <div
                          key={imageId}
                          className="group relative border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-400 bg-white cursor-pointer transition-all hover:shadow-lg"
                          onClick={() => {
                            setSelectedImage({
                              src: imagePath,
                              title: relatedJob?.title || `${selectedCompany} 공고 ${imageId}`,
                              date: relatedJob?.posted_date || ''
                            })
                            setImageZoom(1)
                          }}
                        >
                          {/* 공고 이미지 */}
                          <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                            <img
                              src={imagePath}
                              alt={altText}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const placeholder = target.parentElement?.querySelector('.image-placeholder')
                                if (placeholder) {
                                  (placeholder as HTMLElement).style.display = 'flex'
                                }
                              }}
                            />
                            {/* 플레이스홀더 */}
                            <div className="image-placeholder hidden absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                              <svg className="w-12 h-12 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-xs text-gray-400 text-center">이미지 없음</p>
                            </div>
                            
                            {/* 호버 시 정보 오버레이 */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="text-white text-center px-3">
                                <p className="text-xs font-medium mb-1 line-clamp-2">{relatedJob?.title || `공고 ${imageId}`}</p>
                                <p className="text-xs text-gray-200">
                                  {relatedJob?.posted_date ? new Date(relatedJob.posted_date).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  }) : `ID: ${imageId}`}
                                </p>
                                <p className="text-xs text-gray-300 mt-1">클릭하여 확대</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* 하단 정보 */}
                          <div className="p-3 bg-white">
                            <p className="text-xs font-semibold text-gray-900 mb-1 line-clamp-1">
                              {relatedJob?.title || `공고 ${imageId}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {relatedJob?.posted_date ? new Date(relatedJob.posted_date).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }) : `이미지 ID: ${imageId}`}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* 페이지네이션 */}
                  {totalImagePages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setImageGalleryPage(prev => Math.max(1, prev - 1))}
                        disabled={imageGalleryPage === 1}
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        이전
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalImagePages) }, (_, i) => {
                          let pageNum
                          if (totalImagePages <= 5) {
                            pageNum = i + 1
                          } else if (imageGalleryPage <= 3) {
                            pageNum = i + 1
                          } else if (imageGalleryPage >= totalImagePages - 2) {
                            pageNum = totalImagePages - 4 + i
                          } else {
                            pageNum = imageGalleryPage - 2 + i
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setImageGalleryPage(pageNum)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                imageGalleryPage === pageNum
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>
                      <button
                        onClick={() => setImageGalleryPage(prev => Math.min(totalImagePages, prev + 1))}
                        disabled={imageGalleryPage === totalImagePages}
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        다음
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })()}
        
        {/* 이미지 확대 모달 */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4"
            onClick={() => {
              setSelectedImage(null)
              setImageZoom(1)
            }}
          >
            <div 
              className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedImage.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedImage.date ? new Date(selectedImage.date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }) : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* 줌 컨트롤 */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setImageZoom(prev => Math.max(0.5, prev - 0.25))
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
                      title="축소"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium text-gray-700 min-w-[60px] text-center">
                      {Math.round(imageZoom * 100)}%
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setImageZoom(prev => Math.min(3, prev + 0.25))
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
                      title="확대"
                    >
                      +
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setImageZoom(1)
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors ml-1"
                      title="원본 크기"
                    >
                      리셋
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedImage(null)
                      setImageZoom(1)
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* 이미지 */}
              <div 
                className="relative overflow-auto bg-gray-50" 
                style={{ maxHeight: 'calc(90vh - 80px)' }}
              >
                <div className="flex items-center justify-center p-6" style={{ minHeight: '100%' }}>
                  <img
                    src={selectedImage.src}
                    alt={selectedImage.title}
                    className="object-contain"
                    style={{ 
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                      transform: `scale(${imageZoom})`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.2s ease-out',
                      display: 'block'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const placeholder = target.parentElement?.parentElement?.querySelector('.image-placeholder')
                      if (placeholder) {
                        (placeholder as HTMLElement).style.display = 'flex'
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      setImageZoom(prev => prev === 1 ? 2 : 1)
                    }}
                  />
                </div>
                {/* 플레이스홀더 */}
                <div className="image-placeholder hidden absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                  <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-400 text-lg">이미지를 불러올 수 없습니다</p>
                  <p className="text-gray-300 text-sm mt-2">{selectedImage.src}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

