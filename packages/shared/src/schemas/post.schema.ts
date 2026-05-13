import { z } from 'zod'
import { photoCategorySchema, photoStatusSchema } from './enums.js'

export const photoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string(),
  thumbnailUrl: z.string().nullable(),
  width: z.number(),
  height: z.number(),
  fileSize: z.number(),
  neighborhood: z.string(),
  category: photoCategorySchema,
  status: photoStatusSchema,
  cameraMake: z.string().nullable(),
  cameraModel: z.string().nullable(),
  lens: z.string().nullable(),
  iso: z.number().nullable(),
  aperture: z.string().nullable(),
  shutterSpeed: z.string().nullable(),
  focalLength: z.string().nullable(),
  takenAt: z.string().nullable().or(z.date().nullable()),
  authorId: z.string(),
  voteCount: z.number(),
  approvedAt: z.string().nullable().or(z.date().nullable()),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export const createPhotoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  description: z.string().max(2000).optional(),
  neighborhood: z.string().min(1, 'Neighborhood is required'),
  category: photoCategorySchema,
  cameraMake: z.string().max(60).optional(),
  cameraModel: z.string().max(60).optional(),
  lens: z.string().max(60).optional(),
  iso: z.coerce.number().int().positive().optional(),
  aperture: z.string().max(10).optional(),
  shutterSpeed: z.string().max(20).optional(),
  focalLength: z.string().max(20).optional(),
})

export const updatePhotoSchema = createPhotoSchema.partial()

export const photoQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sortBy: z.enum(['newest', 'top', 'trending']).default('newest'),
  category: photoCategorySchema.optional(),
  neighborhood: z.string().optional(),
  authorId: z.string().optional(),
  status: photoStatusSchema.optional(),
  cursor: z.string().optional(),
})

export type Photo = z.infer<typeof photoSchema>
export type CreatePhotoInput = z.infer<typeof createPhotoSchema>
export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>
export type PhotoQuery = z.infer<typeof photoQuerySchema>
