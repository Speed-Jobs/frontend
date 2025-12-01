'use client'

interface CompanyNetworkBubbleProps {
  companies: Array<{
    name: string
    count: number
    group: number
    x: number
    y: number
    size: number
  }>
  ourCompany: string
}

export default function CompanyNetworkBubble({ companies, ourCompany }: CompanyNetworkBubbleProps) {
  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
      <div className="text-gray-400 text-sm">
        회사 네트워크
      </div>
    </div>
  )
}

