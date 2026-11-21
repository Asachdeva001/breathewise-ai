import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { UserProfile, AqiTelemetry } from '../../shared/types.js';

describe('BreatheWise Backend API Integration Tests', () => {
  it('GET /api/health returns 200 and operational status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.gcp).toBeDefined();
    expect(res.body.version).toBe('1.0.0');
  });

  it('GET /api/air-quality?demo=true returns valid CPCB telemetry in Demo Mode', async () => {
    const res = await request(app).get('/api/air-quality?demo=true&scenario=severe_winter_smog');
    expect(res.status).toBe(200);
    expect(res.body.isDemo).toBe(true);
    expect(res.body.standard).toBe('CPCB');
    expect(res.body.category).toBe('Severe');
    expect(res.body.aqi).toBeGreaterThan(400);
    expect(res.body.dominantPollutant).toBe('PM25');
  });

  it('POST /api/recommendations returns 4-slot plan, indoor hacks, and transit alternatives', async () => {
    const sampleTelemetry: AqiTelemetry = {
      city: 'New Delhi',
      latitude: 28.6139,
      longitude: 77.209,
      aqi: 380,
      standard: 'CPCB',
      category: 'Very Poor',
      categoryColor: '#FF0000',
      categoryTextColor: '#FFFFFF',
      dominantPollutant: 'PM25',
      subIndices: [],
      pollutants: { pm25: 220, pm10: 310 },
      timestamp: new Date().toISOString(),
      source: 'Open-Meteo',
      isDemo: false,
      healthAdvisory: 'Test warning',
      sensitiveGroupWarning: 'Test sensitive warning',
    };

    const sampleProfile: UserProfile = {
      userId: 'test_user_1',
      cityName: 'New Delhi',
      householdSize: 4,
      vulnerabilities: ['asthma_respiratory'],
      homeType: 'apartment',
      hasAirPurifier: true,
      hasKitchenExhaust: true,
      primaryCommute: 'personal_car',
      averageCommuteDistanceKm: 15,
      exercisePreference: 'morning',
      onboardingCompleted: true,
    };

    const res = await request(app)
      .post('/api/recommendations')
      .send({ telemetry: sampleTelemetry, profile: sampleProfile });

    expect(res.status).toBe(200);
    expect(res.body.routineSlots.length).toBe(4);
    expect(res.body.indoorHacks.length).toBeGreaterThanOrEqual(4);
    expect(res.body.sustainableAlternatives.length).toBeGreaterThanOrEqual(2);
    expect(res.body.vulnerabilityFactor).toContain('asthma');
  });

  it('POST /api/chat responds with grounded context and suggested follow-ups', async () => {
    const sampleTelemetry: AqiTelemetry = {
      city: 'New Delhi',
      latitude: 28.6139,
      longitude: 77.209,
      aqi: 450,
      standard: 'CPCB',
      category: 'Severe',
      categoryColor: '#C00000',
      categoryTextColor: '#FFFFFF',
      dominantPollutant: 'PM25',
      subIndices: [],
      pollutants: { pm25: 390 },
      timestamp: new Date().toISOString(),
      source: 'Open-Meteo',
      isDemo: true,
      healthAdvisory: 'Emergency',
      sensitiveGroupWarning: 'Hazardous',
    };

    const res = await request(app)
      .post('/api/chat')
      .send({
        message: 'Can I go for a morning walk in this smog?',
        telemetry: sampleTelemetry,
      });

    expect(res.status).toBe(200);
    expect(res.body.message.content).toContain('Avoid');
    expect(res.body.message.groundedContext.aqi).toBe(450);
    expect(res.body.message.suggestedFollowups.length).toBeGreaterThan(0);
  });

  it('GET and PUT /api/preferences manage user profile persistence', async () => {
    const userId = `test-user-${Date.now()}`;

    // Get default
    const getRes = await request(app).get(`/api/preferences?userId=${userId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.userId).toBe(userId);

    // Update
    const updatedProfile: UserProfile = {
      ...getRes.body,
      cityName: 'Mumbai',
      primaryCommute: 'metro_train',
      hasAirPurifier: true,
      onboardingCompleted: true,
    };

    const putRes = await request(app).put('/api/preferences').send(updatedProfile);
    expect(putRes.status).toBe(200);
    expect(putRes.body.cityName).toBe('Mumbai');
    expect(putRes.body.primaryCommute).toBe('metro_train');
  });

  it('POST /api/impact/actions records a sustainable action and updates totals', async () => {
    const userId = `impact-user-${Date.now()}`;

    const res = await request(app)
      .post('/api/impact/actions')
      .send({
        userId,
        actionType: 'transit_shift',
        title: 'Took Metro to Work',
        distanceKm: 20,
        baselineMode: 'personal_car',
        alternativeMode: 'metro_train',
      });

    expect(res.status).toBe(201);
    expect(res.body.action.avoidedCo2Kg).toBeGreaterThan(0);
    expect(res.body.summary.totalAvoidedCo2Kg).toBeGreaterThan(0);
    expect(res.body.summary.actionsCompletedCount).toBe(1);

    // Verify GET /api/impact
    const getRes = await request(app).get(`/api/impact?userId=${userId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.actionsCompletedCount).toBe(1);
    expect(getRes.body.recentActions.length).toBe(1);
  });
});
