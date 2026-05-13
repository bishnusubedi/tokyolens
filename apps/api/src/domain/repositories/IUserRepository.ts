import type { User, UserPublic } from '../entities/User.js'

export interface CreateUserData {
  email: string
  username: string
  name: string
  password: string
}

export interface UpdateUserData {
  name?: string | undefined
  bio?: string | null | undefined
  location?: string | null | undefined
  websiteUrl?: string | null | undefined
  instagramUrl?: string | null | undefined
  avatarUrl?: string | null | undefined
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  create(data: CreateUserData): Promise<User>
  update(id: string, data: UpdateUserData): Promise<UserPublic>
  ban(id: string): Promise<void>
  unban(id: string): Promise<void>
  list(options: { page: number; limit: number }): Promise<{ data: UserPublic[]; total: number }>
  countActive(): Promise<number>
  follow(followerId: string, followingId: string): Promise<void>
  unfollow(followerId: string, followingId: string): Promise<void>
  isFollowing(followerId: string, followingId: string): Promise<boolean>
  getFollowCounts(userId: string): Promise<{ followerCount: number; followingCount: number }>
  listFollowers(userId: string, page: number, limit: number): Promise<{ data: UserPublic[]; total: number }>
  listFollowing(userId: string, page: number, limit: number): Promise<{ data: UserPublic[]; total: number }>
  changeRole(id: string, role: 'USER' | 'MODERATOR'): Promise<void>
  listWithSearch(options: { page: number; limit: number; search?: string; role?: string; status?: string }): Promise<{ data: UserPublic[]; total: number }>
}
