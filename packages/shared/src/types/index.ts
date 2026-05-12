import { z } from 'zod';
import {
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  UserLoginSchema,
  AuthResponseSchema,
  UserRoleSchema,
} from '../schemas/user.schema.js';
import {
  PostSchema,
  CreatePostSchema,
  UpdatePostSchema,
  PostStatusSchema,
} from '../schemas/post.schema.js';
import {
  PaginationQuerySchema,
  ApiErrorSchema,
  UuidParamSchema,
} from '../schemas/common.schema.js';

export type UserRole = z.infer<typeof UserRoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UserLoginDto = z.infer<typeof UserLoginSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export type PostStatus = z.infer<typeof PostStatusSchema>;
export type Post = z.infer<typeof PostSchema>;
export type CreatePostDto = z.infer<typeof CreatePostSchema>;
export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type UuidParam = z.infer<typeof UuidParamSchema>;

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
};
