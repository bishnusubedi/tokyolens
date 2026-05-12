import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      errors: err.errors,
    });
    return;
  }

  if (process.env['NODE_ENV'] !== 'production') {
    console.error(err);
  }

  res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Route not found', code: 'NOT_FOUND' });
}
