'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Send, X, Minimize2, Maximize2, Bot } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  components?: ChatComponent[]
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
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const chatbotRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '안녕하세요! 무엇을 도와드릴까요? 채용 일정, 대시보드, 공고 품질 등에 대해 물어보실 수 있습니다.',
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
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // AI 응답 생성 (실제로는 API 호출)
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue.trim())
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse.content,
        components: aiResponse.components
      }
      setMessages(prev => [...prev, assistantMessage])
    }, 500)
  }

  const handleComponentClick = (route: string) => {
    router.push(route)
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
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none' // 드래그 중 텍스트 선택 방지
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
    }
  }, [isDragging, dragOffset])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-[9999]"
        aria-label="챗봇 열기"
      >
        <Bot className="w-6 h-6" />
      </button>
    )
  }

  const chatbotStyle: React.CSSProperties = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: 'auto',
        bottom: 'auto',
        transition: isDragging ? 'none' : 'all 0.3s'
      }
    : {
        right: '1.5rem',
        bottom: '1.5rem'
      }

  return (
    <div
      ref={chatbotRef}
      className={`fixed w-96 max-w-[calc(100vw-3rem)] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-[9999] ${
        isMinimized ? 'h-16' : 'h-[600px] max-h-[calc(100vh-3rem)]'
      } ${isDragging ? 'cursor-move' : ''}`}
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
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="bg-gray-900 hover:bg-gray-800 text-white"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

