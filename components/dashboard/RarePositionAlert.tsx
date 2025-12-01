interface RarePositionAlertProps {
  competitive: Array<{
    position: string
    companyCount: number
  }>
  blueOcean: Array<{
    position: string
    companyCount: number
  }>
}

export default function RarePositionAlert({ competitive, blueOcean }: RarePositionAlertProps) {
  return (
    <div className="space-y-4">
      {/* 경쟁이 치열한 포지션 */}
      {competitive && competitive.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <h3 className="text-sm font-semibold text-red-400">경쟁 치열</h3>
          </div>
          <div className="space-y-2">
            {competitive.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-white rounded-lg border border-red-200 hover:border-red-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium text-sm">{item.position}</span>
                  <span className="text-red-400 text-xs font-semibold bg-red-500/10 px-2 py-1 rounded">
                    {item.companyCount}개사
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 블루오션 포지션 */}
      {blueOcean && blueOcean.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <h3 className="text-sm font-semibold text-blue-400">블루오션</h3>
          </div>
          <div className="space-y-2">
            {blueOcean.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium text-sm">{item.position}</span>
                  <span className="text-blue-400 text-xs font-semibold bg-blue-500/10 px-2 py-1 rounded">
                    {item.companyCount}개사
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 데이터가 없는 경우 */}
      {(!competitive || competitive.length === 0) && (!blueOcean || blueOcean.length === 0) && (
        <div className="text-gray-500 text-sm text-center py-8">
          희소 포지션이 없습니다.
        </div>
      )}
    </div>
  )
}


