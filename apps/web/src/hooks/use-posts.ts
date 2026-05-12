'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { Post, CreatePostDto, UpdatePostDto, PaginatedResponse, ApiResponse } from '@repo/shared';

export function usePosts(params?: { page?: number; limit?: number; authorId?: string }) {
  return useQuery({
    queryKey: queryKeys.posts.list(params),
    queryFn: () => {
      const search = new URLSearchParams();
      if (params?.page) search.set('page', String(params.page));
      if (params?.limit) search.set('limit', String(params.limit));
      if (params?.authorId) search.set('authorId', params.authorId);
      return apiClient.get<PaginatedResponse<Post>>(`/api/posts?${search}`);
    },
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => apiClient.get<ApiResponse<Post>>(`/api/posts/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePostDto) =>
      apiClient.post<ApiResponse<Post>>('/api/posts', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.posts.all() }),
  });
}

export function useUpdatePost(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePostDto) =>
      apiClient.patch<ApiResponse<Post>>(`/api/posts/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.posts.all() });
      qc.invalidateQueries({ queryKey: queryKeys.posts.detail(id) });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/posts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.posts.all() }),
  });
}
