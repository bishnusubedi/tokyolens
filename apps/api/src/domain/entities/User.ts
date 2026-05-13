export interface User {
  id: string
  email: string
  username: string
  name: string
  password: string
  role: 'USER' | 'MODERATOR' | 'ADMIN'
  status: 'ACTIVE' | 'BANNED'
  avatarUrl: string | null
  bio: string | null
  location: string | null
  websiteUrl: string | null
  instagramUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export type UserPublic = Omit<User, 'password'>
export type UserSummary = Pick<User, 'id' | 'username' | 'name' | 'avatarUrl' | 'role'>
