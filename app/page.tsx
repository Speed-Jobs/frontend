'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CompanyLogo from '@/components/CompanyLogo'
import jobPostingsData from '@/data/jobPostings.json'

export default function Home() {
  // 백엔드 API에서 데이터 가져오기
  const [apiData, setApiData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // 실제 호출되는 URL 확인
        const apiUrl = 'http://172.20.10.2:8080/api/v1/posts/simple'
        console.log('=== 백엔드 API 호출 ===')
        console.log('호출 URL:', apiUrl)
        console.log('호출 시각:', new Date().toISOString())
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // CORS 문제 해결을 위한 옵션
          mode: 'cors',
          credentials: 'omit',
        })
        
        console.log('응답 상태:', response.status)
        console.log('응답 URL:', response.url)
        console.log('응답 OK:', response.ok)
        console.log('응답 헤더:', Object.fromEntries(response.headers.entries()))
        
        if (!response.ok) {
          console.error('HTTP 에러 발생! 상태 코드:', response.status)
          const errorText = await response.text()
          console.error('에러 응답 내용:', errorText)
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        const result = await response.json()
        console.log('백엔드에서 받은 데이터:', result)
        console.log('백엔드 posts 배열 순서:', result.data?.posts?.map((p: any) => ({ id: p.id, title: p.title, company: p.company?.name })))
        
        // 백엔드 응답 형식을 기존 형식으로 변환 (순서 유지)
        if (result.data && result.data.posts && Array.isArray(result.data.posts)) {
          // 순서를 유지하기 위해 map 사용 (정렬하지 않음)
          const transformedData = result.data.posts.map((post: any, index: number) => {
            const today = new Date()
            const expiredDate = new Date(today)
            expiredDate.setDate(today.getDate() + (post.daysLeft || 0))
            
            // experience를 기존 형식으로 변환
            const experienceMap: Record<string, string> = {
              'ENTRY': '신입',
              'JUNIOR': '경력 1~3년',
              'MID_SENIOR': '경력 3~5년',
              'SENIOR': '경력 5년 이상'
            }
            
            return {
              id: post.id,
              title: post.title,
              company: post.company?.name || '',
              location: '',
              employment_type: '정규직', // 기본값
              experience: experienceMap[post.experience] || post.experience,
              crawl_date: today.toISOString().split('T')[0],
              posted_date: today.toISOString().split('T')[0], // 오늘 날짜로 설정
              expired_date: expiredDate.toISOString().split('T')[0],
              description: '',
              meta_data: {
                job_category: post.role || '',
                salary: '면접 후 결정',
                benefits: [],
                tech_stack: []
              }
            }
          })
          
          console.log('변환된 데이터 순서:', transformedData.map((d: any) => ({ id: d.id, title: d.title, company: d.company })))
          console.log('변환된 데이터:', transformedData)
          // 순서를 보장하기 위해 그대로 설정 (정렬하지 않음)
          setApiData(transformedData)
        } else {
          setApiData([])
        }
      } catch (err) {
        console.error('=== API 호출 에러 상세 정보 ===')
        console.error('에러 타입:', err instanceof Error ? err.constructor.name : typeof err)
        console.error('에러 메시지:', err instanceof Error ? err.message : String(err))
        console.error('에러 스택:', err instanceof Error ? err.stack : 'N/A')
        
        // CORS 에러인지 확인
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          console.error('CORS 또는 네트워크 에러로 보입니다.')
          console.error('백엔드에서 CORS 설정을 확인해주세요.')
          setError('CORS 또는 네트워크 연결 오류가 발생했습니다. 백엔드 CORS 설정을 확인해주세요.')
        } else {
          setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.')
        }
        setApiData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobPostings()
  }, [])

  // API 데이터가 있으면 사용하고, 없으면 기본 데이터 사용
  const jobPostingsDataToUse = apiData.length > 0 ? apiData : jobPostingsData

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

  // 대표 경쟁사 공고 미리보기 (백엔드 데이터가 있으면 그대로 사용, 없으면 필터링)
  // 백엔드에서 받은 순서(최신 공고 순)를 그대로 유지
  const previewJobPostings = useMemo(() => {
    // 백엔드에서 받은 데이터가 있으면 순서 그대로 사용 (최대 10개)
    // 백엔드에서 이미 최신 공고 순으로 정렬되어 있으므로 순서 변경 없이 그대로 사용
    if (apiData.length > 0) {
      // slice만 사용하여 순서 유지 (정렬하지 않음)
      const result = apiData.slice(0, 10)
      console.log('previewJobPostings 최종 순서 (백엔드 순서 유지):', result.map((j: any) => ({ id: j.id, title: j.title, company: j.company })))
      return result
    }
    
    // 기본 데이터는 로고가 있는 회사만 필터링
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
  }, [apiData, companiesWithLogo, jobPostingsData])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && !isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
            <p className="text-yellow-600 font-semibold mb-2">데이터 로드 실패</p>
            <p className="text-yellow-500 text-sm">{error}</p>
            <p className="text-gray-500 text-xs mt-2">기본 데이터를 사용합니다.</p>
          </div>
        </div>
      )}

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
              {apiData.length > 0 && (
                <p className="text-sm text-green-600 mt-2">✓ 백엔드 API에서 {apiData.length}개의 데이터를 불러왔습니다.</p>
              )}
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
            <div className="space-y-3">
              {previewJobPostings.map((job) => {
                // 마감일까지 남은 일수 계산
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
                
                const deadline = getDaysUntilExpiry(job.expired_date)
                const companyName = job.company.replace('(주)', '').trim()
                
                // 날짜 포맷팅
                const formatDate = (dateString: string) => {
                  const date = new Date(dateString)
                  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
                }
                
                const startDate = formatDate(job.posted_date)
                const endDate = job.expired_date ? formatDate(job.expired_date) : '상시채용'
                
                // 공고명 생성 (다양한 형식으로 구성)
                const getJobPostingTitle = () => {
                  const postedDate = new Date(job.posted_date)
                  const year = postedDate.getFullYear()
                  const month = postedDate.getMonth() + 1
                  const half = month <= 6 ? '상반기' : '하반기'
                  
                  // 경력 정보 파싱
                  const experience = job.experience || ''
                  const isNewbie = experience.includes('신입') || experience === '신입'
                  const isExperienced = experience.includes('경력')
                  
                  // 직군명 추출 (괄호 안 내용 포함)
                  const jobTitle = job.title || ''
                  const jobCategoryName = job.meta_data?.job_category || ''
                  
                  // 괄호 안의 세부 직군명 추출 (예: "백엔드 개발자 (Python/Django)" -> "Python/Django")
                  const detailMatch = jobTitle.match(/\(([^)]+)\)/)
                  const detailCategory = detailMatch ? detailMatch[1] : null
                  
                  // 다양한 템플릿 배열
                  const templates: string[] = []
                  
                  // 템플릿 1: "YYYY년 하반기 신입구성원(직군) 채용"
                  if (isNewbie && detailCategory) {
                    templates.push(`${year}년 ${half} 신입구성원(${detailCategory}) 채용`)
                  }
                  
                  // 템플릿 2: "YYYY년 하반기 신입/경력 채용"
                  if (isNewbie || isExperienced) {
                    if (isNewbie && isExperienced) {
                      templates.push(`${year}년 ${half} 신입/경력 채용`)
                    } else if (isNewbie) {
                      templates.push(`${year}년 ${half} 신입 채용`)
                    } else {
                      templates.push(`${year}년 ${half} 경력 채용`)
                    }
                  }
                  
                  // 템플릿 3: "YYYY년 하반기 공개채용"
                  templates.push(`${year}년 ${half} 공개채용`)
                  
                  // 템플릿 4: "YYYY년 하반기 정규직 채용"
                  if (job.employment_type === '정규직') {
                    templates.push(`${year}년 ${half} 정규직 채용`)
                  }
                  
                  // 템플릿 5: "YYYY년 하반기 [직군명] 채용"
                  if (jobCategoryName && jobCategoryName !== '개발') {
                    templates.push(`${year}년 ${half} ${jobCategoryName} 채용`)
                  }
                  
                  // 템플릿 6: "YYYY년 하반기 신입구성원 채용"
                  if (isNewbie) {
                    templates.push(`${year}년 ${half} 신입구성원 채용`)
                  }
                  
                  // 템플릿 7: "YYYY년 하반기 상시채용"
                  if (!job.expired_date) {
                    templates.push(`${year}년 ${half} 상시채용`)
                  }
                  
                  // job.id를 기반으로 일관된 템플릿 선택 (같은 공고는 항상 같은 형식)
                  const templateIndex = job.id % templates.length
                  return templates[templateIndex] || `${year}년 ${half} 공개채용`
                }
                
                const jobPostingTitle = getJobPostingTitle()
                
                // 직군명 추출 (job.title에서 괄호 앞 부분만 추출)
                const getJobCategory = () => {
                  if (job.title) {
                    // 괄호가 있으면 괄호 앞 부분만 추출
                    const match = job.title.match(/^([^(]+)/)
                    if (match) {
                      return match[1].trim()
                    }
                    return job.title.trim()
                  }
                  // job.title이 없으면 job_category를 기반으로 매핑
                  const category = job.meta_data?.job_category || '개발'
                  const categoryMap: Record<string, string> = {
                    'AI/ML': 'ML Engineer',
                    '개발': 'Developer',
                    '데이터': 'Data Engineer',
                    '인프라': 'Infrastructure Engineer',
                    '보안': 'Security Engineer',
                    '기획': 'Product Manager',
                    '디자인': 'Designer',
                    '마케팅': 'Marketing'
                  }
                  return categoryMap[category] || category
                }
                
                const jobCategory = getJobCategory()
                
                return (
                  <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
                    <div className="flex items-center gap-4 p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      {/* 기업사진 */}
                      <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 flex-shrink-0 overflow-hidden">
                        <CompanyLogo name={companyName} className="w-full h-full p-2" />
                      </div>
                      
                      {/* 메인 정보 영역 */}
                      <div className="flex-1 min-w-0">
                        {/* 기업명 */}
                        <div className="mb-2">
                          <p className="text-sm font-semibold text-gray-900">{companyName}</p>
                        </div>
                        
                        {/* 공고명 */}
                        <div className="mb-2">
                          <h4 className="font-bold text-gray-900 text-xl truncate">
                            {jobPostingTitle}
                          </h4>
                        </div>
                        
                        {/* 직군명 */}
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {jobCategory}
                          </p>
                        </div>
                        
                        {/* 날짜, 고용형태 */}
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">기간:</span>
                            <span className="text-sm font-medium text-gray-700">{startDate} ~ {endDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">고용형태:</span>
                            <span className="text-sm font-medium text-gray-700">{job.employment_type}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 마감일까지 남은 일수 */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`w-28 px-4 py-2 text-sm font-semibold rounded-lg border whitespace-nowrap text-center ${
                          deadline === '마감' || deadline === '오늘 마감'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : deadline === '상시채용'
                            ? 'bg-gray-50 text-gray-700 border-gray-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {deadline}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
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
      <Footer />
    </div>
  )
}

