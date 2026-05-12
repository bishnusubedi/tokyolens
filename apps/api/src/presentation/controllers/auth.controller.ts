import type { Request, Response, NextFunction } from 'express';
import type { LoginUseCase } from '../../application/use-cases/user/LoginUseCase.js';
import type { RegisterUseCase } from '../../application/use-cases/user/RegisterUseCase.js';

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUseCase.execute(req.body);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.registerUseCase.execute(req.body);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request & { user?: { userId: string } }, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({ data: req.user });
    } catch (err) {
      next(err);
    }
  };
}
