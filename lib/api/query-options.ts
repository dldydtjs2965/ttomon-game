import { queryOptions } from '@tanstack/react-query'
import { verificationApi } from '@/lib/api/verification'

// Query Keys
export const QUERY_KEYS = {
  verification: {
    all: ['verification'] as const,
    list: (userId: string, weeks: number) => 
      ['verification', 'list', userId, weeks] as const,
    summary: (userId: string, weeks: number) => 
      ['verification', 'summary', userId, weeks] as const,
    streak: (userId: string) => 
      ['verification', 'streak', userId] as const,
  },
} as const

// Query Options
export const verificationQueryOptions = {
  list: (userId: string, weeks: number) =>
    queryOptions({
      queryKey: QUERY_KEYS.verification.list(userId, weeks),
      queryFn: () => verificationApi.getVerifications(userId, weeks),
    }),
  
  summary: (userId: string, weeks: number) =>
    queryOptions({
      queryKey: QUERY_KEYS.verification.summary(userId, weeks),
      queryFn: () => verificationApi.getWeeklySummaries(userId, weeks),
    }),

  streak: (userId: string) =>
    queryOptions({
      queryKey: QUERY_KEYS.verification.streak(userId),
      queryFn: () => verificationApi.getStreakInfo(userId),
    }),
}
