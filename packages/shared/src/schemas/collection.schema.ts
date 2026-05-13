import { z } from 'zod'

export const collectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isPrivate: z.boolean(),
  coverUrl: z.string().nullable(),
  userId: z.string(),
  itemCount: z.number().default(0),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export const createCollectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().optional().default(false),
})

export const updateCollectionSchema = createCollectionSchema.partial()

export const saveToCollectionSchema = z.object({
  photoId: z.string().min(1),
})

export type Collection = z.infer<typeof collectionSchema>
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>
export type SaveToCollectionInput = z.infer<typeof saveToCollectionSchema>
