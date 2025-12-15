'use client'

import { useState, useEffect, useRef } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface JobPostingsTrendChartProps {
  data?: Array<{
    period: string
    count: number
  }> // 선택적: 외부에서 데이터를 전달할 수도 있음
  isLoading?: boolean
  error?: string | null
  timeframe?: 'Daily' | 'Weekly' | 'Monthly' // 데이터 페칭 시 사용
  companyKeyword?: string // 회사 필터링 (선택적)
}

export default function JobPostingsTrendChart({ 
  data: externalData, 
  isLoading: externalIsLoading, 
  error: externalError,
  timeframe = 'Weekly',
  companyKeyword
}: JobPostingsTrendChartProps) {
  const [data, setData] = useState<Array<{ period: string; count: number }>>(externalData || [])
  const [isLoading, setIsLoading] = useState(!externalData && !externalIsLoading)
  const [error, setError] = useState<string | null>(externalError || null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // 외부에서 data가 전달되면 사용하고, 없으면 자체적으로 데이터 페칭
  useEffect(() => {
    // 외부에서 data가 전달되면 사용
    if (externalData && externalData.length > 0) {
      setData(externalData)
      setIsLoading(false)
      setError(null)
      return
    }
    
    // 외부에서 isLoading이나 error가 명시적으로 전달되면 사용
    if (externalIsLoading !== undefined) {
      setIsLoading(externalIsLoading)
    }
    if (externalError !== undefined) {
      setError(externalError)
    }
    
    // 자체적으로 데이터 페칭
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const timeframeMap: Record<string, string> = {
          'Daily': 'daily',
          'Weekly': 'weekly',
          'Monthly': 'monthly'
        }
        const timeframeParam = timeframeMap[timeframe] || 'weekly'
        
        let apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/job-postings-trend?timeframe=${timeframeParam}&include_insight=false`
        
        if (companyKeyword) {
          apiUrl += `&company_keyword=${encodeURIComponent(companyKeyword)}`
        }
        
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
        
        if (result.status === 200 && result.code === 'SUCCESS' && result.data) {
          const trends = result.data.trends || result.data.selected_company?.trends || []
          setData(trends)
        } else {
          throw new Error(result.message || '데이터를 불러오는데 실패했습니다.')
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : '데이터를 불러오는 중 오류가 발생했습니다.')
        setData([])
      } finally {
        setIsLoading(false)
      }
    }, 300)
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [externalData, externalIsLoading, externalError, timeframe, companyKeyword])
  
  // 외부에서 전달된 props 우선 사용
  const displayData = externalData || data
  const displayIsLoading = externalIsLoading !== undefined ? externalIsLoading : isLoading
  const displayError = externalError !== undefined ? externalError : error
  // 데이터가 있으면 로딩 중이어도 표시, 데이터가 없고 로딩 중일 때만 로딩 표시
  if (displayIsLoading && (!displayData || displayData.length === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-gray-400">데이터를 불러오는 중...</div>
      </div>
    )
  }

  if (displayError) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-red-400 text-sm">{displayError}</div>
      </div>
    )
  }

  if (!displayData || displayData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-gray-400 text-sm">데이터가 없습니다.</div>
      </div>
    )
  }

  const maxCount = Math.max(...displayData.map(item => item.count), 1)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={displayData}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
        <XAxis 
          dataKey="period" 
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          domain={[0, maxCount * 1.1]}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1a2d47', 
            border: '1px solid #2a3f5f', 
            borderRadius: '8px', 
            color: '#e5e7eb',
            fontSize: '13px'
          }}
          formatter={(value: number) => [`${value}건`, '공고 수']}
        />
        <Area 
          type="monotone" 
          dataKey="count" 
          stroke="#60a5fa" 
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorCount)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}











