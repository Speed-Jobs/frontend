'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function AnalysisPage() {
  const [selectedJobRole, setSelectedJobRole] = useState('Software Development')

  // 공고 발행 통계 데이터 (이미지에 맞게 수정)
  const companyStats = [
    { rank: 1, company: 'SK', count: 168, change: 6.2, isIncrease: true },
    { rank: 2, company: '토스', count: 152, change: 3.6, isIncrease: true },
    { rank: 3, company: '카카오', count: 145, change: 4.1, isIncrease: true },
    { rank: 4, company: '네이버', count: 138, change: 6.7, isIncrease: true },
    { rank: 5, company: '쿠팡', count: 125, change: 3.2, isIncrease: false },
  ]

  const maxCount = Math.max(...companyStats.map((c) => c.count))

  // 공고 트렌드 데이터 (이미지에 맞게 수정)
  const postingTrendData = [
    { month: '2023/10', value: 420 },
    { month: '2023/11', value: 480 },
    { month: '2023/12', value: 520 },
    { month: '2024/01', value: 580 },
    { month: '2024/02', value: 650 },
    { month: '2024/03', value: 680 },
  ]

  // 분기별 트렌드 데이터 (이미지에 맞게 수정)
  const quarterlyTrendData = [
    { quarter: '2023 Q4', value: 850 },
    { quarter: '2024 Q1', value: 920 },
    { quarter: '2024 Q2', value: 980 },
    { quarter: '2024 Q3', value: 1050 },
    { quarter: '2024 Q4', value: 1100 },
  ]

  // 직무별 기술 데이터 (13개 직무 기준)
  const jobRoleTechs: Record<string, { 
    used: Array<{ name: string; count: number; percentage: number }>; 
    unused: string[];
    representative?: string;
  }> = {
    전체: {
      used: [],
      unused: [],
    },
    'Software Development': {
      used: [
        { name: 'Java', count: 120, percentage: 45 },
        { name: 'Spring', count: 95, percentage: 35 },
        { name: 'React', count: 80, percentage: 30 },
        { name: 'Node.js', count: 65, percentage: 24 },
      ],
      unused: ['Python', 'Django', 'Vue.js'],
      representative: 'Software Development (총 50건, 2023.10.24)',
    },
    'Factory AX Engineering': {
      used: [
        { name: 'PLC', count: 85, percentage: 55 },
        { name: 'SCADA', count: 70, percentage: 45 },
        { name: 'MES', count: 60, percentage: 39 },
      ],
      unused: ['웹 개발', '모바일'],
      representative: 'Factory AX Engineering (총 50건, 2023.10.24)',
    },
    'Solution Development': {
      used: [
        { name: 'SAP', count: 110, percentage: 50 },
        { name: 'ERP', count: 95, percentage: 43 },
        { name: 'Oracle', count: 75, percentage: 34 },
      ],
      unused: ['클라우드', '마이크로서비스'],
      representative: 'Solution Development (총 50건, 2023.10.24)',
    },
    'Cloud/Infra Engineering': {
      used: [
        { name: 'AWS', count: 100, percentage: 48 },
        { name: 'Docker', count: 85, percentage: 41 },
        { name: 'Kubernetes', count: 70, percentage: 34 },
      ],
      unused: ['온프레미스', '레거시'],
      representative: 'Cloud/Infra Engineering (총 50건, 2023.10.24)',
    },
    'Architect': {
      used: [
        { name: 'System Design', count: 90, percentage: 52 },
        { name: 'Microservices', count: 75, percentage: 43 },
        { name: 'Cloud Architecture', count: 65, percentage: 38 },
      ],
      unused: ['모놀리식', '레거시'],
      representative: 'Architect (총 50건, 2023.10.24)',
    },
    'Project Management': {
      used: [
        { name: 'Agile', count: 95, percentage: 55 },
        { name: 'Scrum', count: 80, percentage: 46 },
        { name: 'Jira', count: 70, percentage: 41 },
      ],
      unused: ['워터폴', '전통적'],
      representative: 'Project Management (총 50건, 2023.10.24)',
    },
    'Quality Management': {
      used: [
        { name: 'Testing', count: 85, percentage: 50 },
        { name: 'QA', count: 75, percentage: 44 },
        { name: 'Automation', count: 60, percentage: 35 },
      ],
      unused: ['수동 테스트', '레거시'],
      representative: 'Quality Management (총 50건, 2023.10.24)',
    },
    'AI': {
      used: [
        { name: 'Python', count: 120, percentage: 58 },
        { name: 'TensorFlow', count: 95, percentage: 46 },
        { name: 'PyTorch', count: 80, percentage: 39 },
      ],
      unused: ['전통적 개발', '레거시'],
      representative: 'AI (총 50건, 2023.10.24)',
    },
    '정보보호': {
      used: [
        { name: 'Security', count: 90, percentage: 53 },
        { name: 'Penetration Testing', count: 75, percentage: 44 },
        { name: 'Compliance', count: 65, percentage: 38 },
      ],
      unused: ['일반 개발', '비보안'],
      representative: '정보보호 (총 50건, 2023.10.24)',
    },
    'Sales': {
      used: [
        { name: 'CRM', count: 100, percentage: 55 },
        { name: 'Salesforce', count: 85, percentage: 47 },
        { name: 'Marketing', count: 70, percentage: 39 },
      ],
      unused: ['기술 개발', '엔지니어링'],
      representative: 'Sales (총 50건, 2023.10.24)',
    },
    'Domain Expert': {
      used: [
        { name: 'Domain Knowledge', count: 95, percentage: 52 },
        { name: 'Industry Expertise', count: 80, percentage: 44 },
        { name: 'Business Analysis', count: 70, percentage: 38 },
      ],
      unused: ['기술 중심', '개발'],
      representative: 'Domain Expert (총 50건, 2023.10.24)',
    },
    'Consulting': {
      used: [
        { name: 'Strategy', count: 90, percentage: 51 },
        { name: 'ESG', count: 75, percentage: 43 },
        { name: 'Transformation', count: 65, percentage: 37 },
      ],
      unused: ['운영', '일반 업무'],
      representative: 'Consulting (총 50건, 2023.10.24)',
    },
    'Biz. Supporting': {
      used: [
        { name: 'Planning', count: 85, percentage: 50 },
        { name: 'Management', count: 75, percentage: 44 },
        { name: 'Governance', count: 65, percentage: 38 },
      ],
      unused: ['기술 개발', '엔지니어링'],
      representative: 'Biz. Supporting (총 50건, 2023.10.24)',
    },
  }

  const currentTechs = jobRoleTechs[selectedJobRole] || jobRoleTechs['Software Development']

  // PDF 다운로드 함수
  const handleDownloadPDF = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default

      const element = document.getElementById('ai-report-content')
      if (!element) {
        alert('리포트 컨텐츠를 찾을 수 없습니다.')
        return
      }

      // 스타일 로드 대기
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // PDF 설정
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = 210 // A4 너비 (mm)
      const pdfHeight = 297 // A4 높이 (mm)
      const margin = 15 // 여백 (mm)
      const contentWidth = pdfWidth - margin * 2
      const contentHeight = pdfHeight - margin * 2

      // 전체 컨텐츠를 한 번에 캡처
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
      })

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        alert('캔버스 생성에 실패했습니다.')
        return
      }

      const imgData = canvas.toDataURL('image/png', 1.0)
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      
      if (!imgData || imgData === 'data:,') {
        alert('이미지 데이터 생성에 실패했습니다.')
        return
      }
      
      // 이미지 너비를 PDF 콘텐츠 너비에 맞춤
      const imgWidthInPdf = contentWidth
      const imgHeightInPdf = (imgHeight * imgWidthInPdf) / imgWidth

      // 페이지 나눔 처리
      const totalPages = Math.ceil(imgHeightInPdf / contentHeight)
      
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage()
        }
        
        // 현재 페이지에 표시할 이미지의 Y 위치 계산
        const sourceY = (imgHeight / totalPages) * i
        const sourceHeight = imgHeight / totalPages
        const pageImgHeight = imgHeightInPdf / totalPages
        
        // 이미지의 해당 부분을 캔버스에 그리기
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = imgWidth
        pageCanvas.height = sourceHeight
        const pageCtx = pageCanvas.getContext('2d')
        
        if (pageCtx) {
          const img = new Image()
          img.src = imgData
          
          await new Promise<void>((resolve) => {
            img.onload = () => {
              try {
                pageCtx.drawImage(
                  img,
                  0, sourceY, imgWidth, sourceHeight,
                  0, 0, imgWidth, sourceHeight
                )
                const pageImgData = pageCanvas.toDataURL('image/png', 1.0)
                if (pageImgData && pageImgData !== 'data:,') {
                  pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidthInPdf, pageImgHeight)
                }
              } catch (e) {
                console.error('이미지 그리기 오류:', e)
              }
              resolve()
            }
            img.onerror = () => {
              console.error('이미지 로드 실패')
              resolve()
            }
            // 타임아웃 설정
            setTimeout(() => resolve(), 5000)
          })
        }
      }

      pdf.save('AI_분석_리포트.pdf')
    } catch (error) {
      console.error('PDF 생성 중 오류:', error)
      alert(`PDF 다운로드 중 오류가 발생했습니다: ${error}`)
    }
  }

  // DOCX 다운로드 함수
  const handleDownloadDocx = async () => {
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx')
      
      // file-saver는 default export를 사용
      const fileSaverModule = await import('file-saver')
      const saveAs = (fileSaverModule as any).default || (fileSaverModule as any).saveAs

      if (!Document || !Packer || !Paragraph || !TextRun || !HeadingLevel) {
        alert('DOCX 라이브러리 로드에 실패했습니다.')
        return
      }

      if (!saveAs || typeof saveAs !== 'function') {
        // 대체 방법: 직접 다운로드 링크 생성
        console.warn('saveAs를 사용할 수 없어 대체 방법을 사용합니다.')
      }

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                text: 'AI 분석 리포트',
                heading: HeadingLevel.HEADING_1,
              }),
              new Paragraph({
                text: '1. 공고 발행 통계',
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `분석 기간 동안 총 ${companyStats.reduce((sum, c) => sum + c.count, 0)}건의 공고가 발행되었습니다. 주요 기업별 공고 발행 현황은 다음과 같습니다:`,
                  }),
                ],
              }),
              ...companyStats.map((stat) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${stat.company}: ${stat.count}건 (전년 동기 대비 ${stat.isIncrease ? '+' : '-'}${Math.abs(stat.change)}%)`,
                    }),
                  ],
                })
              ),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '월별 트렌드를 분석한 결과, 공고 발행 수는 지속적으로 증가하는 추세를 보이고 있습니다. 2023년 10월 420건에서 시작하여 2024년 3월 680건까지 증가했습니다. 분기별로는 2023 Q4 850건에서 2024 Q4 1,100건으로 약 29.4% 증가했습니다.',
                  }),
                ],
              }),
              new Paragraph({
                text: '2. 트렌드 분석',
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '공고 트렌드를 분석한 결과, 월별로 지속적인 증가 추세를 보이고 있습니다. 특히 2024년 초반부터 급격한 증가세를 보이며, 이는 IT 업계의 인력 수요가 크게 증가하고 있음을 시사합니다.',
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '분기별 트렌드에서도 동일한 패턴이 관찰되며, 각 분기마다 약 5-7%의 성장률을 보이고 있어 안정적인 성장세를 유지하고 있습니다.',
                  }),
                ],
              }),
              new Paragraph({
                text: '3. 직무별 분석',
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '직무별 기술 스택 분석 결과, 각 직무마다 선호하는 기술과 사용하지 않는 기술이 명확하게 구분됩니다.',
                  }),
                ],
              }),
              ...(selectedJobRole !== '전체' && currentTechs.used.length > 0
                ? [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${selectedJobRole} 직무의 경우:`,
                          bold: true,
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `• 주요 사용 기술: ${currentTechs.used.map((t) => t.name).join(', ')}`,
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `• 사용하지 않는 기술: ${currentTechs.unused.join(', ')}`,
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `특히 ${currentTechs.used[0]?.name} 기술은 ${currentTechs.used[0]?.percentage}%의 공고에서 요구되고 있어 해당 직무의 핵심 기술로 자리잡고 있습니다.`,
                        }),
                      ],
                    }),
                  ]
                : []),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '최근 등장한 새로운 직무로는 AI/ML 엔지니어, 데이터 엔지니어, DevOps 엔지니어 등이 있으며, 이러한 직무들은 클라우드 기술과 자동화 도구에 대한 요구가 높은 특징을 보입니다.',
                  }),
                ],
              }),
              new Paragraph({
                text: '4. 비교 분석',
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '우리 회사(SK AX)의 포지셔닝을 경쟁사와 비교한 결과:',
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '• 공고 발행 수: 경쟁사 대비 중간 수준으로, 시장 점유율 확보를 위한 전략적 접근이 필요합니다.',
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '• 기술 스택: 최신 기술 트렌드를 잘 반영하고 있으며, 특히 클라우드 및 AI/ML 분야에서 강점을 보이고 있습니다.',
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '• 타이밍: 시장 동향을 적절히 파악하여 공고를 발행하고 있어 경쟁력 있는 포지셔닝을 유지하고 있습니다.',
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '전반적으로 우리 회사는 기술 혁신과 시장 트렌드에 대한 이해도가 높으며, 경쟁사 대비 차별화된 채용 전략을 수립할 수 있는 기반을 갖추고 있습니다.',
                  }),
                ],
              }),
            ],
          },
        ],
      })

      const blob = await Packer.toBlob(doc)
      if (!blob) {
        alert('DOCX 파일 생성에 실패했습니다.')
        return
      }
      
      // saveAs 함수가 있으면 사용, 없으면 대체 방법 사용
      if (saveAs && typeof saveAs === 'function') {
        saveAs(blob, 'AI_분석_리포트.docx')
      } else {
        // 대체 방법: 직접 다운로드 링크 생성
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'AI_분석_리포트.docx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('DOCX 생성 중 오류:', error)
      alert(`DOCX 다운로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
        {/* AI 분석 리포트 Section - 통합 */}
        <section id="ai-report-content" className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 space-y-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900">AI 분석 리포트</h2>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF 다운로드
              </button>
              <button
                onClick={handleDownloadDocx}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                DOCX 다운로드
              </button>
            </div>
          </div>

          {/* 1. 공고 발행 통계 */}
          <div className="pdf-section" data-section-index="0" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">1. 공고 발행 통계</h3>
            <p className="text-gray-600 mb-6">회사별 공고 수</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companyStats.map((stat) => (
                <div
                  key={stat.rank}
                  className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">{stat.rank}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{stat.company}</h4>
                        <p className="text-sm text-gray-500">공고 발행 수</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold text-gray-900">{stat.count}</span>
                      <span className="text-lg text-gray-600">건</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {stat.isIncrease ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-semibold text-green-600">
                            +{Math.abs(stat.change)}%
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-lg">
                          <svg
                            className="w-4 h-4 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-semibold text-red-600">
                            -{Math.abs(stat.change)}%
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-gray-500">전월 대비</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>시장 점유율</span>
                      <span className="font-semibold">{((stat.count / companyStats.reduce((sum, c) => sum + c.count, 0)) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-gray-700 to-gray-900 h-3 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${(stat.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          {/* AI 리포트 텍스트 - 공고 발행 통계 */}
          <div className="mt-6 prose max-w-none">
            <div className="space-y-3 text-base leading-relaxed text-gray-700">
              <p>
                분석 기간 동안 총 <strong>{companyStats.reduce((sum, c) => sum + c.count, 0)}건</strong>의 공고가 발행되었습니다.
                주요 기업별 공고 발행 현황은 다음과 같습니다:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                {companyStats.map((stat) => (
                  <li key={stat.rank}>
                    <strong>{stat.company}</strong>: {stat.count}건 (전년 동기 대비{' '}
                    {stat.isIncrease ? '+' : '-'}
                    {Math.abs(stat.change)}%)
                  </li>
                ))}
              </ul>
              <p>
                월별 트렌드를 분석한 결과, 공고 발행 수는 지속적으로 증가하는 추세를 보이고 있습니다.
                2023년 10월 420건에서 시작하여 2024년 3월 680건까지 증가했습니다.
                분기별로는 2023 Q4 850건에서 2024 Q4 1,100건으로 약 29.4% 증가했습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 2. 트렌드 분석 */}
        <div className="pdf-section" data-section-index="1" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">2. 트렌드 분석</h3>
          <div 
            style={{ 
              pageBreakInside: 'avoid', 
              breakInside: 'avoid'
            }}
          >
            <div className="grid grid-cols-2 gap-6">
              {/* 공고 트렌드 (라인 차트) */}
              <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  공고 트렌드
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={postingTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis domain={[0, 700]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#C91A2A"
                      strokeWidth={2}
                      dot={{ fill: '#C91A2A', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 분기별 트렌드 (바 차트) */}
              <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  분기별 트렌드
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={quarterlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="quarter" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis domain={[0, 1200]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill="#6b7280" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI 리포트 텍스트 - 트렌드 분석 */}
            <div className="mt-6 prose max-w-none">
              <div className="space-y-3 text-base leading-relaxed text-gray-700">
                <p>
                  공고 트렌드를 분석한 결과, 월별로 지속적인 증가 추세를 보이고 있습니다.
                  특히 2024년 초반부터 급격한 증가세를 보이며, 이는 IT 업계의 인력 수요가
                  크게 증가하고 있음을 시사합니다.
                </p>
                <p>
                  분기별 트렌드에서도 동일한 패턴이 관찰되며, 각 분기마다 약 5-7%의 성장률을
                  보이고 있어 안정적인 성장세를 유지하고 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 직무별 분석 */}
        <div className="pdf-section" data-section-index="2" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">3. 직무별 분석</h3>
          <p className="text-gray-600 mb-4">필요 기술을 분석했어요...</p>

          {/* 직무 필터 버튼 */}
          <div className="flex flex-wrap gap-3 mb-6">
            {['전체', 'Software Development', 'Factory AX Engineering', 'Solution Development', 'Cloud/Infra Engineering', 'Architect', 'Project Management', 'Quality Management', 'AI', '정보보호', 'Sales', 'Domain Expert', 'Consulting', 'Biz. Supporting'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedJobRole(role)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedJobRole === role
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {selectedJobRole !== '전체' && currentTechs.used.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-6 mb-4">
                {/* 사용된 기술 */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    사용된 기술
                  </h3>
                  <div className="space-y-3">
                    {currentTechs.used.map((tech, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{tech.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{tech.count}건</span>
                            <span className="text-sm font-semibold text-gray-900">
                              ({tech.percentage}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-gray-700 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${tech.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 제외된 기술 */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    제외된 기술
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentTechs.unused.map((tech, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700"
                      >
                        <span>{tech}</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 대표적 직무 표시 */}
              {currentTechs.representative && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                  <p className="text-sm text-gray-600">
                    ※ 대표적 직무{' '}
                    <span className="font-medium text-gray-900">
                      {currentTechs.representative}
                    </span>
                  </p>
                </div>
              )}
            </>
          )}

          {selectedJobRole === '전체' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-gray-600 text-center">직무를 선택해주세요</p>
            </div>
          )}

          {/* AI 리포트 텍스트 - 직무별 분석 */}
          <div className="mt-6 prose max-w-none">
            <div className="space-y-3 text-base leading-relaxed text-gray-700">
              <p>
                직무별 기술 스택 분석 결과, 각 직무마다 선호하는 기술과 사용하지 않는 기술이 명확하게 구분됩니다.
              </p>
              {selectedJobRole !== '전체' && currentTechs.used.length > 0 && (
                <>
                  <p>
                    <strong>{selectedJobRole}</strong> 직무의 경우:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>주요 사용 기술</strong>: {currentTechs.used.map(t => t.name).join(', ')}
                    </li>
                    <li>
                      <strong>사용하지 않는 기술</strong>: {currentTechs.unused.join(', ')}
                    </li>
                  </ul>
                  <p>
                    특히 {currentTechs.used[0]?.name} 기술은 {currentTechs.used[0]?.percentage}%의 공고에서 요구되고 있어
                    해당 직무의 핵심 기술로 자리잡고 있습니다.
                  </p>
                </>
              )}
              <p>
                최근 등장한 새로운 직무로는 AI/ML 엔지니어, 데이터 엔지니어, DevOps 엔지니어 등이 있으며,
                이러한 직무들은 클라우드 기술과 자동화 도구에 대한 요구가 높은 특징을 보입니다.
              </p>
            </div>
          </div>
        </div>

        {/* 4. 비교 분석 */}
        <div className="pdf-section" data-section-index="3" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">4. 비교 분석</h3>
          <div className="prose max-w-none">
            <div className="space-y-3 text-base leading-relaxed text-gray-700">
              <p>
                우리 회사(SK AX)의 포지셔닝을 경쟁사와 비교한 결과:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>공고 발행 수</strong>: 경쟁사 대비 중간 수준으로, 시장 점유율 확보를 위한 전략적 접근이 필요합니다.
                </li>
                <li>
                  <strong>기술 스택</strong>: 최신 기술 트렌드를 잘 반영하고 있으며, 특히 클라우드 및 AI/ML 분야에서 강점을 보이고 있습니다.
                </li>
                <li>
                  <strong>타이밍</strong>: 시장 동향을 적절히 파악하여 공고를 발행하고 있어 경쟁력 있는 포지셔닝을 유지하고 있습니다.
                </li>
              </ul>
              <p>
                전반적으로 우리 회사는 기술 혁신과 시장 트렌드에 대한 이해도가 높으며,
                경쟁사 대비 차별화된 채용 전략을 수립할 수 있는 기반을 갖추고 있습니다.
              </p>
            </div>
          </div>
        </div>
        </section>
      </div>
    </div>
  )
}
