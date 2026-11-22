import { describe, it, expect } from 'vitest';
import {
  getAirQualityQuerySchema,
  chatBodySchema,
  recordActionBodySchema,
  userProfileSchema,
} from '../schemas/api.schemas.js';

describe('API Zod Validation Schemas', () => {
  describe('getAirQualityQuerySchema', () => {
    it('accepts valid query parameters', () => {
      const parsed = getAirQualityQuerySchema.parse({
        city: 'New Delhi',
        demo: 'true',
        scenario: 'severe_winter_smog',
      });
      expect(parsed.city).toBe('New Delhi');
      expect(parsed.demo).toBe('true');
    });

    it('rejects invalid demo enum value', () => {
      expect(() => {
        getAirQualityQuerySchema.parse({ demo: 'invalid_boolean' });
      }).toThrow();
    });
  });

  describe('chatBodySchema', () => {
    const validTelemetry = {
      city: 'New Delhi',
      latitude: 28.6139,
      longitude: 77.209,
      aqi: 450,
      standard: 'CPCB' as const,
      category: 'Severe' as const,
      categoryColor: '#C00000',
      categoryTextColor: '#FFFFFF',
      dominantPollutant: 'PM25',
      subIndices: [{ pollutant: 'pm25', concentration: 350, subIndex: 450, unit: 'µg/m³' }],
      pollutants: { pm25: 350 },
      timestamp: '2026-11-21T06:00:00Z',
      source: 'Open-Meteo',
      isDemo: true,
      healthAdvisory: 'Stay indoors',
      sensitiveGroupWarning: 'High risk',
    };

    it('accepts valid chat request payload', () => {
      const parsed = chatBodySchema.parse({
        message: '  Can I exercise outside today?  ',
        telemetry: validTelemetry,
      });
      expect(parsed.message).toBe('Can I exercise outside today?'); // Trimmed
    });

    it('rejects empty or whitespace-only messages', () => {
      expect(() => {
        chatBodySchema.parse({
          message: '   ',
          telemetry: validTelemetry,
        });
      }).toThrow();
    });

    it('rejects missing telemetry context', () => {
      expect(() => {
        chatBodySchema.parse({
          message: 'Hello',
        });
      }).toThrow();
    });
  });

  describe('recordActionBodySchema', () => {
    it('validates supported action types', () => {
      const parsed = recordActionBodySchema.parse({
        actionType: 'transit_shift',
        distanceKm: 18,
        baselineMode: 'personal_car',
        alternativeMode: 'metro_train',
      });
      expect(parsed.actionType).toBe('transit_shift');
    });

    it('rejects unknown action types', () => {
      expect(() => {
        recordActionBodySchema.parse({
          actionType: 'unsupported_action',
        });
      }).toThrow();
    });
  });

  describe('userProfileSchema', () => {
    it('applies sensible defaults for household profiles', () => {
      const parsed = userProfileSchema.parse({
        userId: 'usr-123',
        cityName: 'Mumbai',
      });
      expect(parsed.householdSize).toBe(3);
      expect(parsed.primaryCommute).toBe('personal_car');
      expect(parsed.vulnerabilities).toEqual([]);
    });
  });
});
