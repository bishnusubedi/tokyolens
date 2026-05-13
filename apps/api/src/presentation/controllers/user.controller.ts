import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/auth.middleware.js'
import type { UserUseCase } from '../../application/use-cases/user/GetUsersUseCase.js'


const param = (v: string | string[] | undefined): string => Array.isArray(v) ? v[0]! : (v ?? '')

export class UserController {
  constructor(private readonly userUseCase: UserUseCase) {}

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userUseCase.getProfile(param(req.params['username']), req.user?.userId)
      res.json({ data: user })
    } catch (err) {
      next(err)
    }
  }

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userUseCase.updateProfile(req.user!.userId, req.body)
      res.json({ data: user })
    } catch (err) {
      next(err)
    }
  }

  getGallery = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.userUseCase.getGallery(
        param(req.params['username']),
        Number(req.query['page']) || 1,
        Number(req.query['limit']) || 20,
      )
      res.json({ data: result.data, meta: { total: result.total } })
    } catch (err) {
      next(err)
    }
  }

  getTrophyCase = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const awards = await this.userUseCase.getTrophyCase(param(req.params['username']))
      res.json({ data: awards })
    } catch (err) {
      next(err)
    }
  }

  follow = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.userUseCase.follow(req.user!.userId, param(req.params['username']))
      res.json({ data: result })
    } catch (err) { next(err) }
  }

  unfollow = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.userUseCase.unfollow(req.user!.userId, param(req.params['username']))
      res.json({ data: result })
    } catch (err) { next(err) }
  }

  listFollowers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.userUseCase.listFollowers(
        param(req.params['username']),
        Number(req.query['page']) || 1,
        Number(req.query['limit']) || 20,
      )
      res.json({ data: result.data, meta: { total: result.total } })
    } catch (err) { next(err) }
  }

  listFollowing = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.userUseCase.listFollowing(
        param(req.params['username']),
        Number(req.query['page']) || 1,
        Number(req.query['limit']) || 20,
      )
      res.json({ data: result.data, meta: { total: result.total } })
    } catch (err) { next(err) }
  }
}
