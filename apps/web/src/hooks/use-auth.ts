'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { AuthResponse, UserLoginDto, CreateUserDto, ApiResponse } from '@repo/shared';

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => apiClient.get<ApiResponse<AuthResponse['user']>>('/api/auth/me'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UserLoginDto) =>
      apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', dto),
    onSuccess: (res) => {
      localStorage.setItem('auth_token', res.data.token);
      qc.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUserDto) =>
      apiClient.post<ApiResponse<AuthResponse>>('/api/auth/register', dto),
    onSuccess: (res) => {
      localStorage.setItem('auth_token', res.data.token);
      qc.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return () => {
    localStorage.removeItem('auth_token');
    qc.clear();
  };
}
