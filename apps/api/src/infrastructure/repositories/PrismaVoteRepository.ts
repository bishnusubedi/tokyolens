import type { PrismaClient } from '@repo/database'
import type { IVoteRepository } from '../../domain/repositories/IPostRepository.js'

export class PrismaVoteRepository implements IVoteRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByUserAndPhoto(userId: string, photoId: string): Promise<{ id: string } | null> {
    return this.db.vote.findUnique({ where: { userId_photoId: { userId, photoId } }, select: { id: true } })
  }

  async create(userId: string, photoId: string): Promise<void> {
    await this.db.vote.create({ data: { userId, photoId } })
  }

  async delete(userId: string, photoId: string): Promise<void> {
    await this.db.vote.delete({ where: { userId_photoId: { userId, photoId } } })
  }

  async countByPhoto(photoId: string): Promise<number> {
    return this.db.vote.count({ where: { photoId } })
  }

  async aggregateByPeriod(start: Date, end: Date, limit: number): Promise<Array<{ photoId: string; authorId: string; voteCount: number }>> {
    const results = await this.db.$queryRaw<Array<{ photoId: string; authorId: string; voteCount: bigint }>>`
      SELECT p.id AS "photoId",
             p."authorId",
             COUNT(DISTINCT v."userId")::bigint AS "voteCount"
      FROM "photos" p
      JOIN "votes" v ON v."photoId" = p.id
      WHERE p.status = 'APPROVED'
        AND v."createdAt" >= ${start}
        AND v."createdAt" <  ${end}
      GROUP BY p.id, p."authorId"
      HAVING COUNT(DISTINCT v."userId") > 0
      ORDER BY "voteCount" DESC, p."createdAt" ASC
      LIMIT ${limit}
    `
    return results.map((r: any) => ({ photoId: String(r.photoId), authorId: String(r.authorId), voteCount: Number(r.voteCount) }))
  }
}
