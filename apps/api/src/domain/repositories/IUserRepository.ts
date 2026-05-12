import type { User } from '../entities/User.js';
import type { PaginationQuery, PaginatedResponse } from '@repo/shared';

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: 'ADMIN' | 'USER';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(pagination: PaginationQuery): Promise<PaginatedResponse<User>>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}
