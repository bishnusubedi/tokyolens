import { z } from 'zod'

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const paginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
})

export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
})

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export const commentSchema = z.object({
  id: z.string(),
  body: z.string(),
  authorId: z.string(),
  photoId: z.string(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export const createCommentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(1000),
})

export const voteResponseSchema = z.object({
  voted: z.boolean(),
  count: z.number(),
})

export const awardSchema = z.object({
  id: z.string(),
  type: z.enum(['WEEKLY_WINNER', 'MONTHLY_WINNER']),
  photoId: z.string(),
  userId: z.string(),
  periodStart: z.string().or(z.date()),
  periodEnd: z.string().or(z.date()),
  voteCount: z.number(),
  awardedAt: z.string().or(z.date()),
})

export const forumCategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  sortOrder: z.number(),
  threadCount: z.number().optional(),
})

export const createThreadSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  body: z.string().min(10, 'Body must be at least 10 characters').max(10000),
  categorySlug: z.string().min(1),
})

export const createReplySchema = z.object({
  body: z.string().min(1, 'Reply cannot be empty').max(5000),
  embeddedPhotoId: z.string().optional(),
})

export const moderationActionSchema = z.object({
  action: z.enum(['APPROVE', 'HIDE', 'DELETE']),
  reason: z.string().optional(),
})

export const banUserSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
})

export type PaginationMeta = z.infer<typeof paginationMetaSchema>
export type Comment = z.infer<typeof commentSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type VoteResponse = z.infer<typeof voteResponseSchema>
export type Award = z.infer<typeof awardSchema>
export type ForumCategory = z.infer<typeof forumCategorySchema>
export type CreateThreadInput = z.infer<typeof createThreadSchema>
export type CreateReplyInput = z.infer<typeof createReplySchema>
export type ModerationAction = z.infer<typeof moderationActionSchema>
