import type { IPostRepository } from '../../../domain/repositories/IPostRepository.js';
import { NotFoundError, ForbiddenError } from '../../../shared/errors/AppError.js';
import type { CreatePostDto, UpdatePostDto, PaginationQuery } from '@repo/shared';
import type { PostWithAuthor } from '../../../domain/entities/Post.js';

export class PostUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async getAll(pagination: PaginationQuery, authorId?: string) {
    return this.postRepository.findAll(pagination, authorId);
  }

  async getById(id: string): Promise<PostWithAuthor> {
    const post = await this.postRepository.findById(id);
    if (!post) throw new NotFoundError('Post', id);
    return post;
  }

  async create(dto: CreatePostDto, authorId: string) {
    return this.postRepository.create({ ...dto, authorId });
  }

  async update(id: string, dto: UpdatePostDto, requesterId: string, requesterRole: string) {
    const post = await this.postRepository.findById(id);
    if (!post) throw new NotFoundError('Post', id);
    if (post.authorId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenError('You do not own this post');
    }
    return this.postRepository.update(id, dto);
  }

  async delete(id: string, requesterId: string, requesterRole: string): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post) throw new NotFoundError('Post', id);
    if (post.authorId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenError('You do not own this post');
    }
    await this.postRepository.delete(id);
  }
}
