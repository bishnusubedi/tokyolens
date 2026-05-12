import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { authRouter } from './presentation/routes/auth.routes.js';
import { userRouter } from './presentation/routes/user.routes.js';
import { postRouter } from './presentation/routes/post.routes.js';
import { errorHandler, notFoundHandler } from './presentation/middleware/error.middleware.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env['NODE_ENV'] !== 'test') {
  app.use(morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'));
}

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
