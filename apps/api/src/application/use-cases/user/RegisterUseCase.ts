import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js'
import { AuthService } from '../../../infrastructure/services/AuthService.js'
import { ConflictError } from '../../../shared/errors/AppError.js'
import type { RegisterInput } from '@repo/shared'

export class RegisterUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: RegisterInput) {
    const [existingEmail, existingUsername] = await Promise.all([
      this.userRepository.findByEmail(dto.email),
      this.userRepository.findByUsername(dto.username),
    ])
    if (existingEmail) throw new ConflictError('Email already in use')
    if (existingUsername) throw new ConflictError('Username already taken')

    const hashed = await AuthService.hashPassword(dto.password)
    const user = await this.userRepository.create({ ...dto, password: hashed })

    const { password: _, ...publicUser } = user
    const token = AuthService.signToken(publicUser)

    return { user: publicUser, token }
  }
}
