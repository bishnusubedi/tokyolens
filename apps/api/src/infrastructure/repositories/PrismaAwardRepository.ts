import type { PrismaClient } from '@repo/database'
import type { Award, AwardWithPhoto } from '../../domain/entities/Post.js'
import type { IAwardRepository } from '../../domain/repositories/IPostRepository.js'

const AUTHOR_SELECT = { id: true, username: true, name: true, avatarUrl: true, role: true }
const AWARD_INCLUDE = {
  photo: {
    include: { author: { select: AUTHOR_SELECT } },
  },
  user: { select: AUTHOR_SELECT },
}

export class PrismaAwardRepository implements IAwardRepository {
  constructor(private readonly db: PrismaClient) {}

  async upsert(data: {
    type: Award['type']
    photoId: string
    userId: string
    periodStart: Date
    periodEnd: Date
    voteCount: number
  }): Promise<Award> {
    return this.db.award.upsert({
      where: { type_periodStart: { type: data.type, periodStart: data.periodStart } },
      create: data,
      update: { photoId: data.photoId, userId: data.userId, voteCount: data.voteCount },
    }) as Promise<Award>
  }

  async findLatestByType(type: Award['type']): Promise<AwardWithPhoto | null> {
    const award = await this.db.award.findFirst({
      where: { type },
      orderBy: { awardedAt: 'desc' },
      include: AWARD_INCLUDE,
    })
    return award as unknown as AwardWithPhoto | null
  }

  async listByUser(userId: string): Promise<AwardWithPhoto[]> {
    const awards = await this.db.award.findMany({
      where: { userId },
      orderBy: { awardedAt: 'desc' },
      include: AWARD_INCLUDE,
    })
    return awards as unknown as AwardWithPhoto[]
  }

  async list(limit = 20): Promise<AwardWithPhoto[]> {
    const awards = await this.db.award.findMany({
      orderBy: { awardedAt: 'desc' },
      take: limit,
      include: AWARD_INCLUDE,
    })
    return awards as unknown as AwardWithPhoto[]
  }
}
