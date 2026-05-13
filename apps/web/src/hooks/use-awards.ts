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
      apiClient.get<ApiResponse<{ totalUsers: number; totalPhotos: number; pendingPhotos: number; hiddenPhotos: number; dau: number; totalVotes: number; totalComments: number; totalThreads: number; totalCollections: number; newUsersThisMonth: number; newPhotosThisWeek: number; bannedUsers: number }>>(
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

export function useChangeRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'USER' | 'MODERATOR' }) =>
      apiClient.patch(`/api/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.users() })
    },
  })
}

export function useAdminUsers(params?: { search?: string; role?: string; status?: string }) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => {
      const qs = new URLSearchParams()
      qs.set('limit', '50')
      if (params?.search) qs.set('search', params.search)
      if (params?.role) qs.set('role', params.role)
      if (params?.status) qs.set('status', params.status)
      return apiClient.get<ApiResponse<{ data: UserRow[]; total: number }>>(`/api/admin/users/search?${qs}`)
    },
  })
}

export function useAdminPhotos(status = 'APPROVED') {
  return useQuery({
    queryKey: queryKeys.admin.photos({ status }),
    queryFn: () =>
      apiClient.get<ApiResponse<{ data: AdminPhoto[]; total: number }>>(`/api/admin/photos?status=${status}&limit=50`),
  })
}

export function useAdminThreads() {
  return useQuery({
    queryKey: queryKeys.admin.threads(),
    queryFn: () =>
      apiClient.get<ApiResponse<{ data: AdminThread[]; total: number }>>('/api/admin/forum/threads?limit=50'),
  })
}

export function useAdminActivity() {
  return useQuery({
    queryKey: queryKeys.admin.activity(),
    queryFn: () => apiClient.get<ApiResponse<AdminActivity>>('/api/admin/activity'),
    staleTime: 30 * 1000,
  })
}

export function useDeleteThread() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/admin/forum/threads/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.threads() })
    },
  })
}

export type UserRow = {
  id: string; username: string; name: string; email: string; status: string; role: string; createdAt: string
}
export type AdminPhoto = {
  id: string; title: string; imageUrl: string; thumbnailUrl: string | null; neighborhood: string
  category: string; voteCount: number; status: string; createdAt: string
  author: { id: string; username: string; name: string }
}
export type AdminThread = {
  id: string; title: string; replyCount: number; pinned: boolean; createdAt: string; lastReplyAt: string
  author: { id: string; username: string; name: string }
  category: { name: string; slug: string }
}
export type AdminActivity = {
  recentPhotos: Array<{ id: string; title: string; imageUrl: string; thumbnailUrl: string | null; createdAt: string; author: { username: string; name: string } }>
  recentUsers: Array<{ id: string; username: string; name: string; email: string; createdAt: string; role: string; status: string }>
  recentThreads: Array<{ id: string; title: string; createdAt: string; author: { username: string; name: string } }>
}
