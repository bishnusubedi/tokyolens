import type { UserSummary } from './User.js'

export interface Photo {
  id: string
  title: string
  description: string | null
  imageUrl: string
  thumbnailUrl: string | null
  width: number
  height: number
  fileSize: number
  neighborhood: string
  category: 'STREET' | 'PORTRAIT' | 'LANDSCAPE' | 'ARCHITECTURE' | 'NIGHT' | 'MACRO' | 'WILDLIFE' | 'TRAVEL' | 'ABSTRACT' | 'OTHER'
  status: 'PENDING' | 'APPROVED' | 'HIDDEN' | 'DELETED'
  cameraMake: string | null
  cameraModel: string | null
  lens: string | null
  iso: number | null
  aperture: string | null
  shutterSpeed: string | null
  focalLength: string | null
  takenAt: Date | null
  authorId: string
  voteCount: number
  approvedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface PhotoWithAuthor extends Photo {
  author: UserSummary
  hasVoted?: boolean
  previewUrl?: string | null
  tags?: Array<{ name: string; slug: string }>
}

export interface Comment {
  id: string
  body: string
  authorId: string
  photoId: string
  createdAt: Date
  updatedAt: Date
}

export interface CommentWithAuthor extends Comment {
  author: UserSummary
}

export interface Award {
  id: string
  type: 'WEEKLY_WINNER' | 'MONTHLY_WINNER'
  photoId: string
  userId: string
  periodStart: Date
  periodEnd: Date
  voteCount: number
  awardedAt: Date
}

export interface AwardWithPhoto extends Award {
  photo: PhotoWithAuthor
  user: UserSummary
}

export interface ForumCategory {
  id: string
  slug: string
  name: string
  description: string
  sortOrder: number
}

export interface ForumThread {
  id: string
  title: string
  body: string
  authorId: string
  categoryId: string
  pinned: boolean
  locked: boolean
  replyCount: number
  lastReplyAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface ForumThreadWithAuthor extends ForumThread {
  author: UserSummary
  category: ForumCategory
}

export interface ForumReply {
  id: string
  body: string
  authorId: string
  threadId: string
  embeddedPhotoId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ForumReplyWithAuthor extends ForumReply {
  author: UserSummary
  embeddedPhoto: PhotoWithAuthor | null
}
