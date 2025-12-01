import { ReactNode } from 'react'

interface DarkDashboardCardProps {
  title: string
  children: ReactNode
  className?: string
}

export default function DarkDashboardCard({ 
  title, 
  children, 
  className = '' 
}: DarkDashboardCardProps) {
  return (
    <div className={`bg-[#1a2d47] rounded-lg border border-[#2a3f5f] shadow-lg p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <div className="text-gray-300">
        {children}
      </div>
    </div>
  )
}


