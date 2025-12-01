interface WeeklyTrendAnalysisProps {
  trends: Array<{
    icon: 'target' | 'chart' | 'warning'
    title: string
    description: string
    color: 'red' | 'green' | 'yellow'
  }>
  suggestion: string
}

export default function WeeklyTrendAnalysis({ trends, suggestion }: WeeklyTrendAnalysisProps) {
  const getIcon = (icon: string) => {
    switch (icon) {
      case 'target':
        return '🎯'
      case 'chart':
        return '📈'
      case 'warning':
        return '⚠️'
      default:
        return '📊'
    }
  }

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red':
        return 'border-red-500/30 bg-red-500/10 text-red-400'
      case 'green':
        return 'border-green-500/30 bg-green-500/10 text-green-400'
      case 'yellow':
        return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
      default:
        return 'border-gray-500/30 bg-gray-500/10 text-gray-400'
    }
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-8">
        트렌드 데이터가 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 트렌드 목록 */}
      <div className="space-y-3">
        {trends.map((trend, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getColorClass(trend.color)} transition-colors hover:opacity-80`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{getIcon(trend.icon)}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 font-semibold text-sm mb-1">{trend.title}</h3>
                <p className="text-gray-700 text-xs">{trend.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 제안사항 */}
      {suggestion && (
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-blue-400 text-sm">💡</span>
            <div>
              <p className="text-blue-600 font-semibold text-xs mb-1">제안사항</p>
              <p className="text-gray-700 text-sm">{suggestion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


