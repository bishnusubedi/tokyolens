'use client'

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { ApiResponse, CreatePhotoInput, PhotoQuery } from '@repo/shared'

type PhotoListResponse = {
  data: PhotoWithAuthor[]
  meta: { total: number; nextCursor?: string }
}

type PhotoWithAuthor = {
  id: string
  title: string
  description: string | null
  imageUrl: string
  thumbnailUrl: string | null
  width: number
  height: number
  fileSize: number
  neighborhood: string
  category: string
  status: string
  voteCount: number
  hasVoted?: boolean
  createdAt: string
  cameraMake?: string | null
  cameraModel?: string | null
  lens?: string | null
  iso?: number | null
  aperture?: string | null
  shutterSpeed?: string | null
  focalLength?: string | null
  author: { id: string; username: string; name: string; avatarUrl: string | null; role: string }
}

type CommentWithAuthor = {
  id: string
  body: string
  createdAt: string
  author: { id: string; username: string; name: string; avatarUrl: string | null }
}

export function usePhotos(params: Partial<PhotoQuery> = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.photos.list(params as Record<string, unknown>),
    queryFn: ({ pageParam }) => {
      const qs = new URLSearchParams()
      qs.set('limit', String(params.limit ?? 20))
      qs.set('sortBy', params.sortBy ?? 'newest')
      if (params.category) qs.set('category', params.category)
      if (params.neighborhood) qs.set('neighborhood', params.neighborhood)
      if (pageParam) qs.set('cursor', pageParam as string)
      return apiClient.get<PhotoListResponse>(`/api/photos?${qs}`)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.meta.nextCursor,
  })
}

export function usePhoto(id: string) {
  return useQuery({
    queryKey: queryKeys.photos.detail(id),
    queryFn: () => apiClient.get<ApiResponse<PhotoWithAuthor>>(`/api/photos/${id}`),
    enabled: !!id,
  })
}

export function useComments(photoId: string) {
  return useQuery({
    queryKey: queryKeys.photos.comments(photoId),
    queryFn: () => apiClient.get<ApiResponse<CommentWithAuthor[]>>(`/api/photos/${photoId}/comments`),
    enabled: !!photoId,
  })
}

export function useVote(photoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.post<ApiResponse<{ voted: boolean; count: number }>>(`/api/photos/${photoId}/vote`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.photos.detail(photoId) })
      qc.invalidateQueries({ queryKey: queryKeys.photos.all() })
    },
  })
}

export function useAddComment(photoId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: string) =>
      apiClient.post<ApiResponse<CommentWithAuthor>>(`/api/photos/${photoId}/comments`, { body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.photos.comments(photoId) })
    },
  })
}

export function useUploadPhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ file, data }: { file: File; data: CreatePhotoInput }) => {
      const form = new FormData()
      form.append('image', file)
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) form.append(k, String(v))
      })
      return apiClient.upload<ApiResponse<PhotoWithAuthor>>('/api/photos', form)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.photos.all() })
    },
  })
}

export function useDeletePhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/photos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.photos.all() })
    },
  })
}

export function useRelatedPhotos(photoId: string) {
  return useQuery({
    queryKey: [...queryKeys.photos.detail(photoId), 'related'],
    queryFn: () => apiClient.get<{ data: PhotoWithAuthor[] }>(`/api/photos/${photoId}/related`),
    enabled: !!photoId,
  })
}
