import type { PrismaClient } from '@repo/database';
import type { User } from '../../domain/entities/User.js';
import type {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
} from '../../domain/repositories/IUserRepository.js';
import type { PaginationQuery, PaginatedResponse } from '@repo/shared';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  async findAll(pagination: PaginationQuery): Promise<PaginatedResponse<User>> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.db.user.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.db.user.count(),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(data: CreateUserData): Promise<User> {
    return this.db.user.create({ data });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.db.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.db.user.delete({ where: { id } });
  }
}
