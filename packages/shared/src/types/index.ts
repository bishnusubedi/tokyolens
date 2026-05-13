export type {
  UserRole,
  UserStatus,
  PhotoCategory,
  PhotoStatus,
  AwardType,
  ForumCategorySlug,
} from '../schemas/enums.js'

export type {
  User,
  UserPublic,
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
} from '../schemas/user.schema.js'

export type {
  Photo,
  CreatePhotoInput,
  UpdatePhotoInput,
  PhotoQuery,
} from '../schemas/post.schema.js'

export type {
  PaginationMeta,
  Comment,
  CreateCommentInput,
  VoteResponse,
  Award,
  ForumCategory,
  CreateThreadInput,
  CreateReplyInput,
  ModerationAction,
} from '../schemas/common.schema.js'

export type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
  SaveToCollectionInput,
} from '../schemas/collection.schema.js'

export type FollowStats = {
  followerCount: number
  followingCount: number
  isFollowing: boolean
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage?: boolean
  }
}

export type CursorResponse<T> = {
  data: T[]
  meta: { total: number; nextCursor?: string }
}

export type ApiResponse<T> = {
  data: T
  message?: string
}

export type AuthResponse = {
  user: import('../schemas/user.schema.js').UserPublic
  token: string
}
