'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NotificationToast from '@/components/NotificationToast'
import jobPostingsData from '@/data/jobPostings.json'
import { useJobNotifications } from '@/hooks/useJobNotifications'
import DarkDashboardCard from '@/components/dashboard/DarkDashboardCard'
import JobRoleBarChart from '@/components/dashboard/JobRoleBarChart'
import CompanyJobPostings from '@/components/dashboard/CompanyJobPostings'
import CompanyNetworkBubble from '@/components/dashboard/CompanyNetworkBubble'
import RecruitmentCalendar from '@/components/dashboard/RecruitmentCalendar'
import CompanyRecruitmentTable from '@/components/dashboard/CompanyRecruitmentTable'
import HotJobsList from '@/components/dashboard/HotJobsList'
import JobPostingsTrendChart from '@/components/dashboard/JobPostingsTrendChart'
import CompanyRecruitmentChart from '@/components/dashboard/CompanyRecruitmentChart'
import CombinedTrendChart from '@/components/dashboard/CombinedTrendChart'
import CompanyInsightView from '@/components/dashboard/CompanyInsightView'
import JobRoleStatisticsChart from '@/components/dashboard/JobRoleStatisticsChart'
import SkillTrendAndCloud from '@/components/dashboard/SkillTrendAndCloud'
import JobDifficultyGauges from '@/components/dashboard/JobDifficultyGauges'

export default function Dashboard() {
  const { newJobs, hasNewJobs, clearNewJobs } = useJobNotifications({
    jobPostings: jobPostingsData,
    autoCheck: true,
    checkInterval: 5 * 60 * 1000, // 5분마다 체크
  })
  const ourCompany = 'SK AX'

  // API 상태 관리
  const [jobPostingsTrendTimeframe, setJobPostingsTrendTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily')
  const [jobPostingsTrendApiData, setJobPostingsTrendApiData] = useState<Array<{ period: string; count: number }>>([])
  const [isLoadingJobPostingsTrend, setIsLoadingJobPostingsTrend] = useState(false)
  const [jobPostingsTrendError, setJobPostingsTrendError] = useState<string | null>(null)

  const [companyRecruitmentTimeframe, setCompanyRecruitmentTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily')
  const [companyRecruitmentApiData, setCompanyRecruitmentApiData] = useState<{
    companies: Array<{ id: number; name: string; key: string }>
    activities: Array<{ period: string; counts: Record<string, number> }>
  } | null>(null)
  const [isLoadingCompanyRecruitment, setIsLoadingCompanyRecruitment] = useState(false)
  const [companyRecruitmentError, setCompanyRecruitmentError] = useState<string | null>(null)
  const [selectedRecruitmentCompanies, setSelectedRecruitmentCompanies] = useState<string[]>([])

  // 스킬 트렌드 관련 상태 (기본값: 첫 번째 회사 또는 빈 문자열)
  const [selectedSkillCompany, setSelectedSkillCompany] = useState<string>('')
  // 스킬 클라우드용 회사 선택 (기본값: 전체)
  const [selectedSkillCloudCompany, setSelectedSkillCloudCompany] = useState<string>('전체')
  const [skillTrendData, setSkillTrendData] = useState<Array<{
    month: string
    [skill: string]: string | number
  }>>([])
  const [isLoadingSkillTrend, setIsLoadingSkillTrend] = useState(false)
  const [skillTrendError, setSkillTrendError] = useState<string | null>(null)

  // 직군별 통계 상태
  const [selectedExpertCategory, setSelectedExpertCategory] = useState<'Tech' | 'Biz' | 'BizSupporting'>('Tech')
  const [selectedJobRole, setSelectedJobRole] = useState<string | null>(null)
  const [jobRoleStatisticsViewMode, setJobRoleStatisticsViewMode] = useState<'Weekly' | 'Monthly'>('Weekly')

  // 직군별 채용 공고 데이터 계산 (직군별 통계의 직군 종류 사용)
  const jobRoleData = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // 날짜 필터링 (더 관대하게 - 최근 30일로 확장)
    const recentJobs = jobPostingsData.filter(job => {
      try {
        const postedDate = new Date(job.posted_date)
        postedDate.setHours(0, 0, 0, 0)
        return postedDate >= lastWeek
      } catch {
        return false
      }
    })

    const previousJobs = jobPostingsData.filter(job => {
      try {
        const postedDate = new Date(job.posted_date)
        postedDate.setHours(0, 0, 0, 0)
        return postedDate >= twoWeeksAgo && postedDate < lastWeek
      } catch {
        return false
      }
    })

    // 최근 공고가 없으면 전체 데이터 사용 (최대 100개)
    const jobsToAnalyze = recentJobs.length > 0 ? recentJobs : jobPostingsData.slice(0, 100)
    const previousJobsToAnalyze = previousJobs.length > 0 ? previousJobs : []

    // 직군별 통계에 사용되는 모든 직군 목록 (SKAX 직무기술서 기준)
    const allRoles = [
      // Tech 전문가
      'Software Development',
      'Factory AX Engineering',
      'Solution Development',
      'Cloud/Infra Engineering',
      'Architect',
      'Project Management',
      'Quality Management',
      'AI',
      '정보보호',
      // Biz 전문가
      'Sales',
      'Domain Expert',
      'Consulting',
      // Biz.Supporting 전문가
      'Biz. Supporting',
    ]

    // 각 직군에 대한 키워드 매핑 (더 포괄적으로)
    const roleKeywords: Record<string, string[]> = {
      'Software Development': ['software', 'development', '개발', '소프트웨어', '프로그래밍', 'programming', 'frontend', 'backend', 'fullstack', '프론트엔드', '백엔드', 'full-stack', 'developer', '개발자', 'react', 'vue', 'angular', 'node', 'java', 'python', 'javascript', 'typescript'],
      'Factory AX Engineering': ['factory', 'ax', 'engineering', '공장', '제조', '시뮬레이션', 'simulation', '기구설계', '전장', '제어', '자동화', 'automation', 'plc', 'scada'],
      'Solution Development': ['solution', '솔루션', 'erp', 'fcm', 'scm', 'hcm', 'biz', '비즈니스', 'sap', 'oracle'],
      'Cloud/Infra Engineering': ['cloud', 'infra', 'infrastructure', '인프라', '클라우드', 'aws', 'azure', 'gcp', 'kubernetes', 'docker', 'devops', '시스템', '네트워크', 'database', '데이터베이스', 'postgresql', 'mysql', 'mongodb', 'redis'],
      'Architect': ['architect', '아키텍트', '설계', 'architecture', 'system design', '시스템 설계', 'solution architect'],
      'Project Management': ['project', 'management', 'pm', '프로젝트', '관리', '프로젝트 매니저', '프로젝트 관리', 'pmo', 'program manager'],
      'Quality Management': ['quality', 'qa', 'qc', '품질', '테스트', 'test', 'testing', 'qa engineer', 'quality assurance'],
      'AI': ['ai', 'artificial intelligence', '인공지능', 'machine learning', 'ml', '딥러닝', 'deep learning', '데이터', 'data', 'generative ai', '생성형 ai', 'tensorflow', 'pytorch', 'nlp', 'computer vision'],
      '정보보호': ['정보보호', '보안', 'security', 'cybersecurity', 'cyber', '보안 진단', 'compliance', 'governance', 'security engineer'],
      'Sales': ['sales', '영업', '세일즈', '영업사원', 'account', '고객', 'account manager', 'business development'],
      'Domain Expert': ['domain', 'expert', '도메인', '전문가', '금융', '제조', '공공', 'b2c', 'industry expert'],
      'Consulting': ['consulting', '컨설팅', '컨설턴트', 'esg', 'she', 'crm', 'scm', 'consultant'],
      'Biz. Supporting': ['strategy', 'planning', '전략', '기획', 'hr', '인사', '재무', 'financial', 'management', '경영', 'human resources'],
    }

    const roleCounts: Record<string, { recent: number; previous: number }> = {}
    
    // 모든 직군 초기화
    allRoles.forEach(role => {
      roleCounts[role] = { recent: 0, previous: 0 }
    })

    // 최근 공고 카운트
    jobsToAnalyze.forEach(job => {
      const title = (job.title || '').toLowerCase()
      const description = (job.description || '').toLowerCase()
      const techStack = (job.meta_data?.tech_stack || []).join(' ').toLowerCase()
      const jobCategory = (job.meta_data?.job_category || '').toLowerCase()
      const text = `${title} ${description} ${techStack} ${jobCategory}`

      Object.entries(roleKeywords).forEach(([role, keywords]) => {
        if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
          roleCounts[role].recent++
        }
      })
    })

    // 이전 공고 카운트
    previousJobsToAnalyze.forEach(job => {
      const title = (job.title || '').toLowerCase()
      const description = (job.description || '').toLowerCase()
      const techStack = (job.meta_data?.tech_stack || []).join(' ').toLowerCase()
      const jobCategory = (job.meta_data?.job_category || '').toLowerCase()
      const text = `${title} ${description} ${techStack} ${jobCategory}`

      Object.entries(roleKeywords).forEach(([role, keywords]) => {
        if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
          roleCounts[role].previous++
        }
      })
    })

    // 13개 직무 모두 표시 (공고가 없는 직군도 0으로 표시)
    return allRoles.map(role => {
      const counts = roleCounts[role] || { recent: 0, previous: 0 }
      return {
        role,
        count: counts.recent,
        change: counts.previous > 0 
          ? Math.round(((counts.recent - counts.previous) / counts.previous) * 100)
          : counts.recent > 0 ? 100 : 0,
      }
    }).sort((a, b) => {
      // 공고 수가 많은 순으로 정렬, 같으면 직무명 순서 유지
      if (b.count !== a.count) {
        return b.count - a.count
      }
      return allRoles.indexOf(a.role) - allRoles.indexOf(b.role)
    })
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

  // 신입 공채 일정 데이터
  const recruitmentScheduleData = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    // 샘플 신입 공채 일정 데이터
    const schedules = [
      { date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`, company: '네이버', type: '신입공채' as const, title: '2025년 상반기 신입 공채' },
      { date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-20`, company: '카카오', type: '신입공채' as const, title: '신입 개발자 공채' },
      { date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-25`, company: '토스', type: '신입공채' as const },
      { date: `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-05`, company: '라인', type: '신입공채' as const, title: '2025년 신입 공채' },
      { date: `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-10`, company: '우아한형제들', type: '신입공채' as const },
      { date: `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-15`, company: '삼성', type: '신입공채' as const, title: '삼성전자 신입 공채' },
      { date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-18`, company: 'LG CNS', type: '인턴십' as const },
      { date: `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-20`, company: '한화시스템', type: '공개채용' as const },
    ]
    
    return schedules
  }, [])

  // 직무 인재 수급 난이도 지수 데이터
  const jobDifficultyData = useMemo(() => {
    const now = new Date()
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    
    // 최근 공고 데이터
    const recentJobs = jobPostingsData.filter(job => {
      const postedDate = new Date(job.posted_date)
      return postedDate >= lastMonth
    })

    // 작년 동기 공고 데이터
    const lastYearJobs = jobPostingsData.filter(job => {
      const postedDate = new Date(job.posted_date)
      return postedDate >= lastYear && postedDate < new Date(lastYear.getTime() + 30 * 24 * 60 * 60 * 1000)
    })

    // 직무별 키워드 매핑
    const positionKeywords: Record<string, string[]> = {
      'Software Development': ['software', '개발', 'developer', 'engineer', '프로그래밍'],
      'Factory AX Engineering': ['factory', '제조', 'ax', 'simulation', '기구설계'],
      'Solution Development': ['solution', 'erp', 'scm', 'crm', '솔루션'],
      'Cloud/Infra Engineering': ['cloud', 'infra', 'aws', 'kubernetes', 'docker', '인프라'],
      'Architect': ['architect', '아키텍트', '설계'],
      'AI': ['ai', 'ml', '인공지능', '머신러닝', '딥러닝'],
      'Sales': ['sales', '영업', '세일즈'],
      'Consulting': ['consulting', '컨설팅', '컨설턴트'],
      'Domain Expert': ['domain', '도메인', '전문가'],
    }

    // 경쟁사 목록
    const competitors = ['네이버', '카카오', '토스', '라인', '우아한형제들', '삼성', 'LG CNS', '한화시스템']

    return Object.entries(positionKeywords).map(([position, keywords]) => {
      // 유사 공고량 계산
      const similarPostings = recentJobs.filter(job => {
        const text = `${job.title} ${job.description || ''}`.toLowerCase()
        return keywords.some(kw => text.includes(kw.toLowerCase()))
      }).length

      // 경쟁사 공고 비중 계산
      const competitorPostings = similarPostings > 0 
        ? recentJobs.filter(job => {
            const text = `${job.title} ${job.description || ''}`.toLowerCase()
            const isSimilar = keywords.some(kw => text.includes(kw.toLowerCase()))
            if (!isSimilar) return false
            const jobCompany = job.company.replace('(주)', '').trim()
            return competitors.some(comp => jobCompany.includes(comp) || comp.includes(jobCompany))
          }).length
        : 0

      const competitorRatio = similarPostings > 0 
        ? (competitorPostings / similarPostings) * 100 
        : 0

      // 작년 동기 대비 증가율
      const lastYearSimilar = lastYearJobs.filter(job => {
        const text = `${job.title} ${job.description || ''}`.toLowerCase()
        return keywords.some(kw => text.includes(kw.toLowerCase()))
      }).length

      const recentGrowthRate = lastYearSimilar > 0
        ? ((similarPostings - lastYearSimilar) / lastYearSimilar) * 100
        : similarPostings > 0 ? 100 : 0

      // 난이도 지수 계산 (0-100)
      // 유사 공고량이 적을수록 어려움 (30점)
      const postingScore = Math.min(30, (1 - Math.min(similarPostings / 50, 1)) * 30)
      
      // 경쟁사 비중이 높을수록 어려움 (30점)
      const competitorScore = (competitorRatio / 100) * 30
      
      // 증가율이 높을수록 어려움 (20점)
      const growthScore = Math.min(20, (recentGrowthRate / 100) * 20)
      
      // 평균 채용 소요기간 (가상 데이터, 20점)
      const avgHiringDuration = 15 + Math.random() * 20 // 15-35일
      const durationScore = Math.min(20, ((avgHiringDuration - 15) / 20) * 20)

      const difficulty = Math.round(postingScore + competitorScore + growthScore + durationScore)

      // 작년 대비 변화 (min-max 스케일링)
      const lastYearDifficulty = difficulty - Math.round(Math.random() * 20 - 10) // ±10 랜덤
      const yearOverYearChange = difficulty - lastYearDifficulty

      // 인사이트 생성
      const insights: string[] = []
      if (similarPostings < 20) {
        insights.push(`시장에서 유사 공고가 ${similarPostings}개로 매우 적어 인재 확보가 어렵습니다.`)
      }
      if (competitorRatio > 60) {
        insights.push(`경쟁사 공고 비중이 ${competitorRatio.toFixed(1)}%로 높아 경쟁이 치열합니다.`)
      }
      if (recentGrowthRate > 30) {
        insights.push(`최근 ${recentGrowthRate.toFixed(1)}% 증가하여 수요가 급증하고 있습니다.`)
      }
      if (avgHiringDuration > 25) {
        insights.push(`평균 채용 소요기간이 ${Math.round(avgHiringDuration)}일로 길어 채용이 지연되고 있습니다.`)
      }
      if (insights.length === 0) {
        insights.push('현재 시장 상황이 비교적 안정적입니다.')
      }

      // 카테고리 분류
      let category: 'Tech' | 'Biz' | 'BizSupporting' | undefined
      if (['Software Development', 'Factory AX Engineering', 'Solution Development', 'Cloud/Infra Engineering', 'Architect', 'AI'].includes(position)) {
        category = 'Tech'
      } else if (['Sales', 'Consulting', 'Domain Expert'].includes(position)) {
        category = 'Biz'
      }

      return {
        name: position,
        category,
        difficulty: Math.min(100, Math.max(0, difficulty)),
        similarPostings,
        competitorRatio: Math.round(competitorRatio * 10) / 10,
        recentGrowthRate: Math.round(recentGrowthRate * 10) / 10,
        avgHiringDuration: Math.round(avgHiringDuration),
        yearOverYearChange: Math.round(yearOverYearChange * 10) / 10,
        insights,
      }
    }).sort((a, b) => b.difficulty - a.difficulty)
  }, [])

  // 회사별 공고 데이터 (회사별 공고 컴포넌트용)
  const companyJobPostingsData = useMemo(() => {
    const companies = ['네이버', '카카오', '토스', '라인', '우아한형제들', '삼성', 'LG CNS', '한화시스템']
    
    return companies.map(company => {
      const companyJobs = jobPostingsData.filter(job => {
        const jobCompany = job.company.replace('(주)', '').trim()
        return jobCompany.includes(company) || company.includes(jobCompany)
      })
      
      return {
        name: company,
        count: companyJobs.length,
      }
    }).sort((a, b) => b.count - a.count) // 공고 수가 많은 순으로 정렬
  }, [])

  // 회사별 채용 현황 테이블 데이터 (SKAX 직무기술서 기준)
  const companyRecruitmentTableData = useMemo(() => {
    const companies = ['네이버', '카카오', '토스', '라인', '우아한형제들', '삼성', 'LG CNS', '한화시스템']
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // 최근 공고가 없으면 전체 데이터 사용
    const recentJobs = jobPostingsData.filter(job => {
      try {
        const postedDate = new Date(job.posted_date)
        postedDate.setHours(0, 0, 0, 0)
        return postedDate >= lastWeek
      } catch {
        return false
      }
    })

    const previousJobs = jobPostingsData.filter(job => {
      try {
        const postedDate = new Date(job.posted_date)
        postedDate.setHours(0, 0, 0, 0)
        return postedDate >= twoWeeksAgo && postedDate < lastWeek
      } catch {
        return false
      }
    })

    // SKAX 직무기술서 기준 직군 키워드 매핑 (13개 직무)
    const roleKeywords: Record<string, string[]> = {
      'Software Development': ['software', 'development', '개발', '소프트웨어', '프로그래밍', 'programming', 'frontend', 'backend', 'fullstack', '프론트엔드', '백엔드', 'full-stack', 'developer', '개발자', 'react', 'vue', 'angular', 'node', 'java', 'python', 'javascript', 'typescript', 'mobile development'],
      'Factory AX Engineering': ['factory', 'ax', 'engineering', '공장', '제조', '시뮬레이션', 'simulation', '기구설계', '전장', '제어', '자동화', 'automation', 'plc', 'scada', 'mechanical design', 'electrical', 'control'],
      'Solution Development': ['solution', '솔루션', 'erp', 'fcm', 'scm', 'hcm', 'biz', '비즈니스', 'sap', 'oracle', 'erp_fcm', 'erp_scm', 'erp_hcm', 'erp_t&e'],
      'Cloud/Infra Engineering': ['cloud', 'infra', 'infrastructure', '인프라', '클라우드', 'aws', 'azure', 'gcp', 'kubernetes', 'docker', 'devops', '시스템', '네트워크', 'database', '데이터베이스', 'postgresql', 'mysql', 'mongodb', 'redis', 'system/network', 'middleware', 'data center'],
      'Architect': ['architect', '아키텍트', '설계', 'architecture', 'system design', '시스템 설계', 'solution architect', 'software architect', 'data architect', 'infra architect', 'ai architect', 'automation architect'],
      'Project Management': ['project', 'management', 'pm', '프로젝트', '관리', '프로젝트 매니저', '프로젝트 관리', 'pmo', 'program manager', 'application pm', 'infra pm', 'solution pm', 'ai pm', 'automation pm'],
      'Quality Management': ['quality', 'qa', 'qc', '품질', '테스트', 'test', 'testing', 'qa engineer', 'quality assurance', 'quality engineering', 'offshoring service', 'pmo'],
      'AI': ['ai', 'artificial intelligence', '인공지능', 'machine learning', 'ml', '딥러닝', 'deep learning', '데이터', 'data', 'generative ai', '생성형 ai', 'tensorflow', 'pytorch', 'nlp', 'computer vision', 'ai/data development', 'generative ai development', 'physical ai'],
      '정보보호': ['정보보호', '보안', 'security', 'cybersecurity', 'cyber', '보안 진단', 'compliance', 'governance', 'security engineer', '보안 governance', '보안 consulting', '보안 solution'],
      'Sales': ['sales', '영업', '세일즈', '영업사원', 'account', '고객', 'account manager', 'business development', '제1금융', '제2금융', '공공', 'global', '대외', '대내', 'hi-tech', 'process', '통신', '유통', '물류', '서비스', '미디어', '콘텐츠'],
      'Domain Expert': ['domain', 'expert', '도메인', '전문가', '금융', '제조', '공공', 'b2c', 'industry expert', '금융 도메인', '제조 도메인', '공공 도메인', 'b2c 도메인'],
      'Consulting': ['consulting', '컨설팅', '컨설턴트', 'esg', 'she', 'crm', 'scm', 'consultant', 'erp'],
      'Biz. Supporting': ['strategy', 'planning', '전략', '기획', 'hr', '인사', '재무', 'financial', 'management', '경영', 'human resource', 'stakeholder', 'governance', 'public management', 'new biz', 'biz development'],
    }

    return companies.map(company => {
      const companyRecentJobs = recentJobs.length > 0 
        ? recentJobs.filter(job => {
            const jobCompany = job.company.replace('(주)', '').trim()
            return jobCompany.includes(company) || company.includes(jobCompany)
          })
        : jobPostingsData.filter(job => {
            const jobCompany = job.company.replace('(주)', '').trim()
            return jobCompany.includes(company) || company.includes(jobCompany)
          }).slice(0, 50)

      const companyPreviousJobs = previousJobs.filter(job => {
        const jobCompany = job.company.replace('(주)', '').trim()
        return jobCompany.includes(company) || company.includes(jobCompany)
      })

      const counts: Record<string, number> = {
        'Software Development': 0,
        'Factory AX Engineering': 0,
        'Solution Development': 0,
        'Cloud/Infra Engineering': 0,
        'Architect': 0,
        'Project Management': 0,
        'Quality Management': 0,
        'AI': 0,
        '정보보호': 0,
        'Sales': 0,
        'Domain Expert': 0,
        'Consulting': 0,
        'Biz. Supporting': 0,
      }

      companyRecentJobs.forEach(job => {
        const title = (job.title || '').toLowerCase()
        const description = (job.description || '').toLowerCase()
        const techStack = (job.meta_data?.tech_stack || []).join(' ').toLowerCase()
        const jobCategory = (job.meta_data?.job_category || '').toLowerCase()
        const text = `${title} ${description} ${techStack} ${jobCategory}`

        Object.entries(roleKeywords).forEach(([role, keywords]) => {
          if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
            counts[role]++
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
        'Software Development': counts['Software Development'],
        'Factory AX Engineering': counts['Factory AX Engineering'],
        'Solution Development': counts['Solution Development'],
        'Cloud/Infra Engineering': counts['Cloud/Infra Engineering'],
        'Architect': counts['Architect'],
        'Project Management': counts['Project Management'],
        'Quality Management': counts['Quality Management'],
        'AI': counts['AI'],
        '정보보호': counts['정보보호'],
        'Sales': counts['Sales'],
        'Domain Expert': counts['Domain Expert'],
        'Consulting': counts['Consulting'],
        'Biz. Supporting': counts['Biz. Supporting'],
        total,
        change,
        surgingPosition: surgingPosition || '-',
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

  // 포지션별 성장률 (13개 직무 모두 표시)
  const positionGrowthData = useMemo(() => {
    return jobRoleData.map(item => ({
      position: item.role,
      growth: item.change,
    })).sort((a, b) => {
      // 성장률이 높은 순으로 정렬, 같으면 공고 수가 많은 순
      if (b.growth !== a.growth) {
        return b.growth - a.growth
      }
      const aItem = jobRoleData.find(d => d.role === a.position)
      const bItem = jobRoleData.find(d => d.role === b.position)
      return (bItem?.count || 0) - (aItem?.count || 0)
    })
  }, [jobRoleData])


  // HOT 공고 Top 5 - 실제 공고 데이터 사용
  const hotJobsData = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // 최근 7일 이내 공고 필터링
    const recentJobs = jobPostingsData.filter(job => {
      try {
        const postedDate = new Date(job.posted_date)
        postedDate.setHours(0, 0, 0, 0)
        return postedDate >= lastWeek
      } catch {
        return false
      }
    })

    // 최근 공고가 없으면 전체 데이터 사용 (최대 50개)
    const jobsToUse = recentJobs.length > 0 
      ? recentJobs 
      : jobPostingsData.slice(0, 50)

    // 뷰 카운트 시뮬레이션 및 정렬 (실제로는 API에서 가져와야 함)
    return jobsToUse
      .map((job) => ({
        id: job.id,
        rank: 0, // 나중에 설정
        company: job.company.replace('(주)', '').trim(),
        title: job.title,
        salary: job.meta_data?.salary || '협의',
        location: job.location,
        views: Math.floor(Math.random() * 500) + 500,
        experience: job.experience || '',
        techStack: job.meta_data?.tech_stack || [],
        postedDate: job.posted_date,
        expiredDate: job.expired_date,
        description: job.description || '',
        employmentType: job.employment_type || '',
      }))
      .sort((a, b) => b.views - a.views) // 조회수 기준 정렬
      .slice(0, 5)
      .map((job, index) => ({
        ...job,
        rank: index + 1,
      }))
  }, [])


  // timeframe 동기화: jobPostingsTrendTimeframe이 변경되면 companyRecruitmentTimeframe도 동기화
  useEffect(() => {
    if (jobPostingsTrendTimeframe !== companyRecruitmentTimeframe) {
      setCompanyRecruitmentTimeframe(jobPostingsTrendTimeframe)
    }
  }, [jobPostingsTrendTimeframe])

  // 채용 공고 수 추이 API 호출
  useEffect(() => {
    const fetchJobPostingsTrend = async () => {
      setIsLoadingJobPostingsTrend(true)
      setJobPostingsTrendError(null)
      
      try {
        const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/job-postings-trend?timeframe=${jobPostingsTrendTimeframe.toLowerCase()}`
        console.log('=== 채용 공고 수 추이 API 호출 ===')
        console.log('호출 URL:', apiUrl)
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`채용 공고 수 추이 API 에러 (${response.status}):`, errorText)
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0, 200)}`)
        }
        
        const result = await response.json()
        console.log('백엔드에서 받은 채용 공고 수 추이 데이터:', result)
        
        let data: Array<{ period: string; count: number }> = []
        
        if (result.status === 200 && result.code === 'SUCCESS' && result.data) {
          if (Array.isArray(result.data)) {
            data = result.data
          } else if (typeof result.data === 'object' && result.data !== null) {
            const possibleArrayFields = ['trends', 'data', 'items', 'results', 'list']
            for (const field of possibleArrayFields) {
              if (Array.isArray(result.data[field])) {
                data = result.data[field]
                break
              }
            }
          }
        } else if (Array.isArray(result)) {
          data = result
        }
        
        const formattedData = data.map(item => {
          const date = new Date(item.period)
          let formattedPeriod = item.period
          
          if (jobPostingsTrendTimeframe === 'Daily') {
            const month = date.getMonth() + 1
            const day = date.getDate()
            formattedPeriod = `${month}/${day}`
          } else if (jobPostingsTrendTimeframe === 'Weekly') {
            formattedPeriod = item.period
          } else {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            formattedPeriod = `${year}-${month}`
          }
          
          return {
            period: formattedPeriod,
            count: item.count
          }
        })
        
        setJobPostingsTrendApiData(formattedData)
      } catch (error) {
        console.error('Error fetching job postings trend:', error)
        setJobPostingsTrendError(error instanceof Error ? error.message : '데이터를 불러오는 중 오류가 발생했습니다.')
        setJobPostingsTrendApiData([])
      } finally {
        setIsLoadingJobPostingsTrend(false)
      }
    }
    
    fetchJobPostingsTrend()
  }, [jobPostingsTrendTimeframe])

  // 회사별 채용 활동 API 호출
  useEffect(() => {
    const fetchCompanyRecruitment = async () => {
      try {
        setIsLoadingCompanyRecruitment(true)
        setCompanyRecruitmentError(null)
        
        const timeframeMap: Record<string, string> = {
          'Daily': 'daily',
          'Weekly': 'weekly',
          'Monthly': 'monthly'
        }
        const timeframeParam = timeframeMap[companyRecruitmentTimeframe] || 'daily'
        const companyKeywords = '토스,한화,라인,네이버,카카오,LG,현대오토에버,우아한'
        
        const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/companies/recruitment-activity?timeframe=${timeframeParam}&company_keywords=${encodeURIComponent(companyKeywords)}`
        console.log('=== 회사별 채용 활동 API 호출 ===')
        console.log('호출 URL:', apiUrl)
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`회사별 채용 활동 API 에러 (${response.status}):`, errorText)
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0, 200)}`)
        }
        
        const result = await response.json()
        console.log('백엔드에서 받은 회사별 채용 활동 데이터:', result)
        
        if (result.status === 200 && result.code === 'SUCCESS' && result.data) {
          setCompanyRecruitmentApiData({
            companies: result.data.companies || [],
            activities: result.data.activities || []
          })
          // 초기 선택: 전체 선택 (모든 회사)
          if (selectedRecruitmentCompanies.length === 0 && result.data.companies?.length > 0) {
            setSelectedRecruitmentCompanies(result.data.companies.map((c: { key: string }) => c.key))
          }
        } else {
          setCompanyRecruitmentApiData(null)
        }
      } catch (err) {
        console.error('=== 회사별 채용 활동 API 호출 에러 ===')
        console.error('에러:', err)
        setCompanyRecruitmentError(err instanceof Error ? err.message : '회사별 채용 활동을 불러오는 중 오류가 발생했습니다.')
        setCompanyRecruitmentApiData(null)
      } finally {
        setIsLoadingCompanyRecruitment(false)
      }
    }

    fetchCompanyRecruitment()
  }, [companyRecruitmentTimeframe, selectedRecruitmentCompanies.length])

  // 스킬 트렌드 API 호출 (회사 선택 시, 최근 5년 데이터)
  useEffect(() => {
    if (!selectedSkillCompany || selectedSkillCompany === '') {
      console.log('selectedSkillCompany가 비어있어서 API 호출을 건너뜁니다:', selectedSkillCompany)
      setSkillTrendData([])
      return
    }

    console.log('=== 스킬 트렌드 API 호출 시작 ===')
    console.log('선택된 회사:', selectedSkillCompany)

    const fetchSkillTrend = async () => {
      try {
        setIsLoadingSkillTrend(true)
        setSkillTrendError(null)
        
        // 최근 5년 데이터 가져오기
        const years = ['2021', '2022', '2023', '2024', '2025']
        const allTrends: Array<{
          month: string
          [skill: string]: string | number
        }> = []

        for (const year of years) {
          try {
            // API 엔드포인트: skill-trends (복수형) 사용
            const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/companies/${encodeURIComponent(selectedSkillCompany)}/skill-trends?year=${year}&top_n=10`
            console.log(`=== 스킬 트렌드 API 호출 (${year}) ===`)
            console.log('호출 URL:', apiUrl)
            
            const response = await fetch(apiUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              mode: 'cors',
              credentials: 'omit',
            })
            
            if (response.ok) {
              const result = await response.json()
              console.log(`백엔드에서 받은 스킬 트렌드 데이터 (${year}):`, result)
              console.log(`데이터 구조 확인:`, JSON.stringify(result, null, 2))
              
              if (result.status === 200 && result.code === 'SUCCESS' && result.data) {
                const { trends } = result.data
                console.log(`연도 ${year} trends 배열:`, trends)
                console.log(`연도 ${year} trends 개수:`, Array.isArray(trends) ? trends.length : 0)
                
                if (Array.isArray(trends)) {
                  // 데이터 형식 변환
                  const formattedTrends = trends.map((trend: any) => {
                    const data: any = {}
                    
                    // 형식 1: month가 문자열로 직접 들어있는 경우 ("2025.09")
                    if (trend.month && typeof trend.month === 'string') {
                      data.month = trend.month
                      // 나머지 키들을 스킬로 처리
                      Object.keys(trend).forEach(key => {
                        if (key !== 'month' && key !== 'quarter') {
                          data[key] = Number(trend[key] || 0)
                        }
                      })
                    }
                    // 형식 2: month가 객체인 경우 { year: 2025, month: 9 }
                    else if (trend.month && typeof trend.month === 'object') {
                      const monthYear = trend.month.year || year
                      const monthMonth = String(trend.month.month || '').padStart(2, '0')
                      data.month = `${monthYear}.${monthMonth}`
                      // 나머지 키들을 스킬로 처리
                      Object.keys(trend).forEach(key => {
                        if (key !== 'month' && key !== 'quarter' && key !== 'skills') {
                          data[key] = Number(trend[key] || 0)
                        }
                      })
                    }
                    // 형식 3: quarter와 skills 객체가 있는 경우 (실제 API 응답 형식)
                    if (trend.quarter && trend.skills && typeof trend.skills === 'object') {
                      // quarter를 month로 변환 (예: "2025 Q3" -> "2025.07")
                      const quarterMatch = trend.quarter.match(/(\d{4})\s*Q(\d)/)
                      if (quarterMatch) {
                        const qYear = quarterMatch[1]
                        const quarter = parseInt(quarterMatch[2])
                        const month = (quarter - 1) * 3 + 1 // Q1=1월, Q2=4월, Q3=7월, Q4=10월
                        data.month = `${qYear}.${String(month).padStart(2, '0')}`
                      } else {
                        data.month = `${year}.01`
                      }
                      // skills 객체의 키-값을 직접 사용
                      Object.keys(trend.skills).forEach(skill => {
                        data[skill] = Number(trend.skills[skill] || 0)
                      })
                      return data
                    }
                    // 형식 4: skills가 배열인 경우
                    else if (trend.skills && Array.isArray(trend.skills)) {
                      data.month = `${year}.01` // 기본값
                      trend.skills.forEach((skill: any) => {
                        if (skill.skill && skill.count !== undefined) {
                          data[skill.skill] = Number(skill.count || 0)
                        }
                      })
                    }
                    // 형식 5: 이미 올바른 형식인 경우
                    else {
                      // month 필드가 없으면 기본값 설정
                      if (!data.month) {
                        data.month = `${year}.01`
                      }
                      // 나머지 키들을 스킬로 처리
                      Object.keys(trend).forEach(key => {
                        if (key !== 'month' && key !== 'quarter' && key !== 'skills') {
                          data[key] = Number(trend[key] || 0)
                        }
                      })
                    }
                    
                    return data
                  })
                  
                  console.log(`변환된 데이터 (${year}):`, formattedTrends)
                  allTrends.push(...formattedTrends)
                } else {
                  console.warn(`trends가 배열이 아닙니다:`, typeof trends, trends)
                }
              } else {
                console.warn(`API 응답 형식이 예상과 다릅니다:`, result)
              }
            } else {
              console.warn(`API 호출 실패 (${year}):`, response.status, response.statusText)
            }
          } catch (yearErr) {
            console.warn(`연도 ${year} 데이터 가져오기 실패:`, yearErr)
            // 개별 연도 실패는 무시하고 계속 진행
          }
        }

        console.log('=== 스킬 트렌드 데이터 설정 완료 ===')
        console.log('전체 트렌드 데이터 개수:', allTrends.length)
        setSkillTrendData(allTrends)
      } catch (err) {
        console.error('=== 스킬 트렌드 API 호출 에러 ===')
        console.error('에러:', err)
        setSkillTrendError(err instanceof Error ? err.message : '스킬 트렌드를 불러오는 중 오류가 발생했습니다.')
        setSkillTrendData([])
      } finally {
        setIsLoadingSkillTrend(false)
      }
    }

    fetchSkillTrend()
  }, [selectedSkillCompany])

  // 회사별 채용 활동 차트 데이터 변환
  const companyRecruitmentChartData = useMemo(() => {
    if (!companyRecruitmentApiData || !companyRecruitmentApiData.activities) return []
    
    return companyRecruitmentApiData.activities.map(activity => {
      const data: { period: string; [key: string]: string | number } = { period: activity.period }
      companyRecruitmentApiData.companies.forEach(company => {
        data[company.key] = activity.counts[company.key] || 0
      })
      return data
    })
  }, [companyRecruitmentApiData])

  // 회사별 채용 활동 회사 목록 (색상 포함)
  const recruitmentCompanies = useMemo(() => {
    const colors = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#fb7185', '#818cf8', '#f472b6']
    return companyRecruitmentApiData?.companies.map((company, index) => ({
      key: company.key,
      name: company.name,
      color: colors[index % colors.length]
    })) || []
  }, [companyRecruitmentApiData])

  // 스킬 트렌드 회사 기본값 설정 (첫 번째 회사)
  useEffect(() => {
    if (recruitmentCompanies.length > 0) {
      if (!selectedSkillCompany || selectedSkillCompany === '') {
        console.log('스킬 트렌드 회사 기본값 설정:', recruitmentCompanies[0].name)
        setSelectedSkillCompany(recruitmentCompanies[0].name)
      }
    }
  }, [recruitmentCompanies])

  // 직군별 통계 데이터 (주간/월간에 따라 실제 데이터 계산)
  const jobRoleStatisticsData = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    let currentPeriodStart: Date
    let currentPeriodEnd: Date
    let previousPeriodStart: Date
    let previousPeriodEnd: Date
    
    if (jobRoleStatisticsViewMode === 'Weekly') {
      // 이번주: 오늘부터 7일 전까지
      currentPeriodEnd = new Date(now)
      currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      // 저번주: 7일 전부터 14일 전까지
      previousPeriodEnd = new Date(currentPeriodStart)
      previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    } else {
      // 이번달: 이번 달 1일부터 오늘까지
      currentPeriodEnd = new Date(now)
      currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      // 지난달: 지난 달 1일부터 마지막 날까지
      previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    }
    
    // 현재 기간 공고 필터링
    const currentPeriodJobs = jobPostingsData.filter(job => {
      try {
        const postedDate = new Date(job.posted_date)
        postedDate.setHours(0, 0, 0, 0)
        return postedDate >= currentPeriodStart && postedDate <= currentPeriodEnd
      } catch {
        return false
      }
    })
    
    // 이전 기간 공고 필터링
    const previousPeriodJobs = jobPostingsData.filter(job => {
      try {
        const postedDate = new Date(job.posted_date)
        postedDate.setHours(0, 0, 0, 0)
        return postedDate >= previousPeriodStart && postedDate <= previousPeriodEnd
      } catch {
        return false
      }
    })
    
    // 최근 공고가 없으면 전체 데이터 사용 (최대 100개)
    const jobsToAnalyze = currentPeriodJobs.length > 0 ? currentPeriodJobs : jobPostingsData.slice(0, 100)
    const previousJobsToAnalyze = previousPeriodJobs.length > 0 ? previousPeriodJobs : []
    
    // 직군별 통계에 사용되는 모든 직군 목록 (SKAX 직무기술서 기준)
    const allRoles = {
      Tech: [
        'Software Development',
        'Factory AX Engineering',
        'Solution Development',
        'Cloud/Infra Engineering',
        'Architect',
        'Project Management',
        'Quality Management',
        'AI',
        '정보보호',
      ],
      Biz: [
        'Sales',
        'Domain Expert',
        'Consulting',
      ],
      BizSupporting: [
        'Biz. Supporting',
      ],
    }
    
    const rolesForCategory = allRoles[selectedExpertCategory] || []
    
    // 각 직군에 대한 키워드 매핑
    const roleKeywords: Record<string, string[]> = {
      'Software Development': ['software', 'development', '개발', '소프트웨어', '프로그래밍', 'programming', 'frontend', 'backend', 'fullstack', '프론트엔드', '백엔드', 'full-stack', 'developer', '개발자', 'react', 'vue', 'angular', 'node', 'java', 'python', 'javascript', 'typescript'],
      'Factory AX Engineering': ['factory', 'ax', 'engineering', '공장', '제조', '시뮬레이션', 'simulation', '기구설계', '전장', '제어', '자동화', 'automation', 'plc', 'scada'],
      'Solution Development': ['solution', '솔루션', 'erp', 'fcm', 'scm', 'hcm', 'biz', '비즈니스', 'sap', 'oracle'],
      'Cloud/Infra Engineering': ['cloud', 'infra', 'infrastructure', '인프라', '클라우드', 'aws', 'azure', 'gcp', 'kubernetes', 'docker', 'devops', '시스템', '네트워크', 'database', '데이터베이스', 'postgresql', 'mysql', 'mongodb', 'redis'],
      'Architect': ['architect', '아키텍트', '설계', 'architecture', 'system design', '시스템 설계', 'solution architect'],
      'Project Management': ['project', 'management', 'pm', '프로젝트', '관리', '프로젝트 매니저', '프로젝트 관리', 'pmo', 'program manager'],
      'Quality Management': ['quality', 'qa', 'qc', '품질', '테스트', 'test', 'testing', 'qa engineer', 'quality assurance'],
      'AI': ['ai', 'artificial intelligence', '인공지능', 'machine learning', 'ml', '딥러닝', 'deep learning', '데이터', 'data', 'generative ai', '생성형 ai', 'tensorflow', 'pytorch', 'nlp', 'computer vision'],
      '정보보호': ['정보보호', '보안', 'security', 'cybersecurity', 'cyber', '보안 진단', 'compliance', 'governance', 'security engineer'],
      'Sales': ['sales', '영업', '세일즈', '영업사원', 'account', '고객', 'account manager', 'business development'],
      'Domain Expert': ['domain', 'expert', '도메인', '전문가', '금융', '제조', '공공', 'b2c', 'industry expert'],
      'Consulting': ['consulting', '컨설팅', '컨설턴트', 'esg', 'she', 'crm', 'scm', 'consultant'],
      'Biz. Supporting': ['strategy', 'planning', '전략', '기획', 'hr', '인사', '재무', 'financial', 'management', '경영', 'human resources'],
    }
    
    // Industries 매핑
    const roleIndustries: Record<string, string[]> = {
      'Software Development': ['Front-end Development', 'Back-end Development', 'Mobile Development'],
      'Factory AX Engineering': ['Simulation', '기구설계', '전장/제어'],
      'Solution Development': ['ERP_FCM', 'ERP_SCM', 'ERP_HCM', 'ERP_T&E', 'Biz. Solution'],
      'Cloud/Infra Engineering': ['System/Network Engineering', 'Middleware/Database Engineering', 'Data Center Engineering'],
      'Architect': ['Software Architect', 'Data Architect', 'Infra Architect', 'AI Architect', 'Automation Architect'],
      'Project Management': ['Application PM', 'Infra PM', 'Solution PM', 'AI PM', 'Automation PM'],
      'Quality Management': ['PMO', 'Quality Engineering', 'Offshoring Service Professional'],
      'AI': ['AI/Data Development', 'Generative AI Development', 'Physical AI Development'],
      '정보보호': ['보안 Governance / Compliance', '보안 진단/Consulting', '보안 Solution Service'],
      'Sales': ['[금융] 제1금융', '[금융] 제2금융', '[공공/Global] 공공', '[공공/Global] Global', '[제조] 대외', '[제조] 대내 Hi-Tech', '[제조] 대내 Process', '[B2C] 통신', '[B2C] 유통/물류/서비스', '[B2C] 미디어/콘텐츠'],
      'Domain Expert': ['금융 도메인', '제조 도메인', '공공 도메인', 'B2C 도메인'],
      'Consulting': ['ESG', 'SHE', 'CRM', 'SCM', 'ERP', 'AI'],
      'Biz. Supporting': ['Strategy Planning', 'New Biz. Development', 'Financial Management', 'Human Resource Management', 'Stakeholder Management', 'Governance & Public Management'],
    }
    
    const roleCounts: Record<string, { current: number; previous: number }> = {}
    
    // 모든 직군 초기화
    rolesForCategory.forEach(role => {
      roleCounts[role] = { current: 0, previous: 0 }
    })
    
    // 현재 기간 공고 카운트
    jobsToAnalyze.forEach(job => {
      const title = (job.title || '').toLowerCase()
      const description = (job.description || '').toLowerCase()
      const techStack = (job.meta_data?.tech_stack || []).join(' ').toLowerCase()
      const jobCategory = (job.meta_data?.job_category || '').toLowerCase()
      const text = `${title} ${description} ${techStack} ${jobCategory}`
      
      Object.entries(roleKeywords).forEach(([role, keywords]) => {
        if (rolesForCategory.includes(role) && keywords.some(kw => text.includes(kw.toLowerCase()))) {
          roleCounts[role].current++
        }
      })
    })
    
    // 이전 기간 공고 카운트
    previousJobsToAnalyze.forEach(job => {
      const title = (job.title || '').toLowerCase()
      const description = (job.description || '').toLowerCase()
      const techStack = (job.meta_data?.tech_stack || []).join(' ').toLowerCase()
      const jobCategory = (job.meta_data?.job_category || '').toLowerCase()
      const text = `${title} ${description} ${techStack} ${jobCategory}`
      
      Object.entries(roleKeywords).forEach(([role, keywords]) => {
        if (rolesForCategory.includes(role) && keywords.some(kw => text.includes(kw.toLowerCase()))) {
          roleCounts[role].previous++
        }
      })
    })
    
    // 데이터 변환 (모든 직군 포함, 0인 값도 포함)
    return rolesForCategory.map(role => {
      const counts = roleCounts[role] || { current: 0, previous: 0 }
      return {
        name: role,
        value: counts.current,
        previousValue: counts.previous,
        industries: roleIndustries[role] || [],
      }
    })
  }, [selectedExpertCategory, jobRoleStatisticsViewMode])

  // 스킬별 통계 API 상태
  const [skillsApiData, setSkillsApiData] = useState<Array<{
    name: string
    count: number
    percentage: number
    change: number
    relatedSkills: string[]
  }>>([])
  const [isLoadingSkills, setIsLoadingSkills] = useState(false)
  const [skillsError, setSkillsError] = useState<string | null>(null)

  // 기본 스킬 데이터 (API 실패 시 fallback)
  const defaultSkillsData = [
    { name: 'spring', count: 286, percentage: 26.8, change: 3.5, relatedSkills: ['kotlin', 'java', 'maven', 'gradle'] },
    { name: 'react', count: 245, percentage: 22.9, change: 5.2, relatedSkills: ['typescript', 'javascript', 'nextjs'] },
    { name: 'python', count: 198, percentage: 18.5, change: 2.1, relatedSkills: ['django', 'flask', 'fastapi'] },
    { name: 'typescript', count: 187, percentage: 17.5, change: 4.3, relatedSkills: ['react', 'nodejs', 'angular'] },
    { name: 'aws', count: 156, percentage: 14.6, change: 1.8, relatedSkills: ['ec2', 's3', 'lambda'] },
    { name: 'docker', count: 142, percentage: 13.3, change: 2.7, relatedSkills: ['kubernetes', 'jenkins', 'ci/cd'] },
    { name: 'mysql', count: 128, percentage: 12.0, change: 1.5, relatedSkills: ['postgresql', 'mongodb', 'redis'] },
    { name: 'kubernetes', count: 115, percentage: 10.8, change: 3.2, relatedSkills: ['docker', 'helm', 'istio'] },
    { name: 'redis', count: 98, percentage: 9.2, change: 2.4, relatedSkills: ['cache', 'pub/sub', 'session'] },
    { name: 'kafka', count: 87, percentage: 8.1, change: 1.9, relatedSkills: ['streaming', 'event-driven', 'messaging'] },
    { name: 'nodejs', count: 165, percentage: 15.4, change: 2.8, relatedSkills: ['express', 'nestjs', 'graphql'] },
    { name: 'vue', count: 134, percentage: 12.5, change: 1.6, relatedSkills: ['nuxt', 'vuex', 'pinia'] },
    { name: 'java', count: 178, percentage: 16.7, change: 2.3, relatedSkills: ['spring', 'jpa', 'maven'] },
    { name: 'go', count: 112, percentage: 10.5, change: 3.1, relatedSkills: ['gin', 'gorm', 'microservices'] },
    { name: 'kotlin', count: 145, percentage: 13.6, change: 2.9, relatedSkills: ['spring', 'android', 'coroutines'] },
    { name: 'postgresql', count: 98, percentage: 9.2, change: 1.4, relatedSkills: ['sql', 'database', 'orm'] },
    { name: 'mongodb', count: 76, percentage: 7.1, change: 1.2, relatedSkills: ['nosql', 'database', 'aggregation'] },
    { name: 'elasticsearch', count: 89, percentage: 8.3, change: 2.0, relatedSkills: ['search', 'logstash', 'kibana'] },
    { name: 'graphql', count: 67, percentage: 6.3, change: 1.8, relatedSkills: ['apollo', 'relay', 'api'] },
    { name: 'terraform', count: 92, percentage: 8.6, change: 2.5, relatedSkills: ['iac', 'aws', 'infrastructure'] },
  ].sort((a, b) => b.count - a.count)

  // 스킬 통계 API 호출 (회사 필터 적용, 연도 필터 제거 - 최근 5년 전체)
  useEffect(() => {
    const fetchSkillsStatistics = async () => {
      try {
        setIsLoadingSkills(true)
        setSkillsError(null)
        
        const params = new URLSearchParams()
        // 연도 필터 제거 - 최근 5년 전체 데이터
        const startDate = '2021-01-01'
        const endDate = '2025-12-31'
        params.append('start_date', startDate)
        params.append('end_date', endDate)
        
        // 회사 필터 추가 (스킬 클라우드용)
        if (selectedSkillCloudCompany !== '전체') {
          params.append('company', selectedSkillCloudCompany)
        }
        
        params.append('limit', '20')
        
        const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/skills/statistics?${params.toString()}`
        console.log('=== 스킬 통계 API 호출 ===')
        console.log('호출 URL:', apiUrl)
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('백엔드에서 받은 스킬 통계 데이터:', result)
        
        if ((result.status === 0 || result.status === 200) && result.code === 'SUCCESS' && result.data) {
          const { skills } = result.data
          if (Array.isArray(skills)) {
            setSkillsApiData(skills.sort((a: any, b: any) => b.count - a.count))
          } else {
            setSkillsApiData(defaultSkillsData)
          }
        } else {
          setSkillsApiData(defaultSkillsData)
        }
      } catch (err) {
        console.error('=== 스킬 통계 API 호출 에러 ===')
        console.error('에러:', err)
        setSkillsError(err instanceof Error ? err.message : '스킬 통계를 불러오는 중 오류가 발생했습니다.')
        setSkillsApiData(defaultSkillsData)
      } finally {
        setIsLoadingSkills(false)
      }
    }

    fetchSkillsStatistics()
  }, [selectedSkillCloudCompany])

  // 스킬 클라우드에 사용할 데이터 (선택된 회사에 따라 필터링)
  const skillCloudData = useMemo(() => {
    return skillsApiData.length > 0 ? skillsApiData : defaultSkillsData
  }, [skillsApiData])

  // 현재 시간 표시 (클라이언트에서만 업데이트)
  const [currentTime, setCurrentTime] = useState('')
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const date = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      const ampm = parseInt(hours) < 12 ? '오전' : '오후'
      const displayHours = parseInt(hours) % 12 || 12
      
      setCurrentTime(`${year}. ${month}. ${date}. ${ampm} ${displayHours}:${minutes}:${seconds}`)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {hasNewJobs && (
        <NotificationToast newJobs={newJobs} onClose={clearNewJobs} />
      )}

      <div className="max-w-[1920px] mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600">{currentTime || '로딩 중...'} | 실시간 모니터링</p>
          </div>
        </div>

        {/* 메인 3열 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* 왼쪽 컬럼 (3열) */}
          <div className="lg:col-span-3 space-y-6">
            <DarkDashboardCard title="회사별 공고">
              <CompanyJobPostings companies={companyJobPostingsData} />
            </DarkDashboardCard>

            <DarkDashboardCard title="직군별 채용 공고">
              <JobRoleBarChart data={jobRoleData} />
            </DarkDashboardCard>
          </div>

          {/* 중앙 컬럼 (6열) */}
          <div className="lg:col-span-6 space-y-6">
            <DarkDashboardCard title="신입 공채 일정" className="h-[450px]">
              <RecruitmentCalendar events={recruitmentScheduleData} />
            </DarkDashboardCard>

            <DarkDashboardCard title="회사별 금주 채용 현황">
              <CompanyRecruitmentTable data={companyRecruitmentTableData} />
            </DarkDashboardCard>
          </div>

          {/* 오른쪽 컬럼 (3열) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">🔥 이번주 HOT 공고 Top 5</h2>
                <Link 
                  href="/jobs"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  전체 보기
                  <span className="text-xs">→</span>
                </Link>
              </div>
              <div className="text-gray-700">
                <HotJobsList jobs={hotJobsData} />
              </div>
            </div>
          </div>
        </div>

        {/* 하단 2열 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 직군별 통계 */}
          <DarkDashboardCard title="직군별 통계">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setJobRoleStatisticsViewMode('Weekly')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    jobRoleStatisticsViewMode === 'Weekly'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  주간별
                </button>
                <button
                  onClick={() => setJobRoleStatisticsViewMode('Monthly')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    jobRoleStatisticsViewMode === 'Monthly'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  월간별
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedExpertCategory('Tech')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    selectedExpertCategory === 'Tech'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Tech
                </button>
                <button
                  onClick={() => setSelectedExpertCategory('Biz')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    selectedExpertCategory === 'Biz'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Biz
                </button>
                <button
                  onClick={() => setSelectedExpertCategory('BizSupporting')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    selectedExpertCategory === 'BizSupporting'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Biz Supporting
                </button>
              </div>
            </div>
            <JobRoleStatisticsChart
              data={jobRoleStatisticsData}
              selectedRole={selectedJobRole}
              onRoleClick={setSelectedJobRole}
              viewMode={jobRoleStatisticsViewMode}
              isLoading={false}
              error={null}
            />
          </DarkDashboardCard>

          <DarkDashboardCard title="직무 인재 수급 난이도 지수">
            <JobDifficultyGauges 
              data={jobDifficultyData}
            />
          </DarkDashboardCard>
        </div>


        {/* API 연동 차트 섹션 */}
        <div className="space-y-6">
          {/* 통합 차트: 일간 채용 공고 수 추이 + 회사별 채용 활동 */}
          <DarkDashboardCard title="일간 채용 공고 수 추이 및 주요 회사별 채용 활동">
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setJobPostingsTrendTimeframe('Daily')
                    setCompanyRecruitmentTimeframe('Daily')
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    jobPostingsTrendTimeframe === 'Daily'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  일간
                </button>
                <button
                  onClick={() => {
                    setJobPostingsTrendTimeframe('Weekly')
                    setCompanyRecruitmentTimeframe('Weekly')
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    jobPostingsTrendTimeframe === 'Weekly'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  주간
                </button>
                <button
                  onClick={() => {
                    setJobPostingsTrendTimeframe('Monthly')
                    setCompanyRecruitmentTimeframe('Monthly')
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    jobPostingsTrendTimeframe === 'Monthly'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  월간
                </button>
              </div>
              {recruitmentCompanies.length > 0 && (
                <div className="flex flex-wrap gap-2 ml-auto items-center">
                  <button
                    onClick={() => {
                      // 전체 선택: 모든 회사 선택
                      setSelectedRecruitmentCompanies(recruitmentCompanies.map(c => c.key))
                    }}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      selectedRecruitmentCompanies.length === recruitmentCompanies.length || selectedRecruitmentCompanies.length === 0
                        ? 'bg-gray-900/20 text-gray-700 border border-gray-900/50'
                        : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    전체
                  </button>
                  {recruitmentCompanies.map((company) => {
                    const isSelected = selectedRecruitmentCompanies.length === 1 && selectedRecruitmentCompanies.includes(company.key)
                    return (
                      <button
                        key={company.key}
                        onClick={() => {
                          if (isSelected) {
                            // 이미 선택된 회사를 다시 클릭하면 전체 선택으로 변경
                            setSelectedRecruitmentCompanies(recruitmentCompanies.map(c => c.key))
                          } else {
                            // 단일 회사 선택: 다른 회사들은 자동 해제
                            setSelectedRecruitmentCompanies([company.key])
                          }
                        }}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          isSelected
                            ? 'bg-gray-900/20 text-gray-700 border border-gray-900/50'
                            : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {company.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            <CombinedTrendChart
              jobPostingsTrendData={jobPostingsTrendApiData}
              companyRecruitmentData={companyRecruitmentChartData}
              companies={recruitmentCompanies}
              selectedCompanies={selectedRecruitmentCompanies}
              timeframe={jobPostingsTrendTimeframe}
              isLoading={isLoadingJobPostingsTrend || isLoadingCompanyRecruitment}
              error={jobPostingsTrendError || companyRecruitmentError}
            />
          </DarkDashboardCard>

          {/* 선택된 회사 인사이트 (단일 회사 선택 시에만 표시) */}
          {selectedRecruitmentCompanies.length === 1 && (() => {
            const selectedCompany = recruitmentCompanies.find(c => c.key === selectedRecruitmentCompanies[0])
            if (!selectedCompany) return null

            // 선택된 회사의 채용 활동 데이터 필터링
            const singleCompanyRecruitmentData = companyRecruitmentChartData.map(item => ({
              period: item.period,
              count: Number(item[selectedCompany.key] || 0),
            }))

            return (
              <DarkDashboardCard title={`${selectedCompany.name} 인사이트`}>
                <CompanyInsightView
                  companyKey={selectedCompany.key}
                  companyName={selectedCompany.name}
                  companyColor={selectedCompany.color}
                  timeframe={jobPostingsTrendTimeframe}
                  recruitmentData={singleCompanyRecruitmentData}
                  totalTrendData={jobPostingsTrendApiData}
                  isLoading={isLoadingJobPostingsTrend || isLoadingCompanyRecruitment}
                  error={jobPostingsTrendError || companyRecruitmentError}
                />
              </DarkDashboardCard>
            )
          })()}


          {/* 상위 스킬 연도별 트렌드 및 스킬 클라우드 */}
          <DarkDashboardCard title="상위 스킬 연도별 트렌드 및 스킬 클라우드 (최근 5년)">
            <div className="mb-4 flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">스킬 트렌드 회사:</span>
                <select
                  value={selectedSkillCompany}
                  onChange={(e) => {
                    console.log('회사 선택 변경:', e.target.value)
                    setSelectedSkillCompany(e.target.value)
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {recruitmentCompanies.length === 0 ? (
                    <option value="">회사 로딩 중...</option>
                  ) : (
                    recruitmentCompanies.map((company) => (
                      <option key={company.key} value={company.name}>{company.name}</option>
                    ))
                  )}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">스킬 클라우드 회사:</span>
                <select
                  value={selectedSkillCloudCompany}
                  onChange={(e) => setSelectedSkillCloudCompany(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="전체">전체</option>
                  {recruitmentCompanies.map((company) => (
                    <option key={company.key} value={company.name}>{company.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <SkillTrendAndCloud
              skillTrendData={skillTrendData}
              skillCloudData={skillCloudData}
              selectedCompany={selectedSkillCompany}
              selectedCloudCompany={selectedSkillCloudCompany}
              selectedYear="2021-2025"
              isLoadingTrend={isLoadingSkillTrend}
              isLoadingCloud={isLoadingSkills}
              trendError={skillTrendError}
              cloudError={skillsError}
            />
          </DarkDashboardCard>

        </div>
      </div>

      <Footer />
    </div>
  )
}

