import type { Post, PostWithAuthor } from '../entities/Post.js';
import type { PaginationQuery, PaginatedResponse } from '@repo/shared';

export interface CreatePostData {
  title: string;
  content: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  authorId: string;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface IPostRepository {
  findById(id: string): Promise<PostWithAuthor | null>;
  findAll(pagination: PaginationQuery, authorId?: string): Promise<PaginatedResponse<PostWithAuthor>>;
  create(data: CreatePostData): Promise<Post>;
  update(id: string, data: UpdatePostData): Promise<Post>;
  delete(id: string): Promise<void>;
}
