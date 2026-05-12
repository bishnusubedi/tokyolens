import type { Request, Response, NextFunction } from 'express';
import type { PostUseCase } from '../../application/use-cases/post/PostUseCase.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { PaginationQuerySchema } from '@repo/shared';

export class PostController {
  constructor(private readonly postUseCase: PostUseCase) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = PaginationQuerySchema.parse(req.query);
      const authorId = req.query['authorId'] as string | undefined;
      const result = await this.postUseCase.getAll(pagination, authorId);
      res.json({ data: result.data, meta: result.meta });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const post = await this.postUseCase.getById(req.params['id']!);
      res.json({ data: post });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const post = await this.postUseCase.create(req.body, req.user!.userId);
      res.status(201).json({ data: post });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const post = await this.postUseCase.update(
        req.params['id']!,
        req.body,
        req.user!.userId,
        req.user!.role,
      );
      res.json({ data: post });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.postUseCase.delete(req.params['id']!, req.user!.userId, req.user!.role);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
