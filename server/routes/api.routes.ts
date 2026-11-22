import { Router } from 'express';
import { getAirQuality } from '../controllers/airQuality.controller.js';
import { getRecommendations } from '../controllers/recommendations.controller.js';
import { handleChat } from '../controllers/chat.controller.js';
import { getPreferences, updatePreferences } from '../controllers/preferences.controller.js';
import { getImpact, recordAction } from '../controllers/impact.controller.js';
import { validateBody, validateQuery } from '../middleware/validateRequest.js';
import {
  getAirQualityQuerySchema,
  getRecommendationsBodySchema,
  chatBodySchema,
  userProfileSchema,
  recordActionBodySchema,
} from '../schemas/api.schemas.js';

const router = Router();

// Air quality telemetry with query parameter validation
router.get('/air-quality', validateQuery(getAirQualityQuerySchema), getAirQuality);

// Deterministic recommendations with body schema validation
router.post('/recommendations', validateBody(getRecommendationsBodySchema), getRecommendations);

// Conversational AI assistant with strict context and prompt validation
router.post('/chat', validateBody(chatBodySchema), handleChat);

// User profile & preferences with schema validation
router.get('/preferences', getPreferences);
router.put('/preferences', validateBody(userProfileSchema), updatePreferences);

// Environmental & health impact tracking
router.get('/impact', getImpact);
router.post('/impact/actions', validateBody(recordActionBodySchema), recordAction);

export default router;
