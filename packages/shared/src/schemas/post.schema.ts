import { z } from 'zod';
import { UserSchema } from './user.schema.js';

export const PostStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  content: z.string(),
  status: PostStatusSchema,
  authorId: z.string().uuid(),
  author: UserSchema.omit({ createdAt: true, updatedAt: true }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreatePostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  status: PostStatusSchema.optional().default('DRAFT'),
});

export const UpdatePostSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  status: PostStatusSchema.optional(),
});
