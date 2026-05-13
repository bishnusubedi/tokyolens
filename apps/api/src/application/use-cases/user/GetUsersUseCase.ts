import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js'
import type { IAwardRepository, IPhotoRepository } from '../../../domain/repositories/IPostRepository.js'
import { NotFoundError, BadRequestError } from '../../../shared/errors/AppError.js'
import type { UpdateProfileInput } from '@repo/shared'

export class UserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly photoRepo: IPhotoRepository,
    private readonly awardRepo: IAwardRepository,
  ) {}

  async getProfile(username: string, requestingUserId?: string) {
    const user = await this.userRepo.findByUsername(username)
    if (!user || user.status === 'BANNED') throw new NotFoundError('User')
    const { password: _, email: __, ...publicUser } = user
    const counts = await this.userRepo.getFollowCounts(user.id)
    const isFollowing = requestingUserId ? await this.userRepo.isFollowing(requestingUserId, user.id) : false
    return { ...publicUser, ...counts, isFollowing }
  }

  async updateProfile(userId: string, dto: UpdateProfileInput) {
    return this.userRepo.update(userId, dto)
  }

  async getGallery(username: string, page = 1, limit = 20) {
    const user = await this.userRepo.findByUsername(username)
    if (!user) throw new NotFoundError('User')
    return this.photoRepo.list({ page, limit, sortBy: 'newest', authorId: user.id, status: 'APPROVED' })
  }

  async getTrophyCase(username: string) {
    const user = await this.userRepo.findByUsername(username)
    if (!user) throw new NotFoundError('User')
    return this.awardRepo.listByUser(user.id)
  }

  async listUsers(page = 1, limit = 20) {
    return this.userRepo.list({ page, limit })
  }

  async follow(followerId: string, targetUsername: string) {
    const target = await this.userRepo.findByUsername(targetUsername)
    if (!target) throw new NotFoundError('User')
    if (target.id === followerId) throw new BadRequestError('Cannot follow yourself')
    await this.userRepo.follow(followerId, target.id)
    return { following: true }
  }

  async unfollow(followerId: string, targetUsername: string) {
    const target = await this.userRepo.findByUsername(targetUsername)
    if (!target) throw new NotFoundError('User')
    await this.userRepo.unfollow(followerId, target.id)
    return { following: false }
  }

  async listFollowers(username: string, page = 1, limit = 20) {
    const user = await this.userRepo.findByUsername(username)
    if (!user) throw new NotFoundError('User')
    return this.userRepo.listFollowers(user.id, page, limit)
  }

  async listFollowing(username: string, page = 1, limit = 20) {
    const user = await this.userRepo.findByUsername(username)
    if (!user) throw new NotFoundError('User')
    return this.userRepo.listFollowing(user.id, page, limit)
  }
}
