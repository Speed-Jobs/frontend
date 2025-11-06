'use client'

import { useState } from 'react'
import Header from '@/components/Header'
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

  const jobPostings = [
    {
      title: 'AI Engineer',
      deadline: 'D-7',
      category: 'Machine Learning / 산업',
      company: '토스',
    },
    {
      title: 'AI Engineer',
      deadline: 'D-7',
      category: 'Machine Learning / 산업',
      company: '토스',
    },
    {
      title: 'AI Engineer',
      deadline: 'D-7',
      category: 'Machine Learning / 산업',
      company: '토스',
    },
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

  const skills = [
    { name: 'spring', size: 'large' },
    { name: 'aws', size: 'small' },
    { name: 'typescript', size: 'small' },
    { name: 'python', size: 'small' },
    { name: 'react', size: 'small' },
    { name: 'redis', size: 'small' },
    { name: 'docker', size: 'small' },
    { name: 'kafka', size: 'small' },
    { name: 'mysql', size: 'small' },
  ]

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
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option>모든 직군</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option>모든 고용형태</option>
            </select>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            14개의 공고를 확인할 수 있어요.
          </p>
          <div className="space-y-3">
            {jobPostings.map((job, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.category}</p>
                  </div>
                  <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded">
                    {job.deadline}
                  </span>
                </div>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-900">
                  {job.company}
                </button>
              </div>
            ))}
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
                className={`px-4 py-2 rounded text-sm ${
                  timeframe === tab
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100'
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
              <div key={index} className="bg-white p-6 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {item.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {item.value}
                </p>
                <p className="text-sm text-green-600 mb-4">
                  Last 14 Days {item.change}
                </p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={trendData}>
                    <Bar dataKey="value" fill="#4B5563" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
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
            <div className="bg-white p-6 border border-gray-200 rounded-lg">
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
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {jobStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 border border-gray-200 rounded-lg">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={techData} layout="vertical">
                  <XAxis type="number" domain={[0, 60]} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4B5563" />
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
                className="bg-white p-6 border border-gray-200 rounded-lg flex items-start gap-4"
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
            <div className="col-span-2 bg-white p-8 border border-gray-200 rounded-lg">
              <div className="relative h-64 flex items-center justify-center">
                {/* Central large skill */}
                <div className="absolute w-32 h-20 bg-gray-800 text-white rounded-full flex items-center justify-center text-base font-semibold z-10">
                  spring
                </div>
                {/* Surrounding small skills */}
                <div className="absolute top-8 left-20 w-16 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-medium">
                  aws
                </div>
                <div className="absolute top-16 right-16 w-20 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-medium">
                  typescript
                </div>
                <div className="absolute bottom-20 right-20 w-16 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-medium">
                  python
                </div>
                <div className="absolute bottom-16 left-16 w-16 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-medium">
                  react
                </div>
                <div className="absolute top-12 left-8 w-16 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-medium">
                  redis
                </div>
                <div className="absolute bottom-12 left-24 w-16 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-medium">
                  docker
                </div>
                <div className="absolute top-24 right-8 w-16 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-medium">
                  kafka
                </div>
                <div className="absolute bottom-24 right-12 w-16 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-medium">
                  mysql
                </div>
              </div>
            </div>
            <div className="bg-white p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                SPRING
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Total count</p>
                  <p className="text-2xl font-bold text-gray-900">286건</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Percentage</p>
                  <p className="text-xl font-bold text-gray-900">26.8%</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">+3.5%</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">+8.9%</p>
                </div>
                <div className="pt-4">
                  <p className="text-xs text-gray-500 mb-2">Related skills</p>
                  <div className="flex flex-wrap gap-2">
                    {['kotlin', 'java', 'another'].map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
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

