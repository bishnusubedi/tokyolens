import type { PrismaClient } from '@repo/database'
import type { CommentWithAuthor } from '../../domain/entities/Post.js'
import type { ICommentRepository } from '../../domain/repositories/IPostRepository.js'
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError.js'

const AUTHOR_SELECT = { id: true, username: true, name: true, avatarUrl: true, role: true }

export class PrismaCommentRepository implements ICommentRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: { body: string; authorId: string; photoId: string }): Promise<CommentWithAuthor> {
    const comment = await this.db.comment.create({
      data,
      include: { author: { select: AUTHOR_SELECT } },
    })
    return comment as unknown as CommentWithAuthor
  }

  async listByPhoto(photoId: string): Promise<CommentWithAuthor[]> {
    const comments = await this.db.comment.findMany({
      where: { photoId },
      include: { author: { select: AUTHOR_SELECT } },
      orderBy: { createdAt: 'asc' },
    })
    return comments as unknown as CommentWithAuthor[]
  }

  async delete(id: string, userId: string): Promise<void> {
    const comment = await this.db.comment.findUnique({ where: { id } })
    if (!comment) throw new NotFoundError('Comment', id)
    if (comment.authorId !== userId) throw new ForbiddenError()
    await this.db.comment.delete({ where: { id } })
  }
}
