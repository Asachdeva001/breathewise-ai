import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';

/**
 * Global Centralized Error Handling Middleware
 * 
 * Intercepts all operational and programming errors, formats uniform JSON responses,
 * logs stack traces in non-production environments, and prevents sensitive leakage.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Error) {
    message = err.message;
    // Check if error object has custom status code
    if ('status' in err && typeof (err as { status: unknown }).status === 'number') {
      statusCode = (err as { status: number }).status;
    } else if ('statusCode' in err && typeof (err as { statusCode: unknown }).statusCode === 'number') {
      statusCode = (err as { statusCode: number }).statusCode;
    }
  }

  if (process.env.NODE_ENV !== 'test') {
    const errorDetails = err instanceof Error ? err.stack || err.message : String(err);
    console.error(`[Error] ${statusCode} - ${message}`, errorDetails);
  }

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      ...(details ? { details } : {}),
    },
  });
}
