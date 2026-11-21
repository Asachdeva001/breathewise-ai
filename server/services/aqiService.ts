/**
 * Air Quality Telemetry Ingestion & Caching Service
 * 
 * Ingests live telemetry from Open-Meteo Air Quality API, provides in-memory TTL caching,
 * computes exact CPCB NAQI via the deterministic calculator, and offers realistic demonstration fixtures.
 */

import { AqiTelemetry, PollutantValues } from '../../shared/types.js';
import { evaluateCpcbAqi } from '../engine/aqiCalculator.js';

interface CacheEntry {
  data: AqiTelemetry;
  expiresAt: number;
}

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const aqiCache = new Map<string, CacheEntry>();

export const CITY_COORDINATES: Record<string, { lat: number; lon: number; country: string }> = {
  'new delhi': { lat: 28.6139, lon: 77.209, country: 'India' },
  delhi: { lat: 28.6139, lon: 77.209, country: 'India' },
  mumbai: { lat: 19.076, lon: 72.8777, country: 'India' },
  bengaluru: { lat: 12.9716, lon: 77.5946, country: 'India' },
  kolkata: { lat: 22.5726, lon: 88.3639, country: 'India' },
  chennai: { lat: 13.0827, lon: 80.2707, country: 'India' },
  hyderabad: { lat: 17.385, lon: 78.4867, country: 'India' },
  lucknow: { lat: 26.8467, lon: 80.9462, country: 'India' },
  patna: { lat: 25.5941, lon: 85.1376, country: 'India' },
  lahore: { lat: 31.5204, lon: 74.3587, country: 'Pakistan' },
  beijing: { lat: 39.9042, lon: 116.4074, country: 'China' },
  london: { lat: 51.5074, lon: -0.1278, country: 'United Kingdom' },
  'new york': { lat: 40.7128, lon: -74.006, country: 'United States' },
  'los angeles': { lat: 34.0522, lon: -118.2437, country: 'United States' },
};

export const DEMO_SCENARIOS: Record<string, { name: string; pollutants: PollutantValues; city: string }> = {
  severe_winter_smog: {
    name: 'Severe Winter Inversion Smog (Delhi NCR)',
    city: 'New Delhi',
    pollutants: {
      pm25: 385,
      pm10: 510,
      no2: 145,
      so2: 65,
      co: 3.2,
      o3: 42,
    },
  },
  very_poor_industrial: {
    name: 'Very Poor Industrial Corridor',
    city: 'Patna',
    pollutants: {
      pm25: 225,
      pm10: 315,
      no2: 185,
      so2: 90,
      co: 2.5,
      o3: 50,
    },
  },
  moderate_urban: {
    name: 'Moderate Autumn Conditions',
    city: 'Bengaluru',
    pollutants: {
      pm25: 75,
      pm10: 130,
      no2: 55,
      so2: 25,
      co: 1.2,
      o3: 55,
    },
  },
  clean_monsoon: {
    name: 'Good Clean Air Post-Rain',
    city: 'Shimla',
    pollutants: {
      pm25: 18,
      pm10: 35,
      no2: 20,
      so2: 10,
      co: 0.4,
      o3: 30,
    },
  },
};

export async function fetchAirQuality(
  cityQuery: string,
  forceDemo: boolean = false,
  scenarioKey?: string
): Promise<AqiTelemetry> {
  const normalizedCity = (cityQuery || 'New Delhi').trim().toLowerCase();

  // If demo mode is explicitly requested, return the synthetic demo fixture
  if (forceDemo) {
    const key = scenarioKey && DEMO_SCENARIOS[scenarioKey] ? scenarioKey : 'severe_winter_smog';
    const fixture = DEMO_SCENARIOS[key];
    const cpcb = evaluateCpcbAqi(fixture.pollutants);

    return {
      city: fixture.city,
      country: 'Demo Environmental Simulation',
      latitude: 28.6139,
      longitude: 77.209,
      aqi: cpcb.aqi,
      standard: 'CPCB',
      category: cpcb.category,
      categoryColor: cpcb.categoryColor,
      categoryTextColor: cpcb.categoryTextColor,
      dominantPollutant: cpcb.dominantPollutant,
      subIndices: cpcb.subIndices,
      pollutants: fixture.pollutants,
      timestamp: new Date().toISOString(),
      source: `Demonstration Fixture: ${fixture.name}`,
      isDemo: true,
      healthAdvisory: cpcb.healthAdvisory,
      sensitiveGroupWarning: cpcb.sensitiveGroupWarning,
    };
  }

  // Check in-memory cache
  const cached = aqiCache.get(normalizedCity);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  // Determine geo-coordinates
  const coords = CITY_COORDINATES[normalizedCity] || CITY_COORDINATES['new delhi'];

  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;

    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      throw new Error(`Open-Meteo API returned status ${response.status}`);
    }

    const data = (await response.json()) as any;
    const current = data.current || {};

    const pollutants: PollutantValues = {
      pm25: current.pm2_5 !== undefined ? Math.round(current.pm2_5 * 10) / 10 : undefined,
      pm10: current.pm10 !== undefined ? Math.round(current.pm10 * 10) / 10 : undefined,
      no2: current.nitrogen_dioxide !== undefined ? Math.round(current.nitrogen_dioxide * 10) / 10 : undefined,
      so2: current.sulphur_dioxide !== undefined ? Math.round(current.sulphur_dioxide * 10) / 10 : undefined,
      co: current.carbon_monoxide !== undefined ? Math.round((current.carbon_monoxide / 1000) * 10) / 10 : undefined, // convert µg to mg/m³
      o3: current.ozone !== undefined ? Math.round(current.ozone * 10) / 10 : undefined,
    };

    const cpcb = evaluateCpcbAqi(pollutants);

    const telemetry: AqiTelemetry = {
      city: capitalize(cityQuery || 'New Delhi'),
      country: coords.country,
      latitude: coords.lat,
      longitude: coords.lon,
      aqi: cpcb.aqi,
      standard: 'CPCB',
      category: cpcb.category,
      categoryColor: cpcb.categoryColor,
      categoryTextColor: cpcb.categoryTextColor,
      dominantPollutant: cpcb.dominantPollutant,
      subIndices: cpcb.subIndices,
      pollutants,
      timestamp: current.time ? new Date(current.time).toISOString() : new Date().toISOString(),
      source: 'Open-Meteo Live Air Quality Telemetry',
      isDemo: false,
      healthAdvisory: cpcb.healthAdvisory,
      sensitiveGroupWarning: cpcb.sensitiveGroupWarning,
    };

    // Cache valid result
    aqiCache.set(normalizedCity, {
      data: telemetry,
      expiresAt: now + CACHE_TTL_MS,
    });

    return telemetry;
  } catch (error) {
    console.warn(`Failed to fetch live AQI for ${cityQuery}, engaging fallback fixture:`, error);
    // Fall back to severe winter smog demo fixture so application functions smoothly
    const fallbackFixture = DEMO_SCENARIOS.severe_winter_smog;
    const cpcb = evaluateCpcbAqi(fallbackFixture.pollutants);

    return {
      city: capitalize(cityQuery || 'New Delhi'),
      country: 'Fallback Mode',
      latitude: coords.lat,
      longitude: coords.lon,
      aqi: cpcb.aqi,
      standard: 'CPCB',
      category: cpcb.category,
      categoryColor: cpcb.categoryColor,
      categoryTextColor: cpcb.categoryTextColor,
      dominantPollutant: cpcb.dominantPollutant,
      subIndices: cpcb.subIndices,
      pollutants: fallbackFixture.pollutants,
      timestamp: new Date().toISOString(),
      source: 'Demonstration Fallback (Network / Provider Offline)',
      isDemo: true,
      healthAdvisory: cpcb.healthAdvisory,
      sensitiveGroupWarning: cpcb.sensitiveGroupWarning,
    };
  }
}

function capitalize(s: string): string {
  return s
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
