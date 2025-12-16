'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Search, ChevronDown, Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  getSubscriptionSettings,
  saveSubscriptionSettings,
  getSubscriptionOptions,
  type SubscriptionData,
  type SubscriptionOptions,
} from '@/lib/api/subscription'

// 타입 정의
interface Option {
  id: number
  name: string
}

interface SubscriptionSettingsProps {
  onSave?: (data: SubscriptionData) => void
}

interface SubscriptionFormData {
  technologies: number[]
  jobRoles: number[]
  jobSkills: string[] // 직군별 직무 (Skill set)
  companies: number[]
  emailNotification: {
    enabled: boolean
    time: string // HH:mm 형식
  }
}

// 직군별 직무(Skill set) 매핑
const JOB_ROLE_SKILLS: Record<string, string[]> = {
  'Software Development': ['Front-end Development', 'Back-end Development', 'Mobile Development'],
  'Factory AX Engineering': ['Simulation', '기구설계', '전장/제어'],
  'Solution Development': ['ERP_FCM', 'ERP_SCM', 'ERP_HCM', 'ERP_T&E', 'Biz. Solution'],
  'Cloud/Infra Engineering': ['System/Network Engineering', 'Middleware/Database Engineering', 'Data Center Engineering'],
  'Architect': ['Software Architect', 'Data Architect', 'Infra Architect', 'AI Architect', 'Automation Architect'],
  'Project Management': ['Application PM', 'Infra PM', 'Solution PM', 'AI PM', 'Automation PM'],
  'Quality Management': ['PMO', 'Quality Engineering', 'Offshoring Service Professional'],
  'AI': ['AI/Data Development', 'Generative AI Development', 'Physical AI Development'],
  '정보보호': ['보안 Governance / Compliance', '보안 진단/Consulting', '보안 Solution Service'],
  'Sales': ['[금융] 제1금융', '[금융] 제2금융', '[공공/Global] 공공', '[공공/Global] Global', '[제조] 대외', '[제조] 대내 Hi-Tech', '[제조] 대내 Process', '[B2C] 통신', '[B2C] 유통/물류/서비스', '[B2C] 미디어/콘텐츠'],
  'Domain Expert': ['금융 도메인', '제조 도메인', '공공 도메인', 'B2C 도메인'],
  'Consulting': ['ESG', 'SHE', 'CRM', 'SCM', 'ERP', 'AI'],
  'Biz. Supporting': ['Strategy Planning', 'New Biz. Development', 'Financial Management', 'Human Resource Management', 'Stakeholder Management', 'Governance & Public Management'],
}

// 예시 데이터
const FALLBACK_TECHNOLOGIES: Option[] = [
  { id: 1, name: 'React' },
  { id: 2, name: 'TypeScript' },
  { id: 3, name: 'Node.js' },
  { id: 4, name: 'Python' },
  { id: 5, name: 'Java' },
  { id: 6, name: 'Spring Boot' },
  { id: 7, name: 'Vue.js' },
  { id: 8, name: 'Next.js' },
  { id: 9, name: 'Docker' },
  { id: 10, name: 'Kubernetes' },
  { id: 11, name: 'AWS' },
  { id: 12, name: 'GraphQL' },
  { id: 13, name: 'AI Engineer' },
  { id: 14, name: 'Machine Learning' },
]

const FALLBACK_JOB_ROLES: Option[] = [
  { id: 1, name: 'Software Development' },
  { id: 2, name: 'Factory AX Engineering' },
  { id: 3, name: 'Solution Development' },
  { id: 4, name: 'Cloud/Infra Engineering' },
  { id: 5, name: 'Architect' },
  { id: 6, name: 'Project Management' },
  { id: 7, name: 'Quality Management' },
  { id: 8, name: 'AI' },
  { id: 9, name: '정보보호' },
  { id: 10, name: 'Sales' },
  { id: 11, name: 'Domain Expert' },
  { id: 12, name: 'Consulting' },
  { id: 13, name: 'Biz. Supporting' },
]

const FALLBACK_COMPANIES: Option[] = [
  { id: 1, name: '네이버' },
  { id: 2, name: '카카오' },
  { id: 3, name: '토스' },
  { id: 4, name: '라인' },
  { id: 5, name: '쿠팡' },
  { id: 6, name: '배달의민족' },
  { id: 7, name: '당근마켓' },
  { id: 8, name: '삼성전자' },
  { id: 9, name: 'LG전자' },
  { id: 10, name: 'SK텔레콤' },
]

// 검색 가능한 멀티 셀렉트 드롭다운 컴포넌트
function SearchableMultiSelect({
  options,
  selectedIds,
  onSelectionChange,
  placeholder,
  searchPlaceholder = '검색...',
  closeOnSelect = false, // 선택 시 드롭다운 닫기 옵션
  showCompleteButton = false, // 완료 버튼 표시 옵션
}: {
  options: Option[]
  selectedIds: number[]
  onSelectionChange: (ids: number[]) => void
  placeholder: string
  searchPlaceholder?: string
  closeOnSelect?: boolean
  showCompleteButton?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id))

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
    
    // 선택 시 드롭다운 닫기 옵션이 활성화되어 있으면 닫기
    if (closeOnSelect) {
      setIsOpen(false)
      setSearchQuery('')
    }
  }

  const removeOption = (id: number) => {
    onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:border-gray-400 transition-colors text-left"
      >
        <span className={selectedIds.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
          {selectedIds.length === 0 ? placeholder : `${selectedIds.length}개 선택됨`}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col max-h-80">
          <div className="p-2 border-b border-gray-200 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 min-h-0">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">검색 결과가 없습니다</div>
            ) : (
              <div className="p-2">
                {filteredOptions.map((option) => {
                  const isSelected = selectedIds.includes(option.id)
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleOption(option.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        isSelected
                          ? 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                          : 'hover:bg-gray-50 text-gray-900'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                          isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                      </div>
                      <span className="flex-1 text-left">{option.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          {showCompleteButton && (
            <div className="p-2 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setSearchQuery('')
                }}
                className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
              >
                선택 완료
              </button>
            </div>
          )}
        </div>
      )}

      {/* 선택된 항목 태그 */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {option.name}
              <button
                type="button"
                onClick={() => removeOption(option.id)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SubscriptionSettings({ onSave }: SubscriptionSettingsProps) {
  const [technologies, setTechnologies] = useState<Option[]>(FALLBACK_TECHNOLOGIES)
  const [jobRoles, setJobRoles] = useState<Option[]>(FALLBACK_JOB_ROLES)
  const [companies, setCompanies] = useState<Option[]>(FALLBACK_COMPANIES)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 구독 설정 폼 상태
  const [formData, setFormData] = useState<SubscriptionFormData>({
    technologies: [],
    jobRoles: [],
    jobSkills: [],
    companies: [],
    emailNotification: {
      enabled: true,
      time: '08:00', // 매일 오전 8시 (고정)
    },
  })

  // 선택된 직군에 해당하는 직무 목록 가져오기
  const getAvailableSkills = (): string[] => {
    const selectedRoleNames = formData.jobRoles
      .map((id) => jobRoles.find((r) => r.id === id)?.name)
      .filter(Boolean) as string[]
    
    const allSkills: string[] = []
    selectedRoleNames.forEach((roleName) => {
      const skills = JOB_ROLE_SKILLS[roleName] || []
      allSkills.push(...skills)
    })
    
    // 중복 제거
    return Array.from(new Set(allSkills))
  }

  // 직군 선택 시 해당 직군의 직무가 선택 해제되도록 처리
  const handleJobRoleChange = (ids: number[]) => {
    const previousRoleIds = formData.jobRoles
    const newRoleIds = ids
    
    // 제거된 직군 찾기
    const removedRoles = previousRoleIds.filter(id => !newRoleIds.includes(id))
    
    // 제거된 직군의 직무들도 제거
    let updatedSkills = [...formData.jobSkills]
    removedRoles.forEach(roleId => {
      const roleName = jobRoles.find(r => r.id === roleId)?.name
      if (roleName && JOB_ROLE_SKILLS[roleName]) {
        updatedSkills = updatedSkills.filter(skill => !JOB_ROLE_SKILLS[roleName].includes(skill))
      }
    })
    
    setFormData({ ...formData, jobRoles: ids, jobSkills: updatedSkills })
  }

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const options = await getSubscriptionOptions().catch(() => null)
        if (options) {
          setTechnologies(options.technologies)
          setJobRoles(options.jobRoles)
          setCompanies(options.companies)
        }

        // 저장된 구독 설정 로드
        try {
          const saved = localStorage.getItem('subscriptionSettings')
          if (saved) {
            const savedData = JSON.parse(saved)
            setFormData({
              technologies: savedData.technologies || [],
              jobRoles: savedData.jobRoles || [],
              jobSkills: savedData.jobSkills || [],
              companies: savedData.companies || [],
              emailNotification: savedData.emailNotification ? {
                ...savedData.emailNotification,
                time: '08:00', // 알림 시간은 오전 8:00로 고정
              } : {
                enabled: true,
                time: '08:00',
              },
            })
          }
        } catch (error) {
          console.warn('저장된 설정 로드 실패:', error)
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // 알림 시간을 항상 08:00로 고정
  useEffect(() => {
    if (formData.emailNotification.time !== '08:00') {
      setFormData((prev) => ({
        ...prev,
        emailNotification: {
          ...prev.emailNotification,
          time: '08:00',
        },
      }))
    }
  }, [formData.emailNotification.time])

  // 구독 설정 저장
  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const subscriptionData: SubscriptionData = {
        technologies: formData.technologies,
        jobRoles: formData.jobRoles,
        companies: formData.companies,
      }

      // 백엔드 API에 저장 시도
      try {
        await saveSubscriptionSettings(subscriptionData)
        setSaveMessage({ type: 'success', text: '구독 설정이 저장되었습니다.' })
      } catch (apiError) {
        console.warn('API 저장 실패, localStorage에 저장합니다.', apiError)
        // API 실패 시 localStorage에 저장 (알림 시간은 항상 08:00로 고정)
        const dataToSave = {
          ...formData,
          emailNotification: {
            ...formData.emailNotification,
            time: '08:00', // 알림 시간은 오전 8:00로 고정
          },
        }
        localStorage.setItem('subscriptionSettings', JSON.stringify(dataToSave))
        setSaveMessage({
          type: 'success',
          text: '구독 설정이 로컬에 저장되었습니다.',
        })
      }

      if (onSave) {
        onSave(subscriptionData)
      }

      // 3초 후 메시지 제거
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('구독 설정 저장 실패:', error)
      setSaveMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' })
    } finally {
      setIsSaving(false)
    }
  }

  // 구독 미리보기 텍스트 생성
  const getPreviewText = () => {
    const parts: string[] = []

    const techNames = formData.technologies
      .map((id) => technologies.find((t) => t.id === id)?.name)
      .filter(Boolean)
    const roleNames = formData.jobRoles
      .map((id) => jobRoles.find((r) => r.id === id)?.name)
      .filter(Boolean)
    const companyNames = formData.companies
      .map((id) => companies.find((c) => c.id === id)?.name)
      .filter(Boolean)

    if (techNames.length > 0) parts.push(techNames.join(', '))
    if (roleNames.length > 0) {
      const roleText = roleNames.join(', ')
      const skillsText = formData.jobSkills.length > 0 
        ? ` (${formData.jobSkills.slice(0, 3).join(', ')}${formData.jobSkills.length > 3 ? '...' : ''})`
        : ''
      parts.push(`${roleText}${skillsText}`)
    }
    if (companyNames.length > 0) {
      parts.push(`기업: ${companyNames.join(', ')}`)
    }

    const emailText = formData.emailNotification.enabled
      ? `이메일 알림: 매일 08:00`
      : '이메일 알림: 비활성화'

    return parts.length > 0 ? `${parts.join(' | ')} | ${emailText}` : '조건을 선택해주세요'
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>구독 및 알림 설정</CardTitle>
        <CardDescription>관심 있는 항목을 선택하여 맞춤 알림을 받아보세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 저장 메시지 */}
        {saveMessage && (
          <div
            className={`p-3 rounded-lg ${
              saveMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        {/* 관심 설정 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">관심 설정</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">기술</label>
            <SearchableMultiSelect
              options={technologies}
              selectedIds={formData.technologies}
              onSelectionChange={(ids) => setFormData({ ...formData, technologies: ids })}
              placeholder="기술을 선택하세요"
              closeOnSelect={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">직군</label>
            <SearchableMultiSelect
              options={jobRoles}
              selectedIds={formData.jobRoles}
              onSelectionChange={handleJobRoleChange}
              placeholder="직군을 선택하세요"
              closeOnSelect={true}
            />
          </div>

          {/* 선택된 직군의 직무 선택 */}
          {formData.jobRoles.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">직무 (Skill set)</label>
              <div className="space-y-2">
                {formData.jobRoles.map((roleId) => {
                  const role = jobRoles.find((r) => r.id === roleId)
                  if (!role) return null
                  
                  const roleSkills = JOB_ROLE_SKILLS[role.name] || []
                  const selectedSkillsForRole = formData.jobSkills.filter(skill => 
                    roleSkills.includes(skill)
                  )
                  
                  return (
                    <div key={roleId} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{role.name}</span>
                        <span className="text-xs text-gray-500">
                          {selectedSkillsForRole.length}/{roleSkills.length} 선택됨
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {roleSkills.map((skill) => {
                          const isSelected = formData.jobSkills.includes(skill)
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => {
                                const updatedSkills = isSelected
                                  ? formData.jobSkills.filter(s => s !== skill)
                                  : [...formData.jobSkills, skill]
                                setFormData({ ...formData, jobSkills: updatedSkills })
                              }}
                              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                              }`}
                            >
                              {skill}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* 선택된 직무 태그 */}
              {formData.jobSkills.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-2">선택된 직무:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.jobSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              jobSkills: formData.jobSkills.filter(s => s !== skill),
                            })
                          }}
                          className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 기업 선택 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">경쟁사 선택</h3>
          
          <SearchableMultiSelect
            options={companies}
            selectedIds={formData.companies}
            onSelectionChange={(ids) => setFormData({ ...formData, companies: ids })}
            placeholder="경쟁사를 검색하여 선택하세요"
            showCompleteButton={true}
          />
        </div>

        {/* 이메일 알림 설정 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">이메일 알림 설정</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={formData.emailNotification.enabled}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    emailNotification: {
                      ...formData.emailNotification,
                      enabled: checked === true,
                    },
                  })
                }
              />
              <span className="text-sm text-gray-700">이메일 알림 활성화</span>
            </label>
            {formData.emailNotification.enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  알림 시간
                </label>
                <Input
                  type="time"
                  value="08:00"
                  disabled
                  className="w-full max-w-xs bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  매일 오전 8:00에 새로운 채용 공고 알림을 이메일로 받습니다.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 구독 미리보기 */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">구독 미리보기</h4>
          <p className="text-sm text-gray-600">{getPreviewText()}</p>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                설정 저장
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
