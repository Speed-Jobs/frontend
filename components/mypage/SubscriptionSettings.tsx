'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Search, ChevronDown, Save, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  getSubscriptionSettings,
  saveSubscriptionSettings,
  deleteSubscriptionSettings,
  getSubscriptionOptions,
  getMajorSkills,
  getPositions,
  getCompetitorCompanies,
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
  companies: number[]
  emailNotification: {
    enabled: boolean
    time: string // HH:mm 형식
  }
  slackNotification: {
    enabled: boolean
  }
}

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
  const [technologies, setTechnologies] = useState<Option[]>([])
  const [jobRoles, setJobRoles] = useState<Option[]>([])
  const [companies, setCompanies] = useState<Option[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 구독 설정 폼 상태
  const [formData, setFormData] = useState<SubscriptionFormData>({
    technologies: [],
    jobRoles: [],
    companies: [],
    emailNotification: {
      enabled: true,
      time: '08:00', // 매일 오전 8시 (고정)
    },
    slackNotification: {
      enabled: false,
    },
  })

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // 기술 스택 목록을 새로운 API로 가져오기
        let loadedTechnologies: Option[] = []
        try {
          const skills = await getMajorSkills()
          loadedTechnologies = skills
          setTechnologies(skills)
        } catch (error) {
          // 무시
        }

        // 직군 목록을 새로운 API로 가져오기
        let loadedJobRoles: Option[] = []
        try {
          const positions = await getPositions()
          loadedJobRoles = positions
          setJobRoles(positions)
        } catch (error) {
          // 무시
        }

        // 경쟁사 목록을 새로운 API로 가져오기
        let loadedCompanies: Option[] = []
        try {
          const companies = await getCompetitorCompanies()
          loadedCompanies = companies
          setCompanies(companies)
        } catch (error) {
          // 무시
        }

        // 저장된 구독 설정 로드 및 기술 ID 필터링
        try {
          const saved = localStorage.getItem('subscriptionSettings')
          if (saved) {
            const savedData = JSON.parse(saved)
            
            // 기술 목록이 로드되었고 저장된 기술 ID가 있으면 유효한 ID만 필터링
            let validTechIds = savedData.technologies || []
            if (loadedTechnologies.length > 0 && Array.isArray(savedData.technologies)) {
              validTechIds = savedData.technologies.filter((id: number) => 
                loadedTechnologies.some(tech => tech.id === id)
              )
            }

            // 직군 목록이 로드되었고 저장된 직군 ID가 있으면 유효한 ID만 필터링
            let validJobRoleIds = savedData.jobRoles || []
            if (loadedJobRoles.length > 0 && Array.isArray(savedData.jobRoles)) {
              validJobRoleIds = savedData.jobRoles.filter((id: number) => 
                loadedJobRoles.some(role => role.id === id)
              )
            }

            // 경쟁사 목록이 로드되었고 저장된 경쟁사 ID가 있으면 유효한 ID만 필터링
            let validCompanyIds = savedData.companies || []
            if (loadedCompanies.length > 0 && Array.isArray(savedData.companies)) {
              validCompanyIds = savedData.companies.filter((id: number) => 
                loadedCompanies.some(company => company.id === id)
              )
            }

            // 유효하지 않은 ID가 있으면 localStorage 업데이트
            if (validTechIds.length !== (savedData.technologies || []).length ||
                validJobRoleIds.length !== (savedData.jobRoles || []).length ||
                validCompanyIds.length !== (savedData.companies || []).length) {
              const updatedData = {
                ...savedData,
                technologies: validTechIds,
                jobRoles: validJobRoleIds,
                companies: validCompanyIds,
              }
              localStorage.setItem('subscriptionSettings', JSON.stringify(updatedData))
            }
            
            setFormData({
              technologies: validTechIds,
              jobRoles: validJobRoleIds,
              companies: validCompanyIds,
              emailNotification: savedData.emailNotification ? {
                ...savedData.emailNotification,
                time: '08:00', // 알림 시간은 오전 8:00로 고정
              } : {
                enabled: true,
                time: '08:00',
              },
              slackNotification: savedData.slackNotification ? {
                ...savedData.slackNotification,
              } : {
                enabled: false,
              },
            })
          }
        } catch (error) {
          // 무시
        }
      } catch (error) {
        // 무시
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

      // 백엔드 API에 저장
      try {
        const result = await saveSubscriptionSettings(subscriptionData)
        
        // API 저장 성공 시 localStorage에도 백업 저장
        const dataToSave = {
          ...formData,
          emailNotification: {
            ...formData.emailNotification,
            time: '08:00', // 알림 시간은 오전 8:00로 고정
          },
          slackNotification: {
            ...formData.slackNotification,
          },
        }
        localStorage.setItem('subscriptionSettings', JSON.stringify(dataToSave))
        
        // API 성공 메시지 표시
        setSaveMessage({ 
          type: 'success', 
          text: result.message || '구독 설정이 저장되었습니다.' 
        })
      } catch (apiError: any) {
        // API 실패 시 에러 메시지 표시
        setSaveMessage({
          type: 'error',
          text: apiError.message || '구독 설정 저장에 실패했습니다. 다시 시도해주세요.',
        })
        return // API 실패 시 저장 중단
      }

      if (onSave) {
        onSave(subscriptionData)
      }

      // 3초 후 메시지 제거
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error: any) {
      setSaveMessage({ 
        type: 'error', 
        text: error.message || '저장 중 오류가 발생했습니다.' 
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 구독 취소
  const handleDelete = async () => {
    // 확인 대화상자
    if (!confirm('정말 구독을 취소하시겠습니까? 모든 구독 설정이 삭제됩니다.')) {
      return
    }

    setIsDeleting(true)
    setSaveMessage(null)

    try {
      // 백엔드 API에서 구독 취소 시도
      try {
        await deleteSubscriptionSettings()
        setSaveMessage({ type: 'success', text: '구독이 취소되었습니다.' })
        
        // 폼 데이터 초기화
        setFormData({
          technologies: [],
          jobRoles: [],
          companies: [],
          emailNotification: {
            enabled: true,
            time: '08:00',
          },
          slackNotification: {
            enabled: false,
          },
        })
        
        // localStorage에서도 삭제
        localStorage.removeItem('subscriptionSettings')
        
        if (onSave) {
          onSave({
            technologies: [],
            jobRoles: [],
            companies: [],
          })
        }
      } catch (apiError: any) {
        setSaveMessage({
          type: 'error',
          text: apiError.message || '구독 취소 중 오류가 발생했습니다.',
        })
      }

      // 3초 후 메시지 제거
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      setSaveMessage({ type: 'error', text: '구독 취소 중 오류가 발생했습니다.' })
    } finally {
      setIsDeleting(false)
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
      parts.push(roleNames.join(', '))
    }
    if (companyNames.length > 0) {
      parts.push(`기업: ${companyNames.join(', ')}`)
    }

    const emailText = formData.emailNotification.enabled
      ? `이메일 알림: 매일 08:00`
      : '이메일 알림: 비활성화'
    
    const slackText = formData.slackNotification.enabled
      ? 'Slack 알림: 활성화'
      : 'Slack 알림: 비활성화'

    return parts.length > 0 ? `${parts.join(' | ')} | ${emailText} | ${slackText}` : '조건을 선택해주세요'
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
              closeOnSelect={false}
              showCompleteButton={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">직군</label>
            <SearchableMultiSelect
              options={jobRoles}
              selectedIds={formData.jobRoles}
              onSelectionChange={(ids) => setFormData({ ...formData, jobRoles: ids })}
              placeholder="직군을 선택하세요"
              closeOnSelect={false}
              showCompleteButton={true}
            />
          </div>
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

        {/* Slack 알림 설정 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Slack 알림 설정</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={formData.slackNotification.enabled}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    slackNotification: {
                      enabled: checked === true,
                    },
                  })
                }
              />
              <span className="text-sm text-gray-700">Slack 알림 활성화</span>
            </label>
            {formData.slackNotification.enabled && (
              <p className="text-xs text-gray-500">
                새로운 채용 공고 알림을 Slack으로 받습니다.
              </p>
            )}
          </div>
        </div>

        {/* 구독 미리보기 */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">구독 미리보기</h4>
          <p className="text-sm text-gray-600">{getPreviewText()}</p>
        </div>

        {/* 저장 및 취소 버튼 */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Button
            onClick={handleDelete}
            disabled={isDeleting || isSaving}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                취소 중...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                구독 취소
              </>
            )}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isDeleting}
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
