import { Router } from 'express'
import { AwardController, AdminController } from '../controllers/award.controller.js'
import { ForumController } from '../controllers/forum.controller.js'
import { authenticate, requireRole } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { moderationActionSchema, createThreadSchema, createReplySchema, banUserSchema } from '@repo/shared'
import { AwardUseCase } from '../../application/use-cases/award/AwardUseCase.js'
import { ForumUseCase } from '../../application/use-cases/forum/ForumUseCase.js'
import { PrismaAwardRepository } from '../../infrastructure/repositories/PrismaAwardRepository.js'
import { PrismaVoteRepository } from '../../infrastructure/repositories/PrismaVoteRepository.js'
import { PrismaPhotoRepository } from '../../infrastructure/repositories/PrismaPhotoRepository.js'
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository.js'
import { PrismaForumRepository } from '../../infrastructure/repositories/PrismaForumRepository.js'
import { prisma } from '@repo/database'

const awardRepo = new PrismaAwardRepository(prisma)
const voteRepo = new PrismaVoteRepository(prisma)
const photoRepo = new PrismaPhotoRepository(prisma)
const userRepo = new PrismaUserRepository(prisma)
const forumRepo = new PrismaForumRepository(prisma)

const awardUseCase = new AwardUseCase(awardRepo, voteRepo, userRepo, prisma)
const forumUseCase = new ForumUseCase(forumRepo)

const awardController = new AwardController(awardUseCase)
const adminController = new AdminController(photoRepo, userRepo, awardUseCase)
const forumController = new ForumController(forumUseCase)

export const awardRouter: Router = Router()
awardRouter.get('/champion', awardController.getChampion)
awardRouter.get('/', awardController.list)

export const adminRouter: Router = Router()
adminRouter.use(authenticate, requireRole('ADMIN', 'MODERATOR'))
adminRouter.post('/photos/:id/moderate', validate(moderationActionSchema), adminController.moderatePhoto)
adminRouter.post('/users/:id/ban', adminController.banUser)
adminRouter.post('/users/:id/unban', adminController.unbanUser)
adminRouter.get('/users', adminController.listUsers)
adminRouter.get('/photos/pending', adminController.listPendingPhotos)
adminRouter.get('/analytics', adminController.getAnalytics)

export const forumRouter: Router = Router()
forumRouter.get('/categories', forumController.listCategories)
forumRouter.get('/categories/:slug/threads', forumController.listThreads)
forumRouter.post('/threads', authenticate, validate(createThreadSchema), forumController.createThread)
forumRouter.get('/threads/:id', forumController.getThread)
forumRouter.get('/threads/:id/replies', forumController.listReplies)
forumRouter.post('/threads/:id/replies', authenticate, validate(createReplySchema), forumController.createReply)
