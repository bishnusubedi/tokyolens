import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { UserPublic } from '../../domain/entities/User.js'

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production'
const JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] ?? '7d'

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export const AuthService = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  },

  signToken(user: UserPublic): string {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role } satisfies JwtPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions,
    )
  },

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  },
}
