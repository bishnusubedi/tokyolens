import { Router } from 'express'
import { UserController } from '../controllers/user.controller.js'
import { validate } from '../middleware/validate.middleware.js'
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js'
import { updateProfileSchema } from '@repo/shared'
import { UserUseCase } from '../../application/use-cases/user/GetUsersUseCase.js'
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository.js'
import { PrismaPhotoRepository } from '../../infrastructure/repositories/PrismaPhotoRepository.js'
import { PrismaAwardRepository } from '../../infrastructure/repositories/PrismaAwardRepository.js'
import { prisma } from '@repo/database'

const userRepo = new PrismaUserRepository(prisma)
const photoRepo = new PrismaPhotoRepository(prisma)
const awardRepo = new PrismaAwardRepository(prisma)
const useCase = new UserUseCase(userRepo, photoRepo, awardRepo)
const controller = new UserController(useCase)

export const userRouter: Router = Router()

userRouter.patch('/me/profile', authenticate, validate(updateProfileSchema), controller.updateProfile)
userRouter.get('/:username', optionalAuthenticate, controller.getProfile)
userRouter.get('/:username/photos', controller.getGallery)
userRouter.get('/:username/awards', controller.getTrophyCase)
userRouter.post('/:username/follow', authenticate, controller.follow)
userRouter.delete('/:username/follow', authenticate, controller.unfollow)
userRouter.get('/:username/followers', controller.listFollowers)
userRouter.get('/:username/following', controller.listFollowing)
