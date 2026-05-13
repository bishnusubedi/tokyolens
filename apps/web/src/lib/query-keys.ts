export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  users: {
    all: () => ['users'] as const,
    list: (params?: Record<string, unknown>) => ['users', 'list', params] as const,
    profile: (username: string) => ['users', 'profile', username] as const,
    gallery: (username: string, params?: Record<string, unknown>) => ['users', 'gallery', username, params] as const,
    awards: (username: string) => ['users', 'awards', username] as const,
  },
  photos: {
    all: () => ['photos'] as const,
    list: (params?: Record<string, unknown>) => ['photos', 'list', params] as const,
    detail: (id: string) => ['photos', id] as const,
    comments: (id: string) => ['photos', id, 'comments'] as const,
  },
  awards: {
    all: () => ['awards'] as const,
    champion: () => ['awards', 'champion'] as const,
    monthly: () => ['awards', 'monthly'] as const,
    list: (limit?: number) => ['awards', 'list', limit] as const,
  },
  forum: {
    all: () => ['forum'] as const,
    categories: () => ['forum', 'categories'] as const,
    threads: (slug: string, params?: Record<string, unknown>) => ['forum', 'threads', slug, params] as const,
    thread: (id: string) => ['forum', 'thread', id] as const,
    replies: (threadId: string, params?: Record<string, unknown>) => ['forum', 'replies', threadId, params] as const,
  },
  admin: {
    pending: () => ['admin', 'pending'] as const,
    users: (params?: Record<string, unknown>) => ['admin', 'users', params] as const,
    analytics: () => ['admin', 'analytics'] as const,
  },
  collections: {
    all: () => ['collections'] as const,
    mine: () => ['collections', 'mine'] as const,
    detail: (id: string) => ['collections', id] as const,
    photos: (id: string, params?: Record<string, unknown>) => ['collections', id, 'photos', params] as const,
    saved: (photoId: string) => ['collections', 'saved', photoId] as const,
    byUser: (userId: string) => ['collections', 'user', userId] as const,
  },
  follow: {
    followers: (username: string) => ['follow', 'followers', username] as const,
    following: (username: string) => ['follow', 'following', username] as const,
  },
} as const
