import { ReactNode } from 'react'

interface DarkDashboardCardProps {
  title: string | ReactNode
  children: ReactNode
  className?: string
}

export default function DarkDashboardCard({ 
  title, 
  children, 
  className = '' 
}: DarkDashboardCardProps) {
  const hasFixedHeight = className.includes('h-[') || className.includes('h-')
  const isFlexCol = className.includes('flex flex-col') || className.includes('flex-col')
  const hasOverflowVisible = className.includes('overflow-visible')
  
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-lg p-6 ${className} ${hasFixedHeight ? 'overflow-hidden flex flex-col' : isFlexCol ? 'flex flex-col' : ''}`}>
      <h2 className={`text-lg font-semibold text-gray-900 ${hasFixedHeight ? 'mb-3 flex-shrink-0' : 'mb-4 flex-shrink-0'}`}>{title}</h2>
      <div className={`text-gray-700 ${hasFixedHeight ? 'flex-1 min-h-0 overflow-hidden' : ''} ${hasOverflowVisible ? 'overflow-visible' : ''}`}>
        {children}
      </div>
    </div>
  )
}


