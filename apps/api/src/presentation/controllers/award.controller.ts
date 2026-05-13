import type { Request, Response, NextFunction } from 'express'
import type { AwardUseCase } from '../../application/use-cases/award/AwardUseCase.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'
import type { IPhotoRepository } from '../../domain/repositories/IPostRepository.js'
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js'

const param = (v: string | string[] | undefined): string => Array.isArray(v) ? v[0]! : (v ?? '')

export class AwardController {
  constructor(private readonly awardUseCase: AwardUseCase) {}

  getChampion = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const champion = await this.awardUseCase.getChampion()
      res.json({ data: champion })
    } catch (err) {
      next(err)
    }
  }

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const awards = await this.awardUseCase.list()
      res.json({ data: awards })
    } catch (err) {
      next(err)
    }
  }

  getAnalytics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const analytics = await this.awardUseCase.getAnalytics()
      res.json({ data: analytics })
    } catch (err) {
      next(err)
    }
  }
}

export class AdminController {
  constructor(
    private readonly photoRepo: IPhotoRepository,
    private readonly userRepo: IUserRepository,
    private readonly awardUseCase: AwardUseCase,
  ) {}

  moderatePhoto = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { action } = req.body
      const approvedAt = action === 'APPROVE' ? new Date() : undefined
      const photo = await this.photoRepo.updateStatus(param(req.params['id']), action, approvedAt)
      res.json({ data: photo })
    } catch (err) {
      next(err)
    }
  }

  banUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.userRepo.ban(param(req.params['id']))
      res.json({ data: { success: true } })
    } catch (err) {
      next(err)
    }
  }

  unbanUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.userRepo.unban(param(req.params['id']))
      res.json({ data: { success: true } })
    } catch (err) {
      next(err)
    }
  }

  listUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.userRepo.list({
        page: Number(req.query['page']) || 1,
        limit: Number(req.query['limit']) || 20,
      })
      res.json({ data: result.data, meta: { total: result.total } })
    } catch (err) {
      next(err)
    }
  }

  listPendingPhotos = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.photoRepo.list({
        page: Number(req.query['page']) || 1,
        limit: Number(req.query['limit']) || 20,
        sortBy: 'newest',
        status: 'PENDING',
      })
      res.json({ data: result.data, meta: { total: result.total } })
    } catch (err) {
      next(err)
    }
  }

  getAnalytics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const analytics = await this.awardUseCase.getAnalytics()
      res.json({ data: analytics })
    } catch (err) {
      next(err)
    }
  }
}
