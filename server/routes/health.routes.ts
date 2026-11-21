import { Router } from 'express';
import { env } from '../config/env.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'BreatheWise AI Backend API',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    gcp: {
      projectId: env.GOOGLE_CLOUD_PROJECT,
      region: env.GCP_REGION,
      vertexAiModel: env.VERTEX_AI_MODEL_ID,
      firestoreMode: env.FIRESTORE_MODE,
    },
  });
});

export default router;
