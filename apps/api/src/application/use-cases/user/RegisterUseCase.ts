import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { AuthService } from '../../../infrastructure/services/AuthService.js';
import { ConflictError } from '../../../shared/errors/AppError.js';
import type { CreateUserDto, AuthResponse } from '@repo/shared';

export class RegisterUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserDto): Promise<AuthResponse> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new ConflictError('Email already in use');

    const hashed = await AuthService.hashPassword(dto.password);
    const user = await this.userRepository.create({
      ...dto,
      password: hashed,
    });

    const { password: _, ...publicUser } = user;
    const token = AuthService.signToken({
      ...publicUser,
      createdAt: publicUser.createdAt.toISOString(),
      updatedAt: publicUser.updatedAt.toISOString(),
    });

    return {
      user: {
        ...publicUser,
        createdAt: publicUser.createdAt.toISOString(),
        updatedAt: publicUser.updatedAt.toISOString(),
      },
      token,
    };
  }
}
