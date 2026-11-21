/**
 * Deterministic Environmental & Health Impact Engine
 * 
 * Provides verified mathematical formulas for calculating:
 * 1. Personal Lung Inhalation PM2.5 Dose Avoided (in µg)
 * 2. Personal Greenhouse Gas Emissions Avoided (in kg CO2e)
 * 3. Vehicular Tailpipe Particulate Matter Avoided (in g PM2.5)
 */

import { ActionLog, CommuteMode, ImpactSummary } from '../../shared/types.js';

// Emission factors per passenger-kilometer (kg CO2e / pkm and g PM2.5 / pkm)
// Sources: Central Pollution Control Board (CPCB), ARAI (Automotive Research Association of India), and IPCC guidelines
export const TRANSIT_EMISSION_FACTORS: Record<
  CommuteMode,
  { co2eKgPerKm: number; pm25GramsPerKm: number }
> = {
  personal_car: { co2eKgPerKm: 0.170, pm25GramsPerKm: 0.030 },      // Average petrol/diesel 4-wheeler
  two_wheeler: { co2eKgPerKm: 0.075, pm25GramsPerKm: 0.020 },       // Petrol 2-wheeler scooter/bike
  carpool: { co2eKgPerKm: 0.055, pm25GramsPerKm: 0.010 },           // 3-person shared occupancy
  bus: { co2eKgPerKm: 0.045, pm25GramsPerKm: 0.008 },               // Standard CNG/electric urban bus
  metro_train: { co2eKgPerKm: 0.022, pm25GramsPerKm: 0.001 },       // Electric mass rapid transit
  walking_cycling: { co2eKgPerKm: 0.000, pm25GramsPerKm: 0.000 },   // Zero tailpipe emissions
};

// Minute ventilation rates (m³ / hour of air inhaled) based on physiological activity level
// Source: US EPA Exposure Factors Handbook
export const VENTILATION_RATES_M3_PER_HOUR = {
  resting_sleep: 0.45,
  light_sedentary: 0.60, // Office work, sitting
  moderate_walking: 1.20, // Casual walking, daily chores
  heavy_exercise: 2.80,   // Running, cycling outdoors
};

/**
 * Calculates PM2.5 lung inhalation avoided (in micrograms):
 * Dose Avoided = Concentration_ambient (µg/m³) * Filtration_Efficiency * Minute_Ventilation (m³/h) * Exposure_Duration (hours)
 */
export function calculateInhaledDoseAvoided(params: {
  ambientPm25UgM3: number;
  indoorPurifiedPm25UgM3?: number;
  filtrationType: 'n95_mask' | 'hepa_purifier' | 'diy_box_fan' | 'indoor_sealed';
  durationHours: number;
  activityLevel: keyof typeof VENTILATION_RATES_M3_PER_HOUR;
}): {
  avoidedPm25Ug: number;
  filtrationEfficiency: number;
  inhaledAirVolumeM3: number;
  calculationBasis: string;
} {
  const { ambientPm25UgM3, filtrationType, durationHours, activityLevel } = params;
  
  // Filtration efficiencies based on tested peer-reviewed standards
  const efficiencyMap = {
    n95_mask: 0.95,       // NIOSH / BIS certified N95 / FFP2 mask
    hepa_purifier: 0.90,  // True HEPA filter in enclosed room
    diy_box_fan: 0.80,    // 4-filter Corsi-Rosenthal DIY box filter
    indoor_sealed: 0.40,  // Windows closed without filtration (passive building envelope attenuation)
  };

  const efficiency = efficiencyMap[filtrationType] || 0.50;
  const ventilationRate = VENTILATION_RATES_M3_PER_HOUR[activityLevel] || 0.60;
  const totalVolumeInhaled = ventilationRate * durationHours;

  // Total µg of PM2.5 prevented from entering alveolar lung regions
  const avoidedUg = ambientPm25UgM3 * efficiency * totalVolumeInhaled;

  return {
    avoidedPm25Ug: Math.round(avoidedUg * 10) / 10,
    filtrationEfficiency: efficiency,
    inhaledAirVolumeM3: Math.round(totalVolumeInhaled * 100) / 100,
    calculationBasis: `Dose = ${ambientPm25UgM3} µg/m³ × ${efficiency * 100}% eff. × ${totalVolumeInhaled} m³ air volume (${durationHours}h at ${activityLevel}) = ${avoidedUg} µg avoided`,
  };
}

/**
 * Calculates avoided CO2e (kg) and avoided PM2.5 (g) by switching from a high-emission transit mode to a greener alternative.
 */
export function calculateTransitSavings(params: {
  distanceKm: number;
  baselineMode: CommuteMode;
  alternativeMode: CommuteMode;
}): {
  avoidedCo2Kg: number;
  avoidedPm25Grams: number;
  calculationBasis: string;
} {
  const { distanceKm, baselineMode, alternativeMode } = params;

  const baseline = TRANSIT_EMISSION_FACTORS[baselineMode] || TRANSIT_EMISSION_FACTORS.personal_car;
  const alternative = TRANSIT_EMISSION_FACTORS[alternativeMode] || TRANSIT_EMISSION_FACTORS.metro_train;

  const co2DiffPerKm = Math.max(0, baseline.co2eKgPerKm - alternative.co2eKgPerKm);
  const pmDiffPerKm = Math.max(0, baseline.pm25GramsPerKm - alternative.pm25GramsPerKm);

  const totalAvoidedCo2Kg = Math.round(co2DiffPerKm * distanceKm * 100) / 100;
  const totalAvoidedPmGrams = Math.round(pmDiffPerKm * distanceKm * 100) / 100;

  return {
    avoidedCo2Kg: totalAvoidedCo2Kg,
    avoidedPm25Grams: totalAvoidedPmGrams,
    calculationBasis: `Switched from ${baselineMode.replace('_', ' ')} to ${alternativeMode.replace('_', ' ')} over ${distanceKm} km. Saved ${(co2DiffPerKm * 1000).toFixed(0)}g CO2e/km and ${pmDiffPerKm.toFixed(3)}g PM2.5/km.`,
  };
}

/**
 * Computes aggregated impact summary metrics from an array of logged actions.
 */
export function aggregateImpact(userId: string, actions: ActionLog[]): ImpactSummary {
  let totalAvoidedCo2Kg = 0;
  let totalAvoidedPm25Ug = 0;

  for (const act of actions) {
    totalAvoidedCo2Kg += act.avoidedCo2Kg || 0;
    totalAvoidedPm25Ug += act.avoidedPm25Ug || 0;
  }

  // 1 mature tree absorbs ~21.77 kg CO2 annually (~0.06 kg/day)
  const equivalentTrees = Math.round((totalAvoidedCo2Kg / 21.77) * 10) / 10;
  // Hours of clean air equivalent (assuming avg indoor PM2.5 reduced by 100µg over 0.6m³/h)
  const equivalentCleanAirHours = Math.round((totalAvoidedPm25Ug / (100 * 0.6)) * 10) / 10;

  return {
    userId,
    totalAvoidedCo2Kg: Math.round(totalAvoidedCo2Kg * 100) / 100,
    totalAvoidedPm25Ug: Math.round(totalAvoidedPm25Ug * 10) / 10,
    actionsCompletedCount: actions.length,
    weeklyStreakDays: Math.min(actions.length, 7),
    recentActions: actions.slice(-10).reverse(),
    equivalentTreesPlanted: equivalentTrees,
    equivalentCleanAirHours: Math.max(0, equivalentCleanAirHours),
  };
}
