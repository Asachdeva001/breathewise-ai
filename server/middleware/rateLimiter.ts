import { Request, Response, NextFunction } from 'express';

interface ClientBucket {
  count: number;
  resetAt: number;
}

const clientBuckets = new Map<string, ClientBucket>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120; // 120 requests/minute per IP

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  // Skip rate limiting during automated test execution
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const clientKey = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const bucket = clientBuckets.get(clientKey);

  if (!bucket || bucket.resetAt < now) {
    clientBuckets.set(clientKey, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return next();
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({
      error: {
        message: 'Too many requests. Please slow down and try again shortly.',
        statusCode: 429,
        retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
      },
    });
    return;
  }

  bucket.count++;
  next();
}
