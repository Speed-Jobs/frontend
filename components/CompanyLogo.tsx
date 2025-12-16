'use client'

import { useState } from 'react'

interface CompanyLogoProps {
  name: string
  className?: string
}

// 회사명을 ID로 매핑 (API에서 로고를 가져오기 위한 매핑)
const COMPANY_ID_MAP: Record<string, number> = {
  'Coupang': 1,
  '쿠팡': 1,
  '한화시스템/ICT': 2,
  '한화시스템': 2,
  '한화 ICT': 2,
  '한화손해보험': 3,
  '현대오토에버': 4,
  '현대 오토에버': 4,
  '카카오': 5,
  'kakao': 5,
  'Kakao': 5,
  'LG CNS': 6,
  'LGCNS': 6,
  'LINE': 10,
  '라인': 10,
  'NAVER Cloud': 28,
  '네이버 클라우드': 28,
  'NAVER': 29,
  '네이버': 29,
  'NAVER WEBTOON': 30,
  '네이버 웹툰': 30,
  'SK주식회사(AX)': 31,
  'SK주식회사': 31,
  'SK AX': 31,
  'SK C&C': 31,
  'SK주식회사 C&C': 31,
  'SK 주식회사 C&C': 31,
  'SK주식회사C&C': 31,
  '토스증권': 32,
  '토스': 34,
  'Toss': 34,
  '토스뱅크': 35,
  '토스인슈어런스': 36,
  '토스씨엑스': 37,
  '토스플레이스': 39,
  '토스페이먼츠': 41,
  '우아한형제들': 47,
  '배민': 47,
  '배달의민족': 47,
}

// 회사명 정규화 함수 (부분 매칭 지원)
function normalizeCompanyNameForId(companyName: string): string {
  const normalized = companyName.replace(/\(주\)/g, '').replace(/\s+/g, ' ').trim()
  
  // 직접 매칭
  if (COMPANY_ID_MAP[normalized]) {
    return normalized
  }
  
  // 부분 매칭 (예: "한화시스템/ICT"에서 "한화시스템" 찾기)
  for (const [key, id] of Object.entries(COMPANY_ID_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return key
    }
  }
  
  return normalized
}

// 회사명으로 ID 찾기
function getCompanyId(companyName: string): number | null {
  const normalizedName = normalizeCompanyNameForId(companyName)
  return COMPANY_ID_MAP[normalizedName] || null
}

// API 로고 URL 생성
function getCompanyLogoUrl(companyId: number): string {
  return `https://speedjobs-spring.skala25a.project.skala-ai.com/api/v1/companies/${companyId}/logo?useWebp=false`
}

export default function CompanyLogo({ name, className = '' }: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  // name이 없거나 undefined인 경우 처리
  if (!name || typeof name !== 'string') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-600">?</span>
        </div>
      </div>
    )
  }

  // 회사명 정규화 (공백 제거, (주) 제거 등)
  const normalizedName = name.replace(/\(주\)/g, '').replace(/\s+/g, ' ').trim()

  // 회사 ID 찾기
  const companyId = getCompanyId(name)
  
  // API 로고 URL이 있으면 우선 사용
  const apiLogoUrl = companyId ? getCompanyLogoUrl(companyId) : null

  // 회사명을 파일명으로 매핑 (폴백용)
  const companyNameMap: Record<string, string> = {
    'SK AX': 'sk-ax',
    'SK주식회사 C&C': 'sk-ax',
    'SK 주식회사 C&C': 'sk-ax',
    'SK C&C': 'sk-ax',
    'SK주식회사C&C': 'sk-ax',
    '삼성SDS': 'samsung-sds',
    'SAMSUNG': 'samsung-sds',
    '삼성전자': 'samsung-electronics',
    '삼성': 'samsung-electronics',
    'LGCNS': 'lg-cns',
    'LG': 'lg-cns',
    'LG전자': 'lg-electronics',
    '현대 오토에버': 'hyundai-autoever',
    'HYUNDAI': 'hyundai-autoever',
    '현대자동차': 'hyundai-motor',
    '한화 시스템': 'hanwha-system',
    'KT': 'kt',
    '네이버': 'naver',
    'NAVER': 'naver',
    '카카오': 'kakao',
    'kakao': 'kakao',
    '라인': 'line',
    'LINE': 'line',
    '쿠팡': 'coupang',
    '배민': 'baemin',
    '토스': 'toss',
    'KPMG': 'kpmg',
    '당근': 'daangn',
    '당근마켓': 'daangn',
    'Daangn': 'daangn',
  }

  // 폴백 URL (로컬 이미지가 없을 때 사용)
  const fallbackUrls: Record<string, string> = {
    '삼성SDS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/200px-Samsung_Logo.svg.png',
    'LGCNS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/LG_symbol.svg/200px-LG_symbol.svg.png',
    '현대 오토에버': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Hyundai_Motor_Company_logo.svg/200px-Hyundai_Motor_Company_logo.svg.png',
    '네이버': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Naver_Logotype.png/200px-Naver_Logotype.png',
    '카카오': 'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/5a3a3b1d0160000001.png',
    '당근': 'https://www.daangn.com/favicon-192x192.png',
  }

  // 로컬 이미지 경로 생성 (정규화된 이름으로 먼저 시도, 그 다음 원본 이름)
  const logoFileName = companyNameMap[normalizedName] || companyNameMap[name] || normalizedName.toLowerCase().replace(/\s+/g, '-')
  const localImagePath = `/logos/${logoFileName}.png`
  const fallbackUrl = fallbackUrls[normalizedName] || fallbackUrls[name] || ''

  const handleError = () => {
    // API URL이 실패하면 로컬 이미지로 폴백
    if (apiLogoUrl && !useFallback) {
      setUseFallback(true)
    } else if (!useFallback && fallbackUrl) {
      setUseFallback(true)
    } else {
      setImgError(true)
    }
  }

  // 로컬 이미지가 없고 폴백도 없으면 텍스트 표시
  if (imgError) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-600">{name}</span>
        </div>
      </div>
    )
  }

  // 현재 사용할 이미지 경로 결정 (우선순위: API URL > 로컬 이미지 > 폴백 URL)
  let imageSrc: string
  if (apiLogoUrl && !useFallback) {
    imageSrc = apiLogoUrl
  } else if (useFallback && fallbackUrl) {
    imageSrc = fallbackUrl
  } else {
    imageSrc = localImagePath
  }

  // 이미지 사용 (img 태그 사용)
  return (
    <div className={`relative w-full h-full ${className}`}>
      <img
        src={imageSrc}
        alt={`${name} 로고`}
        className="w-full h-full object-contain"
        onError={handleError}
        loading="lazy"
      />
    </div>
  )
}

