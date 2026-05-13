import type { ICollectionRepository } from '../../../domain/repositories/ICollectionRepository.js'
import { NotFoundError, ForbiddenError } from '../../../shared/errors/AppError.js'

export class CollectionUseCase {
  constructor(private readonly collectionRepo: ICollectionRepository) {}

  async list(userId: string) {
    return this.collectionRepo.listByUser(userId)
  }

  async create(userId: string, dto: { name: string; description?: string; isPrivate?: boolean }) {
    return this.collectionRepo.create({ ...dto, userId })
  }

  async update(id: string, userId: string, dto: { name?: string; description?: string | null; isPrivate?: boolean }) {
    const col = await this.collectionRepo.findById(id)
    if (!col) throw new NotFoundError('Collection', id)
    if (col.userId !== userId) throw new ForbiddenError()
    return this.collectionRepo.update(id, dto)
  }

  async delete(id: string, userId: string) {
    const col = await this.collectionRepo.findById(id)
    if (!col) throw new NotFoundError('Collection', id)
    if (col.userId !== userId) throw new ForbiddenError()
    await this.collectionRepo.delete(id)
  }

  async addPhoto(collectionId: string, userId: string, photoId: string) {
    const col = await this.collectionRepo.findById(collectionId)
    if (!col) throw new NotFoundError('Collection', collectionId)
    if (col.userId !== userId) throw new ForbiddenError()
    await this.collectionRepo.addPhoto(collectionId, photoId)
    return { saved: true }
  }

  async removePhoto(collectionId: string, userId: string, photoId: string) {
    const col = await this.collectionRepo.findById(collectionId)
    if (!col) throw new NotFoundError('Collection', collectionId)
    if (col.userId !== userId) throw new ForbiddenError()
    await this.collectionRepo.removePhoto(collectionId, photoId)
    return { saved: false }
  }

  async getPhotos(collectionId: string, requestingUserId: string | undefined, page = 1, limit = 20) {
    const col = await this.collectionRepo.findById(collectionId)
    if (!col) throw new NotFoundError('Collection', collectionId)
    if (col.isPrivate && col.userId !== requestingUserId) throw new NotFoundError('Collection', collectionId)
    return this.collectionRepo.listPhotos(collectionId, page, limit)
  }

  async getSavedCollections(userId: string, photoId: string) {
    return this.collectionRepo.getSavedCollections(userId, photoId)
  }

  async getPublicByUser(userId: string) {
    const all = await this.collectionRepo.listByUser(userId)
    return all.filter((c) => !c.isPrivate)
  }
}
