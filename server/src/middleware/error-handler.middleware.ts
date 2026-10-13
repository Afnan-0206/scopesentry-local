import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '@scopesentry/shared';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Safe console log without leaking document content
  console.error(`[API Error] ${req.method} ${req.path}: ${err.message || 'Internal error'}`);

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  const response: ApiErrorResponse = {
    error: err.message || 'An unexpected error occurred.',
    code: errorCode,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}
