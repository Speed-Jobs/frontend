'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/dashboard', label: '대시보드' },
    { href: '/analysis', label: '분석리포트' },
    { href: '/matching', label: '자동매칭' },
    { href: '/quality', label: '공고품질 평가' },
  ]

  return (
    <header className="w-full px-8 py-6 flex justify-between items-center bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <Link
        href="/"
        className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
      >
        Speed Jobs
      </Link>
      <nav className="flex gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              pathname === item.href
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
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

