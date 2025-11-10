// 저장소 팩토리 - 나중에 DB로 전환하기 쉽도록 추상화

import { JobPostingStorage } from './types'
import { LocalStorageJobStorage } from './localStorageStorage'
// import { DatabaseJobStorage } from './databaseStorage' // 나중에 추가

export function createJobStorage(): JobPostingStorage {
  // 환경 변수로 DB 사용 여부 확인 (나중에 추가)
  // if (process.env.NEXT_PUBLIC_USE_DATABASE === 'true') {
  //   return new DatabaseJobStorage()
  // }
  
  // 현재는 localStorage만 사용
  return new LocalStorageJobStorage()
}

