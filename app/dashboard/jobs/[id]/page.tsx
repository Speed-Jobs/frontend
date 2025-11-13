'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import jobPostingsData from '@/data/jobPostings.json'

interface PostedAt {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

interface Company {
  id: number
  name: string
}

interface JobPosting {
  id: number
  title: string
  role: string
  experience: string
  daysLeft: number
  postedAt: PostedAt
  closeAt: PostedAt
  applyUrl: string
  skills: string[]
  company: Company
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const jobId = params.id as string
        const apiUrl = `http://172.20.10.2:8080/api/v1/posts/${jobId}`
        
        console.log('=== 상세 공고 API 호출 ===')
        console.log('호출 URL:', apiUrl)
        console.log('호출 시각:', new Date().toISOString())
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        })
        
        console.log('응답 상태:', response.status)
        console.log('응답 URL:', response.url)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('백엔드에서 받은 상세 데이터:', result)
        
        if (result.data) {
          setJob(result.data)
        } else {
          // 백엔드 데이터가 없으면 기본 데이터에서 찾기
          const foundJob = jobPostingsData.find((j) => j.id === parseInt(jobId))
          if (foundJob) {
            // 기본 데이터를 백엔드 형식으로 변환
            const today = new Date()
            const postedDate = new Date(foundJob.posted_date)
            const expiredDate = foundJob.expired_date ? new Date(foundJob.expired_date) : null
            
            const transformedJob: JobPosting = {
              id: foundJob.id,
              title: foundJob.title,
              role: foundJob.meta_data?.job_category || '개발',
              experience: foundJob.experience,
              daysLeft: expiredDate ? Math.ceil((expiredDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0,
              postedAt: {
                year: postedDate.getFullYear(),
                month: postedDate.getMonth() + 1,
                day: postedDate.getDate(),
                hour: postedDate.getHours(),
                minute: postedDate.getMinutes(),
                second: postedDate.getSeconds(),
              },
              closeAt: expiredDate ? {
                year: expiredDate.getFullYear(),
                month: expiredDate.getMonth() + 1,
                day: expiredDate.getDate(),
                hour: expiredDate.getHours(),
                minute: expiredDate.getMinutes(),
                second: expiredDate.getSeconds(),
              } : {
                year: 0,
                month: 0,
                day: 0,
                hour: 0,
                minute: 0,
                second: 0,
              },
              applyUrl: '',
              skills: foundJob.meta_data?.tech_stack || [],
              company: {
                id: 0,
                name: foundJob.company.replace('(주)', '').trim(),
              },
            }
            setJob(transformedJob)
          } else {
            setJob(null)
          }
        }
      } catch (err) {
        console.error('=== 상세 공고 API 호출 에러 ===')
        console.error('에러 타입:', err instanceof Error ? err.constructor.name : typeof err)
        console.error('에러 메시지:', err instanceof Error ? err.message : String(err))
        
        // 에러 발생 시 기본 데이터에서 찾기
        const jobId = parseInt(params.id as string)
        const foundJob = jobPostingsData.find((j) => j.id === jobId)
        if (foundJob) {
          const today = new Date()
          const postedDate = new Date(foundJob.posted_date)
          const expiredDate = foundJob.expired_date ? new Date(foundJob.expired_date) : null
          
          const transformedJob: JobPosting = {
            id: foundJob.id,
            title: foundJob.title,
            role: foundJob.meta_data?.job_category || '개발',
            experience: foundJob.experience,
            daysLeft: expiredDate ? Math.ceil((expiredDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0,
            postedAt: {
              year: postedDate.getFullYear(),
              month: postedDate.getMonth() + 1,
              day: postedDate.getDate(),
              hour: postedDate.getHours(),
              minute: postedDate.getMinutes(),
              second: postedDate.getSeconds(),
            },
            closeAt: expiredDate ? {
              year: expiredDate.getFullYear(),
              month: expiredDate.getMonth() + 1,
              day: expiredDate.getDate(),
              hour: expiredDate.getHours(),
              minute: expiredDate.getMinutes(),
              second: expiredDate.getSeconds(),
            } : {
              year: 0,
              month: 0,
              day: 0,
              hour: 0,
              minute: 0,
              second: 0,
            },
            applyUrl: '',
            skills: foundJob.meta_data?.tech_stack || [],
            company: {
              id: 0,
              name: foundJob.company.replace('(주)', '').trim(),
            },
          }
          setJob(transformedJob)
          setError('백엔드 API 호출 실패. 기본 데이터를 사용합니다.')
        } else {
          setJob(null)
          setError(err instanceof Error ? err.message : '공고를 불러오는 중 오류가 발생했습니다.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobDetail()
  }, [params.id])

  // 날짜 객체를 문자열로 변환
  const formatDateFromObject = (dateObj: PostedAt) => {
    if (dateObj.year === 0) return '상시채용'
    return `${dateObj.year}년 ${dateObj.month}월 ${dateObj.day}일`
  }

  // 날짜 객체를 Date 객체로 변환
  const dateObjectToDate = (dateObj: PostedAt) => {
    return new Date(dateObj.year, dateObj.month - 1, dateObj.day, dateObj.hour, dateObj.minute, dateObj.second)
  }

  const formatDate = (dateObj: PostedAt) => {
    if (dateObj.year === 0) return '상시채용'
    return dateObjectToDate(dateObj).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getDaysUntilExpiry = (daysLeft: number): string => {
    if (daysLeft < 0) return '마감'
    if (daysLeft === 0) return '오늘 마감'
    return `${daysLeft}일 남음`
  }

  // experience를 한글 형식으로 변환
  const formatExperience = (experience: string) => {
    const experienceMap: Record<string, string> = {
      'ENTRY': '신입',
      'JUNIOR': '경력 1~3년',
      'MID_SENIOR': '경력 3~5년',
      'SENIOR': '경력 5년 이상'
    }
    return experienceMap[experience] || experience
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-600">공고를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="px-8 py-16 max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-lg">공고를 찾을 수 없습니다.</p>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-sk-red text-white rounded-lg hover:bg-sk-red-dark border border-sk-red"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="px-8 py-8 max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          뒤로 가기
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
              <div className="flex items-center gap-4 text-lg text-gray-600">
                <span className="font-semibold">{job.company.name}</span>
                <span>•</span>
                <span>{job.role}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-4 py-2 rounded-lg font-semibold ${
                getDaysUntilExpiry(job.daysLeft).includes('마감')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {getDaysUntilExpiry(job.daysLeft)}
              </span>
              <span className="text-sm text-gray-500">
                {job.role}
              </span>
            </div>
          </div>

          {/* Job Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500 mb-1">직무</p>
              <p className="font-semibold text-gray-900">{job.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">경력</p>
              <p className="font-semibold text-gray-900">{formatExperience(job.experience)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">게시일</p>
              <p className="font-semibold text-gray-900">{formatDate(job.postedAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">마감일</p>
              <p className="font-semibold text-gray-900">{formatDate(job.closeAt)}</p>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        {job.applyUrl && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200">
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full text-center px-8 py-4 bg-sk-red hover:bg-sk-red-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              지원하기 →
            </a>
          </div>
        )}

        {/* Tech Stack */}
        {job.skills && job.skills.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">기술 스택</h2>
            <div className="flex flex-wrap gap-3">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium border border-gray-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">추가 정보</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">공고 게시일</span>
              <span className="font-semibold text-gray-900">{formatDate(job.postedAt)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">공고 마감일</span>
              <span className="font-semibold text-gray-900">{formatDate(job.closeAt)}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600">지원 링크</span>
              {job.applyUrl ? (
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sk-red hover:underline"
                >
                  지원 페이지로 이동 →
                </a>
              ) : (
                <span className="font-semibold text-gray-900">없음</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

