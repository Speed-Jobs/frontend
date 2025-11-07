import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">404</h2>
        <p className="text-xl text-gray-600 mb-6">페이지를 찾을 수 없습니다</p>
        <Link
          href="/"
          className="px-6 py-3 bg-sk-red hover:bg-sk-red-dark text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-block"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}

