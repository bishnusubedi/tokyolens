import type { PrismaClient } from '@repo/database'
import type { ICollectionRepository, CollectionRow, CollectionItemRow } from '../../domain/repositories/ICollectionRepository.js'

export class PrismaCollectionRepository implements ICollectionRepository {
  constructor(private readonly db: PrismaClient) {}

  private async withCount(collection: { id: string; name: string; description: string | null; isPrivate: boolean; coverUrl: string | null; userId: string; createdAt: Date; updatedAt: Date }): Promise<CollectionRow> {
    const itemCount = await this.db.collectionItem.count({ where: { collectionId: collection.id } })
    return { ...collection, itemCount }
  }

  async listByUser(userId: string): Promise<CollectionRow[]> {
    const rows = await this.db.collection.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } })
    return Promise.all(rows.map((r) => this.withCount(r)))
  }

  async findById(id: string): Promise<CollectionRow | null> {
    const row = await this.db.collection.findUnique({ where: { id } })
    if (!row) return null
    return this.withCount(row)
  }

  async create(data: { name: string; description?: string; isPrivate?: boolean; userId: string }): Promise<CollectionRow> {
    const row = await this.db.collection.create({ data: { name: data.name, description: data.description ?? null, isPrivate: data.isPrivate ?? false, userId: data.userId } })
    return { ...row, itemCount: 0 }
  }

  async update(id: string, data: { name?: string; description?: string | null; isPrivate?: boolean }): Promise<CollectionRow> {
    const row = await this.db.collection.update({ where: { id }, data })
    return this.withCount(row)
  }

  async delete(id: string): Promise<void> {
    await this.db.collection.delete({ where: { id } })
  }

  async addPhoto(collectionId: string, photoId: string): Promise<void> {
    await this.db.collectionItem.upsert({
      where: { collectionId_photoId: { collectionId, photoId } },
      create: { collectionId, photoId },
      update: {},
    })
    const firstPhoto = await this.db.collectionItem.findFirst({
      where: { collectionId },
      include: { photo: { select: { thumbnailUrl: true, imageUrl: true } } },
      orderBy: { savedAt: 'desc' },
    })
    if (firstPhoto) {
      await this.db.collection.update({
        where: { id: collectionId },
        data: { coverUrl: firstPhoto.photo.thumbnailUrl ?? firstPhoto.photo.imageUrl, updatedAt: new Date() },
      })
    }
  }

  async removePhoto(collectionId: string, photoId: string): Promise<void> {
    await this.db.collectionItem.delete({ where: { collectionId_photoId: { collectionId, photoId } } })
    const newCover = await this.db.collectionItem.findFirst({
      where: { collectionId },
      include: { photo: { select: { thumbnailUrl: true, imageUrl: true } } },
      orderBy: { savedAt: 'desc' },
    })
    await this.db.collection.update({
      where: { id: collectionId },
      data: { coverUrl: newCover ? (newCover.photo.thumbnailUrl ?? newCover.photo.imageUrl) : null },
    })
  }

  async listPhotos(collectionId: string, page: number, limit: number): Promise<{ data: CollectionItemRow[]; total: number }> {
    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      this.db.collectionItem.findMany({
        where: { collectionId },
        skip,
        take: limit,
        orderBy: { savedAt: 'desc' },
        include: {
          photo: {
            select: {
              id: true, title: true, imageUrl: true, thumbnailUrl: true,
              width: true, height: true, neighborhood: true, voteCount: true,
              author: { select: { id: true, username: true, name: true, avatarUrl: true } },
            },
          },
        },
      }),
      this.db.collectionItem.count({ where: { collectionId } }),
    ])
    return { data: items as CollectionItemRow[], total }
  }

  async hasPhoto(collectionId: string, photoId: string): Promise<boolean> {
    const item = await this.db.collectionItem.findUnique({ where: { collectionId_photoId: { collectionId, photoId } } })
    return !!item
  }

  async getSavedCollections(userId: string, photoId: string): Promise<string[]> {
    const items = await this.db.collectionItem.findMany({
      where: { photoId, collection: { userId } },
      select: { collectionId: true },
    })
    return items.map((i) => i.collectionId)
  }
}
