import { Router } from 'express';
import { getAirQuality } from '../controllers/airQuality.controller.js';
import { getRecommendations } from '../controllers/recommendations.controller.js';
import { handleChat } from '../controllers/chat.controller.js';
import { getPreferences, updatePreferences } from '../controllers/preferences.controller.js';
import { getImpact, recordAction } from '../controllers/impact.controller.js';

const router = Router();

// Air quality telemetry
router.get('/air-quality', getAirQuality);

// Deterministic recommendations
router.post('/recommendations', getRecommendations);

// Conversational AI assistant
router.post('/chat', handleChat);

// User profile & preferences
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

// Environmental & health impact tracking
router.get('/impact', getImpact);
router.post('/impact/actions', recordAction);

export default router;
