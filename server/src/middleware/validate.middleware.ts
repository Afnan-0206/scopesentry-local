import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiErrorResponse } from '@scopesentry/shared';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorResponse: ApiErrorResponse = {
          error: 'Validation Error',
          code: 'VALIDATION_FAILED',
          details: err.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(errorResponse);
        return;
      }
      next(err);
    }
  };
}
