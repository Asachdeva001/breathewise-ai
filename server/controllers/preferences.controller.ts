import { Request, Response, NextFunction } from 'express';
import { getUserProfile, saveUserProfile } from '../services/firestoreService.js';
import { UserProfile } from '../../shared/types.js';

export async function getPreferences(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'default_user';
    let profile = await getUserProfile(userId);

    if (!profile) {
      // Provide default template
      profile = {
        userId,
        cityName: 'New Delhi',
        householdSize: 4,
        vulnerabilities: [],
        homeType: 'apartment',
        hasAirPurifier: false,
        hasKitchenExhaust: true,
        primaryCommute: 'personal_car',
        averageCommuteDistanceKm: 15,
        exercisePreference: 'morning',
        onboardingCompleted: false,
      };
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const profileData = req.body as UserProfile;

    if (!profileData || !profileData.userId) {
      res.status(400).json({ error: { message: 'Valid profile with userId required.' } });
      return;
    }

    const saved = await saveUserProfile(profileData);
    res.json(saved);
  } catch (error) {
    next(error);
  }
}
