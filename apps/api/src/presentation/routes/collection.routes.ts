import { Router } from 'express'
import { CollectionController } from '../controllers/collection.controller.js'
import { validate } from '../middleware/validate.middleware.js'
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js'
import { createCollectionSchema, updateCollectionSchema, saveToCollectionSchema } from '@repo/shared'
import { CollectionUseCase } from '../../application/use-cases/collection/CollectionUseCase.js'
import { PrismaCollectionRepository } from '../../infrastructure/repositories/PrismaCollectionRepository.js'
import { prisma } from '@repo/database'

const repo = new PrismaCollectionRepository(prisma)
const useCase = new CollectionUseCase(repo)
const controller = new CollectionController(useCase)

export const collectionRouter: Router = Router()

// Current user's collections
collectionRouter.get('/', authenticate, controller.list)
collectionRouter.post('/', authenticate, validate(createCollectionSchema), controller.create)
collectionRouter.get('/saved', authenticate, controller.getSavedCollections)
collectionRouter.patch('/:id', authenticate, validate(updateCollectionSchema), controller.update)
collectionRouter.delete('/:id', authenticate, controller.delete)
collectionRouter.post('/:id/photos', authenticate, validate(saveToCollectionSchema), controller.addPhoto)
collectionRouter.delete('/:id/photos/:photoId', authenticate, controller.removePhoto)
collectionRouter.get('/:id/photos', optionalAuthenticate, controller.getPhotos)

// Public collections for a user
collectionRouter.get('/user/:userId', controller.getPublicByUser)
