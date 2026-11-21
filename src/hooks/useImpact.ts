import { useState, useEffect, useCallback } from 'react';
import { ImpactSummary } from '../../shared/types.js';
import { fetchImpactApi, logActionApi } from '../services/api.js';

export function useImpact(userId: string) {
  const [impact, setImpact] = useState<ImpactSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const loadImpact = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchImpactApi(userId);
      setImpact(data);
    } catch (err) {
      console.warn('Failed to load impact stats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadImpact();
  }, [loadImpact]);

  const logAction = async (payload: {
    actionType: string;
    title: string;
    distanceKm?: number;
    baselineMode?: string;
    alternativeMode?: string;
    ambientPm25?: number;
    durationHours?: number;
  }) => {
    try {
      const res = await logActionApi({
        userId,
        ...payload,
      });
      setImpact(res.summary);
      setActionSuccessMessage(`Action logged: "${payload.title}"! Impact updated.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      return res;
    } catch (err) {
      console.error('Failed to log action:', err);
    }
  };

  return {
    impact,
    loading,
    actionSuccessMessage,
    logAction,
    refresh: loadImpact,
  };
}
