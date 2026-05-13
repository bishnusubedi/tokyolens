import type { Request, Response, NextFunction } from 'express'
import type { LoginUseCase } from '../../application/use-cases/user/LoginUseCase.js'
import type { RegisterUseCase } from '../../application/use-cases/user/RegisterUseCase.js'
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly userRepo: IUserRepository,
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUseCase.execute(req.body)
      res.json({ data: result })
    } catch (err) {
      next(err)
    }
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.registerUseCase.execute(req.body)
      res.status(201).json({ data: result })
    } catch (err) {
      next(err)
    }
  }

  me = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userRepo.findById(req.user!.userId)
      if (!user) { res.status(401).json({ message: 'User not found' }); return }
      const { password: _, ...publicUser } = user
      res.json({ data: publicUser })
    } catch (err) {
      next(err)
    }
  }
}
