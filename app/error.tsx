'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">문제가 발생했습니다</h2>
        <p className="text-gray-600 mb-6">{error.message || '알 수 없는 오류가 발생했습니다.'}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-sk-red hover:bg-sk-red-dark text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}

