import { z } from 'zod'

export const userRoleSchema = z.enum(['USER', 'MODERATOR', 'ADMIN'])
export const userStatusSchema = z.enum(['ACTIVE', 'BANNED'])

export const photoStatusSchema = z.enum(['PENDING', 'APPROVED', 'HIDDEN', 'DELETED'])
export const photoCategorySchema = z.enum([
  'STREET',
  'PORTRAIT',
  'LANDSCAPE',
  'ARCHITECTURE',
  'NIGHT',
  'MACRO',
  'WILDLIFE',
  'TRAVEL',
  'ABSTRACT',
  'OTHER',
])

export const awardTypeSchema = z.enum(['WEEKLY_WINNER', 'MONTHLY_WINNER'])

export const forumCategorySlugSchema = z.enum([
  'EQUIPMENT_REVIEWS',
  'TOKYO_PHOTO_SPOTS',
  'CRITIQUE_MY_WORK',
  'GENERAL',
])

export type UserRole = z.infer<typeof userRoleSchema>
export type UserStatus = z.infer<typeof userStatusSchema>
export type PhotoStatus = z.infer<typeof photoStatusSchema>
export type PhotoCategory = z.infer<typeof photoCategorySchema>
export type AwardType = z.infer<typeof awardTypeSchema>
export type ForumCategorySlug = z.infer<typeof forumCategorySlugSchema>
