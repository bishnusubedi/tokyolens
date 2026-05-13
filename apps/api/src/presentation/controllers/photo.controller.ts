import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/auth.middleware.js'
import type { PhotoUseCase } from '../../application/use-cases/photo/PhotoUseCase.js'

const param = (v: string | string[] | undefined): string => Array.isArray(v) ? v[0]! : (v ?? '')

export class PhotoController {
  constructor(private readonly photoUseCase: PhotoUseCase) {}

  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.photoUseCase.list(req.query as any, req.user?.userId)
      res.json({ data: result.data, meta: { total: result.total, nextCursor: result.nextCursor } })
    } catch (err) {
      next(err)
    }
  }

  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const photo = await this.photoUseCase.getById(param(req.params["id"]), req.user?.userId)
      res.json({ data: photo })
    } catch (err) {
      next(err)
    }
  }

  upload = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) { res.status(400).json({ message: 'Image file is required' }); return }
      const photo = await this.photoUseCase.upload(req.user!.userId, req.body, req.file.buffer)
      res.status(201).json({ data: photo })
    } catch (err) {
      next(err)
    }
  }

  vote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.photoUseCase.toggleVote(param(req.params["id"]), req.user!.userId)
      res.json({ data: result })
    } catch (err) {
      next(err)
    }
  }

  addComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comment = await this.photoUseCase.addComment(param(req.params["id"]), req.user!.userId, req.body.body)
      res.status(201).json({ data: comment })
    } catch (err) {
      next(err)
    }
  }

  listComments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comments = await this.photoUseCase.listComments(param(req.params["id"]))
      res.json({ data: comments })
    } catch (err) {
      next(err)
    }
  }

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.photoUseCase.delete(param(req.params["id"]), req.user!.userId, req.user!.role)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  }

  related = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const photos = await this.photoUseCase.getRelated(param(req.params['id']))
      res.json({ data: photos })
    } catch (err) {
      next(err)
    }
  }

  getUserPhotos = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.photoUseCase.getUserPhotos(
        param(req.params['authorId']),
        Number(req.query['page']) || 1,
        Number(req.query['limit']) || 20,
      )
      res.json({ data: result.data, meta: { total: result.total } })
    } catch (err) {
      next(err)
    }
  }
}
