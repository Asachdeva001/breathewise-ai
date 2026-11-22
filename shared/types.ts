/**
 * Shared Type Definitions for BreatheWise AI
 * 
 * Defines foundational data models, air quality metrics, user profile schemas,
 * diurnal routine plans, indoor air hacks, community action blueprints, and impact ledger accounting.
 * 
 * @module shared/types
 */

/** Supported Air Quality Index evaluation standards */
export type AqiStandard = 'CPCB' | 'EPA';

/** Official CPCB NAQI Health Severity Categories */
export type PollutionCategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

/** Raw ambient concentration values measured in standard environmental units */
export interface PollutantValues {
  /** Fine particulate matter ≤ 2.5 µm aerodynamic diameter (µg/m³) */
  pm25?: number;
  /** Coarse particulate matter ≤ 10 µm aerodynamic diameter (µg/m³) */
  pm10?: number;
  /** Nitrogen Dioxide (µg/m³) */
  no2?: number;
  /** Sulphur Dioxide (µg/m³) */
  so2?: number;
  /** Carbon Monoxide (mg/m³) */
  co?: number;
  /** Ground-level Ozone (µg/m³) */
  o3?: number;
}

/** Individual sub-index calculated via piecewise linear interpolation */
export interface PollutantSubIndex {
  /** Chemical pollutant identifier */
  pollutant: keyof PollutantValues;
  /** Measured ambient concentration */
  concentration: number;
  /** Calculated sub-index value (0 - 500) */
  subIndex: number;
  /** Measurement unit (e.g. µg/m³, mg/m³) */
  unit: string;
}

/** Comprehensive verified air quality telemetry payload */
export interface AqiTelemetry {
  /** Target city name */
  city: string;
  /** Country of station */
  country?: string;
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Composite Air Quality Index value (0 - 500) */
  aqi: number;
  /** Regulatory evaluation standard used */
  standard: AqiStandard;
  /** Health severity category mapped to official thresholds */
  category: PollutionCategory;
  /** Hex color code for visual severity indicators */
  categoryColor: string;
  /** Hex text color ensuring high contrast readability */
  categoryTextColor: string;
  /** Pollutant responsible for highest sub-index */
  dominantPollutant: string;
  /** Array of individual pollutant sub-indices */
  subIndices: PollutantSubIndex[];
  /** Raw pollutant concentration dictionary */
  pollutants: PollutantValues;
  /** ISO timestamp of data capture */
  timestamp: string;
  /** Originating telemetry station or monitoring service */
  source: string;
  /** Whether the telemetry represents synthetic evaluation fixtures */
  isDemo: boolean;
  /** General public health advisory */
  healthAdvisory: string;
  /** Actionable advisory specifically for at-risk sensitive groups */
  sensitiveGroupWarning: string;
}

/** Clinical and physiological vulnerability factors influencing physical risk */
export type HouseholdVulnerability =
  | 'infants_children'
  | 'elderly'
  | 'asthma_respiratory'
  | 'cardiovascular'
  | 'pregnancy';

/** Commute transit options for lifestyle modal shifting */
export type CommuteMode =
  | 'metro_train'
  | 'bus'
  | 'carpool'
  | 'personal_car'
  | 'two_wheeler'
  | 'walking_cycling';

/** Home architectural enclosure type */
export type HomeType = 'apartment' | 'independent_house' | 'other';

/** User profile storing household context and lifestyle constraints (zero PII) */
export interface UserProfile {
  /** Anonymous unique session identifier */
  userId: string;
  /** Selected residential metropolitan city */
  cityName: string;
  /** Optional user latitude */
  latitude?: number;
  /** Optional user longitude */
  longitude?: number;
  /** Total number of family members in household */
  householdSize: number;
  /** Identified physiological vulnerabilities in household */
  vulnerabilities: HouseholdVulnerability[];
  /** Home structural architectural category */
  homeType: HomeType;
  /** Whether mechanical air purifiers are currently installed */
  hasAirPurifier: boolean;
  /** Whether kitchen has mechanical exhaust / chimney */
  hasKitchenExhaust: boolean;
  /** Baseline daily commute mode */
  primaryCommute: CommuteMode;
  /** Roundtrip commute distance in kilometers */
  averageCommuteDistanceKm: number;
  /** Preferred physical workout time slot */
  exercisePreference: 'morning' | 'afternoon' | 'evening' | 'indoor_only';
  /** Whether onboarding questionnaire has been completed */
  onboardingCompleted: boolean;
  /** Profile creation timestamp */
  createdAt?: string;
  /** Last updated timestamp */
  updatedAt?: string;
}

/** Diurnal time block routine recommendation */
export interface RoutineSlot {
  /** Time of day segment */
  timeSlot: 'Morning (06:00 - 10:00)' | 'Midday (10:00 - 16:00)' | 'Evening (16:00 - 20:00)' | 'Night (20:00 - 06:00)';
  /** High-level operational headline */
  title: string;
  /** Outdoor exposure advisory level */
  outdoorStatus: 'Safe' | 'Caution' | 'Avoid';
  /** Concrete recommended actions */
  recommendedActions: string[];
  /** Safe indoor replacement activities */
  indoorActivities: string[];
  /** Low-emission transit guidance */
  commuteAdvice: string;
  /** Meteorological and atmospheric physics reasoning */
  scientificReason: string;
  /** Direct impact explanation of following this routine */
  directImpactExplanation?: string;
}

/** Practical indoor air mitigation hack */
export interface IndoorHack {
  /** Unique hack identifier */
  id: string;
  /** Clear actionable title */
  title: string;
  /** Functional category */
  category: 'ventilation' | 'purification' | 'cleaning' | 'cooking';
  /** Target residential zone */
  room: 'Kitchen' | 'Bedroom' | 'Living Room' | 'General';
  /** One-sentence action directive */
  action: string;
  /** Expense required to implement */
  costTier: 'Free' | 'Low Cost' | 'Equipment Required';
  /** Estimated particulate reduction percentage */
  expectedPmReductionPercent: number;
  /** Step-by-step implementation guide */
  instructions: string[];
  /** Underlying aerosol physics and fluid dynamics mechanism */
  scientificMechanism: string;
  /** Direct impact explanation of this hack */
  directImpactExplanation?: string;
}

/** Sustainable lifestyle or transit modal shift alternative */
export interface SustainableAlternative {
  /** Unique alternative identifier */
  id: string;
  /** Action title */
  title: string;
  /** Domain category */
  category: 'transit' | 'energy' | 'consumption';
  /** Current high-emission baseline habit */
  currentHabit: string;
  /** Recommended low-emission sustainable replacement */
  recommendedAlternative: string;
  /** Avoided greenhouse gas emissions per roundtrip (kg CO2e) */
  estimatedAvoidedCo2Kg: number;
  /** Avoided vehicular tailpipe PM emissions (grams PM2.5) */
  estimatedAvoidedPmGrams: number;
  /** Scientific environmental and personal rationale */
  rationale: string;
  /** Direct impact explanation */
  directImpactExplanation?: string;
}

/** Community and neighborhood-scale action blueprint */
export interface CommunityAction {
  /** Unique community action identifier */
  id: string;
  /** Action title */
  title: string;
  /** Community category */
  category: 'anti_burning' | 'school_commute' | 'clean_air_sanctuary' | 'community_alert';
  /** Target community stakeholder */
  targetAudience: 'Apartment RWAs' | 'Neighborhoods' | 'Schools & Parents' | 'General Public';
  /** One-line high-impact summary */
  impactStatement: string;
  /** Step-by-step execution protocol for communities */
  actionSteps: string[];
  /** Pre-drafted notice/WhatsApp broadcast template for RWA notice boards */
  broadcastTemplate?: string;
  /** Estimated quantified community benefit */
  estimatedCommunityBenefit: string;
}

/** Unified recommendation response object returned by server */
export interface RecommendationResponse {
  /** High-level executive situational summary */
  summary: string;
  /** Dominant air threat and measured concentration */
  dominantThreat: string;
  /** Evaluated household vulnerability multiplier text */
  vulnerabilityFactor: string;
  /** 4 diurnal routine time slots */
  routineSlots: RoutineSlot[];
  /** Practical indoor mitigation hacks */
  indoorHacks: IndoorHack[];
  /** Sustainable lifestyle & transit modal shifts */
  sustainableAlternatives: SustainableAlternative[];
  /** Community & neighborhood action blueprints */
  communityActions?: CommunityAction[];
  /** ISO generation timestamp */
  generatedAt: string;
  /** Whether Vertex AI enriched the suggestions */
  isAiEnhanced: boolean;
}

/** Conversational chat message structure */
export interface ChatMessage {
  /** Message unique ID */
  id: string;
  /** Author role in conversation */
  role: 'user' | 'assistant' | 'system';
  /** Text content */
  content: string;
  /** ISO timestamp */
  timestamp: string;
  /** Grounded telemetry context snapshot */
  groundedContext?: {
    city: string;
    aqi: number;
    category: PollutionCategory;
    dominantPollutant: string;
  };
  /** Context-aware suggested follow-up prompts */
  suggestedFollowups?: string[];
}

/** Logged sustainable action entry for personal impact ledger */
export interface ActionLog {
  /** Unique action instance ID */
  id: string;
  /** User identifier */
  userId: string;
  /** Classification of action taken */
  actionType: 'transit_shift' | 'indoor_hack' | 'mask_usage' | 'routine_shift' | 'community_action';
  /** Action title */
  title: string;
  /** Verified greenhouse emissions avoided (kg CO2e) */
  avoidedCo2Kg: number;
  /** Verified personal lung PM2.5 dose avoided (µg) */
  avoidedPm25Ug: number;
  /** ISO timestamp of action */
  timestamp: string;
  /** Mathematical and empirical basis string */
  calculationBasis: string;
}

/** Aggregated environmental and personal health impact summary */
export interface ImpactSummary {
  /** User identifier */
  userId: string;
  /** Cumulative avoided greenhouse gas emissions (kg CO2e) */
  totalAvoidedCo2Kg: number;
  /** Cumulative avoided PM2.5 lung inhalation dose (µg) */
  totalAvoidedPm25Ug: number;
  /** Total count of verified actions logged */
  actionsCompletedCount: number;
  /** Consistent consecutive days of active engagement */
  weeklyStreakDays: number;
  /** Recent action log history */
  recentActions: ActionLog[];
  /** Equivalent trees planted based on 21.77 kg CO2/year */
  equivalentTreesPlanted: number;
  /** Equivalent hours of purified air inhalation gained */
  equivalentCleanAirHours: number;
}
