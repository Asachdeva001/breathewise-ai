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

  // Security Middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Vite inline styles & fonts in dev/prod
      crossOriginEmbedderPolicy: false,
    })
  );

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
    const distPath = path.resolve(__dirname, '../dist');
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
