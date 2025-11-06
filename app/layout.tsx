import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Speed Jobs - AI 기반 채용 인텔리전스',
  description: '경쟁사 채용공고를 한눈에 파악하세요',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}

