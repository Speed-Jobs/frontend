'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Send, X, Minimize2, Maximize2, Bot, LayoutDashboard, Calendar, Star, Building2, TrendingUp, Users, Briefcase, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react'

interface JobPosting {
  id: number
  title: string
  companyName?: string
  role?: string
  experience?: string
  skills?: string[]
  postedAt?: {
    year: number
    month: number
    day: number
  }
  closeAt?: {
    year: number
    month: number
    day: number
  }
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  components?: ChatComponent[]
  jobPostings?: JobPosting[]
}

interface ChatComponent {
  id: string
  title: string
  description: string
  route: string
  icon?: string
}

// 대시보드 페이지 정보 매핑
const DASHBOARD_PAGES: Record<string, { route: string; description: string; icon: string }> = {
  '채용 일정': {
    route: '/dashboard/recruitment-schedule',
    description: '경쟁사 채용 일정을 시각화하고 최적의 채용 전략을 수립하세요',
    icon: '📅'
  },
  '채용 일정 분석': {
    route: '/dashboard/recruitment-schedule',
    description: '경쟁사 채용 일정을 시각화하고 최적의 채용 전략을 수립하세요',
    icon: '📅'
  },
  '대시보드': {
    route: '/dashboard',
    description: '전체 대시보드 메인 페이지',
    icon: '📊'
  },
  '메인 대시보드': {
    route: '/dashboard',
    description: '전체 대시보드 메인 페이지',
    icon: '📊'
  },
  '공고품질 평가': {
    route: '/quality',
    description: '채용 공고의 품질을 평가하고 분석합니다',
    icon: '⭐'
  },
  '회사별 공고': {
    route: '/companies',
    description: '회사별 채용 공고를 확인하세요',
    icon: '🏢'
  },
}

  // AI 응답 생성 함수 (간단한 키워드 매칭 기반)
function generateAIResponse(query: string): { content: string; components?: ChatComponent[] } {
  const lowerQuery = query.toLowerCase()
  
  // 채용 일정 관련 질문
  if (lowerQuery.includes('채용 일정') || lowerQuery.includes('일정') || lowerQuery.includes('스케줄') || 
      lowerQuery.includes('캘린더') || lowerQuery.includes('달력') || lowerQuery.includes('recruitment schedule')) {
    return {
      content: '채용 일정 분석 페이지에서 경쟁사 채용 일정을 확인하고 관리할 수 있습니다.',
      components: [{
        id: 'recruitment-schedule',
        title: '채용 일정 분석',
        description: '경쟁사 채용 일정 시각화 및 분석',
        route: '/dashboard/recruitment-schedule',
        icon: '📅'
      }]
    }
  }
  
  // 대시보드 관련 질문
  if (lowerQuery.includes('대시보드') || lowerQuery.includes('메인') || lowerQuery.includes('홈') || 
      lowerQuery.includes('dashboard') || lowerQuery.includes('통계') || lowerQuery.includes('인사이트')) {
    return {
      content: '대시보드 메인 페이지에서 전체 통계와 인사이트를 확인할 수 있습니다.',
      components: [{
        id: 'dashboard',
        title: '대시보드',
        description: '전체 통계 및 인사이트 확인',
        route: '/dashboard',
        icon: '📊'
      }]
    }
  }
  
  // 공고 품질 관련 질문
  if (lowerQuery.includes('품질') || lowerQuery.includes('평가') || (lowerQuery.includes('공고') && lowerQuery.includes('품질')) ||
      lowerQuery.includes('quality') || lowerQuery.includes('분석')) {
    return {
      content: '공고품질 평가 페이지에서 채용 공고의 품질을 평가하고 분석할 수 있습니다.',
      components: [{
        id: 'quality',
        title: '공고품질 평가',
        description: '채용 공고 품질 평가 및 분석',
        route: '/quality',
        icon: '⭐'
      }]
    }
  }
  
  // 회사 관련 질문
  if (lowerQuery.includes('회사') || lowerQuery.includes('기업') || lowerQuery.includes('company') ||
      (lowerQuery.includes('채용') && lowerQuery.includes('공고')) || lowerQuery.includes('공고 목록')) {
    return {
      content: '회사별 공고 페이지에서 각 회사의 채용 공고를 확인할 수 있습니다.',
      components: [{
        id: 'companies',
        title: '회사별 공고',
        description: '회사별 채용 공고 확인',
        route: '/companies',
        icon: '🏢'
      }]
    }
  }
  
  // 여러 페이지를 추천하는 경우
  if (lowerQuery.includes('모든') || lowerQuery.includes('전체') || lowerQuery.includes('목록') ||
      lowerQuery.includes('어떤') || lowerQuery.includes('뭐가') || lowerQuery.includes('기능')) {
    return {
      content: '다음 페이지들을 확인해보세요:',
      components: [
        {
          id: 'dashboard',
          title: '대시보드',
          description: '전체 통계 및 인사이트',
          route: '/dashboard',
          icon: '📊'
        },
        {
          id: 'recruitment-schedule',
          title: '채용 일정 분석',
          description: '경쟁사 채용 일정 시각화',
          route: '/dashboard/recruitment-schedule',
          icon: '📅'
        },
        {
          id: 'quality',
          title: '공고품질 평가',
          description: '채용 공고 품질 평가',
          route: '/quality',
          icon: '⭐'
        },
        {
          id: 'companies',
          title: '회사별 공고',
          description: '회사별 채용 공고 확인',
          route: '/companies',
          icon: '🏢'
        }
      ]
    }
  }
  
  // 기본 응답
  return {
    content: '어떤 기능을 찾고 계신가요? 채용 일정, 대시보드, 공고 품질 평가, 회사별 공고 등에 대해 물어보실 수 있습니다.',
    components: [
      {
        id: 'dashboard',
        title: '대시보드',
        description: '전체 통계 및 인사이트',
        route: '/dashboard',
        icon: '📊'
      },
      {
        id: 'recruitment-schedule',
        title: '채용 일정 분석',
        description: '경쟁사 채용 일정 시각화',
        route: '/dashboard/recruitment-schedule',
        icon: '📅'
      }
    ]
  }
}

export default function AIChatbot() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  
  // 페이지 변경 시 위치를 초기화하여 모든 페이지에서 동일한 위치에 표시
  useEffect(() => {
    setPosition(null)
  }, [pathname])
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 480, height: 700 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number; left: number; top: number } | null>(null)
  const chatbotRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '안녕하세요! 궁금한 것 무엇이든 물어보세요.'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 공고 상세 정보 가져오기 함수
  const fetchJobPostings = async (postIds: number[]): Promise<JobPosting[]> => {
    const jobPostings: JobPosting[] = []
    
    // 각 post_id로 공고 정보 가져오기
    const fetchPromises = postIds.map(async (postId) => {
      try {
        const response = await fetch(`https://speedjobs-spring.skala25a.project.skala-ai.com/api/v1/posts/${postId}`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
          },
          mode: 'cors',
          credentials: 'omit',
        })
        if (!response.ok) {
          console.warn(`공고 ${postId} 정보를 가져올 수 없습니다.`)
          return null
        }
        const result = await response.json()
        
        if (result.status === 200 && result.data) {
          const job = result.data
          return {
            id: job.id || postId,
            title: job.title || '',
            companyName: job.companyName || job.company?.name || '',
            role: job.role || '',
            experience: job.experience || '',
            skills: Array.isArray(job.skills) ? job.skills : [],
            postedAt: job.postedAt || job.registeredAt || null,
            closeAt: job.closeAt || null,
          } as JobPosting
        }
        return null
      } catch (error) {
        console.error(`공고 ${postId} 정보 가져오기 실패:`, error)
        return null
      }
    })
    
    const results = await Promise.all(fetchPromises)
    return results.filter((job): job is JobPosting => job !== null)
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim()
    }

    setMessages(prev => [...prev, userMessage])
    const question = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    // 로딩 메시지 추가
    const loadingMessageId = (Date.now() + 1).toString()
    const loadingMessage: Message = {
      id: loadingMessageId,
      type: 'assistant',
      content: '답변을 생성하는 중...'
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      // API 호출
      const response = await fetch('https://speedjobs-backend.skala25a.project.skala-ai.com/rag/search', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: question
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // sources에서 post_id 추출
      const postIds: number[] = []
      if (result.sources && Array.isArray(result.sources)) {
        result.sources.forEach((source: any) => {
          if (source.post_id && typeof source.post_id === 'number') {
            postIds.push(source.post_id)
          } else if (source.metadata?.post_id && typeof source.metadata.post_id === 'number') {
            postIds.push(source.metadata.post_id)
          }
        })
      }

      // 중복 제거
      const uniquePostIds = Array.from(new Set(postIds))

      // 공고 정보 가져오기
      let jobPostings: JobPosting[] = []
      if (uniquePostIds.length > 0) {
        jobPostings = await fetchJobPostings(uniquePostIds)
      }

      // 로딩 메시지 제거하고 실제 응답 추가
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessageId)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: result.answer || '답변을 생성할 수 없습니다.',
          jobPostings: jobPostings.length > 0 ? jobPostings : undefined
        }
        return [...filtered, assistantMessage]
      })
    } catch (error) {
      // 에러 발생 시 로딩 메시지 제거하고 에러 메시지 추가
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessageId)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.'
        }
        return [...filtered, errorMessage]
      })
      console.error('API 호출 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleComponentClick = (route: string) => {
    router.push(route)
  }

  // 빠른 질문 메뉴 항목들
  const quickQuestions = [
    { text: '2025년 하반기 토스 채용공고수와 이를 기반으로 웹에서 사업동향 분석해줘' },
    { text: '2025년 각 분기별 토스 채용 공고 총 몇 개야?' }
  ]

  // 페이지 이동 메뉴 항목들
  const pageMenus = [
    { title: '대시보드', route: '/dashboard', icon: LayoutDashboard, description: '전체 통계 및 인사이트' },
    { title: '채용 일정', route: '/dashboard/recruitment-schedule', icon: Calendar, description: '경쟁사 채용 일정 분석' },
    { title: '공고 품질', route: '/quality', icon: Star, description: '채용 공고 품질 평가' },
    { title: '회사별 공고', route: '/companies', icon: Building2, description: '회사별 채용 공고 확인' }
  ]

  const handleQuickQuestion = async (question: string) => {
    if (isLoading) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // 로딩 메시지 추가
    const loadingMessageId = (Date.now() + 1).toString()
    const loadingMessage: Message = {
      id: loadingMessageId,
      type: 'assistant',
      content: '답변을 생성하는 중...'
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      // API 호출
      const response = await fetch('https://speedjobs-backend.skala25a.project.skala-ai.com/rag/search', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: question
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // sources에서 post_id 추출
      const postIds: number[] = []
      if (result.sources && Array.isArray(result.sources)) {
        result.sources.forEach((source: any) => {
          if (source.post_id && typeof source.post_id === 'number') {
            postIds.push(source.post_id)
          } else if (source.metadata?.post_id && typeof source.metadata.post_id === 'number') {
            postIds.push(source.metadata.post_id)
          }
        })
      }

      // 중복 제거
      const uniquePostIds = Array.from(new Set(postIds))

      // 공고 정보 가져오기
      let jobPostings: JobPosting[] = []
      if (uniquePostIds.length > 0) {
        jobPostings = await fetchJobPostings(uniquePostIds)
      }

      // 로딩 메시지 제거하고 실제 응답 추가
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessageId)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: result.answer || '답변을 생성할 수 없습니다.',
          jobPostings: jobPostings.length > 0 ? jobPostings : undefined
        }
        return [...filtered, assistantMessage]
      })
    } catch (error) {
      // 에러 발생 시 로딩 메시지 제거하고 에러 메시지 추가
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessageId)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.'
        }
        return [...filtered, errorMessage]
      })
      console.error('API 호출 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (chatbotRef.current) {
      const rect = chatbotRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsDragging(true)
    }
  }

  // 리사이즈 시작
  const handleResizeStart = (direction: string) => (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (chatbotRef.current) {
      setIsResizing(true)
      setResizeDirection(direction)
      const rect = chatbotRef.current.getBoundingClientRect()
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: size.width,
        height: size.height,
        left: position?.x ?? (window.innerWidth - rect.width - 24),
        top: position?.y ?? (window.innerHeight - rect.height - 24)
      })
    }
  }

  // 드래그 중
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && chatbotRef.current) {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y
        
        // 화면 경계 체크
        const maxX = window.innerWidth - chatbotRef.current.offsetWidth
        const maxY = window.innerHeight - chatbotRef.current.offsetHeight
        
        const boundedX = Math.max(0, Math.min(newX, maxX))
        const boundedY = Math.max(0, Math.min(newY, maxY))
        
        setPosition({ x: boundedX, y: boundedY })
      } else if (isResizing && resizeStart && resizeDirection) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y
        
        // 최소/최대 크기 제한
        const minWidth = 300
        const minHeight = 400
        const maxWidth = window.innerWidth - 24
        const maxHeight = window.innerHeight - 24
        
        let newWidth = resizeStart.width
        let newHeight = resizeStart.height
        let newLeft = resizeStart.left
        let newTop = resizeStart.top
        
        // 방향에 따라 크기와 위치 조정
        if (resizeDirection.includes('e')) {
          // 우측
          newWidth = Math.max(minWidth, Math.min(maxWidth - resizeStart.left, resizeStart.width + deltaX))
        }
        if (resizeDirection.includes('w')) {
          // 좌측
          const widthChange = resizeStart.width - deltaX
          if (widthChange >= minWidth && resizeStart.left + deltaX >= 0) {
            newWidth = widthChange
            newLeft = resizeStart.left + deltaX
          } else if (widthChange < minWidth) {
            newWidth = minWidth
            newLeft = resizeStart.left + resizeStart.width - minWidth
          }
        }
        if (resizeDirection.includes('s')) {
          // 하단
          newHeight = Math.max(minHeight, Math.min(maxHeight - resizeStart.top, resizeStart.height + deltaY))
        }
        if (resizeDirection.includes('n')) {
          // 상단
          const heightChange = resizeStart.height - deltaY
          if (heightChange >= minHeight && resizeStart.top + deltaY >= 0) {
            newHeight = heightChange
            newTop = resizeStart.top + deltaY
          } else if (heightChange < minHeight) {
            newHeight = minHeight
            newTop = resizeStart.top + resizeStart.height - minHeight
          }
        }
        
        setSize({ width: newWidth, height: newHeight })
        if (resizeDirection.includes('w') || resizeDirection.includes('n')) {
          setPosition({ x: newLeft, y: newTop })
        }
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setResizeDirection(null)
      setResizeStart(null)
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none' // 드래그 중 텍스트 선택 방지
      if (isResizing && resizeDirection) {
        const cursorMap: Record<string, string> = {
          'n': 'ns-resize',
          's': 'ns-resize',
          'e': 'ew-resize',
          'w': 'ew-resize',
          'ne': 'nesw-resize',
          'nw': 'nwse-resize',
          'se': 'nwse-resize',
          'sw': 'nesw-resize'
        }
        document.body.style.cursor = cursorMap[resizeDirection] || 'nwse-resize'
      } else {
        document.body.style.cursor = isDragging ? 'move' : ''
      }
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, resizeDirection, position, size])

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50"
          aria-label="챗봇 열기"
          style={{ boxShadow: '0 10px 40px rgba(59, 130, 246, 0.5)' }}
        >
          <Bot className="w-10 h-10" />
        </button>
        <span className="text-xs font-semibold text-gray-800 bg-white px-3 py-1 rounded-lg shadow-lg whitespace-nowrap">
          Speed Jobs AI Chatbot
        </span>
      </div>
    )
  }
  
  const chatbotStyle: React.CSSProperties = {
    ...(position
      ? {
          left: `${position.x}px`,
          top: `${position.y}px`,
          right: 'auto',
          bottom: 'auto',
        }
      : {
          right: '1.5rem',
          bottom: '1.5rem'
        }),
    width: `${size.width}px`,
    height: isMinimized ? '64px' : `${size.height}px`,
    maxWidth: 'calc(100vw - 3rem)',
    maxHeight: 'calc(100vh - 3rem)',
    transition: (isDragging || isResizing) ? 'none' : 'all 0.3s'
  }

  return (
    <div
      ref={chatbotRef}
      className={`fixed bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-[9999] ${
        isDragging ? 'cursor-move' : ''
      } ${isResizing ? 'cursor-nwse-resize' : ''}`}
      style={chatbotStyle}
    >
      {/* 헤더 */}
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">AI Chatbot</h3>
            <p className="text-xs text-gray-500">무엇을 도와드릴까요?</p>
          </div>
        </div>
        <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            aria-label={isMinimized ? '최대화' : '최소화'}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-gray-600" />
            ) : (
              <Minimize2 className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 메시지 영역 */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  {message.type === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-2">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.components && message.components.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.components.map((component) => (
                        <Card
                          key={component.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer transition-all border border-gray-200 hover:border-gray-300 hover:shadow-md"
                          onClick={() => handleComponentClick(component.route)}
                        >
                          <div className="flex items-start gap-3">
                            {component.icon && (
                              <span className="text-2xl flex-shrink-0">{component.icon}</span>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-gray-900 mb-1">
                                {component.title}
                              </h4>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {component.description}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                  {message.jobPostings && message.jobPostings.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        관련 채용 공고 ({message.jobPostings.length}개)
                      </div>
                      {message.jobPostings.map((job) => (
                        <Card
                          key={job.id}
                          className="p-3 border border-gray-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                                  {job.title || '제목 없음'}
                                </h4>
                              </div>
                              {job.companyName && (
                                <p className="text-xs text-gray-600 mb-1">
                                  {job.companyName}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {job.role && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                    {job.role}
                                  </span>
                                )}
                                {job.experience && (
                                  <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                    {job.experience}
                                  </span>
                                )}
                              </div>
                              {job.postedAt && (
                                <p className="text-xs text-gray-500 mt-2">
                                  등록일: {job.postedAt.year}.{String(job.postedAt.month).padStart(2, '0')}.{String(job.postedAt.day).padStart(2, '0')}
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 기본 메뉴 영역 */}
          <div className="border-t-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
            {/* 빠른 시작 토글 버튼 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors bg-gradient-to-r from-blue-100 to-purple-100"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-800">질문 가이드</span>
              </div>
              {isMenuOpen ? (
                <ChevronUp className="w-5 h-5 text-blue-600 transition-transform font-bold" />
              ) : (
                <ChevronDown className="w-5 h-5 text-blue-600 transition-transform font-bold" />
              )}
            </button>
            
            {/* 슬라이드 메뉴 컨텐츠 */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pt-3 pb-4">
                {/* 페이지 이동 메뉴 */}
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    페이지 이동
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pageMenus.map((menu) => {
                      return (
                        <button
                          key={menu.route}
                          onClick={() => handleComponentClick(menu.route)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-800 bg-white border-2 border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-400 hover:shadow-md transition-all"
                          title={menu.description}
                        >
                          <span>{menu.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                
                {/* 자주 묻는 질문 */}
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-purple-600" />
                    자주 묻는 질문
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(item.text)}
                        disabled={isLoading}
                        className="px-4 py-2.5 text-sm font-semibold text-gray-800 bg-white border-2 border-purple-200 rounded-xl hover:bg-purple-50 hover:border-purple-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                      >
                        <span className="line-clamp-2">{item.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 입력 영역 */}
          <div className="px-5 pt-5 pb-5 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="flex-1 text-base py-3 h-12"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed h-12 px-6"
              >
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
      
      {/* 리사이즈 핸들들 */}
      {!isMinimized && (
        <>
          {/* 모서리 핸들 */}
          {/* 좌상 (nw) */}
          <div
            onMouseDown={handleResizeStart('nw')}
            className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize group z-10"
            style={{ marginTop: '-2px', marginLeft: '-2px' }}
          >
            <div className="absolute top-0 left-0 w-full h-full flex items-start justify-start">
              <div className="w-3 h-3 border-l-2 border-t-2 border-gray-400 group-hover:border-gray-600 transition-colors rounded-tl-lg bg-white"></div>
            </div>
          </div>
          
          {/* 우상 (ne) */}
          <div
            onMouseDown={handleResizeStart('ne')}
            className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize group z-10"
            style={{ marginTop: '-2px', marginRight: '-2px' }}
          >
            <div className="absolute top-0 right-0 w-full h-full flex items-start justify-end">
              <div className="w-3 h-3 border-r-2 border-t-2 border-gray-400 group-hover:border-gray-600 transition-colors rounded-tr-lg bg-white"></div>
            </div>
          </div>
          
          {/* 좌하 (sw) */}
          <div
            onMouseDown={handleResizeStart('sw')}
            className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize group z-10"
            style={{ marginBottom: '-2px', marginLeft: '-2px' }}
          >
            <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-start">
              <div className="w-3 h-3 border-l-2 border-b-2 border-gray-400 group-hover:border-gray-600 transition-colors rounded-bl-lg bg-white"></div>
            </div>
          </div>
          
          {/* 우하 (se) */}
          <div
            onMouseDown={handleResizeStart('se')}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize group z-10"
            style={{ marginBottom: '-2px', marginRight: '-2px' }}
          >
            <div className="absolute bottom-0 right-0 w-full h-full flex items-end justify-end">
              <div className="w-3 h-3 border-r-2 border-b-2 border-gray-400 group-hover:border-gray-600 transition-colors rounded-br-lg bg-white"></div>
            </div>
          </div>
          
          {/* 변 핸들 */}
          {/* 상 (n) */}
          <div
            onMouseDown={handleResizeStart('n')}
            className="absolute top-0 left-4 right-4 h-2 cursor-ns-resize group z-10"
            style={{ marginTop: '-2px' }}
          >
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-full border-t-2 border-gray-400 group-hover:border-gray-600 transition-colors bg-white rounded-t"></div>
          </div>
          
          {/* 하 (s) */}
          <div
            onMouseDown={handleResizeStart('s')}
            className="absolute bottom-0 left-4 right-4 h-2 cursor-ns-resize group z-10"
            style={{ marginBottom: '-2px' }}
          >
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-full border-b-2 border-gray-400 group-hover:border-gray-600 transition-colors bg-white rounded-b"></div>
          </div>
          
          {/* 좌 (w) */}
          <div
            onMouseDown={handleResizeStart('w')}
            className="absolute top-4 bottom-4 left-0 w-2 cursor-ew-resize group z-10"
            style={{ marginLeft: '-2px' }}
          >
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-12 w-full border-l-2 border-gray-400 group-hover:border-gray-600 transition-colors bg-white rounded-l"></div>
          </div>
          
          {/* 우 (e) */}
          <div
            onMouseDown={handleResizeStart('e')}
            className="absolute top-4 bottom-4 right-0 w-2 cursor-ew-resize group z-10"
            style={{ marginRight: '-2px' }}
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 h-12 w-full border-r-2 border-gray-400 group-hover:border-gray-600 transition-colors bg-white rounded-r"></div>
          </div>
        </>
      )}
    </div>
  )
}

