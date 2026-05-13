'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { ApiResponse, Collection } from '@repo/shared'

type CollectionListResponse = { data: Collection[] }

export function useMyCollections() {
  return useQuery({
    queryKey: queryKeys.collections.mine(),
    queryFn: () => apiClient.get<CollectionListResponse>('/api/collections'),
    retry: false,
  })
}

export function usePublicCollections(userId: string) {
  return useQuery({
    queryKey: queryKeys.collections.byUser(userId),
    queryFn: () => apiClient.get<CollectionListResponse>(`/api/collections/user/${userId}`),
    enabled: !!userId,
  })
}

export function useSavedCollections(photoId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.collections.saved(photoId),
    queryFn: () => apiClient.get<ApiResponse<string[]>>(`/api/collections/saved?photoId=${photoId}`),
    enabled: enabled && !!photoId,
    retry: false,
  })
}

export function useCreateCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; description?: string; isPrivate?: boolean }) =>
      apiClient.post<ApiResponse<Collection>>('/api/collections', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.collections.mine() }),
  })
}

export function useDeleteCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/collections/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.collections.mine() }),
  })
}

export function useSaveToCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ collectionId, photoId }: { collectionId: string; photoId: string }) =>
      apiClient.post(`/api/collections/${collectionId}/photos`, { photoId }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.collections.saved(vars.photoId) })
      qc.invalidateQueries({ queryKey: queryKeys.collections.mine() })
    },
  })
}

export function useRemoveFromCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ collectionId, photoId }: { collectionId: string; photoId: string }) =>
      apiClient.delete(`/api/collections/${collectionId}/photos/${photoId}`),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.collections.saved(vars.photoId) })
      qc.invalidateQueries({ queryKey: queryKeys.collections.mine() })
    },
  })
}
