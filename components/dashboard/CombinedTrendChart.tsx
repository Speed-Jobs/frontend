'use client'

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useMemo } from 'react'

interface CombinedTrendChartProps {
  // 일간 채용 공고 수 추이 데이터
  jobPostingsTrendData: Array<{
    period: string
    count: number
  }>
  // 회사별 채용 활동 데이터
  companyRecruitmentData: Array<{
    period: string
    [key: string]: string | number
  }>
  companies: Array<{
    key: string
    name: string
    color: string
  }>
  selectedCompanies: string[]
  timeframe: 'Daily' | 'Weekly' | 'Monthly'
  isLoading?: boolean
  error?: string | null
}

export default function CombinedTrendChart({
  jobPostingsTrendData,
  companyRecruitmentData,
  companies,
  selectedCompanies,
  timeframe,
  isLoading,
  error,
}: CombinedTrendChartProps) {
  // period 형식 정규화 함수 (예: "2025-01-15" -> "1/15", "11/1" -> "11/1")
  const normalizePeriod = (period: string): string => {
    // 이미 "M/D" 형식인 경우 그대로 반환
    if (/^\d{1,2}\/\d{1,2}$/.test(period)) {
      return period
    }
    // ISO 형식이나 다른 날짜 형식인 경우 변환 시도
    try {
      const date = new Date(period)
      if (!isNaN(date.getTime())) {
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${month}/${day}`
      }
    } catch (e) {
      // 변환 실패 시 원본 반환
    }
    return period
  }

  // 두 데이터를 period 기준으로 병합
  const mergedData = useMemo(() => {
    if (!jobPostingsTrendData || jobPostingsTrendData.length === 0) {
      const result = (companyRecruitmentData || []).map(item => ({
        period: normalizePeriod(item.period),
        ...Object.fromEntries(
          Object.entries(item).filter(([key]) => key !== 'period')
        ),
      }))
      return result
    }
    if (!companyRecruitmentData || companyRecruitmentData.length === 0) {
      const result = jobPostingsTrendData.map(item => ({
        period: normalizePeriod(item.period),
        totalCount: item.count,
      }))
      return result
    }

    // period를 키로 하는 맵 생성 (정규화된 period 사용)
    const dataMap = new Map<string, any>()

    // 일간 채용 공고 수 데이터 추가
    jobPostingsTrendData.forEach(item => {
      const normalizedPeriod = normalizePeriod(item.period)
      dataMap.set(normalizedPeriod, {
        period: normalizedPeriod,
        totalCount: item.count,
      })
    })

    // 회사별 채용 활동 데이터 병합
    companyRecruitmentData.forEach(item => {
      const normalizedPeriod = normalizePeriod(item.period)
      const existing = dataMap.get(normalizedPeriod)
      if (existing) {
        // 기존 데이터에 회사별 데이터 추가
        Object.keys(item).forEach(key => {
          if (key !== 'period') {
            existing[key] = item[key]
          }
        })
      } else {
        // 새로운 period인 경우
        const newItem: any = { period: normalizedPeriod }
        Object.keys(item).forEach(key => {
          if (key !== 'period') {
            newItem[key] = item[key]
          }
        })
        dataMap.set(normalizedPeriod, newItem)
      }
    })

    // period 순서대로 정렬 (날짜 파싱 시도)
    const sorted = Array.from(dataMap.values()).sort((a, b) => {
      // "M/D" 형식 파싱
      const parseMD = (period: string): number => {
        const match = period.match(/^(\d{1,2})\/(\d{1,2})$/)
        if (match) {
          const month = parseInt(match[1])
          const day = parseInt(match[2])
          return month * 100 + day // 간단한 정렬을 위한 값
        }
        // 다른 형식인 경우 Date 파싱 시도
        const date = new Date(period)
        if (!isNaN(date.getTime())) {
          return date.getTime()
        }
        return 0
      }
      
      return parseMD(a.period) - parseMD(b.period)
    })
    
    return sorted
  }, [jobPostingsTrendData, companyRecruitmentData])

  // 최대값 계산 (Y축 범위 설정용)
  const maxValue = useMemo(() => {
    const values: number[] = []
    
    // 전체 채용 공고 수
    if (mergedData.length > 0) {
      mergedData.forEach(item => {
        if (item.totalCount !== undefined) {
          values.push(item.totalCount)
        }
      })
    }
    
    // 회사 이름 정규화 함수 (key 생성용)
    const normalizeCompanyName = (name: string): string => {
      return name.toLowerCase().replace(/\s+/g, '').replace(/[\/\(\)]/g, '').trim()
    }
    
    // 회사 key 생성 함수 (normalizeCompanyName 기반)
    const generateCompanyKey = (name: string): string => {
      return normalizeCompanyName(name)
    }
    
    // 선택된 회사들의 채용 활동 수 (selectedCompanies는 회사 이름 배열)
    if (selectedCompanies.length > 0) {
      mergedData.forEach(item => {
        selectedCompanies.forEach(companyName => {
          // 회사 이름을 key로 변환하여 매칭 (normalizeCompanyName 기반)
          const companyKey = generateCompanyKey(companyName)
          const value = Number(item[companyKey] || 0)
          if (value > 0) {
            values.push(value)
          }
        })
      })
    }
    
    return Math.max(...values, 1)
  }, [mergedData, selectedCompanies])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-gray-500">데이터를 불러오는 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <div className="text-red-500 text-sm mb-2">데이터를 불러오는 중 오류가 발생했습니다.</div>
        <div className="text-xs text-gray-500">{error}</div>
        {error.includes('500') && (
          <div className="text-xs text-gray-400 mt-2">
            서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </div>
        )}
      </div>
    )
  }

  if (!mergedData || mergedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <div className="text-gray-500 text-sm mb-2">데이터가 없습니다.</div>
        <div className="text-xs text-gray-400">
          {!jobPostingsTrendData || jobPostingsTrendData.length === 0 ? '전체 공고 수 데이터가 없습니다. ' : ''}
          {!companyRecruitmentData || companyRecruitmentData.length === 0 ? '회사별 채용 활동 데이터가 없습니다.' : ''}
        </div>
        {error && (
          <div className="text-xs text-red-400 mt-2">에러: {error}</div>
        )}
      </div>
    )
  }

  // 단일 회사 선택 시 선택된 회사 정보 가져오기
  const selectedCompany = selectedCompanies.length === 1 
    ? companies.find(c => c.name === selectedCompanies[0])
    : null

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={mergedData}>
        <defs>
          <linearGradient id="colorTotalCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
          </linearGradient>
          {/* 단일 회사 선택 시 사용할 gradient */}
          {selectedCompany && (
            <linearGradient id={`colorSelectedCompany-${selectedCompany.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={selectedCompany.color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={selectedCompany.color} stopOpacity={0}/>
            </linearGradient>
          )}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="period" 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          domain={[0, maxValue * 1.1]}
          label={{ value: '공고 수 (건)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#ffffff', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            color: '#374151',
            fontSize: '13px'
          }}
          formatter={(value: number, name: string) => {
            if (name === 'totalCount') {
              // 단일 회사 선택 시에는 선택된 회사명 표시
              if (selectedCompanies.length === 1) {
                const selectedCompany = companies.find(c => c.name === selectedCompanies[0])
                return [`${value}건`, selectedCompany ? selectedCompany.name : '공고 수']
              }
              return [`${value}건`, '전체 공고 수']
            }
            const company = companies.find(c => c.key === name)
            return [`${value}건`, company ? company.name : name]
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#6b7280' }}
          iconType="line"
          formatter={(value: string) => {
            if (value === 'totalCount') {
              // 단일 회사 선택 시에는 선택된 회사명 표시
              if (selectedCompanies.length === 1) {
                const selectedCompany = companies.find(c => c.name === selectedCompanies[0])
                return selectedCompany ? selectedCompany.name : '공고 수'
              }
              return '전체 공고 수'
            }
            const company = companies.find(c => c.key === value)
            return company ? company.name : value
          }}
        />
        {/* 전체 채용 공고 수 - Area 차트 (단일 회사 선택 시에는 숨김) */}
        {jobPostingsTrendData && jobPostingsTrendData.length > 0 && selectedCompanies.length !== 1 && (
          <Area
            type="monotone"
            dataKey="totalCount"
            stroke="#93c5fd"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#colorTotalCount)"
            name="전체 공고 수"
          />
        )}
        {/* 단일 회사 선택 시: 선택된 회사의 공고 수를 Area 차트로 표시 */}
        {jobPostingsTrendData && jobPostingsTrendData.length > 0 && selectedCompanies.length === 1 && selectedCompany && (
          <Area
            type="monotone"
            dataKey="totalCount"
            stroke={selectedCompany.color}
            strokeWidth={2}
            fillOpacity={0.3}
            fill={`url(#colorSelectedCompany-${selectedCompany.key})`}
            name={selectedCompanies[0]}
          />
        )}
        {/* 회사별 채용 활동 - Line 차트 (단일 회사 선택 시에는 숨김, Area 차트로 표시) */}
        {selectedCompanies.length !== 1 && companies.map((company) => {
          // selectedCompanies는 회사 이름 배열이므로 name으로 비교
          if (selectedCompanies.includes(company.name)) {
            return (
              <Line 
                key={company.key}
                type="monotone" 
                dataKey={company.key} 
                stroke={company.color} 
                strokeWidth={3} 
                dot={{ r: 4, fill: company.color }}
                activeDot={{ r: 6 }}
                name={company.name}
              />
            )
          }
          return null
        })}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

