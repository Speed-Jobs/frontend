'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const pathname = usePathname()
  const [logoError, setLogoError] = useState(false)
  const [logoSrc, setLogoSrc] = useState('/logos/service-logo.png')
  const { isAuthenticated, user, logout } = useAuth()
  
  const navItems = [
    { href: '/dashboard', label: '대시보드', icon: '📊' },
    { href: '/quality', label: '공고품질 평가', icon: '⭐' },
    { href: '/companies', label: '회사별 공고', icon: '📋' },
  ]
  
  const userMenuItems = [
    { href: '/mypage', label: '마이페이지', icon: '👤' },
  ]

  const handleLogoError = () => {
    // 로고가 없으면 에러 상태
    setLogoError(true)
  }

  const handleLogout = async () => {
    await logout()
  }

  // 로그인/회원가입 페이지에서는 헤더를 표시하지 않음
  if (pathname === '/login' || pathname === '/signup') {
    return null
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
      <nav className="flex gap-2 items-center">
        {/* 네비게이션 메뉴 - 로그인 여부와 관계없이 항상 표시 */}
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
              pathname === item.href
                ? 'bg-gray-900 text-white border border-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {item.icon && <span>{item.icon}</span>}
            {item.label}
          </Link>
        ))}
        
        {/* 사용자 메뉴 - 로그인한 경우에만 표시 */}
        {isAuthenticated ? (
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
            {userMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                  pathname === item.href
                    ? 'bg-gray-900 text-white border border-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </Link>
            ))}
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 shadow-sm hover:shadow-md ml-4"
          >
            로그인
          </Link>
        )}
      </nav>
    </header>
  )
}

