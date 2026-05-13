import type { Photo, PhotoWithAuthor, Comment, CommentWithAuthor, Award, AwardWithPhoto, ForumCategory, ForumThread, ForumThreadWithAuthor, ForumReply, ForumReplyWithAuthor } from '../entities/Post.js'

export interface CreatePhotoData {
  title: string
  description?: string | undefined
  imageUrl: string
  thumbnailUrl?: string | undefined
  previewUrl?: string | undefined
  width: number
  height: number
  fileSize: number
  neighborhood: string
  category: Photo['category']
  cameraMake?: string | undefined
  cameraModel?: string | undefined
  lens?: string | undefined
  iso?: number | undefined
  aperture?: string | undefined
  shutterSpeed?: string | undefined
  focalLength?: string | undefined
  takenAt?: Date | undefined
  authorId: string
}

export interface PhotoListOptions {
  page: number
  limit: number
  sortBy: 'newest' | 'top' | 'trending'
  category?: Photo['category'] | undefined
  neighborhood?: string | undefined
  authorId?: string | undefined
  status?: Photo['status'] | undefined
  requestingUserId?: string | undefined
  cursor?: string | undefined
}

export interface IPhotoRepository {
  create(data: CreatePhotoData): Promise<Photo>
  findById(id: string, requestingUserId?: string): Promise<PhotoWithAuthor | null>
  list(options: PhotoListOptions): Promise<{ data: PhotoWithAuthor[]; total: number; nextCursor?: string }>
  listRelated(photoId: string, category: string, limit: number): Promise<PhotoWithAuthor[]>
  updateStatus(id: string, status: Photo['status'], approvedAt?: Date): Promise<Photo>
  update(id: string, data: Partial<CreatePhotoData>): Promise<Photo>
  delete(id: string): Promise<void>
  incrementVoteCount(id: string): Promise<void>
  decrementVoteCount(id: string): Promise<void>
  findApprovedInRange(start: Date, end: Date): Promise<Photo[]>
}

export interface IVoteRepository {
  findByUserAndPhoto(userId: string, photoId: string): Promise<{ id: string } | null>
  create(userId: string, photoId: string): Promise<void>
  delete(userId: string, photoId: string): Promise<void>
  countByPhoto(photoId: string): Promise<number>
  aggregateByPeriod(start: Date, end: Date, limit: number): Promise<Array<{ photoId: string; authorId: string; voteCount: number }>>
}

export interface ICommentRepository {
  create(data: { body: string; authorId: string; photoId: string }): Promise<CommentWithAuthor>
  listByPhoto(photoId: string): Promise<CommentWithAuthor[]>
  delete(id: string, userId: string): Promise<void>
}

export interface IAwardRepository {
  upsert(data: {
    type: Award['type']
    photoId: string
    userId: string
    periodStart: Date
    periodEnd: Date
    voteCount: number
  }): Promise<Award>
  findLatestByType(type: Award['type']): Promise<AwardWithPhoto | null>
  listByUser(userId: string): Promise<AwardWithPhoto[]>
  list(limit?: number): Promise<AwardWithPhoto[]>
}

export interface IForumRepository {
  listCategories(): Promise<ForumCategory[]>
  findCategoryBySlug(slug: string): Promise<ForumCategory | null>
  createThread(data: { title: string; body: string; authorId: string; categoryId: string }): Promise<ForumThreadWithAuthor>
  listThreads(categoryId: string, options: { page: number; limit: number }): Promise<{ data: ForumThreadWithAuthor[]; total: number }>
  listAllThreads(options: { page: number; limit: number }): Promise<{ data: ForumThreadWithAuthor[]; total: number }>
  findThread(id: string): Promise<ForumThreadWithAuthor | null>
  createReply(data: { body: string; authorId: string; threadId: string; embeddedPhotoId?: string | undefined }): Promise<ForumReplyWithAuthor>
  listReplies(threadId: string, options: { page: number; limit: number }): Promise<{ data: ForumReplyWithAuthor[]; total: number }>
  deleteThread(id: string): Promise<void>
  deleteReply(id: string): Promise<void>
}
