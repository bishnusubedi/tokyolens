import express, { type Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import path from 'node:path'
import { rateLimit } from 'express-rate-limit'
import { authRouter } from './presentation/routes/auth.routes.js'
import { userRouter } from './presentation/routes/user.routes.js'
import { postRouter } from './presentation/routes/post.routes.js'
import { collectionRouter } from './presentation/routes/collection.routes.js'
import { awardRouter, adminRouter, forumRouter } from './presentation/routes/award.routes.js'
import { errorHandler, notFoundHandler } from './presentation/middleware/error.middleware.js'

const app: Express = express()

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(
  cors({
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
    credentials: true,
  }),
)
app.use(compression())
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))

if (process.env['NODE_ENV'] !== 'test') {
  app.use(morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'))
}

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)

// Serve uploaded images
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), {
  maxAge: '30d',
}))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/photos', postRouter)
app.use('/api/collections', collectionRouter)
app.use('/api/awards', awardRouter)
app.use('/api/admin', adminRouter)
app.use('/api/forum', forumRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
