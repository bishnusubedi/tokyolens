import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js'
import { AuthService } from '../../../infrastructure/services/AuthService.js'
import { UnauthorizedError } from '../../../shared/errors/AppError.js'
import type { LoginInput } from '@repo/shared'

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: LoginInput) {
    const user = await this.userRepository.findByEmail(dto.email)
    if (!user) throw new UnauthorizedError('Invalid credentials')

    if (user.status === 'BANNED') throw new UnauthorizedError('Account is banned')

    const valid = await AuthService.comparePassword(dto.password, user.password)
    if (!valid) throw new UnauthorizedError('Invalid credentials')

    const { password: _, ...publicUser } = user
    const token = AuthService.signToken(publicUser)

    return { user: publicUser, token }
  }
}
