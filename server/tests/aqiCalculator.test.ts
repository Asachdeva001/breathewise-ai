import { describe, it, expect } from 'vitest';
import {
  calculateSubIndex,
  evaluateCpcbAqi,
  getPollutionCategory,
} from '../engine/aqiCalculator.js';

describe('Deterministic AQI Calculator Engine (CPCB Standard)', () => {
  describe('calculateSubIndex for PM2.5', () => {
    it('calculates correct Good bracket sub-index (0-30 µg/m³)', () => {
      expect(calculateSubIndex('pm25', 0)).toBe(0);
      expect(calculateSubIndex('pm25', 15)).toBe(25);
      expect(calculateSubIndex('pm25', 30)).toBe(50);
    });

    it('calculates correct Satisfactory bracket sub-index (31-60 µg/m³)', () => {
      expect(calculateSubIndex('pm25', 31)).toBe(51);
      expect(calculateSubIndex('pm25', 45)).toBe(75);
      expect(calculateSubIndex('pm25', 60)).toBe(100);
    });

    it('calculates correct Moderate bracket sub-index (61-90 µg/m³)', () => {
      expect(calculateSubIndex('pm25', 61)).toBe(101);
      expect(calculateSubIndex('pm25', 75)).toBe(149);
      expect(calculateSubIndex('pm25', 90)).toBe(200);
    });

    it('calculates correct Poor bracket sub-index (91-120 µg/m³)', () => {
      expect(calculateSubIndex('pm25', 91)).toBe(201);
      expect(calculateSubIndex('pm25', 120)).toBe(300);
    });

    it('calculates correct Very Poor bracket sub-index (121-250 µg/m³)', () => {
      expect(calculateSubIndex('pm25', 121)).toBe(301);
      expect(calculateSubIndex('pm25', 250)).toBe(400);
    });

    it('calculates correct Severe bracket sub-index (251-500 µg/m³)', () => {
      expect(calculateSubIndex('pm25', 251)).toBe(401);
      expect(calculateSubIndex('pm25', 380)).toBe(452);
      expect(calculateSubIndex('pm25', 500)).toBe(500);
    });

    it('handles extreme values exceeding 500 µg/m³ cleanly by capping at 500', () => {
      expect(calculateSubIndex('pm25', 650)).toBe(500);
      expect(calculateSubIndex('pm25', 999)).toBe(500);
    });

    it('handles invalid or negative numbers safely', () => {
      expect(calculateSubIndex('pm25', -10)).toBe(0);
      expect(calculateSubIndex('pm25', NaN)).toBe(0);
    });
  });

  describe('evaluateCpcbAqi full evaluation', () => {
    it('identifies dominant pollutant and max sub-index correctly', () => {
      // PM2.5 = 145 µg/m³ -> SubIndex ~ 320 (Very Poor)
      // PM10 = 80 µg/m³ -> SubIndex ~ 80 (Satisfactory)
      // NO2 = 30 µg/m³ -> SubIndex ~ 38 (Good)
      const result = evaluateCpcbAqi({
        pm25: 145,
        pm10: 80,
        no2: 30,
      });

      expect(result.dominantPollutant).toBe('PM25');
      expect(result.category).toBe('Very Poor');
      expect(result.aqi).toBeGreaterThanOrEqual(315);
      expect(result.aqi).toBeLessThanOrEqual(325);
      expect(result.subIndices.length).toBe(3);
    });

    it('classifies Severe winter smog scenario accurately', () => {
      const result = evaluateCpcbAqi({
        pm25: 350, // Severe
        pm10: 480, // Severe
        no2: 120,  // Moderate
      });

      expect(result.category).toBe('Severe');
      expect(result.aqi).toBeGreaterThan(400);
      expect(result.healthAdvisory).toContain('Emergency health hazard');
    });

    it('handles empty or missing pollutant set gracefully', () => {
      const result = evaluateCpcbAqi({});
      expect(result.aqi).toBe(0);
      expect(result.dominantPollutant).toBe('N/A');
    });
  });

  describe('getPollutionCategory', () => {
    it('maps standard CPCB bands', () => {
      expect(getPollutionCategory(25)).toBe('Good');
      expect(getPollutionCategory(75)).toBe('Satisfactory');
      expect(getPollutionCategory(150)).toBe('Moderate');
      expect(getPollutionCategory(250)).toBe('Poor');
      expect(getPollutionCategory(350)).toBe('Very Poor');
      expect(getPollutionCategory(450)).toBe('Severe');
      expect(getPollutionCategory(500)).toBe('Severe');
    });
  });
});
