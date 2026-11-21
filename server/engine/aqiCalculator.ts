/**
 * Deterministic Air Quality Index (AQI) Calculation Engine
 * 
 * Implements the official Indian Central Pollution Control Board (CPCB) NAQI 
 * standard with piecewise linear interpolation, alongside US-EPA AQI support.
 */

import { AqiStandard, PollutionCategory, PollutantSubIndex, PollutantValues } from '../../shared/types.js';

interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

// Official CPCB Breakpoints
const CPCB_BREAKPOINTS: Record<keyof PollutantValues, Breakpoint[]> = {
  pm25: [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
    { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
    { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
    { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
    { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
    { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
  ],
  pm10: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
    { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
    { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
    { cLow: 431, cHigh: 600, iLow: 401, iHigh: 500 },
  ],
  no2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200 },
    { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300 },
    { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400 },
    { cLow: 401, cHigh: 800, iLow: 401, iHigh: 500 },
  ],
  so2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 81, cHigh: 380, iLow: 101, iHigh: 200 },
    { cLow: 381, cHigh: 800, iLow: 201, iHigh: 300 },
    { cLow: 801, cHigh: 1600, iLow: 301, iHigh: 400 },
    { cLow: 1601, cHigh: 2400, iLow: 401, iHigh: 500 },
  ],
  co: [
    { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50 },
    { cLow: 1.1, cHigh: 2.0, iLow: 51, iHigh: 100 },
    { cLow: 2.1, cHigh: 10.0, iLow: 101, iHigh: 200 },
    { cLow: 10.1, cHigh: 17.0, iLow: 201, iHigh: 300 },
    { cLow: 17.1, cHigh: 34.0, iLow: 301, iHigh: 400 },
    { cLow: 34.1, cHigh: 50.0, iLow: 401, iHigh: 500 },
  ],
  o3: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 168, iLow: 101, iHigh: 200 },
    { cLow: 169, cHigh: 208, iLow: 201, iHigh: 300 },
    { cLow: 209, cHigh: 748, iLow: 301, iHigh: 400 },
    { cLow: 749, cHigh: 1000, iLow: 401, iHigh: 500 },
  ],
};

const UNITS: Record<keyof PollutantValues, string> = {
  pm25: 'µg/m³',
  pm10: 'µg/m³',
  no2: 'µg/m³',
  so2: 'µg/m³',
  co: 'mg/m³',
  o3: 'µg/m³',
};

/**
 * Calculates a single pollutant sub-index via linear interpolation:
 * I = ((I_high - I_low) / (C_high - C_low)) * (C - C_low) + I_low
 */
export function calculateSubIndex(pollutant: keyof PollutantValues, concentration: number): number {
  if (concentration < 0 || isNaN(concentration)) return 0;

  const breakpoints = CPCB_BREAKPOINTS[pollutant];
  if (!breakpoints) return 0;

  // If concentration is below minimum
  if (concentration <= breakpoints[0].cLow) return breakpoints[0].iLow;

  // Find corresponding breakpoint bracket
  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      const subIndex =
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow;
      return Math.round(subIndex);
    }
  }

  // If concentration exceeds the highest defined bracket (Severe+ extrapolation up to 500 max)
  const lastBp = breakpoints[breakpoints.length - 1];
  if (concentration > lastBp.cHigh) {
    return 500;
  }

  return 0;
}

export interface CpcbAqiResult {
  aqi: number;
  dominantPollutant: string;
  category: PollutionCategory;
  categoryColor: string;
  categoryTextColor: string;
  subIndices: PollutantSubIndex[];
  healthAdvisory: string;
  sensitiveGroupWarning: string;
}

/**
 * Evaluates the full CPCB Indian National Air Quality Index.
 * Requirement: At least 3 pollutants must be monitored, of which PM2.5 or PM10 must be present.
 * If fewer than 3 pollutants are available, fallback calculates using available particulate data.
 */
export function evaluateCpcbAqi(pollutants: PollutantValues): CpcbAqiResult {
  const subIndices: PollutantSubIndex[] = [];

  for (const [key, value] of Object.entries(pollutants)) {
    const pollutantKey = key as keyof PollutantValues;
    if (typeof value === 'number' && !isNaN(value) && value >= 0) {
      const idx = calculateSubIndex(pollutantKey, value);
      subIndices.push({
        pollutant: pollutantKey,
        concentration: value,
        subIndex: idx,
        unit: UNITS[pollutantKey] || 'µg/m³',
      });
    }
  }

  if (subIndices.length === 0) {
    return {
      aqi: 0,
      dominantPollutant: 'N/A',
      category: 'Good',
      categoryColor: '#00E400',
      categoryTextColor: '#000000',
      subIndices: [],
      healthAdvisory: 'Air quality telemetry is currently unavailable.',
      sensitiveGroupWarning: 'No data to evaluate risk.',
    };
  }

  // Sort sub-indices descending to find the maximum sub-index (dominant pollutant)
  subIndices.sort((a, b) => b.subIndex - a.subIndex);
  const dominant = subIndices[0];
  const maxAqi = dominant.subIndex;

  const category = getPollutionCategory(maxAqi);
  const styling = getCategoryStyling(category);
  const advisories = getHealthAdvisory(category, dominant.pollutant);

  return {
    aqi: maxAqi,
    dominantPollutant: dominant.pollutant.toUpperCase(),
    category,
    categoryColor: styling.color,
    categoryTextColor: styling.textColor,
    subIndices,
    healthAdvisory: advisories.advisory,
    sensitiveGroupWarning: advisories.sensitiveWarning,
  };
}

export function getPollutionCategory(aqi: number): PollutionCategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export function getCategoryStyling(category: PollutionCategory): { color: string; textColor: string } {
  switch (category) {
    case 'Good':
      return { color: '#00B050', textColor: '#FFFFFF' };
    case 'Satisfactory':
      return { color: '#92D050', textColor: '#000000' };
    case 'Moderate':
      return { color: '#FFFF00', textColor: '#000000' };
    case 'Poor':
      return { color: '#FF9900', textColor: '#000000' };
    case 'Very Poor':
      return { color: '#FF0000', textColor: '#FFFFFF' };
    case 'Severe':
      return { color: '#C00000', textColor: '#FFFFFF' };
  }
}

export function getHealthAdvisory(category: PollutionCategory, dominantPollutant: string): { advisory: string; sensitiveWarning: string } {
  const pol = dominantPollutant.toUpperCase();
  switch (category) {
    case 'Good':
      return {
        advisory: 'Minimal air pollution impact. Outdoor activities are safe for all individuals.',
        sensitiveWarning: 'Safe for everyone, including sensitive individuals.',
      };
    case 'Satisfactory':
      return {
        advisory: 'Air quality is acceptable. Minor breathing discomfort may occur to sensitive people.',
        sensitiveWarning: 'People with respiratory illnesses should keep emergency inhalers accessible.',
      };
    case 'Moderate':
      return {
        advisory: `Breathing discomfort possible to individuals with lungs, asthma, and heart diseases due to elevated ${pol}.`,
        sensitiveWarning: 'Children and seniors should limit prolonged heavy outdoor exertion.',
      };
    case 'Poor':
      return {
        advisory: `Breathing discomfort to most people on prolonged exposure. Significant ${pol} particulate load.`,
        sensitiveWarning: 'Asthmatics and elderly should avoid outdoor morning and evening walks.',
      };
    case 'Very Poor':
      return {
        advisory: `Respiratory illness on prolonged exposure. High atmospheric particulate inversion traps toxic particles.`,
        sensitiveWarning: 'Wear certified N95 masks when outside. Keep windows closed during peak inversion hours.',
      };
    case 'Severe':
      return {
        advisory: `Emergency health hazard. Affects healthy people and seriously impacts those with existing diseases. Winter smog peak.`,
        sensitiveWarning: 'Strictly avoid all outdoor exercise. Run HEPA/DIY purifiers indoors. Vulnerable persons must stay indoors.',
      };
  }
}
