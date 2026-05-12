import type { PrismaClient } from '@repo/database';
import type { Post, PostWithAuthor } from '../../domain/entities/Post.js';
import type {
  IPostRepository,
  CreatePostData,
  UpdatePostData,
} from '../../domain/repositories/IPostRepository.js';
import type { PaginationQuery, PaginatedResponse } from '@repo/shared';

const postWithAuthorSelect = {
  id: true,
  title: true,
  content: true,
  status: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: { id: true, name: true, email: true },
  },
} as const;

export class PrismaPostRepository implements IPostRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<PostWithAuthor | null> {
    return this.db.post.findUnique({
      where: { id },
      select: postWithAuthorSelect,
    }) as Promise<PostWithAuthor | null>;
  }

  async findAll(
    pagination: PaginationQuery,
    authorId?: string,
  ): Promise<PaginatedResponse<PostWithAuthor>> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;
    const where = authorId ? { authorId } : undefined;

    const [data, total] = await Promise.all([
      this.db.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: postWithAuthorSelect,
      }),
      this.db.post.count({ where }),
    ]);

    return {
      data: data as PostWithAuthor[],
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(data: CreatePostData): Promise<Post> {
    return this.db.post.create({ data });
  }

  async update(id: string, data: UpdatePostData): Promise<Post> {
    return this.db.post.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.db.post.delete({ where: { id } });
  }
}
