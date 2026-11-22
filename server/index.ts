import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { requestLogger } from './middleware/logging.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/health.routes.js';
import apiRoutes from './routes/api.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Security Middleware: Hardened Helmet & CSP Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: [
            "'self'",
            'https://air-quality-api.open-meteo.com',
            'https://geocoding-api.open-meteo.com',
          ],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xContentTypeOptions: true,
      xDnsPrefetchControl: { allow: false },
      xFrameOptions: { action: 'sameorigin' },
    })
  );

  // Prototype Pollution & Injection Guard
  app.use((req, _res, next) => {
    const sanitize = (obj: unknown): void => {
      if (obj && typeof obj === 'object') {
        for (const key of Object.keys(obj as Record<string, unknown>)) {
          if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            delete (obj as Record<string, unknown>)[key];
          } else {
            sanitize((obj as Record<string, unknown>)[key]);
          }
        }
      }
    };
    sanitize(req.body);
    sanitize(req.query);
    sanitize(req.params);
    next();
  });

  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
    })
  );

  // Request Parsing & Logging
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);
  app.use(rateLimiter);

  // Mount API Endpoints
  app.use('/api', healthRoutes);
  app.use('/api', apiRoutes);

  // In production, serve compiled static React assets from /dist
  if (env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));

    // Client-side routing fallback
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}

export const app = createApp();

// Start HTTP server only if executed directly
if (process.env.NODE_ENV !== 'test') {
  const PORT = env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[BreatheWise AI] Server listening on http://localhost:${PORT}`);
    console.log(`[BreatheWise AI] Environment: ${env.NODE_ENV} | Model: ${env.VERTEX_AI_MODEL_ID}`);
  });
}
