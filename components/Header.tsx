'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [logoError, setLogoError] = useState(false)
  const [logoSrc, setLogoSrc] = useState('/logos/service-logo.png')
  
  const navItems = [
    { href: '/dashboard', label: '대시보드' },
    { href: '/analysis', label: '분석리포트' },
    { href: '/matching', label: '자동매칭' },
    { href: '/quality', label: '공고품질 평가' },
  ]

  const handleLogoError = () => {
    // 로고가 없으면 에러 상태
    setLogoError(true)
  }

  return (
    <header className="w-full px-8 py-6 flex justify-between items-center bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <Link
        href="/"
        className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-300"
      >
        {!logoError ? (
          <div className="relative w-10 h-10 flex-shrink-0">
            <img
              src={logoSrc}
              alt="로고"
              className="w-full h-full object-contain"
              onError={handleLogoError}
            />
          </div>
        ) : (
          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">SJ</span>
          </div>
        )}
        <span className="text-2xl font-bold text-gray-900">Speed Jobs</span>
      </Link>
      <nav className="flex gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              pathname === item.href
                ? 'bg-gray-900 text-white border border-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}

