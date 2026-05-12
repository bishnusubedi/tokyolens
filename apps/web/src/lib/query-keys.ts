export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  users: {
    all: () => ['users'] as const,
    list: (params?: Record<string, unknown>) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', id] as const,
  },
  posts: {
    all: () => ['posts'] as const,
    list: (params?: Record<string, unknown>) => ['posts', 'list', params] as const,
    detail: (id: string) => ['posts', id] as const,
  },
} as const;
