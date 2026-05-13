import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'
import { prisma } from '@repo/database'
import type { Response, NextFunction } from 'express'

export const feedRouter: Router = Router()

// GET /api/feed?cursor=<cuid>&limit=20
// Returns photos from users the authenticated user follows, cursor-paginated
feedRouter.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const limit = Math.min(Number(req.query['limit']) || 20, 50)
    const cursor = req.query['cursor'] as string | undefined

    const followedUsers = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    })

    if (followedUsers.length === 0) {
      res.json({ data: [], nextCursor: null })
      return
    }

    const followedIds = followedUsers.map((f) => f.followingId)

    const photos = await prisma.photo.findMany({
      where: {
        authorId: { in: followedIds },
        status: 'APPROVED',
      },
      include: {
        author: { select: { id: true, username: true, name: true, avatarUrl: true } },
        tags: { include: { tag: { select: { name: true, slug: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    const hasMore = photos.length > limit
    const items = hasMore ? photos.slice(0, limit) : photos
    const nextCursor = hasMore ? items[items.length - 1]?.id : null

    res.json({ data: items, nextCursor })
  } catch (err) {
    next(err)
  }
})
