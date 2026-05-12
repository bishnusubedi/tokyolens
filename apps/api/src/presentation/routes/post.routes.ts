import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { CreatePostSchema, UpdatePostSchema } from '@repo/shared';
import { PostUseCase } from '../../application/use-cases/post/PostUseCase.js';
import { PrismaPostRepository } from '../../infrastructure/repositories/PrismaPostRepository.js';
import { prisma } from '@repo/database';

const postRepo = new PrismaPostRepository(prisma);
const postUseCase = new PostUseCase(postRepo);
const controller = new PostController(postUseCase);

export const postRouter = Router();

postRouter.get('/', controller.getAll);
postRouter.get('/:id', controller.getById);
postRouter.post('/', authenticate, validate(CreatePostSchema), controller.create);
postRouter.patch('/:id', authenticate, validate(UpdatePostSchema), controller.update);
postRouter.delete('/:id', authenticate, controller.delete);
