'use client'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

type SearchResult<T> = { data: T[]; meta: { total: number; page: number; limit: number } }
type PhotoResult = { id: string; title: string; imageUrl: string; thumbnailUrl: string | null; width: number; height: number; neighborhood: string; voteCount: number; hasVoted?: boolean; author: { username: string; name: string; avatarUrl: string | null }; tags?: { name: string; slug: string }[] }
type UserResult = { id: string; username: string; name: string; avatarUrl: string | null; bio: string | null; _count: { photos: number; followers: number } }
type BoardResult = { id: string; name: string; isPrivate: boolean; user: { username: string; name: string }; _count: { items: number } }

export function useSearchPhotos(q: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.search.results(q, 'photos'),
    queryFn: () => apiClient.get<SearchResult<PhotoResult>>(`/api/search?q=${encodeURIComponent(q)}&type=photos`),
    enabled: enabled && q.length > 0,
    staleTime: 30_000,
  })
}

export function useSearchUsers(q: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.search.results(q, 'users'),
    queryFn: () => apiClient.get<SearchResult<UserResult>>(`/api/search?q=${encodeURIComponent(q)}&type=users`),
    enabled: enabled && q.length > 0,
    staleTime: 30_000,
  })
}

export function useSearchBoards(q: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.search.results(q, 'boards'),
    queryFn: () => apiClient.get<SearchResult<BoardResult>>(`/api/search?q=${encodeURIComponent(q)}&type=boards`),
    enabled: enabled && q.length > 0,
    staleTime: 30_000,
  })
}
