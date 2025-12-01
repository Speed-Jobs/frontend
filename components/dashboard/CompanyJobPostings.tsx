'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import CompanyLogo from '@/components/CompanyLogo'

interface CompanyJobPostingsProps {
  companies?: Array<{
    name: string
    count: number
    logo?: string
  }>
}

export default function CompanyJobPostings({ companies }: CompanyJobPostingsProps) {
  const router = useRouter()

  // 기본 회사 목록 (companies prop이 없을 경우)
  const defaultCompanies = useMemo(() => {
    return [
      { name: '네이버', count: 0 },
      { name: '카카오', count: 0 },
      { name: '토스', count: 0 },
      { name: '라인', count: 0 },
      { name: '우아한형제들', count: 0 },
      { name: '삼성', count: 0 },
      { name: 'LG CNS', count: 0 },
      { name: '한화시스템', count: 0 },
    ]
  }, [])

  const displayCompanies = companies && companies.length > 0 ? companies : defaultCompanies

  const handleCompanyClick = (companyName: string) => {
    // 회사명을 URL 파라미터로 인코딩하여 회사 페이지로 이동
    const encodedCompany = encodeURIComponent(companyName)
    router.push(`/companies?company=${encodedCompany}`)
  }

  if (!displayCompanies || displayCompanies.length === 0) {
    return (
      <div className="text-gray-400 text-sm text-center py-8">
        회사 데이터가 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {displayCompanies.map((company, index) => {
        const companyName = company?.name || ''
        if (!companyName) return null
        
        return (
          <button
            key={index}
            onClick={() => handleCompanyClick(companyName)}
            className="w-full flex items-center justify-between p-3 bg-[#0f1e35] rounded-lg border border-[#2a3f5f] hover:border-blue-500/50 hover:bg-[#1a2d47] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-[#1a2d47] rounded-lg border border-[#2a3f5f] group-hover:border-blue-500/50 transition-colors overflow-hidden">
                <CompanyLogo name={companyName} className="w-8 h-8" />
              </div>
              <div className="text-left">
                <div className="text-gray-200 font-medium group-hover:text-white transition-colors">
                  {companyName}
                </div>
                {company.count > 0 && (
                  <div className="text-xs text-gray-400">
                    공고 {company.count}개
                  </div>
                )}
              </div>
            </div>
            <div className="text-gray-400 group-hover:text-blue-400 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        )
      })}
    </div>
  )
}

