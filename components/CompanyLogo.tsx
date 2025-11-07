'use client'

import { useState } from 'react'

interface CompanyLogoProps {
  name: string
  className?: string
}

export default function CompanyLogo({ name, className = '' }: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  // 회사명 정규화 (공백 제거, (주) 제거 등)
  const normalizedName = name.replace(/\(주\)/g, '').replace(/\s+/g, ' ').trim()

  // 회사명을 파일명으로 매핑
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
    if (!useFallback && fallbackUrl) {
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

  // 현재 사용할 이미지 경로 결정
  const imageSrc = useFallback ? fallbackUrl : localImagePath

  // 로컬 이미지 사용 (img 태그 사용)
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

