import { describe, it, expect } from 'vitest';
import {
  calculateInhaledDoseAvoided,
  calculateTransitSavings,
  aggregateImpact,
} from '../engine/impactEngine.js';

describe('Deterministic Impact Engine', () => {
  describe('calculateInhaledDoseAvoided', () => {
    it('calculates avoided PM2.5 lung dose with an N95 mask during walking', () => {
      // Ambient: 250 µg/m³, N95 efficiency: 95%, Walking ventilation: 1.2 m³/h, Duration: 2h
      // Expected Volume = 2.4 m³
      // Expected Dose Avoided = 250 * 0.95 * 2.4 = 570 µg
      const result = calculateInhaledDoseAvoided({
        ambientPm25UgM3: 250,
        filtrationType: 'n95_mask',
        durationHours: 2,
        activityLevel: 'moderate_walking',
      });

      expect(result.avoidedPm25Ug).toBe(570);
      expect(result.filtrationEfficiency).toBe(0.95);
      expect(result.inhaledAirVolumeM3).toBe(2.4);
      expect(result.calculationBasis).toContain('570');
    });

    it('calculates avoided dose with a HEPA purifier during sleep', () => {
      // Ambient: 180 µg/m³, HEPA efficiency: 90%, Sleep ventilation: 0.45 m³/h, Duration: 8h
      // Expected Volume = 3.6 m³
      // Expected Dose Avoided = 180 * 0.90 * 3.6 = 583.2 µg
      const result = calculateInhaledDoseAvoided({
        ambientPm25UgM3: 180,
        filtrationType: 'hepa_purifier',
        durationHours: 8,
        activityLevel: 'resting_sleep',
      });

      expect(result.avoidedPm25Ug).toBe(583.2);
    });
  });

  describe('calculateTransitSavings', () => {
    it('calculates CO2 and PM avoided by switching from personal car to metro', () => {
      // Distance: 20 km
      // Car: 0.170 kg CO2/km, 0.030 g PM/km
      // Metro: 0.022 kg CO2/km, 0.001 g PM/km
      // Diff: 0.148 kg CO2/km, 0.029 g PM/km
      // Expected: 2.96 kg CO2 avoided, 0.58 g PM avoided
      const result = calculateTransitSavings({
        distanceKm: 20,
        baselineMode: 'personal_car',
        alternativeMode: 'metro_train',
      });

      expect(result.avoidedCo2Kg).toBe(2.96);
      expect(result.avoidedPm25Grams).toBe(0.58);
      expect(result.calculationBasis).toContain('personal car to metro train');
    });

    it('returns zero savings when alternative mode has higher or equal emissions', () => {
      const result = calculateTransitSavings({
        distanceKm: 10,
        baselineMode: 'metro_train',
        alternativeMode: 'personal_car',
      });

      expect(result.avoidedCo2Kg).toBe(0);
      expect(result.avoidedPm25Grams).toBe(0);
    });
  });

  describe('aggregateImpact', () => {
    it('aggregates multiple actions into total metrics and environmental equivalents', () => {
      const actions = [
        {
          id: '1',
          userId: 'user-1',
          actionType: 'transit_shift' as const,
          title: 'Metro commute',
          avoidedCo2Kg: 3.5,
          avoidedPm25Ug: 450,
          timestamp: '2026-11-21T08:00:00Z',
          calculationBasis: 'basis 1',
        },
        {
          id: '2',
          userId: 'user-1',
          actionType: 'indoor_hack' as const,
          title: 'Corsi Rosenthal Fan',
          avoidedCo2Kg: 0,
          avoidedPm25Ug: 650,
          timestamp: '2026-11-21T10:00:00Z',
          calculationBasis: 'basis 2',
        },
      ];

      const summary = aggregateImpact('user-1', actions);
      expect(summary.totalAvoidedCo2Kg).toBe(3.5);
      expect(summary.totalAvoidedPm25Ug).toBe(1100);
      expect(summary.actionsCompletedCount).toBe(2);
      expect(summary.equivalentTreesPlanted).toBeGreaterThan(0);
    });
  });
});
