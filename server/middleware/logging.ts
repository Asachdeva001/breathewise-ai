import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    // Structured JSON log compatible with Google Cloud Logging
    const logEntry = {
      severity: statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARNING' : 'INFO',
      message: `${method} ${originalUrl} ${statusCode} - ${duration}ms`,
      httpRequest: {
        requestMethod: method,
        requestUrl: originalUrl,
        status: statusCode,
        remoteIp: ip,
        latency: `${(duration / 1000).toFixed(3)}s`,
      },
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== 'test') {
      console.log(JSON.stringify(logEntry));
    }
  });

  next();
}
