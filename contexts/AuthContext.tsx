'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name?: string, passwordConfirm?: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // 초기 로드 시 localStorage에서 사용자 정보 확인
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedAuth = localStorage.getItem('isAuthenticated')
    if (storedUser && storedAuth === 'true') {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Next.js API Route를 통해 프록시 (쿠키가 같은 도메인에 저장되도록)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.status !== 200) {
        // 에러 응답 처리
        throw new Error(data.message || '로그인에 실패했습니다.')
      }

      // 성공 시 사용자 정보 저장
      const userData: User = { email }
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('isAuthenticated', 'true')
      return true
    } catch (error) {
      console.error('로그인 오류:', error)
      throw error
    }
  }

  const signup = async (email: string, password: string, name?: string, passwordConfirm?: string): Promise<boolean> => {
    try {
      const response = await fetch('https://speedjobs-spring.skala25a.project.skala-ai.com/members', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || '',
          email,
          password,
          passwordConfirm: passwordConfirm || password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // 에러 응답 처리
        throw new Error(data.message || '회원가입에 실패했습니다.')
      }

      // 성공 시 사용자 정보 저장
      const userData: User = { email, name }
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('isAuthenticated', 'true')
      return true
    } catch (error) {
      console.error('회원가입 오류:', error)
      throw error
    }
  }

  const logout = async (): Promise<void> => {
    try {
      const response = await fetch('https://speedjobs-spring.skala25a.project.skala-ai.com/logout', {
        method: 'POST',
        headers: {
          'accept': '*/*',
        },
      })

      const data = await response.json()

      if (!response.ok || data.status !== 200) {
        // 에러 응답 처리
        throw new Error(data.message || '로그아웃에 실패했습니다.')
      }

      // 성공 시 로컬 상태 정리
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      router.push('/')
    } catch (error) {
      console.error('로그아웃 오류:', error)
      // API 호출 실패해도 로컬 상태는 정리
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      router.push('/')
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

