interface CompanyRecruitmentTableProps {
  data: Array<{
    company: string
    backend: number
    frontend: number
    dataAi: number
    devops: number
    mobile: number
    total: number
    change: number
    surgingPosition: string
  }>
}

export default function CompanyRecruitmentTable({ data }: CompanyRecruitmentTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-gray-400 text-sm text-center py-8">
        데이터가 없습니다.
      </div>
    )
  }

  const isPositive = (change: number) => change > 0
  const isNegative = (change: number) => change < 0

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#2a3f5f]">
            <th className="text-left py-3 px-4 text-gray-300 font-semibold text-sm">회사</th>
            <th className="text-center py-3 px-2 text-gray-300 font-semibold text-sm">Backend</th>
            <th className="text-center py-3 px-2 text-gray-300 font-semibold text-sm">Frontend</th>
            <th className="text-center py-3 px-2 text-gray-300 font-semibold text-sm">Data/AI</th>
            <th className="text-center py-3 px-2 text-gray-300 font-semibold text-sm">DevOps</th>
            <th className="text-center py-3 px-2 text-gray-300 font-semibold text-sm">Mobile</th>
            <th className="text-center py-3 px-4 text-gray-300 font-semibold text-sm">총계</th>
            <th className="text-center py-3 px-4 text-gray-300 font-semibold text-sm">변화</th>
            <th className="text-center py-3 px-4 text-gray-300 font-semibold text-sm">급증 포지션</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className="border-b border-[#2a3f5f]/50 hover:bg-[#0f1e35] transition-colors"
            >
              <td className="py-3 px-4">
                <span className="text-white font-medium">{row.company}</span>
              </td>
              <td className="text-center py-3 px-2">
                <span className="text-gray-300">{row.backend}</span>
              </td>
              <td className="text-center py-3 px-2">
                <span className="text-gray-300">{row.frontend}</span>
              </td>
              <td className="text-center py-3 px-2">
                <span className="text-gray-300">{row.dataAi}</span>
              </td>
              <td className="text-center py-3 px-2">
                <span className="text-gray-300">{row.devops}</span>
              </td>
              <td className="text-center py-3 px-2">
                <span className="text-gray-300">{row.mobile}</span>
              </td>
              <td className="text-center py-3 px-4">
                <span className="text-white font-semibold">{row.total}</span>
              </td>
              <td className="text-center py-3 px-4">
                {row.change !== 0 && (
                  <span
                    className={`text-xs font-medium ${
                      isPositive(row.change)
                        ? 'text-green-400'
                        : isNegative(row.change)
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {isPositive(row.change) ? '↑' : isNegative(row.change) ? '↓' : ''} {Math.abs(row.change)}%
                  </span>
                )}
                {row.change === 0 && (
                  <span className="text-gray-500 text-xs">-</span>
                )}
              </td>
              <td className="text-center py-3 px-4">
                <span className="text-orange-400 text-xs font-medium bg-orange-400/10 px-2 py-1 rounded">
                  {row.surgingPosition}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


