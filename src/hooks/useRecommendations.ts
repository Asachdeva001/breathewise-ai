import { useState, useEffect, useCallback } from 'react';
import { AqiTelemetry, RecommendationResponse, UserProfile } from '../../shared/types.js';
import { fetchRecommendationsApi } from '../services/api.js';

export function useRecommendations(telemetry: AqiTelemetry | null, profile: UserProfile | null) {
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    if (!telemetry || !profile) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecommendationsApi(telemetry, profile);
      setRecommendations(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  }, [telemetry, profile]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refresh: loadRecommendations,
  };
}
