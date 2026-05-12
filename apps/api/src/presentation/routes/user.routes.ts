import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { GetUsersUseCase } from '../../application/use-cases/user/GetUsersUseCase.js';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository.js';
import { prisma } from '@repo/database';

const userRepo = new PrismaUserRepository(prisma);
const getUsersUseCase = new GetUsersUseCase(userRepo);
const controller = new UserController(getUsersUseCase);

export const userRouter = Router();

userRouter.get('/', authenticate, requireRole('ADMIN'), controller.getAll);
userRouter.get('/:id', authenticate, controller.getById);
