interface SurgingKeywordsProps {
  keywords: Array<{
    keyword: string
    change: number
  }>
}

export default function SurgingKeywords({ keywords }: SurgingKeywordsProps) {
  if (!keywords || keywords.length === 0) {
    return (
      <div className="text-gray-400 text-sm text-center py-8">
        급증 키워드가 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {keywords.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 bg-[#0f1e35] rounded-lg border border-[#2a3f5f] hover:border-orange-500/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-gray-200 font-medium">{item.keyword}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-orange-400 font-bold text-sm">↑</span>
            <span className="text-orange-400 font-semibold">
              {item.change >= 1000 ? '신규' : `${item.change}%`}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}







