'use client'

import { useState, useMemo, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NotificationToast from '@/components/NotificationToast'
import jobPostingsData from '@/data/jobPostings.json'
import { useJobNotifications } from '@/hooks/useJobNotifications'
import DarkDashboardCard from '@/components/dashboard/DarkDashboardCard'
import JobRoleBarChart from '@/components/dashboard/JobRoleBarChart'
import TechStackList from '@/components/dashboard/TechStackList'
import SurgingKeywords from '@/components/dashboard/SurgingKeywords'
import CompanyNetworkBubble from '@/components/dashboard/CompanyNetworkBubble'
import CompanyRecruitmentTable from '@/components/dashboard/CompanyRecruitmentTable'
import ShareBarChart from '@/components/dashboard/ShareBarChart'
import GrowthRateList from '@/components/dashboard/GrowthRateList'
import RarePositionAlert from '@/components/dashboard/RarePositionAlert'
import HotJobsList from '@/components/dashboard/HotJobsList'
import WeeklyTrendAnalysis from '@/components/dashboard/WeeklyTrendAnalysis'

export default function Dashboard() {
  const { newJobs, hasNewJobs, clearNewJobs } = useJobNotifications()
  const ourCompany = 'SK AX'

  // 직군별 채용 공고 데이터 계산
  const jobRoleData = useMemo(() => {
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const recentJobs = jobPostingsData.filter(job => {
      const postedDate = new Date(job.posted_date)
      return postedDate >= lastWeek
    })

    const previousJobs = jobPostingsData.filter(job => {
      const postedDate = new Date(job.posted_date)
      return postedDate >= twoWeeksAgo && postedDate < lastWeek
    })

    const roleKeywords: Record<string, string[]> = {
      'Backend': ['backend', '백엔드', '서버', 'api', 'rest'],
      'Frontend': ['frontend', '프론트엔드', 'react', 'vue', 'angular'],
      'Data/AI': ['ai', 'ml', 'data', '데이터', '인공지능', '머신러닝'],
      'DevOps': ['devops', '인프라', 'cloud', 'aws', 'kubernetes', 'docker'],
      'Mobile': ['mobile', '모바일', 'ios', 'android', 'react native'],
    }

    const roleCounts: Record<string, { recent: number; previous: number }> = {}
    
    Object.keys(roleKeywords).forEach(role => {
      roleCounts[role] = { recent: 0, previous: 0 }
    })

    recentJobs.forEach(job => {
      const text = `${job.title} ${job.description || ''}`.toLowerCase()
      Object.entries(roleKeywords).forEach(([role, keywords]) => {
        if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
          roleCounts[role].recent++
        }
      })
    })

    previousJobs.forEach(job => {
      const text = `${job.title} ${job.description || ''}`.toLowerCase()
      Object.entries(roleKeywords).forEach(([role, keywords]) => {
        if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
          roleCounts[role].previous++
        }
      })
    })

    return Object.entries(roleCounts).map(([role, counts]) => ({
      role,
      count: counts.recent,
      change: counts.previous > 0 
        ? Math.round(((counts.recent - counts.previous) / counts.previous) * 100)
        : counts.recent > 0 ? 100 : 0,
    })).sort((a, b) => b.count - a.count)
  }, [])

  // 핵심 기술스택 Top 5
  const techStackData = useMemo(() => {
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentJobs = jobPostingsData.filter(job => {
      const postedDate = new Date(job.posted_date)
      return postedDate >= lastWeek
    })

    const techCounts: Record<string, number> = {}
    
    recentJobs.forEach(job => {
      job.meta_data?.tech_stack?.forEach(tech => {
        techCounts[tech] = (techCounts[tech] || 0) + 1
      })
    })

    return Object.entries(techCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item, index) => ({ rank: index + 1, ...item }))
  }, [])

  // 이번주 급증 키워드
  const surgingKeywordsData = useMemo(() => {
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const recentJobs = jobPostingsData.filter(job => {
      const postedDate = new Date(job.posted_date)
      return postedDate >= lastWeek
    })

    const previousJobs = jobPostingsData.filter(job => {
      const postedDate = new Date(job.posted_date)
      return postedDate >= twoWeeksAgo && postedDate < lastWeek
    })

    const keywordCounts: Record<string, { recent: number; previous: number }> = {}
    
    const keywords = ['MLOps', 'Rust', 'MSA 설계', 'Next.js', 'Terraform', 'Kubernetes', 'Docker', 'React', 'Python', 'AWS']

    keywords.forEach(keyword => {
      keywordCounts[keyword] = { recent: 0, previous: 0 }
    })

    recentJobs.forEach(job => {
      const text = `${job.title} ${job.description || ''}`.toLowerCase()
      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          keywordCounts[keyword].recent++
        }
      })
    })

    previousJobs.forEach(job => {
      const text = `${job.title} ${job.description || ''}`.toLowerCase()
      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          keywordCounts[keyword].previous++
        }
      })
    })

    return Object.entries(keywordCounts)
      .map(([keyword, counts]) => ({
        keyword,
        change: counts.previous > 0
          ? Math.round(((counts.recent - counts.previous) / counts.previous) * 100)
          : counts.recent > 0 ? 1000 : 0,
      }))
      .filter(item => item.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 5)
  }, [])

  // 회사 네트워크 버블 데이터
  const companyNetworkData = useMemo(() => {
    const companies = ['네이버', '카카오', '토스', '라인', '우아한형제들', '삼성', 'LG CNS', '한화시스템']
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentJobs = jobPostingsData.filter(job => {
      const postedDate = new Date(job.posted_date)
      return postedDate >= lastWeek
    })

    const companyCounts: Record<string, number> = {}
    
    companies.forEach(company => {
      companyCounts[company] = recentJobs.filter(job => {
        const jobCompany = job.company.replace('(주)', '').trim()
        return jobCompany.includes(company) || company.includes(jobCompany)
      }).length
    })

    const groupMapping: Record<string, number> = {
      '삼성': 1,
      'LG CNS': 1,
      '한화시스템': 1,
      '네이버': 2,
      '카카오': 2,
      '토스': 2,
      '라인': 2,
      '우아한형제들': 2,
    }

    return companies.map((company, index) => ({
      name: company,
      count: companyCounts[company] || 0,
      group: groupMapping[company] || 3,
      x: 20 + (index % 3) * 30 + Math.random() * 10,
      y: 20 + Math.floor(index / 3) * 30 + Math.random() * 10,
      size: companyCounts[company] || 1,
    }))
  }, [])

  // 회사별 채용 현황 테이블 데이터
  const companyRecruitmentTableData = useMemo(() => {
    const companies = ['네이버', '카카오', '토스', '라인', '우아한형제들', '삼성', 'LG CNS', '한화시스템']
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const recentJobs = jobPostingsData.filter(job => {
      const postedDate = new Date(job.posted_date)
      return postedDate >= lastWeek
    })

    const previousJobs = jobPostingsData.filter(job => {
      const postedDate = new Date(job.posted_date)
      return postedDate >= twoWeeksAgo && postedDate < lastWeek
    })

    const roleKeywords: Record<string, string[]> = {
      'backend': ['backend', '백엔드', '서버', 'api'],
      'frontend': ['frontend', '프론트엔드', 'react', 'vue'],
      'dataAi': ['ai', 'ml', 'data', '데이터', '인공지능'],
      'devops': ['devops', '인프라', 'cloud', 'aws'],
      'mobile': ['mobile', '모바일', 'ios', 'android'],
    }

    return companies.map(company => {
      const companyRecentJobs = recentJobs.filter(job => {
        const jobCompany = job.company.replace('(주)', '').trim()
        return jobCompany.includes(company) || company.includes(jobCompany)
      })

      const companyPreviousJobs = previousJobs.filter(job => {
        const jobCompany = job.company.replace('(주)', '').trim()
        return jobCompany.includes(company) || company.includes(jobCompany)
      })

      const counts: Record<string, number> = {
        backend: 0,
        frontend: 0,
        dataAi: 0,
        devops: 0,
        mobile: 0,
      }

      companyRecentJobs.forEach(job => {
        const text = `${job.title} ${job.description || ''}`.toLowerCase()
        Object.entries(roleKeywords).forEach(([key, keywords]) => {
          if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
            counts[key as keyof typeof counts]++
          }
        })
      })

      const total = Object.values(counts).reduce((sum, val) => sum + val, 0)
      const previousTotal = companyPreviousJobs.length
      const change = previousTotal > 0 
        ? Math.round(((total - previousTotal) / previousTotal) * 100)
        : total > 0 ? 100 : 0

      const surgingPosition = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

      return {
        company,
        backend: counts.backend,
        frontend: counts.frontend,
        dataAi: counts.dataAi,
        devops: counts.devops,
        mobile: counts.mobile,
        total,
        change,
        surgingPosition: surgingPosition === 'dataAi' ? 'Data/AI' : 
                        surgingPosition === 'backend' ? 'Backend' :
                        surgingPosition === 'frontend' ? 'Frontend' :
                        surgingPosition === 'devops' ? 'DevOps' :
                        surgingPosition === 'mobile' ? 'Mobile' : '-',
      }
    }).sort((a, b) => b.total - a.total)
  }, [])

  // 회사별 채용 점유율
  const companyShareData = useMemo(() => {
    const total = companyRecruitmentTableData.reduce((sum, item) => sum + item.total, 0)
    if (total === 0) return []

    return companyRecruitmentTableData.map(item => ({
      company: item.company,
      share: Math.round((item.total / total) * 100 * 10) / 10,
    })).slice(0, 8)
  }, [companyRecruitmentTableData])

  // 포지션별 성장률
  const positionGrowthData = useMemo(() => {
    return jobRoleData.map(item => ({
      position: item.role,
      growth: item.change,
    })).sort((a, b) => b.growth - a.growth)
  }, [jobRoleData])

  // 희소 포지션 알림
  const rarePositionData = useMemo(() => {
    const competitive = [
      { position: 'Blockchain 개발', companyCount: 5 },
      { position: 'MLOps', companyCount: 8 },
    ]

    const blueOcean = [
      { position: 'Rust 개발자', companyCount: 2 },
      { position: 'Web3 기획자', companyCount: 1 },
    ]

    return { competitive, blueOcean }
  }, [])

  // HOT 공고 Top 5
  const hotJobsData = useMemo(() => {
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentJobs = jobPostingsData.filter(job => {
      const postedDate = new Date(job.posted_date)
      return postedDate >= lastWeek
    })

    // 간단한 뷰 카운트 시뮬레이션 (실제로는 API에서 가져와야 함)
    return recentJobs
      .map((job, index) => ({
        rank: index + 1,
        company: job.company.replace('(주)', '').trim(),
        title: job.title,
        salary: job.meta_data?.salary || '협의',
        location: job.location,
        views: Math.floor(Math.random() * 500) + 500,
      }))
      .slice(0, 5)
  }, [])

  // 주간 트렌드 분석
  const weeklyTrendData = useMemo(() => {
    return {
      trends: [
        {
          icon: 'target' as const,
          title: '토스의 Data/AI 대규모 채용',
          description: '→ 금융 AI 시장 경쟁 가열',
          color: 'red' as const,
        },
        {
          icon: 'chart' as const,
          title: "'Kubernetes' 요구 23% 증가",
          description: '클라우드 네이티브 전환 가속',
          color: 'green' as const,
        },
        {
          icon: 'warning' as const,
          title: "▲ 경쟁사 8곳이 'Backend' 동시 채용중",
          description: '·채용 경쟁 심화 예상',
          color: 'yellow' as const,
        },
      ],
      suggestion: '연봉 상향 또는 복지 차별화 필요',
    }
  }, [])

  // 현재 시간 표시
  const currentTime = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const date = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const ampm = parseInt(hours) < 12 ? '오전' : '오후'
    const displayHours = parseInt(hours) % 12 || 12
    
    return `${year}. ${month}. ${date}. ${ampm} ${displayHours}:${minutes}:${seconds}`
  }, [])

  return (
    <div className="min-h-screen bg-[#0f1e35]">
      <Header />
      {hasNewJobs && (
        <NotificationToast newJobs={newJobs} onClose={clearNewJobs} />
      )}

      <div className="max-w-[1920px] mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">채용 인텔리전스</h1>
            <p className="text-gray-400">{currentTime} | 실시간 모니터링</p>
          </div>
        </div>

        {/* 메인 3열 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* 왼쪽 컬럼 (3열) */}
          <div className="lg:col-span-3 space-y-6">
            <DarkDashboardCard title="직군별 채용 공고">
              <JobRoleBarChart data={jobRoleData} />
            </DarkDashboardCard>

            <DarkDashboardCard title="핵심 기술스택 Top 5">
              <TechStackList items={techStackData} />
            </DarkDashboardCard>

            <DarkDashboardCard title="이번주 급증 키워드">
              <SurgingKeywords keywords={surgingKeywordsData} />
            </DarkDashboardCard>
          </div>

          {/* 중앙 컬럼 (6열) */}
          <div className="lg:col-span-6 space-y-6">
            <DarkDashboardCard title="회사 네트워크" className="h-[450px]">
              <CompanyNetworkBubble companies={companyNetworkData} ourCompany={ourCompany} />
            </DarkDashboardCard>

            <DarkDashboardCard title="회사별 금주 채용 현황">
              <CompanyRecruitmentTable data={companyRecruitmentTableData} />
            </DarkDashboardCard>
          </div>

          {/* 오른쪽 컬럼 (3열) */}
          <div className="lg:col-span-3 space-y-6">
            <DarkDashboardCard title="회사별 채용 점유율">
              <ShareBarChart data={companyShareData} />
            </DarkDashboardCard>

            <DarkDashboardCard title="포지션별 성장률">
              <GrowthRateList items={positionGrowthData} />
            </DarkDashboardCard>

            <DarkDashboardCard title="희소 포지션 알림">
              <RarePositionAlert
                competitive={rarePositionData.competitive}
                blueOcean={rarePositionData.blueOcean}
              />
            </DarkDashboardCard>
          </div>
        </div>

        {/* 하단 2열 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DarkDashboardCard title="🔥 이번주 HOT 공고 Top 5">
            <HotJobsList jobs={hotJobsData} />
          </DarkDashboardCard>

          <DarkDashboardCard title="📊 주간 트렌드 분석">
            <WeeklyTrendAnalysis
              trends={weeklyTrendData.trends}
              suggestion={weeklyTrendData.suggestion}
            />
          </DarkDashboardCard>
        </div>
      </div>

      <Footer />
    </div>
  )
}

