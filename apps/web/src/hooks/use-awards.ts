'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { ApiResponse } from '@repo/shared'

type AwardWithPhoto = {
  id: string
  type: 'WEEKLY_WINNER' | 'MONTHLY_WINNER'
  voteCount: number
  periodStart: string
  periodEnd: string
  awardedAt: string
  photo: {
    id: string
    title: string
    imageUrl: string
    thumbnailUrl: string | null
    neighborhood: string
    author: { id: string; username: string; name: string; avatarUrl: string | null }
  }
}

export function useChampion() {
  return useQuery({
    queryKey: queryKeys.awards.champion(),
    queryFn: () => apiClient.get<ApiResponse<AwardWithPhoto | null>>('/api/awards/champion'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAwards(limit = 10) {
  return useQuery({
    queryKey: queryKeys.awards.list(limit),
    queryFn: () => apiClient.get<ApiResponse<AwardWithPhoto[]>>(`/api/awards?limit=${limit}`),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.admin.analytics(),
    queryFn: () =>
      apiClient.get<ApiResponse<{ totalUsers: number; totalPhotos: number; pendingPhotos: number; dau: number }>>(
        '/api/admin/analytics',
      ),
  })
}

export function useModerationPhotos() {
  return useQuery({
    queryKey: queryKeys.admin.pending(),
    queryFn: () => apiClient.get<ApiResponse<unknown[]>>('/api/admin/photos/pending'),
  })
}

export function useModeratePhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'APPROVE' | 'HIDE' | 'DELETE' }) =>
      apiClient.post(`/api/admin/photos/${id}/moderate`, { action }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.pending() })
      qc.invalidateQueries({ queryKey: queryKeys.photos.all() })
    },
  })
}

export function useBanUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ban }: { id: string; ban: boolean }) =>
      apiClient.post(`/api/admin/users/${id}/${ban ? 'ban' : 'unban'}`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.users() })
    },
  })
}
