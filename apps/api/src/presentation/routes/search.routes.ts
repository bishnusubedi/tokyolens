import { Router } from 'express'
import { validate } from '../middleware/validate.middleware.js'
import { optionalAuthenticate } from '../middleware/auth.middleware.js'
import { searchQuerySchema } from '@repo/shared'
import { prisma } from '@repo/database'

export const searchRouter: Router = Router()

searchRouter.get('/', optionalAuthenticate, validate(searchQuerySchema, 'query'), async (req: any, res, next) => {
  try {
    const { q, type, page, limit } = req.query as { q: string; type: string; page: number; limit: number }
    const skip = (page - 1) * limit

    if (type === 'users') {
      const [data, total] = await Promise.all([
        prisma.user.findMany({
          where: {
            status: 'ACTIVE',
            OR: [
              { username: { contains: q, mode: 'insensitive' } },
              { name: { contains: q, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
            bio: true,
            _count: { select: { photos: true, followers: true } },
          },
          take: limit,
          skip,
        }),
        prisma.user.count({
          where: {
            status: 'ACTIVE',
            OR: [
              { username: { contains: q, mode: 'insensitive' } },
              { name: { contains: q, mode: 'insensitive' } },
            ],
          },
        }),
      ])
      res.json({ data, meta: { total, page, limit } })
      return
    }

    if (type === 'boards') {
      const [data, total] = await Promise.all([
        prisma.collection.findMany({
          where: { isPrivate: false, name: { contains: q, mode: 'insensitive' } },
          include: {
            user: { select: { username: true, name: true, avatarUrl: true } },
            _count: { select: { items: true } },
          },
          take: limit,
          skip,
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.collection.count({
          where: { isPrivate: false, name: { contains: q, mode: 'insensitive' } },
        }),
      ])
      res.json({ data, meta: { total, page, limit } })
      return
    }

    if (type === 'tags') {
      const data = await prisma.tag.findMany({
        where: {
          slug: {
            contains: q.toLowerCase().replace(/\s+/g, '-'),
            mode: 'insensitive',
          },
        },
        include: { _count: { select: { photoTags: true } } },
        take: limit,
        skip,
      })
      res.json({ data, meta: { total: data.length, page, limit } })
      return
    }

    // Default: photos
    const [data, total] = await Promise.all([
      prisma.photo.findMany({
        where: {
          status: 'APPROVED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { neighborhood: { contains: q, mode: 'insensitive' } },
            { tags: { some: { tag: { slug: { contains: q.toLowerCase().replace(/\s+/g, '-') } } } } },
          ],
        },
        include: {
          author: { select: { id: true, username: true, name: true, avatarUrl: true, role: true } },
          tags: { include: { tag: { select: { name: true, slug: true } } } },
          ...(req.user ? { votes: { where: { userId: req.user.userId }, select: { userId: true } } } : {}),
        },
        take: limit,
        skip,
        orderBy: { voteCount: 'desc' },
      }),
      prisma.photo.count({
        where: {
          status: 'APPROVED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { neighborhood: { contains: q, mode: 'insensitive' } },
          ],
        },
      }),
    ])
    const mapped = data.map((p) => ({
      ...p,
      hasVoted: req.user ? p.votes?.some((v: any) => v.userId === req.user!.userId) : undefined,
      votes: undefined,
      tags: p.tags.map((pt: any) => pt.tag),
    }))
    res.json({ data: mapped, meta: { total, page, limit } })
  } catch (err) {
    next(err)
  }
})
