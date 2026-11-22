import { useState, useEffect, useCallback } from 'react';
import { AqiTelemetry } from '../../shared/types.js';
import { fetchAirQualityApi } from '../services/api.js';

export function useAirQuality(initialCity: string = 'New Delhi') {
  const [city, setCity] = useState(initialCity);
  const [telemetry, setTelemetry] = useState<AqiTelemetry | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [scenario, setScenario] = useState<string>('severe_winter_smog');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAirQualityApi(city, isDemo, isDemo ? scenario : undefined);
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve air quality data');
    } finally {
      setLoading(false);
    }
  }, [city, isDemo, scenario]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    city,
    setCity,
    telemetry,
    isDemo,
    setIsDemo,
    scenario,
    setScenario,
    loading,
    error,
    refresh: loadData,
  };
}
