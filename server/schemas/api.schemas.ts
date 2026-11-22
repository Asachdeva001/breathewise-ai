/**
 * Zod API Validation Schemas
 * 
 * Strict runtime validation contracts guarding all server endpoints against
 * malformed inputs, prototype pollution, oversized strings, and invalid enums.
 */

import { z } from 'zod';

export const aqiStandardEnum = z.enum(['CPCB', 'EPA']);
export const pollutionCategoryEnum = z.enum([
  'Good',
  'Satisfactory',
  'Moderate',
  'Poor',
  'Very Poor',
  'Severe',
]);

export const householdVulnerabilityEnum = z.enum([
  'infants_children',
  'elderly',
  'asthma_respiratory',
  'cardiovascular',
  'pregnancy',
]);

export const commuteModeEnum = z.enum([
  'metro_train',
  'bus',
  'carpool',
  'personal_car',
  'two_wheeler',
  'walking_cycling',
]);

export const homeTypeEnum = z.enum(['apartment', 'independent_house', 'other']);

export const exercisePreferenceEnum = z.enum([
  'morning',
  'afternoon',
  'evening',
  'indoor_only',
]);

export const pollutantValuesSchema = z.object({
  pm25: z.number().nonnegative().optional(),
  pm10: z.number().nonnegative().optional(),
  no2: z.number().nonnegative().optional(),
  so2: z.number().nonnegative().optional(),
  co: z.number().nonnegative().optional(),
  o3: z.number().nonnegative().optional(),
});

export const pollutantSubIndexSchema = z.object({
  pollutant: z.string(),
  concentration: z.number(),
  subIndex: z.number(),
  unit: z.string(),
});

export const aqiTelemetrySchema = z.object({
  city: z.string().min(1).max(100),
  country: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  aqi: z.number().min(0).max(1000),
  standard: aqiStandardEnum,
  category: pollutionCategoryEnum,
  categoryColor: z.string(),
  categoryTextColor: z.string(),
  dominantPollutant: z.string(),
  subIndices: z.array(pollutantSubIndexSchema),
  pollutants: pollutantValuesSchema,
  timestamp: z.string(),
  source: z.string(),
  isDemo: z.boolean(),
  healthAdvisory: z.string(),
  sensitiveGroupWarning: z.string(),
});

export const userProfileSchema = z.object({
  userId: z.string().min(1).max(100),
  cityName: z.string().min(1).max(100),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  householdSize: z.number().min(1).max(20).default(3),
  vulnerabilities: z.array(householdVulnerabilityEnum).default([]),
  homeType: homeTypeEnum.default('apartment'),
  hasAirPurifier: z.boolean().default(false),
  hasKitchenExhaust: z.boolean().default(true),
  primaryCommute: commuteModeEnum.default('personal_car'),
  averageCommuteDistanceKm: z.number().min(0).max(200).default(15),
  exercisePreference: exercisePreferenceEnum.default('morning'),
  onboardingCompleted: z.boolean().default(false),
});

export const getAirQualityQuerySchema = z.object({
  city: z.string().max(100).optional(),
  demo: z.enum(['true', 'false']).optional(),
  scenario: z.string().max(100).optional(),
  lat: z.string().optional(),
  lon: z.string().optional(),
});

export const getRecommendationsBodySchema = z.object({
  telemetry: aqiTelemetrySchema,
  profile: userProfileSchema.optional(),
});

export const chatBodySchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(2000),
  conversationId: z.string().max(100).optional(),
  telemetry: aqiTelemetrySchema,
  profile: userProfileSchema.optional(),
});

export const recordActionBodySchema = z.object({
  userId: z.string().max(100).optional(),
  actionType: z.enum(['transit_shift', 'indoor_hack', 'mask_usage', 'routine_shift']),
  title: z.string().max(200).optional(),
  distanceKm: z.number().or(z.string()).optional(),
  baselineMode: z.string().optional(),
  alternativeMode: z.string().optional(),
  ambientPm25: z.number().or(z.string()).optional(),
  durationHours: z.number().or(z.string()).optional(),
});
