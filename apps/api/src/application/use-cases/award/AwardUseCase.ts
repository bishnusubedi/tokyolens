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

    const [totalUsers, totalPhotos, pendingPhotos, dau] = await Promise.all([
      this.db.user.count(),
      this.db.photo.count({ where: { status: 'APPROVED' } }),
      this.db.photo.count({ where: { status: 'PENDING' } }),
      this.db.vote.groupBy({ by: ['userId'], where: { createdAt: { gte: yesterday } } }).then((r: unknown[]) => r.length),
    ])

    return { totalUsers, totalPhotos, pendingPhotos, dau }
  }
}
