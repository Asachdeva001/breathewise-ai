import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../../shared/types.js';
import { fetchPreferencesApi, updatePreferencesApi } from '../services/api.js';

const USER_ID_KEY = 'breathewise_user_id';

function getOrGenerateUserId(): string {
  let uid = localStorage.getItem(USER_ID_KEY);
  if (!uid) {
    uid = `bw-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    localStorage.setItem(USER_ID_KEY, uid);
  }
  return uid;
}

export function usePreferences() {
  const [userId] = useState<string>(getOrGenerateUserId);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPreferencesApi(userId);
      setProfile(data);
    } catch (err) {
      console.warn('Failed to fetch preferences from server, using local defaults:', err);
      setProfile({
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
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const saveProfile = async (updated: Partial<UserProfile>) => {
    if (!profile) return;
    const newProfile: UserProfile = { ...profile, ...updated };
    setProfile(newProfile);
    try {
      await updatePreferencesApi(newProfile);
    } catch (err) {
      console.warn('Preferences update save failed on server:', err);
    }
  };

  return {
    userId,
    profile,
    loading,
    saveProfile,
    refresh: loadPreferences,
  };
}
