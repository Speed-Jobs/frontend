interface TechStackListProps {
  items: Array<{
    rank: number
    name: string
    count: number
  }>
}

export default function TechStackList({ items }: TechStackListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-gray-400 text-sm text-center py-8">
        데이터가 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.rank}
          className="flex items-center justify-between p-3 bg-[#0f1e35] rounded-lg border border-[#2a3f5f] hover:border-blue-500/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm">
              {item.rank}
            </div>
            <span className="text-gray-200 font-medium">{item.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{item.count}</span>
            <span className="text-gray-400 text-xs">건</span>
          </div>
        </div>
      ))}
    </div>
  )
}




