'use client'

import { useState, useMemo } from 'react'

const ITEMS_PER_PAGE = 3

interface DifficultyData {
  name: string
  category?: string // 'Tech' | 'Biz' | 'BizSupporting'
  difficulty: number // 0-100
  similarPostings: number // 유사 공고량
  competitorRatio: number // 경쟁사 공고 비중 (%)
  recentGrowthRate: number // 최근 증가율 (%)
  avgHiringDuration?: number // 평균 채용 소요기간 (일)
  yearOverYearChange?: number // 작년 대비 변화
  insights: string[] // 왜 어려운지 설명
}

interface JobDifficultyIndexProps {
  data: DifficultyData[]
  viewMode?: 'all' | 'category' | 'position' // 전체, 직군별, 직무별
}

export default function JobDifficultyIndex({ data, viewMode = 'all' }: JobDifficultyIndexProps) {
  const [selectedViewMode, setSelectedViewMode] = useState<'all' | 'category' | 'position'>(viewMode)
  const [selectedCategory, setSelectedCategory] = useState<string>('전체')
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // 카테고리 목록 추출
  const categories = useMemo(() => {
    const cats = new Set<string>()
    data.forEach(item => {
      if (item.category) cats.add(item.category)
    })
    return Array.from(cats)
  }, [data])

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    let filtered = [...data]

    if (selectedViewMode === 'category' && selectedCategory !== '전체') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    if (selectedViewMode === 'position' && selectedPosition) {
      filtered = filtered.filter(item => item.name === selectedPosition)
    }

    return filtered.sort((a, b) => b.difficulty - a.difficulty)
  }, [data, selectedViewMode, selectedCategory, selectedPosition])

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // 필터 변경 시 첫 페이지로 리셋
  const handleViewModeChange = (mode: 'all' | 'category' | 'position') => {
    setSelectedViewMode(mode)
    setSelectedCategory('전체')
    setSelectedPosition(null)
    setCurrentPage(1)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setSelectedPosition(null)
    setCurrentPage(1)
  }

  // 난이도에 따른 색상 계산
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 80) return 'from-red-600 to-red-500'
    if (difficulty >= 60) return 'from-orange-500 to-orange-400'
    if (difficulty >= 40) return 'from-yellow-500 to-yellow-400'
    return 'from-green-500 to-green-400'
  }

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty >= 80) return '매우 어려움'
    if (difficulty >= 60) return '어려움'
    if (difficulty >= 40) return '보통'
    return '쉬움'
  }

  const getDifficultyTextColor = (difficulty: number) => {
    if (difficulty >= 80) return 'text-red-400'
    if (difficulty >= 60) return 'text-orange-400'
    if (difficulty >= 40) return 'text-yellow-400'
    return 'text-green-400'
  }

  // 선택된 항목의 상세 정보
  const selectedItem = selectedPosition 
    ? filteredData.find(item => item.name === selectedPosition)
    : null

  return (
    <div className="space-y-4">
      {/* 뷰 모드 선택 */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleViewModeChange('all')}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
            selectedViewMode === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => handleViewModeChange('category')}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
            selectedViewMode === 'category'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          직군별
        </button>
        <button
          onClick={() => handleViewModeChange('position')}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
            selectedViewMode === 'position'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          직무별
        </button>
      </div>

      {/* 직군별 필터 */}
      {selectedViewMode === 'category' && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleCategoryChange('전체')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              selectedCategory === '전체'
                ? 'bg-gray-900/20 text-gray-700 border border-gray-900/50'
                : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'
            }`}
          >
            전체
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                selectedCategory === cat
                  ? 'bg-gray-900/20 text-gray-700 border border-gray-900/50'
                  : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* 난이도 지수 리스트 */}
      <div className="space-y-3">
        {paginatedData.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              if (selectedViewMode === 'position') {
                setSelectedPosition(selectedPosition === item.name ? null : item.name)
              }
            }}
            className={`p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-400 transition-all ${
              selectedViewMode === 'position' ? 'cursor-pointer' : ''
            } ${selectedPosition === item.name ? 'border-gray-900 bg-gray-50' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-gray-900 font-semibold">{item.name}</h4>
                  {item.category && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {item.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>유사 공고: {item.similarPostings}개</span>
                  <span>경쟁사 비중: {item.competitorRatio.toFixed(1)}%</span>
                  <span className={item.recentGrowthRate > 0 ? 'text-red-400' : 'text-green-400'}>
                    증가율: {item.recentGrowthRate > 0 ? '+' : ''}{item.recentGrowthRate.toFixed(1)}%
                  </span>
                  {item.avgHiringDuration && (
                    <span>평균 소요: {item.avgHiringDuration}일</span>
                  )}
                </div>
              </div>
              <div className="text-right ml-4">
                <div className={`text-2xl font-bold ${getDifficultyTextColor(item.difficulty)}`}>
                  {item.difficulty}
                </div>
                <div className="text-xs text-gray-400">{getDifficultyLabel(item.difficulty)}</div>
                {item.yearOverYearChange !== undefined && (
                  <div className={`text-xs mt-1 ${
                    item.yearOverYearChange > 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    작년 대비 {item.yearOverYearChange > 0 ? '+' : ''}{item.yearOverYearChange.toFixed(1)}p
                  </div>
                )}
              </div>
            </div>

            {/* 난이도 게이지 */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
              <div
                className={`h-full bg-gradient-to-r ${getDifficultyColor(item.difficulty)} rounded-full transition-all duration-500`}
                style={{ width: `${item.difficulty}%` }}
              />
            </div>

            {/* 인사이트 카드 (선택된 경우 또는 항상 표시) */}
            {(selectedPosition === item.name || selectedViewMode !== 'position') && item.insights.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-600 mb-2">난이도 분석</div>
                <ul className="space-y-1">
                  {item.insights.map((insight, idx) => (
                    <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                      <span className="text-gray-700 mt-0.5">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-gray-500 text-sm text-center py-8">
          데이터가 없습니다.
        </div>
      )}

      {/* 페이지네이션 */}
      {filteredData.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            {startIndex + 1}-{Math.min(endIndex, filteredData.length)} / {filteredData.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              이전
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2 py-1.5 text-xs rounded transition-colors ${
                    currentPage === page
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

