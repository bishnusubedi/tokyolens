import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { NotFoundError } from '../../../shared/errors/AppError.js';
import type { PaginationQuery, PaginatedResponse, User } from '@repo/shared';

type PublicUser = Omit<User, 'password'>;

function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
  updatedAt: Date;
}): PublicUser {
  const { password: _, ...rest } = user;
  return {
    ...rest,
    createdAt: rest.createdAt.toISOString(),
    updatedAt: rest.updatedAt.toISOString(),
  };
}

export class GetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async getAll(pagination: PaginationQuery): Promise<PaginatedResponse<PublicUser>> {
    const result = await this.userRepository.findAll(pagination);
    return {
      ...result,
      data: result.data.map(toPublicUser),
    };
  }

  async getById(id: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError('User', id);
    return toPublicUser(user);
  }
}
