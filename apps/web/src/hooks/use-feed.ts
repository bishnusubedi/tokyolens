'use client'
import { useInfiniteQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

type PhotoWithAuthor = {
  id: string
  title: string
  imageUrl: string
  thumbnailUrl: string | null
  width: number
  height: number
  neighborhood: string
  voteCount: number
  hasVoted?: boolean
  author: { id: string; username: string; name: string; avatarUrl: string | null; role: string }
  tags?: Array<{ name: string; slug: string }>
}

type FeedResponse = { data: PhotoWithAuthor[]; nextCursor: string | null }

export function useFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.feed.list(),
    queryFn: ({ pageParam }) => {
      const qs = new URLSearchParams({ limit: '20' })
      if (pageParam) qs.set('cursor', pageParam as string)
      return apiClient.get<FeedResponse>(`/api/feed?${qs}`)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    retry: false,
  })
}
