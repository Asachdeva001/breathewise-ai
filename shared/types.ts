/**
 * Shared Type Definitions for BreatheWise AI
 */

export type AqiStandard = 'CPCB' | 'EPA';

export type PollutionCategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

export interface PollutantValues {
  pm25?: number; // µg/m³
  pm10?: number; // µg/m³
  no2?: number;  // µg/m³
  so2?: number;  // µg/m³
  co?: number;   // mg/m³
  o3?: number;   // µg/m³
}

export interface PollutantSubIndex {
  pollutant: keyof PollutantValues;
  concentration: number;
  subIndex: number;
  unit: string;
}

export interface AqiTelemetry {
  city: string;
  country?: string;
  latitude: number;
  longitude: number;
  aqi: number;
  standard: AqiStandard;
  category: PollutionCategory;
  categoryColor: string;
  categoryTextColor: string;
  dominantPollutant: string;
  subIndices: PollutantSubIndex[];
  pollutants: PollutantValues;
  timestamp: string;
  source: string;
  isDemo: boolean;
  healthAdvisory: string;
  sensitiveGroupWarning: string;
}

export type HouseholdVulnerability =
  | 'infants_children'
  | 'elderly'
  | 'asthma_respiratory'
  | 'cardiovascular'
  | 'pregnancy';

export type CommuteMode =
  | 'metro_train'
  | 'bus'
  | 'carpool'
  | 'personal_car'
  | 'two_wheeler'
  | 'walking_cycling';

export type HomeType = 'apartment' | 'independent_house' | 'other';

export interface UserProfile {
  userId: string;
  cityName: string;
  latitude?: number;
  longitude?: number;
  householdSize: number;
  vulnerabilities: HouseholdVulnerability[];
  homeType: HomeType;
  hasAirPurifier: boolean;
  hasKitchenExhaust: boolean;
  primaryCommute: CommuteMode;
  averageCommuteDistanceKm: number;
  exercisePreference: 'morning' | 'afternoon' | 'evening' | 'indoor_only';
  onboardingCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoutineSlot {
  timeSlot: 'Morning (06:00 - 10:00)' | 'Midday (10:00 - 16:00)' | 'Evening (16:00 - 20:00)' | 'Night (20:00 - 06:00)';
  title: string;
  outdoorStatus: 'Safe' | 'Caution' | 'Avoid';
  recommendedActions: string[];
  indoorActivities: string[];
  commuteAdvice: string;
  scientificReason: string;
}

export interface IndoorHack {
  id: string;
  title: string;
  category: 'ventilation' | 'purification' | 'cleaning' | 'cooking';
  room: 'Kitchen' | 'Bedroom' | 'Living Room' | 'General';
  action: string;
  costTier: 'Free' | 'Low Cost' | 'Equipment Required';
  expectedPmReductionPercent: number;
  instructions: string[];
  scientificMechanism: string;
}

export interface SustainableAlternative {
  id: string;
  title: string;
  category: 'transit' | 'energy' | 'consumption';
  currentHabit: string;
  recommendedAlternative: string;
  estimatedAvoidedCo2Kg: number;
  estimatedAvoidedPmGrams: number;
  rationale: string;
}

export interface RecommendationResponse {
  summary: string;
  dominantThreat: string;
  vulnerabilityFactor: string;
  routineSlots: RoutineSlot[];
  indoorHacks: IndoorHack[];
  sustainableAlternatives: SustainableAlternative[];
  generatedAt: string;
  isAiEnhanced: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  groundedContext?: {
    city: string;
    aqi: number;
    category: PollutionCategory;
    dominantPollutant: string;
  };
  suggestedFollowups?: string[];
}

export interface ActionLog {
  id: string;
  userId: string;
  actionType: 'transit_shift' | 'indoor_hack' | 'mask_usage' | 'routine_shift';
  title: string;
  avoidedCo2Kg: number;
  avoidedPm25Ug: number;
  timestamp: string;
  calculationBasis: string;
}

export interface ImpactSummary {
  userId: string;
  totalAvoidedCo2Kg: number;
  totalAvoidedPm25Ug: number;
  actionsCompletedCount: number;
  weeklyStreakDays: number;
  recentActions: ActionLog[];
  equivalentTreesPlanted: number;
  equivalentCleanAirHours: number;
}
