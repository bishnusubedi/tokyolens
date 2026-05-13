import type { Request, Response, NextFunction } from 'express'
import type { AwardUseCase } from '../../application/use-cases/award/AwardUseCase.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'
import type { IPhotoRepository, IForumRepository } from '../../domain/repositories/IPostRepository.js'
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js'
import { ForbiddenError } from '../../shared/errors/AppError.js'

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
    private readonly forumRepo: IForumRepository,
  ) {}

  moderatePhoto = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { action } = req.body as { action: 'APPROVE' | 'HIDE' | 'DELETE' }
      const statusMap = { APPROVE: 'APPROVED', HIDE: 'HIDDEN', DELETE: 'DELETED' } as const
      const status = statusMap[action]
      const approvedAt = action === 'APPROVE' ? new Date() : undefined
      const photo = await this.photoRepo.updateStatus(param(req.params['id']), status, approvedAt)
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

  listAllPhotos = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = (req.query['status'] as string) || 'APPROVED'
      const result = await this.photoRepo.list({
        page: Number(req.query['page']) || 1,
        limit: Number(req.query['limit']) || 30,
        sortBy: 'newest',
        status: status as any,
      })
      res.json({ data: result.data, meta: { total: result.total } })
    } catch (err) {
      next(err)
    }
  }

  changeRole = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'ADMIN') return next(new ForbiddenError())
      const { role } = req.body as { role: 'USER' | 'MODERATOR' }
      await this.userRepo.changeRole(param(req.params['id']), role)
      res.json({ data: { success: true } })
    } catch (err) {
      next(err)
    }
  }

  listUsersWithSearch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const opts: { page: number; limit: number; search?: string; role?: string; status?: string } = {
        page: Number(req.query['page']) || 1,
        limit: Number(req.query['limit']) || 30,
      }
      const search = req.query['search'] as string | undefined
      const role = req.query['role'] as string | undefined
      const status = req.query['status'] as string | undefined
      if (search) opts.search = search
      if (role) opts.role = role
      if (status) opts.status = status
      const result = await this.userRepo.listWithSearch(opts)
      res.json({ data: result.data, meta: { total: result.total } })
    } catch (err) {
      next(err)
    }
  }

  listAllThreads = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const threads = await this.forumRepo.listAllThreads({
        page: Number(req.query['page']) || 1,
        limit: Number(req.query['limit']) || 30,
      })
      res.json({ data: threads.data, meta: { total: threads.total } })
    } catch (err) {
      next(err)
    }
  }

  deleteThread = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.forumRepo.deleteThread(param(req.params['id']))
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  }

  deleteReply = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.forumRepo.deleteReply(param(req.params['id']))
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  }

  getActivity = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activity = await this.awardUseCase.getRecentActivity()
      res.json({ data: activity })
    } catch (err) {
      next(err)
    }
  }
}
