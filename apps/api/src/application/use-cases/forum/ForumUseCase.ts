import type { IForumRepository } from '../../../domain/repositories/IPostRepository.js'
import { NotFoundError, ForbiddenError } from '../../../shared/errors/AppError.js'
import type { CreateThreadInput, CreateReplyInput } from '@repo/shared'

export class ForumUseCase {
  constructor(private readonly forumRepo: IForumRepository) {}

  async listCategories() {
    return this.forumRepo.listCategories()
  }

  async listThreads(categorySlug: string, page = 1, limit = 20) {
    const category = await this.forumRepo.findCategoryBySlug(categorySlug)
    if (!category) throw new NotFoundError('Forum category')
    return this.forumRepo.listThreads(category.id, { page, limit })
  }

  async getThread(id: string) {
    const thread = await this.forumRepo.findThread(id)
    if (!thread) throw new NotFoundError('Thread', id)
    return thread
  }

  async createThread(userId: string, dto: CreateThreadInput) {
    const category = await this.forumRepo.findCategoryBySlug(dto.categorySlug)
    if (!category) throw new NotFoundError('Forum category')
    return this.forumRepo.createThread({
      title: dto.title,
      body: dto.body,
      authorId: userId,
      categoryId: category.id,
    })
  }

  async createReply(userId: string, threadId: string, dto: CreateReplyInput) {
    const thread = await this.forumRepo.findThread(threadId)
    if (!thread) throw new NotFoundError('Thread', threadId)
    if (thread.locked) throw new ForbiddenError('Thread is locked')
    return this.forumRepo.createReply({
      body: dto.body,
      authorId: userId,
      threadId,
      embeddedPhotoId: dto.embeddedPhotoId,
    })
  }

  async listReplies(threadId: string, page = 1, limit = 50) {
    return this.forumRepo.listReplies(threadId, { page, limit })
  }
}
