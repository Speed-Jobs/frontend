'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* 상단 섹션 */}
        <div className="mb-6">
          {/* 회사 정보 및 소셜 링크 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-gray-900">스피드잡스</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {/* 첫 번째 줄 링크 */}
            <div className="flex flex-wrap gap-4 mb-3">
              <Link href="/" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
                홈
              </Link>
              <Link href="/dashboard" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
                대시보드
              </Link>
              <Link href="/jobs" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
                전체 공고
              </Link>
              <Link href="/companies" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
                회사별 공고
              </Link>
              <Link href="/quality" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
                공고품질 평가
              </Link>
              <Link href="#" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
                공지사항
              </Link>
            </div>
            
            {/* 두 번째 줄 링크 */}
            <div className="flex flex-wrap gap-4">
              <Link href="#" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
                기업서비스
              </Link>
              <Link href="#" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
                채용공고등록
              </Link>
              <Link href="#" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
                광고예약
              </Link>
              <Link href="#" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
                광고/제휴
              </Link>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-300 mb-6"></div>

        {/* 하단 섹션 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* 법적 정보 링크 */}
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
              인재채용
            </Link>
            <Link href="#" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
              이용약관
            </Link>
            <Link href="#" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
              개인정보처리방침
            </Link>
            <Link href="#" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
              커뮤니티운영정책
            </Link>
            <Link href="#" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
              FAQ
            </Link>
            <Link href="#" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
              문의
            </Link>
          </div>

          {/* 앱 다운로드 버튼 */}
          <div className="flex gap-3">
            <Link
              href="#"
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm-1.64-2.24L6.05 2.66l10.76 6.22-2.27 2.27zM6.05 2.66L3.84 4.87l8.49 8.49-2.27-2.27L6.05 2.66z"/>
              </svg>
              <span className="text-xs font-medium">GET IT ON</span>
              <span className="text-sm font-bold">Google Play</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="text-xs font-medium">Download on the</span>
              <span className="text-sm font-bold">App Store</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

