import { describe, it, expect } from 'vitest';
import { calculateSubIndex, evaluateCpcbAqi } from '../engine/aqiCalculator.js';

describe('CPCB NAQI Breakpoint & Boundary Edge-Case Tests', () => {
  describe('calculateSubIndex boundary precision', () => {
    it('handles negative or NaN concentrations safely returning 0', () => {
      expect(calculateSubIndex('pm25', -10)).toBe(0);
      expect(calculateSubIndex('pm25', NaN)).toBe(0);
    });

    it('calculates PM2.5 boundary values accurately', () => {
      // Good boundary: 0 - 30 -> 0 - 50
      expect(calculateSubIndex('pm25', 0)).toBe(0);
      expect(calculateSubIndex('pm25', 30)).toBe(50);

      // Satisfactory boundary: 31 - 60 -> 51 - 100
      expect(calculateSubIndex('pm25', 60)).toBe(100);

      // Moderate boundary: 61 - 90 -> 101 - 200
      expect(calculateSubIndex('pm25', 90)).toBe(200);

      // Poor boundary: 91 - 120 -> 201 - 300
      expect(calculateSubIndex('pm25', 120)).toBe(300);

      // Very Poor boundary: 121 - 250 -> 301 - 400
      expect(calculateSubIndex('pm25', 250)).toBe(400);

      // Severe boundary: 251 - 500 -> 401 - 500
      expect(calculateSubIndex('pm25', 500)).toBe(500);

      // Off-scale extreme > 500
      expect(calculateSubIndex('pm25', 750)).toBe(500);
    });

    it('calculates PM10 boundary values accurately', () => {
      expect(calculateSubIndex('pm10', 0)).toBe(0);
      expect(calculateSubIndex('pm10', 50)).toBe(50);
      expect(calculateSubIndex('pm10', 100)).toBe(100);
      expect(calculateSubIndex('pm10', 250)).toBe(200);
      expect(calculateSubIndex('pm10', 350)).toBe(300);
      expect(calculateSubIndex('pm10', 430)).toBe(400);
      expect(calculateSubIndex('pm10', 600)).toBe(500);
    });

    it('calculates Carbon Monoxide (CO in mg/m³) correctly', () => {
      expect(calculateSubIndex('co', 1.0)).toBe(50);
      expect(calculateSubIndex('co', 2.0)).toBe(100);
      expect(calculateSubIndex('co', 10.0)).toBe(200);
      expect(calculateSubIndex('co', 17.0)).toBe(300);
      expect(calculateSubIndex('co', 34.0)).toBe(400);
      expect(calculateSubIndex('co', 50.0)).toBe(500);
    });
  });

  describe('evaluateCpcbAqi full composite evaluation', () => {
    it('correctly handles all pollutants missing by returning default Good baseline', () => {
      const result = evaluateCpcbAqi({});
      expect(result.aqi).toBe(0);
      expect(result.category).toBe('Good');
      expect(result.dominantPollutant).toBe('N/A');
    });

    it('correctly picks highest sub-index as dominant pollutant', () => {
      const result = evaluateCpcbAqi({
        pm25: 15,  // sub-index ~25 (Good)
        no2: 250,  // sub-index ~270 (Poor)
        so2: 20,   // sub-index ~25 (Good)
      });
      expect(result.dominantPollutant).toBe('NO2');
      expect(result.aqi).toBeGreaterThan(200);
      expect(result.category).toBe('Poor');
    });

    it('identifies Severe winter smog profile correctly', () => {
      const result = evaluateCpcbAqi({
        pm25: 450,
        pm10: 250,
        no2: 120,
      });
      expect(result.aqi).toBeGreaterThan(400);
      expect(result.category).toBe('Severe');
      expect(result.dominantPollutant).toBe('PM25');
    });
  });
});
