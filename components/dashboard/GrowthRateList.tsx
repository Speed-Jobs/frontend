interface GrowthRateListProps {
  items: Array<{
    position: string
    growth: number
  }>
}

export default function GrowthRateList({ items }: GrowthRateListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-8">
        데이터가 없습니다.
      </div>
    )
  }

  const isPositive = (growth: number) => growth > 0
  const isNegative = (growth: number) => growth < 0

  return (
    <div className="h-[400px] overflow-y-auto pr-2">
      <div className="space-y-3">
        {items.map((item, index) => {
        const isGrowth = isPositive(item.growth)
        const isDecline = isNegative(item.growth)

        return (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-500/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {isGrowth && (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
              {isDecline && (
                <div className="w-2 h-2 rounded-full bg-red-500" />
              )}
              {!isGrowth && !isDecline && (
                <div className="w-2 h-2 rounded-full bg-gray-400" />
              )}
              <span className="text-gray-700 font-medium">{item.position}</span>
            </div>
            <div className="flex items-center gap-2">
              {isGrowth && (
                <>
                  <span className="text-green-400 font-bold text-sm">↑</span>
                  <span className="text-green-400 font-semibold">{item.growth}%</span>
                </>
              )}
              {isDecline && (
                <>
                  <span className="text-red-400 font-bold text-sm">↓</span>
                  <span className="text-red-400 font-semibold">{Math.abs(item.growth)}%</span>
                </>
              )}
              {!isGrowth && !isDecline && (
                <span className="text-gray-500 font-semibold">0%</span>
              )}
            </div>
          </div>
        )
      })}
      </div>
    </div>
  )
}


