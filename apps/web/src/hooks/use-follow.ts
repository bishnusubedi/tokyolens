'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

export function useFollow(username: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.post(`/api/users/${username}/follow`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.profile(username) }),
  })
}

export function useUnfollow(username: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.delete(`/api/users/${username}/follow`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.profile(username) }),
  })
}
