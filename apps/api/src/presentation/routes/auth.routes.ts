import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { UserLoginSchema, CreateUserSchema } from '@repo/shared';
import { LoginUseCase } from '../../application/use-cases/user/LoginUseCase.js';
import { RegisterUseCase } from '../../application/use-cases/user/RegisterUseCase.js';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository.js';
import { prisma } from '@repo/database';

const userRepo = new PrismaUserRepository(prisma);
const loginUseCase = new LoginUseCase(userRepo);
const registerUseCase = new RegisterUseCase(userRepo);
const controller = new AuthController(loginUseCase, registerUseCase);

export const authRouter = Router();

authRouter.post('/login', validate(UserLoginSchema), controller.login);
authRouter.post('/register', validate(CreateUserSchema), controller.register);
authRouter.get('/me', authenticate, controller.me);
