import { describe, it, expect } from 'vitest';
import { generateDailyPlan } from '../engine/recommendationRules.js';
import { AqiTelemetry, UserProfile } from '../../shared/types.js';

describe('Deterministic Recommendation Rules Engine', () => {
  const severeTelemetry: AqiTelemetry = {
    city: 'New Delhi',
    latitude: 28.6139,
    longitude: 77.209,
    aqi: 425,
    standard: 'CPCB',
    category: 'Severe',
    categoryColor: '#C00000',
    categoryTextColor: '#FFFFFF',
    dominantPollutant: 'PM25',
    subIndices: [],
    pollutants: { pm25: 360, pm10: 490 },
    timestamp: new Date().toISOString(),
    source: 'Open-Meteo',
    isDemo: false,
    healthAdvisory: 'Emergency health hazard',
    sensitiveGroupWarning: 'Vulnerable must stay indoors',
  };

  const goodTelemetry: AqiTelemetry = {
    city: 'Shimla',
    latitude: 31.1048,
    longitude: 77.1734,
    aqi: 35,
    standard: 'CPCB',
    category: 'Good',
    categoryColor: '#00B050',
    categoryTextColor: '#FFFFFF',
    dominantPollutant: 'PM25',
    subIndices: [],
    pollutants: { pm25: 18, pm10: 32 },
    timestamp: new Date().toISOString(),
    source: 'Open-Meteo',
    isDemo: false,
    healthAdvisory: 'Minimal air pollution',
    sensitiveGroupWarning: 'Safe for everyone',
  };

  const vulnerableProfile: UserProfile = {
    userId: 'user-delhi-1',
    cityName: 'New Delhi',
    householdSize: 4,
    vulnerabilities: ['infants_children', 'asthma_respiratory'],
    homeType: 'apartment',
    hasAirPurifier: false,
    hasKitchenExhaust: true,
    primaryCommute: 'personal_car',
    averageCommuteDistanceKm: 18,
    exercisePreference: 'morning',
    onboardingCompleted: true,
  };

  it('generates 4 diurnal time slots for Severe smog', () => {
    const plan = generateDailyPlan(severeTelemetry, vulnerableProfile);

    expect(plan.routineSlots.length).toBe(4);
    expect(plan.summary).toContain('EMERGENCY ALERT');
    expect(plan.vulnerabilityFactor).toContain('asthma');

    const morningSlot = plan.routineSlots[0];
    expect(morningSlot.outdoorStatus).toBe('Avoid');
    expect(morningSlot.recommendedActions[0]).toContain('Shift all aerobic exercise strictly indoors');
    expect(morningSlot.scientificReason).toContain('inversion');

    const middaySlot = plan.routineSlots[1];
    expect(middaySlot.title).toContain('Solar Mixing Window');
  });

  it('adjusts routines safely for Good conditions', () => {
    const plan = generateDailyPlan(goodTelemetry, vulnerableProfile);

    expect(plan.summary).toContain('FAVORABLE CONDITIONS');
    const morningSlot = plan.routineSlots[0];
    expect(morningSlot.outdoorStatus).toBe('Safe');
    expect(morningSlot.recommendedActions[0]).toContain('Outdoor light walking is acceptable');
  });

  it('generates practical indoor hacks with scientific mechanisms', () => {
    const plan = generateDailyPlan(severeTelemetry, vulnerableProfile);

    expect(plan.indoorHacks.length).toBeGreaterThanOrEqual(4);
    const diyHack = plan.indoorHacks.find(h => h.id === 'hack-diy-purifier');
    expect(diyHack).toBeDefined();
    expect(diyHack?.expectedPmReductionPercent).toBe(85);
    expect(diyHack?.instructions.length).toBeGreaterThan(2);

    const moppingHack = plan.indoorHacks.find(h => h.id === 'hack-damp-mopping');
    expect(moppingHack?.scientificMechanism).toContain('resuspends');
  });

  it('tailors sustainable alternatives to car commute', () => {
    const plan = generateDailyPlan(severeTelemetry, vulnerableProfile);

    const transitAlt = plan.sustainableAlternatives.find(a => a.category === 'transit');
    expect(transitAlt).toBeDefined();
    expect(transitAlt?.title).toContain('Shift from Personal Car to Metro');
    expect(transitAlt?.estimatedAvoidedCo2Kg).toBeGreaterThan(1.0);
  });
});
