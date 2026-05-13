import { z } from 'zod'

export const collectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isPrivate: z.boolean(),
  isCollaborative: z.boolean().optional(),
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

export const updateCollectionSchema = createCollectionSchema.extend({
  isCollaborative: z.boolean().optional(),
}).partial()

export const saveToCollectionSchema = z.object({
  photoId: z.string().min(1),
})

export const createSectionSchema = z.object({
  name: z.string().min(1).max(80),
  sortOrder: z.number().int().min(0).optional(),
})

export const addCollaboratorSchema = z.object({
  username: z.string().min(1),
  canEdit: z.boolean().optional().default(true),
})

export const moveToSectionSchema = z.object({
  sectionId: z.string().nullable(),
})

export type Collection = z.infer<typeof collectionSchema>
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>
export type SaveToCollectionInput = z.infer<typeof saveToCollectionSchema>
export type CreateSectionInput = z.infer<typeof createSectionSchema>
export type AddCollaboratorInput = z.infer<typeof addCollaboratorSchema>
export type MoveToSectionInput = z.infer<typeof moveToSectionSchema>
