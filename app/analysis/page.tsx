'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function AnalysisPage() {
  const [selectedJobRole, setSelectedJobRole] = useState('백엔드')

  // 공고 발행 통계 데이터
  const companyStats = [
    { rank: 1, company: 'SK', count: 168, change: 8.2, isIncrease: true },
    { rank: 2, company: '토스', count: 152, change: 5.1, isIncrease: true },
    { rank: 3, company: '카카오', count: 145, change: -2.3, isIncrease: false },
    { rank: 4, company: '네이버', count: 138, change: 3.7, isIncrease: true },
    { rank: 5, company: '구글', count: 125, change: -3.2, isIncrease: false },
  ]

  const maxCount = Math.max(...companyStats.map((c) => c.count))

  // 공고 발행 트렌드 데이터 (라인 차트)
  const postingTrendData = [
    { month: '2023.05', value: 420 },
    { month: '2023.06', value: 480 },
    { month: '2023.07', value: 520 },
    { month: '2023.08', value: 580 },
    { month: '2023.09', value: 650 },
    { month: '2023.10', value: 720 },
  ]

  // 분기별 트렌드 데이터 (바 차트)
  const quarterlyTrendData = [
    { quarter: '2023.Q1', value: 1050 },
    { quarter: '2023.Q2', value: 1120 },
    { quarter: '2023.Q3', value: 1080 },
    { quarter: '2023.Q4', value: 750 },
  ]

  // 직무별 기술 데이터
  const jobRoleTechs: Record<string, { used: Array<{ name: string; percentage: number }>; unused: string[] }> = {
    백엔드: {
      used: [
        { name: 'spring', percentage: 83.9 },
        { name: 'kotlin', percentage: 27.6 },
        { name: 'mysql', percentage: 23.0 },
        { name: 'aws', percentage: 20.0 },
        { name: 'redis', percentage: 18.4 },
        { name: 'kafka', percentage: 16.1 },
      ],
      unused: ['go', 'rust', 'airflow', 'spark'],
    },
    프론트엔드: {
      used: [
        { name: 'react', percentage: 89.1 },
        { name: 'typescript', percentage: 60.9 },
        { name: 'nodejs', percentage: 28.7 },
        { name: 'docker', percentage: 23.0 },
        { name: 'kubernetes', percentage: 19.5 },
      ],
      unused: ['angular', 'vue', 'svelte'],
    },
    데이터: {
      used: [
        { name: 'java', percentage: 68.0 },
        { name: 'spring', percentage: 40.0 },
        { name: 'python', percentage: 40.0 },
        { name: 'tensorflow', percentage: 32.0 },
        { name: 'pytorch', percentage: 28.0 },
      ],
      unused: ['scala', 'r'],
    },
  }

  const currentTechs = jobRoleTechs[selectedJobRole] || jobRoleTechs['백엔드']

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
        {/* 공고 발행 통계 Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">공고 발행 통계</h2>
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-6">회사별 공고 수</p>
          <div className="space-y-3">
            {companyStats.map((stat) => (
              <div
                key={stat.rank}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-medium w-6">{stat.rank}</span>
                    <span className="font-semibold text-gray-900">{stat.company}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900 font-bold">{stat.count}개</span>
                    <div className="flex items-center gap-1">
                      {stat.isIncrease ? (
                        <svg
                          className="w-4 h-4 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.isIncrease ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        전주 대비 {Math.abs(stat.change)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-sk-red h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stat.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 트렌드 분석 Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">트렌드 분석</h2>
          <div className="grid grid-cols-2 gap-6">
            {/* 공고 발행 트렌드 (라인 차트) */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                공고 발행 트렌드
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={postingTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
                  <YAxis domain={[100, 800]} tick={{ fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#E60012"
                    strokeWidth={2}
                    dot={{ fill: '#E60012', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 분기별 트렌드 (바 차트) */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                분기별 트렌드
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={quarterlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="quarter" tick={{ fill: '#6b7280' }} />
                  <YAxis domain={[200, 1400]} tick={{ fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#E60012" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* 직무별 분석 Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">직무별 분석</h2>
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">회사 기술을 검색하세요</p>

          {/* 직무 태그 */}
          <div className="flex gap-3 mb-6">
            {['백엔드', '프론트엔드', '데이터'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedJobRole(role)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedJobRole === role
                    ? 'bg-sk-red text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* 사용된 기술 */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                사용된 기술
              </h3>
              <div className="space-y-3">
                {currentTechs.used.map((tech, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-sk-red rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {tech.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{tech.name}</span>
                    </div>
                    <span className="text-gray-600 font-semibold">
                      {tech.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 사용되지 않은 기술 */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                사용되지 않은 기술
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentTechs.unused.map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700"
                  >
                    <span>{tech}</span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 새로운 기술 추가 */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              새로운 기술을 추가
            </label>
            <input
              type="text"
              placeholder="prompt_explore (추가 예정: 2023.10.23)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sk-red focus:border-transparent"
              disabled
            />
          </div>
        </section>

        {/* 타이핑 분석 Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">타이핑 분석</h2>
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  security_whitehat
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">최초 등록일:</span>
                    <span className="ml-2 text-gray-900 font-medium">2023.10.30</span>
                  </div>
                  <div>
                    <span className="text-gray-600">최근 수정일:</span>
                    <span className="ml-2 text-gray-900 font-medium">2023.11.10</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-300">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="font-semibold text-gray-900">사용자 등록</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">두나무:</span>
                    <span className="text-gray-900 font-medium">2023.11.15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">네이버:</span>
                    <span className="text-gray-900 font-medium">2023.11.18</span>
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
