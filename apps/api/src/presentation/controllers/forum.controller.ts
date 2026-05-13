import type { Request, Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/auth.middleware.js'
import type { ForumUseCase } from '../../application/use-cases/forum/ForumUseCase.js'

const param = (v: string | string[] | undefined): string => Array.isArray(v) ? v[0]! : (v ?? '')

export class ForumController {
  constructor(private readonly forumUseCase: ForumUseCase) {}

  listCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.forumUseCase.listCategories()
      res.json({ data: categories })
    } catch (err) {
      next(err)
    }
  }

  listThreads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.forumUseCase.listThreads(
        param(req.params['slug']),
        Number(req.query['page']) || 1,
        Number(req.query['limit']) || 20,
      )
      res.json({ data: result.data, meta: { total: result.total } })
    } catch (err) {
      next(err)
    }
  }

  getThread = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const thread = await this.forumUseCase.getThread(param(req.params['id']))
      res.json({ data: thread })
    } catch (err) {
      next(err)
    }
  }

  createThread = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const thread = await this.forumUseCase.createThread(req.user!.userId, req.body)
      res.status(201).json({ data: thread })
    } catch (err) {
      next(err)
    }
  }

  listReplies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.forumUseCase.listReplies(
        param(req.params['id']),
        Number(req.query['page']) || 1,
        Number(req.query['limit']) || 50,
      )
      res.json({ data: result.data, meta: { total: result.total } })
    } catch (err) {
      next(err)
    }
  }

  createReply = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reply = await this.forumUseCase.createReply(req.user!.userId, param(req.params['id']), req.body)
      res.status(201).json({ data: reply })
    } catch (err) {
      next(err)
    }
  }
}
