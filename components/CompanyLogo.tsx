'use client'

import { useState } from 'react'

interface CompanyLogoProps {
  name: string
  className?: string
}

export default function CompanyLogo({ name, className = '' }: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false)
  const [currentUrl, setCurrentUrl] = useState(0)

  // 실제 기업 로고 이미지 URL (여러 소스 제공)
  const logoUrlSets: Record<string, string[]> = {
    SAMSUNG: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/200px-Samsung_Logo.svg.png',
      'https://logos-world.net/wp-content/uploads/2020/05/Samsung-Logo.png',
      'https://1000logos.net/wp-content/uploads/2017/06/Samsung-Logo.png',
    ],
    LG: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/LG_symbol.svg/200px-LG_symbol.svg.png',
      'https://logos-world.net/wp-content/uploads/2020/05/LG-Logo.png',
      'https://1000logos.net/wp-content/uploads/2017/03/LG-Logo.png',
    ],
    HYUNDAI: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Hyundai_Motor_Company_logo.svg/200px-Hyundai_Motor_Company_logo.svg.png',
      'https://logos-world.net/wp-content/uploads/2020/05/Hyundai-Logo.png',
      'https://1000logos.net/wp-content/uploads/2018/08/Hyundai-Logo.png',
    ],
    NAVER: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Naver_Logotype.png/200px-Naver_Logotype.png',
      'https://www.navercorp.com/img/ko/ci/naver_corp_ci.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Naver_Logotype.png/800px-Naver_Logotype.png',
    ],
    kakao: [
      'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/5a3a3b1d0160000001.png',
      'https://www.kakaocorp.com/page/ico_kakao.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Kakao_logo.svg/200px-Kakao_logo.svg.png',
    ],
    당근: [
      'https://www.daangn.com/favicon-192x192.png',
      'https://www.daangn.com/logo.png',
      'https://www.daangn.com/images/logo.png',
    ],
  }

  const urls = logoUrlSets[name] || []
  const imageUrl = urls[currentUrl] || ''

  const handleError = () => {
    if (currentUrl < urls.length - 1) {
      setCurrentUrl(currentUrl + 1)
    } else {
      setImgError(true)
    }
  }

  if (!imageUrl || imgError) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-600">{name}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <img
        src={imageUrl}
        alt={`${name} 로고`}
        className="w-full h-full object-contain"
        onError={handleError}
        loading="lazy"
      />
    </div>
  )
}

