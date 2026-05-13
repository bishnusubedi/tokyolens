import type { PrismaClient } from '@repo/database'
import type { ForumCategory, ForumThreadWithAuthor, ForumReplyWithAuthor } from '../../domain/entities/Post.js'
import type { IForumRepository } from '../../domain/repositories/IPostRepository.js'
import { NotFoundError } from '../../shared/errors/AppError.js'

const AUTHOR_SELECT = { id: true, username: true, name: true, avatarUrl: true, role: true }
const THREAD_INCLUDE = {
  author: { select: AUTHOR_SELECT },
  category: true,
}
const REPLY_INCLUDE = {
  author: { select: AUTHOR_SELECT },
  embeddedPhoto: {
    include: { author: { select: AUTHOR_SELECT } },
  },
}

export class PrismaForumRepository implements IForumRepository {
  constructor(private readonly db: PrismaClient) {}

  async listCategories(): Promise<ForumCategory[]> {
    return this.db.forumCategory.findMany({ orderBy: { sortOrder: 'asc' } }) as Promise<ForumCategory[]>
  }

  async findCategoryBySlug(slug: string): Promise<ForumCategory | null> {
    return this.db.forumCategory.findFirst({ where: { slug: slug as any } }) as Promise<ForumCategory | null>
  }

  async createThread(data: { title: string; body: string; authorId: string; categoryId: string }): Promise<ForumThreadWithAuthor> {
    const thread = await this.db.forumThread.create({
      data,
      include: THREAD_INCLUDE,
    })
    return thread as unknown as ForumThreadWithAuthor
  }

  async listThreads(categoryId: string, options: { page: number; limit: number }): Promise<{ data: ForumThreadWithAuthor[]; total: number }> {
    const skip = (options.page - 1) * options.limit
    const where = { categoryId }
    const [threads, total] = await Promise.all([
      this.db.forumThread.findMany({
        where,
        include: THREAD_INCLUDE,
        orderBy: [{ pinned: 'desc' }, { lastReplyAt: 'desc' }],
        skip,
        take: options.limit,
      }),
      this.db.forumThread.count({ where }),
    ])
    return { data: threads as unknown as ForumThreadWithAuthor[], total }
  }

  async findThread(id: string): Promise<ForumThreadWithAuthor | null> {
    const thread = await this.db.forumThread.findUnique({ where: { id }, include: THREAD_INCLUDE })
    return thread as unknown as ForumThreadWithAuthor | null
  }

  async createReply(data: { body: string; authorId: string; threadId: string; embeddedPhotoId?: string }): Promise<ForumReplyWithAuthor> {
    const reply = await this.db.forumReply.create({
      data,
      include: REPLY_INCLUDE,
    })
    await this.db.forumThread.update({
      where: { id: data.threadId },
      data: { replyCount: { increment: 1 }, lastReplyAt: new Date() },
    })
    return reply as unknown as ForumReplyWithAuthor
  }

  async listReplies(threadId: string, options: { page: number; limit: number }): Promise<{ data: ForumReplyWithAuthor[]; total: number }> {
    const skip = (options.page - 1) * options.limit
    const where = { threadId }
    const [replies, total] = await Promise.all([
      this.db.forumReply.findMany({
        where,
        include: REPLY_INCLUDE,
        orderBy: { createdAt: 'asc' },
        skip,
        take: options.limit,
      }),
      this.db.forumReply.count({ where }),
    ])
    return { data: replies as unknown as ForumReplyWithAuthor[], total }
  }
}
