import { Router } from 'express'
import type { Response, NextFunction } from 'express'
import { PhotoController } from '../controllers/photo.controller.js'
import { validate } from '../middleware/validate.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'
import { optionalAuthenticate } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { createPhotoSchema, createCommentSchema, photoQuerySchema } from '@repo/shared'
import { PhotoUseCase } from '../../application/use-cases/photo/PhotoUseCase.js'
import { PrismaPhotoRepository } from '../../infrastructure/repositories/PrismaPhotoRepository.js'
import { PrismaVoteRepository } from '../../infrastructure/repositories/PrismaVoteRepository.js'
import { PrismaCommentRepository } from '../../infrastructure/repositories/PrismaCommentRepository.js'
import { prisma } from '@repo/database'
import { NotFoundError } from '../../shared/errors/AppError.js'
import { z } from 'zod'

const photoRepo = new PrismaPhotoRepository(prisma)
const voteRepo = new PrismaVoteRepository(prisma)
const commentRepo = new PrismaCommentRepository(prisma)
const useCase = new PhotoUseCase(photoRepo, voteRepo, commentRepo)
const controller = new PhotoController(useCase)

export const photoRouter: Router = Router()

photoRouter.get('/', validate(photoQuerySchema, 'query'), controller.list)
photoRouter.get('/:id', controller.getById)
photoRouter.post('/', authenticate, upload.single('image'), validate(createPhotoSchema), controller.upload)
photoRouter.delete('/:id', authenticate, controller.delete)
photoRouter.post('/:id/vote', authenticate, controller.vote)
photoRouter.get('/:id/related', controller.related)
photoRouter.get('/:id/comments', controller.listComments)
photoRouter.post('/:id/comments', authenticate, validate(createCommentSchema), controller.addComment)

// GET /api/photos/:id/discuss — fetch the linked forum thread (if any)
photoRouter.get('/:id/discuss', optionalAuthenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const photoId = String(req.params['id'])
    const thread = await prisma.forumThread.findFirst({
      where: { sourcePhotoId: photoId },
      include: {
        author: { select: { id: true, username: true, name: true, avatarUrl: true } },
        category: true,
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
    res.json({ data: thread })
  } catch (err) {
    next(err)
  }
})

const discussSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  categorySlug: z.string().optional().default('GENERAL'),
})

// POST /api/photos/:id/discuss — create a forum thread linked to this photo
photoRouter.post('/:id/discuss', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const photoId = String(req.params['id'])
    const photo = await prisma.photo.findUnique({ where: { id: photoId }, select: { id: true, status: true } })
    if (!photo || photo.status !== 'APPROVED') throw new NotFoundError('Photo', photoId)

    const parsed = discussSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors })
      return
    }

    const { title, body, categorySlug } = parsed.data
    const slug = categorySlug.toUpperCase()
    const category = await prisma.forumCategory.findFirst({ where: { slug: slug as any } })
    if (!category) throw new NotFoundError('Forum category')

    const thread = await prisma.forumThread.create({
      data: {
        title,
        body,
        authorId: req.user!.userId,
        categoryId: category.id,
        sourcePhotoId: photoId,
      },
      include: {
        author: { select: { id: true, username: true, name: true, avatarUrl: true } },
        category: true,
      },
    })
    res.status(201).json({ data: thread })
  } catch (err) {
    next(err)
  }
})

export const postRouter = photoRouter
