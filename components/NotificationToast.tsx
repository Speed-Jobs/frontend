// 화면 내 알림 토스트 컴포넌트

'use client'

import { useEffect, useState } from 'react'
import { JobPosting } from '@/lib/storage/types'

interface NotificationToastProps {
  newJobs: JobPosting[]
  onClose: () => void
}

export default function NotificationToast({ newJobs, onClose }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (newJobs.length > 0) {
      setIsVisible(true)
      // 10초 후 자동으로 사라짐
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // 애니메이션 대기
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [newJobs, onClose])

  if (newJobs.length === 0 || !isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 max-w-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🆕</span>
              <h3 className="font-bold text-gray-900">
                새로운 공고 {newJobs.length}개
              </h3>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {newJobs.slice(0, 3).map((job) => (
                <div key={job.id || `${job.title}-${job.company}`} className="text-sm">
                  <p className="font-semibold text-gray-800">{job.company}</p>
                  <p className="text-gray-600 truncate">{job.title}</p>
                </div>
              ))}
              {newJobs.length > 3 && (
                <p className="text-xs text-gray-500">
                  외 {newJobs.length - 3}개 공고...
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

