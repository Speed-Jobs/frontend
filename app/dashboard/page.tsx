'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import JobPostingCard from '@/components/JobPostingCard'
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
} from 'recharts'

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState('Daily')
  const [selectedJobCategory, setSelectedJobCategory] = useState('all')
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('all')
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)

  const jobCategories = ['모든 직군', '개발', '기획', '디자인', '마케팅', '데이터', 'AI/ML', '인프라', '보안']
  const employmentTypes = ['모든 고용형태', '정규직', '계약직', '인턴', '프리랜서', '파트타임']

  // 필터링된 공고 목록
  const filteredJobPostings = jobPostingsData.filter((job) => {
    const jobCategoryMatch =
      selectedJobCategory === 'all' || job.meta_data?.job_category === selectedJobCategory
    const employmentTypeMatch =
      selectedEmploymentType === 'all' || job.employment_type === selectedEmploymentType
    return jobCategoryMatch && employmentTypeMatch
  })

  const handleJobCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedJobCategory(e.target.value === '모든 직군' ? 'all' : e.target.value)
  }

  const handleEmploymentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmploymentType(e.target.value === '모든 고용형태' ? 'all' : e.target.value)
  }

  const trendData = [
    { name: 'backend', value: 120 },
    { name: 'frontend', value: 90 },
    { name: 'ai', value: 60 },
    { name: 'data', value: 40 },
  ]

  const jobStatsData = [
    { name: 'Backend', value: 40, color: '#4B5563' },
    { name: 'Frontend', value: 30, color: '#6B7280' },
    { name: 'AI', value: 20, color: '#9CA3AF' },
    { name: 'Data', value: 10, color: '#D1D5DB' },
  ]

  const techData = [
    { name: 'Spring', value: 55 },
    { name: 'Node.js', value: 50 },
    { name: 'Django', value: 45 },
    { name: 'FastAPI', value: 35 },
    { name: 'K8s', value: 28 },
  ]


  const newsItems = [
    {
      source: '이데일리 - 2025.09.25 - 네이버뉴스',
      headline:
        'LG CNS 신학협력 신입사원 채 투트랙으로 AX 인재 확보 박자',
      snippet:
        'LG CNS가 클라우드, 스마트팩토리, ERP, 아키텍처 등 다양한 분야의 신입사원을 모집하고 있으며, 5월부터 활동을 시작했습니다.',
      image: '🏢',
    },
    {
      source: 'EBN - 1주 전',
      headline: '삼성, 하반기 공채 GSAT 실시 5년간 6만명 채용 통해 미래 대...',
      snippet:
        'GSAT(Global Samsung Aptitude Test)가 26일 실시되어 종합적 사고력과 문제 해결 능력을 평가하여 미래 인재를 선발합니다.',
      image: '👨‍💼',
    },
  ]

  // 스킬셋 데이터 (인기순으로 정렬, count는 공고 수) - 더 다양하게 추가
  const skillsData = [
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
  ].sort((a, b) => b.count - a.count) // 인기순 정렬

  // 스킬 크기 계산 (count 값에 비례하여 크기 조정)
  const getSkillSize = (count: number, index: number, maxCount: number) => {
    // count에 비례한 크기 계산 (0.3 ~ 1.0 범위)
    const sizeRatio = 0.3 + (count / maxCount) * 0.7
    
    // 크기 단계별로 분류하되, count에 비례하여 조정
    if (index === 0) {
      // 가장 인기 있는 스킬 (최대 크기)
      return { 
        width: 'w-36', 
        height: 'h-16', 
        text: 'text-lg', 
        padding: 'px-8 py-3', 
        radius: 80 
      }
    }
    
    // count에 따라 크기 결정
    if (count >= maxCount * 0.8) {
      return { width: 'w-32', height: 'h-14', text: 'text-base', padding: 'px-7 py-3', radius: 70 }
    } else if (count >= maxCount * 0.6) {
      return { width: 'w-28', height: 'h-12', text: 'text-sm', padding: 'px-6 py-2', radius: 64 }
    } else if (count >= maxCount * 0.4) {
      return { width: 'w-24', height: 'h-10', text: 'text-xs', padding: 'px-5 py-2', radius: 56 }
    } else if (count >= maxCount * 0.25) {
      return { width: 'w-20', height: 'h-9', text: 'text-xs', padding: 'px-4 py-1.5', radius: 48 }
    } else {
      return { width: 'w-18', height: 'h-8', text: 'text-xs', padding: 'px-3 py-1', radius: 40 }
    }
  }

  // 겹침 방지를 위한 정확한 위치 계산
  const calculateSkillPositions = () => {
    const positions: Array<{ x: number; y: number }> = []
    const sizes: Array<{ radius: number }> = []
    const maxCount = skillsData[0]?.count || 1
    
    // 모든 스킬의 크기 계산
    for (let i = 0; i < skillsData.length; i++) {
      const size = getSkillSize(skillsData[i].count, i, maxCount)
      sizes.push({ radius: size.radius })
    }
    
    // 중앙 스킬 (index 0)
    positions[0] = { x: 0, y: 0 }
    
    // 레이어별 기본 설정
    const layers = [
      { baseRadius: 130, count: 5 },   // 첫 번째 레이어: 5개
      { baseRadius: 200, count: 7 },   // 두 번째 레이어: 7개
      { baseRadius: 260, count: 8 },   // 세 번째 레이어: 8개
    ]
    
    // 각 스킬의 위치 계산
    for (let index = 1; index < skillsData.length; index++) {
      let currentIndex = index - 1
      let layerIndex = 0
      let layerStartIndex = 0
      
      // 현재 스킬이 어느 레이어에 속하는지 찾기
      for (let i = 0; i < layers.length; i++) {
        if (currentIndex < layerStartIndex + layers[i].count) {
          layerIndex = i
          break
        }
        layerStartIndex += layers[i].count
      }
      
      const layer = layers[layerIndex]
      const positionInLayer = currentIndex - layerStartIndex
      const angleStep = (360 / layer.count) * (Math.PI / 180)
      let baseAngle = positionInLayer * angleStep
      
      const currentSize = sizes[index]
      let radius = layer.baseRadius
      let attempts = 0
      const maxAttempts = 50
      
      // 겹침 방지: 이전 스킬들과 충분한 거리 확보
      while (attempts < maxAttempts) {
        let hasOverlap = false
        const x = Math.cos(baseAngle) * radius
        const y = Math.sin(baseAngle) * radius
        
        // 이전 스킬들과의 거리 확인
        for (let i = 0; i < index; i++) {
          const prevPos = positions[i]
          const prevSize = sizes[i]
          
          const dx = x - prevPos.x
          const dy = y - prevPos.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // 최소 필요한 거리 (두 스킬의 반지름 합 + 여유 공간 25px)
          const minDistance = currentSize.radius + prevSize.radius + 25
          
          if (distance < minDistance) {
            hasOverlap = true
            // 거리가 부족하면 반지름 증가
            radius = Math.max(radius, Math.sqrt(prevPos.x ** 2 + prevPos.y ** 2) + minDistance)
            break
          }
        }
        
        if (!hasOverlap) {
          // 컨테이너 경계 확인 (최대 반지름 280px)
          if (radius <= 280) {
            positions[index] = { x: Math.round(x), y: Math.round(y) }
            break
          } else {
            // 경계를 벗어나면 각도 조정
            baseAngle += angleStep * 0.1
            radius = layer.baseRadius
          }
        }
        
        attempts++
      }
      
      // 최대 시도 횟수 초과 시 강제 배치
      if (attempts >= maxAttempts) {
        const x = Math.cos(baseAngle) * radius
        const y = Math.sin(baseAngle) * radius
        positions[index] = { x: Math.round(x), y: Math.round(y) }
      }
    }
    
    return positions
  }

  // 모든 위치를 한 번에 계산
  const skillPositions = calculateSkillPositions()

  // 개별 스킬 위치 가져오기
  const getSkillPosition = (index: number) => {
    return skillPositions[index] || { x: 0, y: 0 }
  }

  // 선택된 스킬의 데이터
  const selectedSkillData = skillsData.find(s => s.name === selectedSkill) || skillsData[0]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
        {/* Competitor Job Postings Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            경쟁사 공고
          </h2>
          <div className="flex gap-4 mb-6">
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
          <div className="space-y-4">
            {filteredJobPostings.length > 0 ? (
              filteredJobPostings.map((job) => (
                <JobPostingCard key={job.id} job={job} showDetail={true} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">선택한 조건에 맞는 공고가 없습니다.</p>
              </div>
            )}
          </div>
        </section>

        {/* Trend Comparison Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            트렌드 비교
          </h2>
          <div className="flex gap-2 mb-6">
            {['Daily', 'Weekly', 'Monthly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeframe(tab)}
                className={`px-4 py-2 rounded text-sm transition-all ${
                  timeframe === tab
                    ? 'bg-sk-red text-white border border-sk-red'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { title: 'Company Trends', value: '120', change: '+10%' },
              { title: 'Job Trends', value: '150', change: '+15%' },
              { title: 'Tech Trends', value: '180', change: '+20%' },
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {item.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {item.value}
                </p>
                <p className="text-sm text-sk-red mb-4">
                  Last 14 Days {item.change}
                </p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={trendData}>
                    <Bar dataKey="value" fill="#6b7280" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </section>

        {/* Job Statistics Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            직군별 통계
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={jobStatsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) =>
                      percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={100}
                    fill="#6b7280"
                    dataKey="value"
                  >
                    {jobStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#6b7280', '#9ca3af', '#4b5563', '#d1d5db'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1f2937' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={techData} layout="vertical">
                  <XAxis type="number" domain={[0, 60]} tick={{ fill: '#6b7280' }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1f2937' }} />
                  <Bar dataKey="value" fill="#6b7280" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Recruitment Related News Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            채용 관련 뉴스
          </h2>
          <div className="space-y-4">
            {newsItems.map((news, index) => (
              <div
                key={index}
                className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm flex items-start gap-4"
              >
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-2">{news.source}</p>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {news.headline}
                  </h3>
                  <p className="text-sm text-gray-600">{news.snippet}</p>
                </div>
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-4xl">
                  {news.image}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skill Statistics Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            스킬별 통계
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 bg-gradient-to-br from-gray-50 via-white to-gray-50 p-12 border border-gray-200 rounded-2xl shadow-lg relative overflow-hidden">
              {/* 배경 장식 */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sk-red rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-sk-red rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative h-[600px] flex items-center justify-center">
                {skillsData.map((skill, index) => {
                  const maxCount = skillsData[0]?.count || 1
                  const size = getSkillSize(skill.count, index, maxCount)
                  const position = getSkillPosition(index)
                  const isMain = index === 0
                  const isSelected = selectedSkill === skill.name
                  
                  return (
                    <button
                      key={skill.name}
                      onClick={() => setSelectedSkill(skill.name)}
                      className={`absolute ${size.padding} ${size.height} rounded-full flex items-center justify-center ${size.text} font-bold transition-all duration-500 cursor-pointer whitespace-nowrap ${
                        isMain ? 'z-30' : 'z-10'
                      } ${
                        index % 3 === 0 ? 'animate-float-1' : index % 3 === 1 ? 'animate-float-2' : 'animate-float-3'
                      } ${
                        isMain
                          ? 'bg-sk-red text-white shadow-2xl hover:shadow-sk-red/50 hover:scale-110 border-2 border-sk-red/30'
                          : isSelected
                          ? 'bg-gray-600 text-white shadow-xl hover:scale-110 border-2 border-gray-700'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-400 hover:scale-105 shadow-lg'
                      }`}
                      style={{
                        left: `calc(50% + ${position.x}px)`,
                        top: `calc(50% + ${position.y}px)`,
                        transform: `translate(-50%, -50%)`,
                        animationDelay: `${index * 0.1}s`,
                        minWidth: size.width,
                      }}
                    >
                      {skill.name}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase">
                {selectedSkillData.name}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Total count</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedSkillData.count}건</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Percentage</p>
                  <p className="text-xl font-bold text-gray-900">{selectedSkillData.percentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-sk-red">+{selectedSkillData.change}%</p>
                </div>
                <div className="pt-4">
                  <p className="text-xs text-gray-500 mb-2">Related skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkillData.relatedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

