'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { ApiResponse, CreateThreadInput, CreateReplyInput } from '@repo/shared'

type ForumCategory = {
  id: string
  slug: string
  name: string
  description: string
  sortOrder: number
  _count?: { threads: number }
}

type ForumThread = {
  id: string
  title: string
  body: string
  createdAt: string
  locked: boolean
  author: { id: string; username: string; name: string; avatarUrl: string | null }
  _count?: { replies: number }
}

type ForumReply = {
  id: string
  body: string
  createdAt: string
  author: { id: string; username: string; name: string; avatarUrl: string | null }
  embeddedPhoto?: { id: string; thumbnailUrl: string | null; imageUrl: string; title: string } | null
}

type PagedResponse<T> = { data: T[]; total: number }

export function useForumCategories() {
  return useQuery({
    queryKey: queryKeys.forum.categories(),
    queryFn: () => apiClient.get<ApiResponse<ForumCategory[]>>('/api/forum/categories'),
    staleTime: 10 * 60 * 1000,
  })
}

export function useForumThreads(slug: string, page = 1) {
  return useQuery({
    queryKey: queryKeys.forum.threads(slug, { page }),
    queryFn: () =>
      apiClient.get<ApiResponse<PagedResponse<ForumThread>>>(`/api/forum/categories/${slug}/threads?page=${page}&limit=20`),
    enabled: !!slug,
  })
}

export function useForumThread(id: string) {
  return useQuery({
    queryKey: queryKeys.forum.thread(id),
    queryFn: () => apiClient.get<ApiResponse<ForumThread>>(`/api/forum/threads/${id}`),
    enabled: !!id,
  })
}

export function useForumReplies(threadId: string, page = 1) {
  return useQuery({
    queryKey: queryKeys.forum.replies(threadId, { page }),
    queryFn: () =>
      apiClient.get<ApiResponse<PagedResponse<ForumReply>>>(`/api/forum/threads/${threadId}/replies?page=${page}&limit=50`),
    enabled: !!threadId,
  })
}

export function useCreateThread() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateThreadInput) =>
      apiClient.post<ApiResponse<ForumThread>>('/api/forum/threads', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.forum.all() })
    },
  })
}

export function useCreateReply(threadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateReplyInput) =>
      apiClient.post<ApiResponse<ForumReply>>(`/api/forum/threads/${threadId}/replies`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.forum.replies(threadId) })
      qc.invalidateQueries({ queryKey: queryKeys.forum.thread(threadId) })
    },
  })
}
