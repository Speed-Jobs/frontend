interface ShareBarChartProps {
  data: Array<{
    company: string
    share: number
  }>
}

export default function ShareBarChart({ data }: ShareBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-8">
        데이터가 없습니다.
      </div>
    )
  }

  const maxShare = Math.max(...data.map(item => item.share), 1)

  // 그라데이션 색상 배열
  const colors = [
    'from-blue-500 to-blue-400',
    'from-purple-500 to-purple-400',
    'from-green-500 to-green-400',
    'from-yellow-500 to-yellow-400',
    'from-pink-500 to-pink-400',
    'from-indigo-500 to-indigo-400',
    'from-red-500 to-red-400',
    'from-cyan-500 to-cyan-400',
  ]

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = maxShare > 0 ? (item.share / maxShare) * 100 : 0
        const colorClass = colors[index % colors.length]

        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">{item.company}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-semibold">{item.share}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-500 flex items-center justify-end pr-1`}
                style={{ width: `${percentage}%` }}
              >
                {percentage > 15 && (
                  <span className="text-[10px] text-white font-medium">
                    {item.share}%
                  </span>
                )}
              </div>
            </div>
            {percentage <= 15 && (
              <div className="text-right">
                <span className="text-xs text-gray-600">{item.share}%</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}


