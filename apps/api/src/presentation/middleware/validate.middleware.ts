import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors/AppError.js';
import { formatZodErrors } from '@repo/shared';

type Target = 'body' | 'query' | 'params';

export function validate<T>(schema: z.ZodType<T>, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(new ValidationError(formatZodErrors(result.error)));
    }
    req[target] = result.data as never;
    next();
  };
}
