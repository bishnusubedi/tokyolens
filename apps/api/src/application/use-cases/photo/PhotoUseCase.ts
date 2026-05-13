import type { IPhotoRepository, IVoteRepository, ICommentRepository } from '../../../domain/repositories/IPostRepository.js'
import { ImageService } from '../../../infrastructure/services/ImageService.js'
import { NotFoundError, ForbiddenError } from '../../../shared/errors/AppError.js'
import type { CreatePhotoInput, PhotoQuery } from '@repo/shared'

export class PhotoUseCase {
  constructor(
    private readonly photoRepo: IPhotoRepository,
    private readonly voteRepo: IVoteRepository,
    private readonly commentRepo: ICommentRepository,
  ) {}

  async upload(authorId: string, dto: CreatePhotoInput, file: Buffer) {
    const processed = await ImageService.process(file)
    return this.photoRepo.create({
      ...dto,
      iso: dto.iso,
      imageUrl: processed.imageUrl,
      thumbnailUrl: processed.thumbnailUrl,
      width: processed.width,
      height: processed.height,
      fileSize: processed.fileSize,
      ...processed.exif,
      authorId,
    })
  }

  async getById(id: string, requestingUserId?: string) {
    const photo = await this.photoRepo.findById(id, requestingUserId)
    if (!photo) throw new NotFoundError('Photo', id)
    if (photo.status !== 'APPROVED' && photo.authorId !== requestingUserId) {
      throw new NotFoundError('Photo', id)
    }
    return photo
  }

  async list(query: PhotoQuery, requestingUserId?: string) {
    return this.photoRepo.list({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      category: query.category,
      neighborhood: query.neighborhood,
      authorId: query.authorId,
      status: query.status ?? 'APPROVED',
      requestingUserId,
      cursor: query.cursor,
    })
  }

  async toggleVote(photoId: string, userId: string) {
    const photo = await this.photoRepo.findById(photoId)
    if (!photo || photo.status !== 'APPROVED') throw new NotFoundError('Photo', photoId)

    const existing = await this.voteRepo.findByUserAndPhoto(userId, photoId)
    if (existing) {
      await this.voteRepo.delete(userId, photoId)
      await this.photoRepo.decrementVoteCount(photoId)
      const count = await this.voteRepo.countByPhoto(photoId)
      return { voted: false, count }
    } else {
      await this.voteRepo.create(userId, photoId)
      await this.photoRepo.incrementVoteCount(photoId)
      const count = await this.voteRepo.countByPhoto(photoId)
      return { voted: true, count }
    }
  }

  async addComment(photoId: string, userId: string, body: string) {
    const photo = await this.photoRepo.findById(photoId)
    if (!photo || photo.status !== 'APPROVED') throw new NotFoundError('Photo', photoId)
    return this.commentRepo.create({ body, authorId: userId, photoId })
  }

  async listComments(photoId: string) {
    return this.commentRepo.listByPhoto(photoId)
  }

  async delete(id: string, userId: string, role: string) {
    const photo = await this.photoRepo.findById(id)
    if (!photo) throw new NotFoundError('Photo', id)
    if (photo.authorId !== userId && role !== 'ADMIN' && role !== 'MODERATOR') {
      throw new ForbiddenError()
    }
    await this.photoRepo.delete(id)
  }

  async getUserPhotos(authorId: string, page = 1, limit = 20) {
    return this.photoRepo.list({
      page,
      limit,
      sortBy: 'newest',
      authorId,
      status: 'APPROVED',
    })
  }

  async getRelated(photoId: string, limit = 8) {
    const photo = await this.photoRepo.findById(photoId)
    if (!photo || photo.status !== 'APPROVED') throw new NotFoundError('Photo', photoId)
    return this.photoRepo.listRelated(photoId, photo.category, limit)
  }
}
