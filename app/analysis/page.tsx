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
  ResponsiveContainer,
} from 'recharts'

export default function AnalysisPage() {
  const [selectedJobRole, setSelectedJobRole] = useState('백엔드')

  // 공고 발행 통계 데이터 (이미지에 맞게 수정)
  const companyStats = [
    { rank: 1, company: 'SK', count: 168, change: 6.2, isIncrease: true },
    { rank: 2, company: '토스', count: 152, change: 3.6, isIncrease: true },
    { rank: 3, company: '카카오', count: 145, change: 4.1, isIncrease: true },
    { rank: 4, company: '네이버', count: 138, change: 6.7, isIncrease: true },
    { rank: 5, company: '쿠팡', count: 125, change: 3.2, isIncrease: false },
  ]

  const maxCount = Math.max(...companyStats.map((c) => c.count))

  // 공고 트렌드 데이터 (이미지에 맞게 수정)
  const postingTrendData = [
    { month: '2023/10', value: 420 },
    { month: '2023/11', value: 480 },
    { month: '2023/12', value: 520 },
    { month: '2024/01', value: 580 },
    { month: '2024/02', value: 650 },
    { month: '2024/03', value: 680 },
  ]

  // 분기별 트렌드 데이터 (이미지에 맞게 수정)
  const quarterlyTrendData = [
    { quarter: '2023 Q4', value: 850 },
    { quarter: '2024 Q1', value: 920 },
    { quarter: '2024 Q2', value: 980 },
    { quarter: '2024 Q3', value: 1050 },
    { quarter: '2024 Q4', value: 1100 },
  ]

  // 직무별 기술 데이터 (이미지에 맞게 수정)
  const jobRoleTechs: Record<string, { 
    used: Array<{ name: string; count: number; percentage: number }>; 
    unused: string[];
    representative?: string;
  }> = {
    전체: {
      used: [],
      unused: [],
    },
    백엔드: {
      used: [
        { name: 'spring', count: 41, percentage: 40.0 },
        { name: 'kotlin', count: 40, percentage: 21.6 },
        { name: 'mysql', count: 33, percentage: 20.0 },
        { name: 'aws', count: 12, percentage: 14.2 },
        { name: 'redis', count: 10, percentage: 10.6 },
        { name: 'kafka', count: 7, percentage: 10.6 },
      ],
      unused: ['go', 'rust', 'airflow', 'kubernetes'],
      representative: 'backend_engineer (총 50건, 2023.10.24)',
    },
    프론트엔드: {
      used: [
        { name: 'react', count: 41, percentage: 33.3 },
        { name: 'typescript', count: 32, percentage: 40.0 },
        { name: 'nodejs', count: 36, percentage: 29.0 },
        { name: 'docker', count: 40, percentage: 25.0 },
        { name: 'kubernetes', count: 20, percentage: 20.0 },
      ],
      unused: ['angular', 'vue', 'nextjs'],
    },
    데이터: {
      used: [
        { name: 'java', count: 40, percentage: 40.0 },
        { name: 'spring', count: 30, percentage: 30.0 },
        { name: 'python', count: 20, percentage: 20.0 },
        { name: 'tensorflow', count: 10, percentage: 10.0 },
        { name: 'pytorch', count: 20, percentage: 10.0 },
      ],
      unused: ['scala', 'spark'],
      representative: 'data_engineer (총 50건, 2023.10.24)',
    },
  }

  const currentTechs = jobRoleTechs[selectedJobRole] || jobRoleTechs['백엔드']

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
        {/* 공고 발행 통계 Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">공고 발행 통계</h2>
          <p className="text-gray-600 mb-6">회사별 공고 수</p>
          <div className="space-y-3">
            {companyStats.map((stat) => (
              <div
                key={stat.rank}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-medium w-6">{stat.rank}</span>
                    <span className="font-semibold text-gray-900">{stat.company}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900 font-bold">{stat.count}건</span>
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
                        전월 대비 {Math.abs(stat.change)}%
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
            {/* 공고 트렌드 (라인 차트) */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                공고 트렌드
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={postingTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis domain={[0, 700]} tick={{ fill: '#6b7280', fontSize: 12 }} />
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
                    stroke="#C91A2A"
                    strokeWidth={2}
                    dot={{ fill: '#C91A2A', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 분기별 트렌드 (바 차트) */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                분기별 트렌드
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={quarterlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="quarter" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis domain={[0, 1200]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#6b7280" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* 직무별 분석 Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">직무별 분석</h2>
          <p className="text-gray-600 mb-4">필요 기술을 분석했어요...</p>

          {/* 직무 필터 버튼 */}
          <div className="flex gap-3 mb-6">
            {['전체', '백엔드', '프론트엔드', '데이터'].map((role) => (
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

          {selectedJobRole !== '전체' && currentTechs.used.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-6 mb-4">
                {/* 사용된 기술 */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    사용된 기술
                  </h3>
                  <div className="space-y-3">
                    {currentTechs.used.map((tech, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{tech.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{tech.count}건</span>
                            <span className="text-sm font-semibold text-gray-900">
                              ({tech.percentage}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-sk-red h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${tech.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 제외된 기술 */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    제외된 기술
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentTechs.unused.map((tech, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700"
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

              {/* 대표적 직무 표시 */}
              {currentTechs.representative && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                  <p className="text-sm text-gray-600">
                    ※ 대표적 직무{' '}
                    <span className="font-medium text-gray-900">
                      {currentTechs.representative}
                    </span>
                  </p>
                </div>
              )}
            </>
          )}

          {selectedJobRole === '전체' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-gray-600 text-center">직무를 선택해주세요</p>
            </div>
          )}
        </section>

        {/* 기업별 분석 Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">기업별 분석</h2>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      회사명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      시작일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      종료일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      사용자 매칭
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      security_whitehat
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      2023.10.30
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      2023.11.30
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        완료
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked
                          readOnly
                          className="w-4 h-4 text-sk-red border-gray-300 rounded focus:ring-sk-red"
                        />
                        <div className="text-sm text-gray-600">
                          <div>두나무 (2023.11.15)</div>
                          <div>네이버 (2023.11.08)</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 지원자 분석 Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">지원자 분석</h2>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <div className="text-center text-gray-500">
              <p>지원자 분석 데이터가 없습니다.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
