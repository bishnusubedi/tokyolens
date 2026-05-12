import type { Request, Response, NextFunction } from 'express';
import type { GetUsersUseCase } from '../../application/use-cases/user/GetUsersUseCase.js';
import { PaginationQuerySchema } from '@repo/shared';

export class UserController {
  constructor(private readonly getUsersUseCase: GetUsersUseCase) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = PaginationQuerySchema.parse(req.query);
      const result = await this.getUsersUseCase.getAll(pagination);
      res.json({ data: result.data, meta: result.meta });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.getUsersUseCase.getById(req.params['id']!);
      res.json({ data: user });
    } catch (err) {
      next(err);
    }
  };
}
