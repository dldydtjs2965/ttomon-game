import { queryOptions } from '@tanstack/react-query'
import { certificationApi } from '@/lib/api/certification'

// Query Keys
export const QUERY_KEYS = {
  certification: {
    all: ['certification'] as const,
    list: (userId: string, weeks: number) =>
      ['certification', 'list', userId, weeks] as const,
    summary: (userId: string, weeks: number) =>
      ['certification', 'summary', userId, weeks] as const,
    streak: (userId: string) =>
      ['certification', 'streak', userId] as const,
  },
} as const

// Query Options
export const certificationQueryOptions = {
  list: (userId: string, weeks: number) =>
    queryOptions({
      queryKey: QUERY_KEYS.certification.list(userId, weeks),
      queryFn: () => certificationApi.getCertifications(userId, weeks),
    }),

  summary: (userId: string, weeks: number) =>
    queryOptions({
      queryKey: QUERY_KEYS.certification.summary(userId, weeks),
      queryFn: () => certificationApi.getWeeklySummaries(userId, weeks),
    }),

  streak: (userId: string) =>
    queryOptions({
      queryKey: QUERY_KEYS.certification.streak(userId),
      queryFn: () => certificationApi.getStreakInfo(userId),
    }),
}
