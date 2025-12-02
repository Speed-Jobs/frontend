interface CompanyRecruitmentTableProps {
  data: Array<{
    company: string
    'Software Development': number
    'Factory AX Engineering': number
    'Solution Development': number
    'Cloud/Infra Engineering': number
    'Architect': number
    'Project Management': number
    'Quality Management': number
    'AI': number
    '정보보호': number
    'Sales': number
    'Domain Expert': number
    'Consulting': number
    'Biz. Supporting': number
    total: number
    change: number
    surgingPosition: string
  }>
}

export default function CompanyRecruitmentTable({ data }: CompanyRecruitmentTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-8">
        데이터가 없습니다.
      </div>
    )
  }

  const isPositive = (change: number) => change > 0
  const isNegative = (change: number) => change < 0

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden flex flex-col">
      <table className="w-full table-fixed">
        <thead className="sticky top-0 bg-white z-20">
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-3 text-gray-700 font-semibold text-xs sticky left-0 bg-white z-10">회사</th>
            <th className="text-center py-3 px-1.5 text-gray-700 font-semibold text-[10px] whitespace-nowrap">Software<br/>Dev</th>
            <th className="text-center py-3 px-1.5 text-gray-700 font-semibold text-[10px] whitespace-nowrap">Factory AX<br/>Eng</th>
            <th className="text-center py-3 px-1.5 text-gray-700 font-semibold text-[10px] whitespace-nowrap">Solution<br/>Dev</th>
            <th className="text-center py-3 px-1.5 text-gray-700 font-semibold text-[10px] whitespace-nowrap">Cloud/Infra<br/>Eng</th>
            <th className="text-center py-3 px-1.5 text-gray-700 font-semibold text-[10px] whitespace-nowrap">Architect</th>
            <th className="text-center py-3 px-1.5 text-gray-700 font-semibold text-[10px] whitespace-nowrap">Project<br/>Mgmt</th>
            <th className="text-center py-3 px-1.5 text-gray-700 font-semibold text-[10px] whitespace-nowrap">Quality<br/>Mgmt</th>
            <th className="text-center py-3 px-1.5 text-gray-700 font-semibold text-[10px] whitespace-nowrap">AI</th>
            <th className="text-center py-3 px-1.5 text-gray-700 font-semibold text-[10px] whitespace-nowrap">정보보호</th>
            <th className="text-center py-3 px-1.5 text-gray-700 font-semibold text-[10px] whitespace-nowrap">Sales</th>
            <th className="text-center py-3 px-1.5 text-gray-700 font-semibold text-[10px] whitespace-nowrap">Domain<br/>Expert</th>
            <th className="text-center py-3 px-1.5 text-gray-700 font-semibold text-[10px] whitespace-nowrap">Consulting</th>
            <th className="text-center py-3 px-1.5 text-gray-700 font-semibold text-[10px] whitespace-nowrap">Biz.<br/>Supporting</th>
            <th className="text-center py-3 px-3 text-gray-700 font-semibold text-xs">총계</th>
            <th className="text-center py-3 px-3 text-gray-700 font-semibold text-xs">변화</th>
            <th className="text-center py-3 px-3 text-gray-700 font-semibold text-xs">급증<br/>포지션</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-3 sticky left-0 bg-white z-10">
                <span className="text-gray-900 font-medium text-xs">{row.company}</span>
              </td>
              <td className="text-center py-3 px-1.5">
                <span className="text-gray-700 text-xs">{row['Software Development']}</span>
              </td>
              <td className="text-center py-3 px-1.5">
                <span className="text-gray-700 text-xs">{row['Factory AX Engineering']}</span>
              </td>
              <td className="text-center py-3 px-1.5">
                <span className="text-gray-700 text-xs">{row['Solution Development']}</span>
              </td>
              <td className="text-center py-3 px-1.5">
                <span className="text-gray-700 text-xs">{row['Cloud/Infra Engineering']}</span>
              </td>
              <td className="text-center py-3 px-1.5">
                <span className="text-gray-700 text-xs">{row['Architect']}</span>
              </td>
              <td className="text-center py-3 px-1.5">
                <span className="text-gray-700 text-xs">{row['Project Management']}</span>
              </td>
              <td className="text-center py-3 px-1.5">
                <span className="text-gray-700 text-xs">{row['Quality Management']}</span>
              </td>
              <td className="text-center py-3 px-1.5">
                <span className="text-gray-700 text-xs">{row['AI']}</span>
              </td>
              <td className="text-center py-3 px-1.5">
                <span className="text-gray-700 text-xs">{row['정보보호']}</span>
              </td>
              <td className="text-center py-3 px-1.5">
                <span className="text-gray-700 text-xs">{row['Sales']}</span>
              </td>
              <td className="text-center py-3 px-1.5">
                <span className="text-gray-700 text-xs">{row['Domain Expert']}</span>
              </td>
              <td className="text-center py-3 px-1.5">
                <span className="text-gray-700 text-xs">{row['Consulting']}</span>
              </td>
              <td className="text-center py-3 px-1.5">
                <span className="text-gray-700 text-xs">{row['Biz. Supporting']}</span>
              </td>
              <td className="text-center py-3 px-4">
                <span className="text-gray-900 font-semibold">{row.total}</span>
              </td>
              <td className="text-center py-3 px-4">
                {row.change !== 0 && (
                  <span
                    className={`text-xs font-medium ${
                      isPositive(row.change)
                        ? 'text-green-400'
                        : isNegative(row.change)
                        ? 'text-red-400'
                        : 'text-gray-500'
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


