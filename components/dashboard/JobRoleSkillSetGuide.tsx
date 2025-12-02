'use client'

import { useState } from 'react'

interface JobRole {
  name: string
  skillSets: string[]
}

interface CategoryData {
  category: string
  jobRoles: JobRole[]
}

const jobRoleData: CategoryData[] = [
  {
    category: 'Tech 전문가',
    jobRoles: [
      {
        name: 'Software Development',
        skillSets: ['Front-end Development', 'Back-end Development', 'Mobile Development']
      },
      {
        name: 'Factory AX Engineering',
        skillSets: ['Simulation', '기구설계', '전장/제어']
      },
      {
        name: 'Solution Development',
        skillSets: ['ERP_FCM', 'ERP_SCM', 'ERP_HCM', 'ERP_T&E', 'Biz. Solution']
      },
      {
        name: 'Cloud/Infra Engineering',
        skillSets: ['System/Network Engineering', 'Middleware/Database Engineering', 'Data Center Engineering']
      },
      {
        name: 'Architect',
        skillSets: ['Software Architect', 'Data Architect', 'Infra Architect', 'AI Architect', 'Automation Architect']
      },
      {
        name: 'Project Management',
        skillSets: ['Application PM', 'Infra PM', 'Solution PM', 'AI PM', 'Automation PM']
      },
      {
        name: 'Quality Management',
        skillSets: ['PMO', 'Quality Engineering', 'Offshoring Service Professional']
      },
      {
        name: 'AI',
        skillSets: ['AI/Data Development', 'Generative AI Development', 'Physical AI Development']
      },
      {
        name: '정보보호',
        skillSets: ['보안 Governance / Compliance', '보안 진단/Consulting', '보안 Solution Service']
      }
    ]
  },
  {
    category: 'Biz. 전문가',
    jobRoles: [
      {
        name: 'Sales',
        skillSets: [
          '[금융] 제1금융',
          '[금융] 제2금융',
          '[공공/Global] 공공',
          '[공공/Global] Global',
          '[제조] 대외',
          '[제조] 대내 Hi-Tech',
          '[제조] 대내 Process',
          '[B2C] 통신',
          '[B2C] 유통/물류/서비스',
          '[B2C] 미디어/콘텐츠'
        ]
      },
      {
        name: 'Domain Expert',
        skillSets: ['금융 도메인', '제조 도메인', '공공 도메인', 'B2C 도메인']
      },
      {
        name: 'Consulting',
        skillSets: ['ESG', 'SHE', 'ERP', 'CRM', 'SCM', 'AI']
      }
    ]
  },
  {
    category: 'Biz. Supporting 전문가',
    jobRoles: [
      {
        name: 'Biz. Supporting',
        skillSets: [
          'Strategy Planning',
          'New Biz. Development',
          'Financial Management',
          'Human Resource Management',
          'Stakeholder Management',
          'Governance & Public Management'
        ]
      }
    ]
  }
]

export default function JobRoleSkillSetGuide() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tech 전문가')

  const currentCategoryData = jobRoleData.find(cat => cat.category === selectedCategory)

  return (
    <div className="h-full flex flex-col">
      {/* 탭 */}
      <div className="flex gap-2 mb-4 border-b border-gray-200 flex-shrink-0">
        {jobRoleData.map((category) => (
          <button
            key={category.category}
            onClick={() => setSelectedCategory(category.category)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              selectedCategory === category.category
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {category.category}
          </button>
        ))}
      </div>

      {/* 직무 목록 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-3">
          {currentCategoryData?.jobRoles.map((jobRole) => (
            <div
              key={jobRole.name}
              className="border border-gray-200 rounded-lg px-4 py-3 bg-white flex items-center gap-4"
            >
              <div className="flex-shrink-0 min-w-[200px]">
                <span className="text-sm font-semibold text-gray-900">{jobRole.name}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({jobRole.skillSets.length}개)
                </span>
              </div>
              
              <div className="flex-1 flex flex-wrap gap-2">
                {jobRole.skillSets.map((skillSet, index) => (
                  <div
                    key={index}
                    className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700"
                  >
                    {skillSet}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
        <div className="text-xs text-gray-500 text-center">
          직무 13개, Skill set 55개
        </div>
      </div>
    </div>
  )
}

