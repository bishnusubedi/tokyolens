import { Router } from 'express'
import { PhotoController } from '../controllers/photo.controller.js'
import { validate } from '../middleware/validate.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { createPhotoSchema, createCommentSchema, photoQuerySchema } from '@repo/shared'
import { PhotoUseCase } from '../../application/use-cases/photo/PhotoUseCase.js'
import { PrismaPhotoRepository } from '../../infrastructure/repositories/PrismaPhotoRepository.js'
import { PrismaVoteRepository } from '../../infrastructure/repositories/PrismaVoteRepository.js'
import { PrismaCommentRepository } from '../../infrastructure/repositories/PrismaCommentRepository.js'
import { prisma } from '@repo/database'

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

export const postRouter = photoRouter
