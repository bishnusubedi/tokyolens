export interface CollectionRow {
  id: string
  name: string
  description: string | null
  isPrivate: boolean
  coverUrl: string | null
  userId: string
  itemCount: number
  createdAt: Date
  updatedAt: Date
}

export interface CollectionItemRow {
  id: string
  collectionId: string
  photoId: string
  savedAt: Date
  photo: {
    id: string
    title: string
    imageUrl: string
    thumbnailUrl: string | null
    width: number
    height: number
    neighborhood: string
    voteCount: number
    author: { id: string; username: string; name: string; avatarUrl: string | null }
  }
}

export interface ICollectionRepository {
  listByUser(userId: string): Promise<CollectionRow[]>
  findById(id: string): Promise<CollectionRow | null>
  create(data: { name: string; description?: string; isPrivate?: boolean; userId: string }): Promise<CollectionRow>
  update(id: string, data: { name?: string; description?: string | null; isPrivate?: boolean }): Promise<CollectionRow>
  delete(id: string): Promise<void>
  addPhoto(collectionId: string, photoId: string): Promise<void>
  removePhoto(collectionId: string, photoId: string): Promise<void>
  listPhotos(collectionId: string, page: number, limit: number): Promise<{ data: CollectionItemRow[]; total: number }>
  hasPhoto(collectionId: string, photoId: string): Promise<boolean>
  getSavedCollections(userId: string, photoId: string): Promise<string[]>
}
