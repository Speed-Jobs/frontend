interface JobRoleBarChartProps {
  data: Array<{
    role: string
    count: number
    change: number
  }>
}

export default function JobRoleBarChart({ data }: JobRoleBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-gray-400 text-sm text-center py-8">
        데이터가 없습니다.
      </div>
    )
  }

  const maxCount = Math.max(...data.map(item => item.count), 1)

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0
        const isPositive = item.change > 0
        const isNegative = item.change < 0

        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300 font-medium">{item.role}</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{item.count}</span>
                {item.change !== 0 && (
                  <span
                    className={`text-xs font-medium ${
                      isPositive
                        ? 'text-green-400'
                        : isNegative
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {isPositive ? '↑' : isNegative ? '↓' : ''} {Math.abs(item.change)}%
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-[#0f1e35] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}


