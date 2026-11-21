import { Request, Response, NextFunction } from 'express';
import { generateDailyPlan } from '../engine/recommendationRules.js';
import { AqiTelemetry, UserProfile } from '../../shared/types.js';

export async function getRecommendations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { telemetry, profile } = req.body as {
      telemetry: AqiTelemetry;
      profile: UserProfile;
    };

    if (!telemetry || typeof telemetry.aqi !== 'number') {
      res.status(400).json({ error: { message: 'Valid aqi telemetry object required.' } });
      return;
    }

    const defaultProfile: UserProfile = profile || {
      userId: 'default_guest',
      cityName: telemetry.city,
      householdSize: 3,
      vulnerabilities: [],
      homeType: 'apartment',
      hasAirPurifier: false,
      hasKitchenExhaust: true,
      primaryCommute: 'personal_car',
      averageCommuteDistanceKm: 15,
      exercisePreference: 'morning',
      onboardingCompleted: false,
    };

    const plan = generateDailyPlan(telemetry, defaultProfile);
    res.json(plan);
  } catch (error) {
    next(error);
  }
}
