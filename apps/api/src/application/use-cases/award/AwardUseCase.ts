import type { IAwardRepository, IVoteRepository } from '../../../domain/repositories/IPostRepository.js'
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js'
import type { PrismaClient } from '@repo/database'

export class AwardUseCase {
  constructor(
    private readonly awardRepo: IAwardRepository,
    private readonly voteRepo: IVoteRepository,
    private readonly userRepo: IUserRepository,
    private readonly db: PrismaClient,
  ) {}

  async getChampion() {
    return this.awardRepo.findLatestByType('WEEKLY_WINNER')
  }

  async getMonthlyChampion() {
    return this.awardRepo.findLatestByType('MONTHLY_WINNER')
  }

  async list(limit?: number) {
    return this.awardRepo.list(limit)
  }

  async getAnalytics() {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [totalUsers, totalPhotos, pendingPhotos, hiddenPhotos, dau, totalVotes, totalComments, totalThreads, totalCollections, newUsersThisMonth, newPhotosThisWeek, bannedUsers] = await Promise.all([
      this.db.user.count(),
      this.db.photo.count({ where: { status: 'APPROVED' } }),
      this.db.photo.count({ where: { status: 'PENDING' } }),
      this.db.photo.count({ where: { status: 'HIDDEN' } }),
      this.db.vote.groupBy({ by: ['userId'], where: { createdAt: { gte: yesterday } } }).then((r: unknown[]) => r.length),
      this.db.vote.count(),
      this.db.comment.count(),
      this.db.forumThread.count(),
      this.db.collection.count(),
      this.db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.db.photo.count({ where: { status: 'APPROVED', approvedAt: { gte: sevenDaysAgo } } }),
      this.db.user.count({ where: { status: 'BANNED' } }),
    ])

    return { totalUsers, totalPhotos, pendingPhotos, hiddenPhotos, dau, totalVotes, totalComments, totalThreads, totalCollections, newUsersThisMonth, newPhotosThisWeek, bannedUsers }
  }

  async getRecentActivity(): Promise<{
    recentPhotos: Array<{ id: string; title: string; imageUrl: string; thumbnailUrl: string | null; createdAt: Date; author: { id: string; username: string; name: string; avatarUrl: string | null } }>
    recentUsers: Array<{ id: string; username: string; name: string; email: string; avatarUrl: string | null; createdAt: Date; role: string; status: string }>
    recentThreads: Array<{ id: string; title: string; createdAt: Date; author: { id: string; username: string; name: string; avatarUrl: string | null } }>
  }> {
    const AUTHOR_SELECT = { id: true, username: true, name: true, avatarUrl: true }
    const [recentPhotos, recentUsers, recentThreads] = await Promise.all([
      this.db.photo.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { author: { select: AUTHOR_SELECT } },
      }),
      this.db.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { ...AUTHOR_SELECT, email: true, createdAt: true, role: true, status: true },
      }),
      this.db.forumThread.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { author: { select: AUTHOR_SELECT } },
      }),
    ])
    return { recentPhotos, recentUsers, recentThreads }
  }
}
