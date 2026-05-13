import type { PrismaClient } from '@repo/database'
import type { User, UserPublic } from '../../domain/entities/User.js'
import type { IUserRepository, CreateUserData, UpdateUserData } from '../../domain/repositories/IUserRepository.js'

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } }) as Promise<User | null>
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } }) as Promise<User | null>
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { username } }) as Promise<User | null>
  }

  async create(data: CreateUserData): Promise<User> {
    return this.db.user.create({ data }) as Promise<User>
  }

  async update(id: string, data: UpdateUserData): Promise<UserPublic> {
    const user = await this.db.user.update({ where: { id }, data: data as any })
    const { password: _, ...publicUser } = user
    return publicUser as UserPublic
  }

  async ban(id: string): Promise<void> {
    await this.db.user.update({ where: { id }, data: { status: 'BANNED' } })
  }

  async unban(id: string): Promise<void> {
    await this.db.user.update({ where: { id }, data: { status: 'ACTIVE' } })
  }

  async list(options: { page: number; limit: number }): Promise<{ data: UserPublic[]; total: number }> {
    const skip = (options.page - 1) * options.limit
    const [users, total] = await Promise.all([
      this.db.user.findMany({ skip, take: options.limit, orderBy: { createdAt: 'desc' } }),
      this.db.user.count(),
    ])
    const data = users.map((user: any) => { const { password: _p, ...u } = user; return u as UserPublic })
    return { data, total }
  }

  async countActive(): Promise<number> {
    return this.db.user.count({ where: { status: 'ACTIVE' } })
  }

  async follow(followerId: string, followingId: string): Promise<void> {
    await this.db.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      create: { followerId, followingId },
      update: {},
    })
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await this.db.follow.delete({ where: { followerId_followingId: { followerId, followingId } } }).catch(() => {})
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const row = await this.db.follow.findUnique({ where: { followerId_followingId: { followerId, followingId } } })
    return !!row
  }

  async getFollowCounts(userId: string): Promise<{ followerCount: number; followingCount: number }> {
    const [followerCount, followingCount] = await Promise.all([
      this.db.follow.count({ where: { followingId: userId } }),
      this.db.follow.count({ where: { followerId: userId } }),
    ])
    return { followerCount, followingCount }
  }

  async listFollowers(userId: string, page: number, limit: number): Promise<{ data: UserPublic[]; total: number }> {
    const skip = (page - 1) * limit
    const [rows, total] = await Promise.all([
      this.db.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { follower: true },
      }),
      this.db.follow.count({ where: { followingId: userId } }),
    ])
    const data = rows.map((r: any) => { const { password: _, ...u } = r.follower; return u as UserPublic })
    return { data, total }
  }

  async listFollowing(userId: string, page: number, limit: number): Promise<{ data: UserPublic[]; total: number }> {
    const skip = (page - 1) * limit
    const [rows, total] = await Promise.all([
      this.db.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { following: true },
      }),
      this.db.follow.count({ where: { followerId: userId } }),
    ])
    const data = rows.map((r: any) => { const { password: _, ...u } = r.following; return u as UserPublic })
    return { data, total }
  }
}
