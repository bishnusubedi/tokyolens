import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/auth.middleware.js'
import type { CollectionUseCase } from '../../application/use-cases/collection/CollectionUseCase.js'

const param = (v: string | string[] | undefined): string => Array.isArray(v) ? v[0]! : (v ?? '')

export class CollectionController {
  constructor(private readonly useCase: CollectionUseCase) {}

  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const collections = await this.useCase.list(req.user!.userId)
      res.json({ data: collections })
    } catch (err) { next(err) }
  }

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const col = await this.useCase.create(req.user!.userId, req.body)
      res.status(201).json({ data: col })
    } catch (err) { next(err) }
  }

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const col = await this.useCase.update(param(req.params['id']), req.user!.userId, req.body)
      res.json({ data: col })
    } catch (err) { next(err) }
  }

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.useCase.delete(param(req.params['id']), req.user!.userId)
      res.status(204).send()
    } catch (err) { next(err) }
  }

  addPhoto = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.useCase.addPhoto(param(req.params['id']), req.user!.userId, req.body.photoId)
      res.json({ data: result })
    } catch (err) { next(err) }
  }

  removePhoto = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.useCase.removePhoto(param(req.params['id']), req.user!.userId, param(req.params['photoId']))
      res.json({ data: result })
    } catch (err) { next(err) }
  }

  getPhotos = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.useCase.getPhotos(
        param(req.params['id']),
        req.user?.userId,
        Number(req.query['page']) || 1,
        Number(req.query['limit']) || 20,
      )
      res.json({ data: result.data, meta: { total: result.total } })
    } catch (err) { next(err) }
  }

  getSavedCollections = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const photoId = param(req.query['photoId'] as string | undefined)
      const ids = await this.useCase.getSavedCollections(req.user!.userId, photoId)
      res.json({ data: ids })
    } catch (err) { next(err) }
  }

  getPublicByUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = param(req.params['userId'])
      const collections = await this.useCase.getPublicByUser(userId)
      res.json({ data: collections })
    } catch (err) { next(err) }
  }

  getDetail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const col = await this.useCase.getCollectionDetail(param(req.params['id']), req.user?.userId)
      res.json({ data: col })
    } catch (err) { next(err) }
  }

  createSection = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const section = await this.useCase.createSection(param(req.params['id']), req.user!.userId, req.body.name, req.body.sortOrder)
      res.status(201).json({ data: section })
    } catch (err) { next(err) }
  }

  deleteSection = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.useCase.deleteSection(param(req.params['id']), param(req.params['sectionId']), req.user!.userId)
      res.status(204).send()
    } catch (err) { next(err) }
  }

  addCollaborator = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const collab = await this.useCase.addCollaborator(param(req.params['id']), req.user!.userId, req.body.username, req.body.canEdit ?? true)
      res.status(201).json({ data: collab })
    } catch (err) { next(err) }
  }

  removeCollaborator = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.useCase.removeCollaborator(param(req.params['id']), req.user!.userId, param(req.params['userId']))
      res.status(204).send()
    } catch (err) { next(err) }
  }

  moveItemToSection = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.useCase.moveItemToSection(param(req.params['id']), req.user!.userId, param(req.params['photoId']), req.body.sectionId ?? null)
      res.json({ data: item })
    } catch (err) { next(err) }
  }
}
