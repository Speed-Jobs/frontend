'use client'

import AIChatbot from '@/components/dashboard/AIChatbot'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <AIChatbot />
    </>
  )
}

