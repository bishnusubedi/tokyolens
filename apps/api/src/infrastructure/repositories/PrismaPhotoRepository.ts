import type { PrismaClient } from '@repo/database'
import type { Photo, PhotoWithAuthor } from '../../domain/entities/Post.js'
import type { IPhotoRepository, CreatePhotoData, PhotoListOptions } from '../../domain/repositories/IPostRepository.js'

const AUTHOR_SELECT = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
  role: true,
}

const PHOTO_WITH_AUTHOR_INCLUDE = {
  author: { select: AUTHOR_SELECT },
  awards: { select: { type: true } },
}

function mapPhoto(p: any, requestingUserId?: string): PhotoWithAuthor {
  return {
    ...p,
    hasVoted: requestingUserId ? p.votes?.some((v: any) => v.userId === requestingUserId) : undefined,
    awards: undefined,
    votes: undefined,
  }
}

export class PrismaPhotoRepository implements IPhotoRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: CreatePhotoData): Promise<Photo> {
    return this.db.photo.create({ data: data as any }) as Promise<Photo>
  }

  async findById(id: string, requestingUserId?: string): Promise<PhotoWithAuthor | null> {
    const include: any = {
      ...PHOTO_WITH_AUTHOR_INCLUDE,
    }
    if (requestingUserId) {
      include.votes = { where: { userId: requestingUserId }, select: { userId: true } }
    }
    const photo = await this.db.photo.findUnique({ where: { id }, include })
    if (!photo) return null
    return mapPhoto(photo, requestingUserId)
  }

  async list(options: PhotoListOptions): Promise<{ data: PhotoWithAuthor[]; total: number; nextCursor?: string }> {
    const { page, limit, sortBy, category, neighborhood, authorId, status = 'APPROVED', requestingUserId, cursor } = options

    const where: any = { status }
    if (category) where.category = category
    if (neighborhood) where.neighborhood = neighborhood
    if (authorId) where.authorId = authorId

    let orderBy: any
    const now = new Date()
    if (sortBy === 'top') {
      orderBy = { voteCount: 'desc' }
    } else if (sortBy === 'trending') {
      where.approvedAt = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
      orderBy = { voteCount: 'desc' }
    } else {
      orderBy = { createdAt: 'desc' }
    }

    const include: any = { ...PHOTO_WITH_AUTHOR_INCLUDE }
    if (requestingUserId) {
      include.votes = { where: { userId: requestingUserId }, select: { userId: true } }
    }

    const cursorObj = cursor ? { id: cursor } : undefined
    const take = limit + 1

    const photos = await this.db.photo.findMany({
      where,
      orderBy,
      include,
      take,
      skip: cursorObj ? 1 : (page - 1) * limit,
      ...(cursorObj ? { cursor: cursorObj } : {}),
    })

    const hasMore = photos.length > limit
    const items = hasMore ? photos.slice(0, limit) : photos
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

    const total = await this.db.photo.count({ where })

    return {
      data: items.map((p: any) => mapPhoto(p, requestingUserId)),
      total,
      ...(nextCursor ? { nextCursor } : {}),
    }
  }

  async updateStatus(id: string, status: Photo['status'], approvedAt?: Date): Promise<Photo> {
    return this.db.photo.update({
      where: { id },
      data: { status, ...(approvedAt ? { approvedAt } : {}) },
    }) as Promise<Photo>
  }

  async update(id: string, data: Partial<CreatePhotoData>): Promise<Photo> {
    const { authorId: _, ...updateData } = data
    return this.db.photo.update({ where: { id }, data: updateData as any }) as Promise<Photo>
  }

  async delete(id: string): Promise<void> {
    await this.db.photo.update({ where: { id }, data: { status: 'DELETED' } })
  }

  async incrementVoteCount(id: string): Promise<void> {
    await this.db.photo.update({ where: { id }, data: { voteCount: { increment: 1 } } })
  }

  async decrementVoteCount(id: string): Promise<void> {
    await this.db.photo.update({ where: { id }, data: { voteCount: { decrement: 1 } } })
  }

  async findApprovedInRange(start: Date, end: Date): Promise<Photo[]> {
    return this.db.photo.findMany({
      where: { status: 'APPROVED', approvedAt: { gte: start, lt: end } },
    }) as Promise<Photo[]>
  }

  async listRelated(photoId: string, category: string, limit: number): Promise<PhotoWithAuthor[]> {
    const photos = await this.db.photo.findMany({
      where: { status: 'APPROVED', category: category as any, id: { not: photoId } },
      orderBy: { voteCount: 'desc' },
      take: limit,
      include: PHOTO_WITH_AUTHOR_INCLUDE,
    })
    return photos.map((p: any) => mapPhoto(p))
  }
}
