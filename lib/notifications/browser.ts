// 브라우저 알림 기능

import { JobPosting } from '../storage/types'

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export async function sendBrowserNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return
  }

  const hasPermission = await requestNotificationPermission()
  if (!hasPermission) {
    console.warn('Browser notification permission denied')
    return
  }

  try {
    new Notification(title, {
      icon: '/logos/service-logo.png',
      badge: '/logos/service-logo.png',
      ...options,
    })
  } catch (error) {
    console.error('Failed to send browser notification:', error)
  }
}

export async function sendNewJobNotifications(newJobs: JobPosting[]): Promise<void> {
  if (newJobs.length === 0) return

  const hasPermission = await requestNotificationPermission()
  if (!hasPermission) return

  if (newJobs.length === 1) {
    const job = newJobs[0]
    await sendBrowserNotification(
      `🆕 새로운 공고: ${job.company}`,
      {
        body: `${job.title}\n${job.location} | ${job.employment_type}`,
        tag: `job-${job.id}`,
        requireInteraction: false,
      }
    )
  } else {
    await sendBrowserNotification(
      `🆕 새로운 공고 ${newJobs.length}개가 추가되었습니다!`,
      {
        body: `${newJobs.map(job => `${job.company} - ${job.title}`).join('\n')}`,
        tag: 'new-jobs-batch',
        requireInteraction: true,
      }
    )
  }
}

