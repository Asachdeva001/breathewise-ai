/**
 * Deterministic Recommendation Engine
 * 
 * Generates tailored daily routines, indoor air quality hacks, community smog defense blueprints,
 * and sustainable transit alternatives based on scientific air-quality physics, diurnal smog inversion,
 * and household vulnerability context.
 * 
 * Reference Standards:
 * - Central Pollution Control Board (CPCB) NAQI 2014 Guidelines
 * - US EPA Exposure Factors Handbook (Minute Ventilation Rates)
 * - WHO Global Air Quality Guidelines 2021
 * 
 * @module server/engine/recommendationRules
 */

import {
  AqiTelemetry,
  CommunityAction,
  IndoorHack,
  PollutionCategory,
  RecommendationResponse,
  RoutineSlot,
  SustainableAlternative,
  UserProfile,
} from '../../shared/types.js';

/**
 * Generates a comprehensive, personalized air quality action plan.
 * 
 * @param telemetry Real-time or simulated air quality telemetry
 * @param profile User household makeup and lifestyle constraints
 * @returns Unified recommendation response with routines, hacks, transit shifts, and community actions
 */
export function generateDailyPlan(
  telemetry: AqiTelemetry,
  profile: UserProfile
): RecommendationResponse {
  const { aqi, category, dominantPollutant, pollutants } = telemetry;
  const pm25 = pollutants.pm25 || (aqi > 200 ? 150 : 45);

  const hasVulnerableMembers =
    profile.vulnerabilities && profile.vulnerabilities.length > 0;
  const hasAsthmaOrRespiratory = profile.vulnerabilities?.includes('asthma_respiratory');
  const hasChildrenOrElderly =
    profile.vulnerabilities?.includes('infants_children') ||
    profile.vulnerabilities?.includes('elderly');

  // Vulnerability text summary
  let vulnerabilityFactor = 'Standard adult household profile without identified clinical risks.';
  if (hasAsthmaOrRespiratory) {
    vulnerabilityFactor = 'High sensitivity: Household includes individuals with asthma/chronic respiratory conditions.';
  } else if (hasChildrenOrElderly) {
    vulnerabilityFactor = 'Moderate-High sensitivity: Household includes children or elderly individuals whose lung alveolar surfaces are vulnerable.';
  }

  // Generate 4 Diurnal Time-Slot Routines
  const routineSlots: RoutineSlot[] = [
    buildMorningSlot(category, pm25, profile),
    buildMiddaySlot(category, pm25, profile),
    buildEveningSlot(category, pm25, profile),
    buildNightSlot(category, pm25, profile),
  ];

  // Generate Room-by-Room Low-Cost Indoor Hacks
  const indoorHacks: IndoorHack[] = generateIndoorHacks(category, pm25, profile);

  // Generate Sustainable Transit & Lifestyle Alternatives
  const sustainableAlternatives: SustainableAlternative[] = generateSustainableAlternatives(
    profile,
    category
  );

  // Generate Community & Neighborhood-Scale Actions
  const communityActions: CommunityAction[] = generateCommunityActions(
    category,
    pm25,
    profile
  );

  const summary = generateSummaryHeadline(category, aqi, dominantPollutant, hasVulnerableMembers);

  return {
    summary,
    dominantThreat: `${dominantPollutant} (${pm25} µg/m³ ambient concentration)`,
    vulnerabilityFactor,
    routineSlots,
    indoorHacks,
    sustainableAlternatives,
    communityActions,
    generatedAt: new Date().toISOString(),
    isAiEnhanced: false,
  };
}

/**
 * Builds Morning diurnal routine slot (06:00 - 10:00)
 */
function buildMorningSlot(
  category: PollutionCategory,
  pm25: number,
  profile: UserProfile
): RoutineSlot {
  const isSevereOrPoor = category === 'Severe' || category === 'Very Poor' || category === 'Poor';

  if (isSevereOrPoor) {
    return {
      timeSlot: 'Morning (06:00 - 10:00)',
      title: 'Inversion Smog Peak — Restrict Outdoor Movement',
      outdoorStatus: 'Avoid',
      recommendedActions: [
        'Shift all aerobic exercise strictly indoors; do not jog, run, or cycle outside.',
        'Keep home exterior windows and balcony doors firmly closed during dawn and early morning.',
        'Ensure school-going children and commuters wear properly fitted N95/FFP2 masks outdoors.',
        'If commuting, keep car windows rolled up with air recirculation mode enabled.',
      ],
      indoorActivities: [
        'Indoor yoga, bodyweight training, or light stretching in a purified room.',
        'Run indoor air purifier on medium-high in main living areas.',
      ],
      commuteAdvice:
        profile.primaryCommute === 'two_wheeler' || profile.primaryCommute === 'walking_cycling'
          ? 'Switch from two-wheeler to enclosed metro rail or carpool to avoid direct inhalation of trapped vehicular exhaust.'
          : 'Use metro train or carpool. Avoid driving solitary personal cars in stop-and-go morning gridlock.',
      scientificReason:
        'Ground-level atmospheric temperature inversion traps vehicular exhaust and particulate matter in a shallow 50-meter cold air boundary layer before solar heating begins.',
      directImpactExplanation: `Shields family members from peak ambient concentrations (${pm25} µg/m³), preventing up to 140 µg of alveolar lung PM2.5 deposition per hour of outdoor avoidance.`,
    };
  }

  return {
    timeSlot: 'Morning (06:00 - 10:00)',
    title: 'Moderate Morning Conditions',
    outdoorStatus: category === 'Moderate' ? 'Caution' : 'Safe',
    recommendedActions: [
      'Outdoor light walking is acceptable for healthy adults.',
      category === 'Moderate'
        ? 'Sensitive household members should avoid intensive sprint training.'
        : 'Open windows for 20 minutes to exchange stale indoor air.',
    ],
    indoorActivities: ['Morning routine with normal indoor ventilation.'],
    commuteAdvice: 'Public transit or active walking recommended.',
    scientificReason:
      'Atmospheric dispersion is stable, but monitoring local traffic corridor spikes is advised.',
    directImpactExplanation: 'Moderate outdoor conditions maintain inhalation risk within baseline physiological limits.',
  };
}

/**
 * Builds Midday diurnal routine slot (10:00 - 16:00)
 */
function buildMiddaySlot(
  category: PollutionCategory,
  _pm25: number,
  _profile: UserProfile
): RoutineSlot {
  const isSevere = category === 'Severe' || category === 'Very Poor';

  if (isSevere) {
    return {
      timeSlot: 'Midday (10:00 - 16:00)',
      title: 'Solar Mixing Window — Optimum Time for Essential Errands',
      outdoorStatus: 'Caution',
      recommendedActions: [
        'Complete essential outdoor errands during this window when solar heating raises the atmospheric boundary layer.',
        'Wear an N95 mask outside, as absolute PM2.5 concentrations remain elevated above safe limits.',
        'Perform a brief 10-minute controlled cross-ventilation between 12:30 PM - 2:00 PM if indoor CO2 exceeds 1,000 ppm.',
      ],
      indoorActivities: [
        'Perform damp microfiber cleaning or wet mopping to capture settled dust without resuspending it into the air.',
      ],
      commuteAdvice: 'Off-peak travel window: travel now if errands are necessary to avoid rush-hour congestion.',
      scientificReason:
        'Solar radiation warms the earth surface, inducing convection currents that disperse the nocturnal inversion layer and temporarily dilute ground-level PM2.5 concentrations.',
      directImpactExplanation: 'Scheduling travel during midday solar mixing cuts direct particulate inhalation by 35-45% compared to dawn/dusk hours.',
    };
  }

  return {
    timeSlot: 'Midday (10:00 - 16:00)',
    title: 'Favorable Dispersion Window',
    outdoorStatus: 'Safe',
    recommendedActions: [
      'Best time of the day to ventilate the home; open windows on opposing sides for 30 minutes.',
      'Safe for outdoor campus breaks and errands.',
    ],
    indoorActivities: ['General household cleaning and airing.'],
    commuteAdvice: 'Ideal for walking, cycling, or public transport.',
    scientificReason:
      'Peak planetary boundary layer height facilitates maximum vertical mixing and pollutant dilution.',
    directImpactExplanation: 'Maximizes indoor fresh air exchange and flushes accumulated indoor carbon dioxide.',
  };
}

/**
 * Builds Evening diurnal routine slot (16:00 - 20:00)
 */
function buildEveningSlot(
  category: PollutionCategory,
  _pm25: number,
  _profile: UserProfile
): RoutineSlot {
  const isSevereOrPoor = category === 'Severe' || category === 'Very Poor' || category === 'Poor';

  if (isSevereOrPoor) {
    return {
      timeSlot: 'Evening (16:00 - 20:00)',
      title: 'Secondary Inversion & Rush Hour Stagnation',
      outdoorStatus: 'Avoid',
      recommendedActions: [
        'Close all exterior windows before sunset (around 16:30 - 17:00) as the earth cools and traps evening rush-hour emissions.',
        'Postpone children outdoor park play; substitute with interactive indoor board games or family reading.',
        'Commute back with protective N95 respirators.',
      ],
      indoorActivities: [
        'Indoor family activities and study hours.',
        'Ensure kitchen exhaust fan is operating during evening meal preparation.',
      ],
      commuteAdvice:
        'Avoid open-air two-wheelers during rush hour. Opt for metro rail or buses with closed windows.',
      scientificReason:
        'Rapid radiative cooling of the earth surface immediately re-establishes a stable nocturnal boundary layer, trapping evening vehicular tailpipe emissions right at breathing height.',
      directImpactExplanation: 'Sealing windows before 17:00 prevents up to 70% of evening rush-hour nitrogen oxides (NO2) and soot from penetrating indoor bedrooms.',
    };
  }

  return {
    timeSlot: 'Evening (16:00 - 20:00)',
    title: 'Standard Evening Routine',
    outdoorStatus: category === 'Moderate' ? 'Caution' : 'Safe',
    recommendedActions: [
      'Outdoor leisure walks are permissible for healthy adults.',
      'Close windows if neighborhood traffic or biomass burning increases nearby.',
    ],
    indoorActivities: ['Family indoor time with standard ventilation.'],
    commuteAdvice: 'Take metro or bus to prevent evening road congestion.',
    scientificReason:
      'Atmospheric cooling is gradual; local traffic density determines micro-scale exposure.',
    directImpactExplanation: 'Maintains healthy indoor air quality with minimal intervention required.',
  };
}

/**
 * Builds Night diurnal routine slot (20:00 - 06:00)
 */
function buildNightSlot(
  _category: PollutionCategory,
  _pm25: number,
  profile: UserProfile
): RoutineSlot {
  return {
    timeSlot: 'Night (20:00 - 06:00)',
    title: 'Sleep Microclimate Optimization',
    outdoorStatus: 'Avoid',
    recommendedActions: [
      'Keep bedroom doors and windows shut to maintain an isolated sleep envelope.',
      profile.hasAirPurifier
        ? 'Run bedroom air purifier on quiet sleep mode throughout the night.'
        : 'Place a DIY box fan filter or a clean damp towel at door bottom to block infiltration.',
      'Place indoor air-purifying plants (e.g., Sansevieria / Snake Plant) in the bedroom, which produce oxygen overnight through Crassulacean Acid Metabolism (CAM).',
    ],
    indoorActivities: [
      'Unwind in a clean-air sleep sanctuary.',
      'Avoid burning aromatic candles, agarbatti (incense), or mosquito coils, which emit dense toxic VOCs and ultrafine particles.',
    ],
    commuteAdvice: 'Minimize nocturnal road travel where truck emissions and low temperature peak.',
    scientificReason:
      'Humans spend 7-9 hours sleeping in one static breathing zone. Particulate matter accumulating in sealed unpurified bedrooms triggers nocturnal bronchospasms and morning chest tightness.',
    directImpactExplanation: 'Preserving bedroom PM2.5 under 25 µg/m³ overnight ensures 8 hours of respiratory recovery, preventing airway inflammation.',
  };
}

/**
 * Generates practical room-by-room low-cost indoor hacks
 */
function generateIndoorHacks(
  _category: PollutionCategory,
  _pm25: number,
  profile: UserProfile
): IndoorHack[] {
  return [
    {
      id: 'hack-diy-purifier',
      title: 'Corsi-Rosenthal Box Fan Filter',
      category: 'purification',
      room: 'Living Room',
      action: 'Construct a low-cost high-efficiency DIY air purifier using a 20-inch box fan and 4 MERV-13 furnace filters.',
      costTier: profile.hasAirPurifier ? 'Equipment Required' : 'Low Cost',
      expectedPmReductionPercent: 85,
      instructions: [
        'Tape four MERV-13 rated pleated HVAC air filters into a cube with airflow facing inwards.',
        'Seal the bottom with cardboard and duct tape to ensure no unfiltered air bypasses the filters.',
        'Place the 20-inch box fan on top, blowing upwards, and seal the edges tightly with duct tape.',
        'Run on medium speed in the main room; this provides Clean Air Delivery Rate (CADR) equivalent to $400 commercial HEPA units.',
      ],
      scientificMechanism:
        'Multiple large-area MERV-13 filters dramatically lower face velocity, capturing >85% of fine PM2.5 without straining the fan motor.',
      directImpactExplanation: 'Delivers 350+ CFM clean air delivery at approximately ₹2,200 material cost, purifying a 400 sq.ft room in under 20 minutes.',
    },
    {
      id: 'hack-damp-mopping',
      title: 'Microfiber Damp Mopping vs Dry Sweeping',
      category: 'cleaning',
      room: 'General',
      action: 'Never dry-sweep with standard brooms during smog episodes. Use a damp microfiber mop.',
      costTier: 'Free',
      expectedPmReductionPercent: 60,
      instructions: [
        'Discontinue traditional straw or dry nylon broom sweeping.',
        'Lightly mist floors or use a damp microfiber mop with plain water or mild vinegar solution.',
        'Wipe surfaces (shelves, tables, window sills) using damp microfiber cloths rather than feather dusters.',
      ],
      scientificMechanism:
        'Dry sweeping resuspends coarse PM10 and settled heavy PM2.5 back into the breathing zone for 2-4 hours. Wet mopping uses surface tension to trap particles permanently.',
      directImpactExplanation: 'Eliminates dust resuspension, cutting floor-level particulate concentration by up to 60% for crawling toddlers and pets.',
    },
    {
      id: 'hack-cooking-smoke',
      title: 'Kitchen Exhaust & Cooking Protocol',
      category: 'cooking',
      room: 'Kitchen',
      action: 'Isolate kitchen microclimate during frying, tadka, and high-heat cooking.',
      costTier: 'Free',
      expectedPmReductionPercent: 70,
      instructions: [
        'Switch on kitchen chimney/exhaust fan 2 minutes BEFORE igniting burners to establish outward air draft.',
        'Close the kitchen door leading to living areas and bedrooms during cooking.',
        'Keep lids on frying pans and pots to condense aerosolized oil droplets.',
        'Keep exhaust running for 5 minutes after finishing cooking.',
      ],
      scientificMechanism:
        'Cooking oils heated past their smoke point emit dense plumes of ultrafine PM0.1 and PM2.5 (>600 µg/m³), which rapidly disperse throughout poorly isolated homes.',
      directImpactExplanation: 'Prevents acute cooking smoke spikes from elevating whole-house PM2.5 by 300-500 µg/m³ during dinner preparation.',
    },
    {
      id: 'hack-cam-plants',
      title: 'Nocturnal Oxygen & VOC Absorption Plants',
      category: 'purification',
      room: 'Bedroom',
      action: 'Introduce nocturnal CAM plants such as Snake Plant (Sansevieria trifasciata) in bedrooms.',
      costTier: 'Low Cost',
      expectedPmReductionPercent: 20,
      instructions: [
        'Place 2-3 potted Snake Plants (Mother-in-Law’s Tongue) or Areca Palms in the bedroom.',
        'Wipe their broad leaves weekly with a damp cloth to clear accumulated dust and keep stomata open.',
      ],
      scientificMechanism:
        'Snake plants utilize Crassulacean Acid Metabolism, opening their stomata to absorb carbon dioxide and release oxygen exclusively during nighttime hours while absorbing trace formaldehyde.',
      directImpactExplanation: 'Improves sleep oxygenation and captures settling airborne particulates on broad leaf surfaces naturally.',
    },
  ];
}

/**
 * Generates sustainable transit modal shifts and lifestyle alternatives
 */
function generateSustainableAlternatives(
  profile: UserProfile,
  _category: PollutionCategory
): SustainableAlternative[] {
  const alternatives: SustainableAlternative[] = [];
  const distance = profile.averageCommuteDistanceKm || 15;

  if (profile.primaryCommute === 'personal_car') {
    alternatives.push({
      id: 'alt-transit-metro',
      title: 'Shift from Personal Car to Metro / Electric Rail',
      category: 'transit',
      currentHabit: `Daily commute of ${distance} km via solo-occupancy personal car.`,
      recommendedAlternative: 'Take the metro rail network or commuter express train.',
      estimatedAvoidedCo2Kg: Math.round(distance * (0.170 - 0.022) * 100) / 100,
      estimatedAvoidedPmGrams: Math.round(distance * (0.030 - 0.001) * 100) / 100,
      rationale:
        'Electric rail runs on centralized power with zero street-level tailpipe emissions, while also bypassing bumper-to-bumper traffic that exposes drivers to in-cabin pollution.',
      directImpactExplanation: `Saves ${(Math.round(distance * 0.148 * 100) / 100).toFixed(2)} kg CO2e daily and eliminates ${(Math.round(distance * 0.029 * 100) / 100).toFixed(2)} g of direct tailpipe soot from urban streets.`,
    });
  } else if (profile.primaryCommute === 'two_wheeler') {
    alternatives.push({
      id: 'alt-transit-bus',
      title: 'Shift from Two-Wheeler to CNG / Electric Urban Bus',
      category: 'transit',
      currentHabit: `Commuting ${distance} km on open motorcycle/scooter directly behind exhaust pipes.`,
      recommendedAlternative: 'Use city AC buses or carpool services during severe smog periods.',
      estimatedAvoidedCo2Kg: Math.round(distance * (0.075 - 0.045) * 100) / 100,
      estimatedAvoidedPmGrams: Math.round(distance * (0.020 - 0.008) * 100) / 100,
      rationale:
        'Two-wheeler riders inhale up to 10× more toxic exhaust directly at road level. Closed buses reduce personal inhalation dose while cutting per-passenger emissions.',
      directImpactExplanation: 'Cuts personal respiratory exposure by up to 80% compared to sitting behind commercial vehicle exhausts in traffic.',
    });
  } else {
    alternatives.push({
      id: 'alt-transit-carpool',
      title: 'Active Trip Chaining & Carpooling',
      category: 'transit',
      currentHabit: 'Separate individual shopping and transit trips throughout the week.',
      recommendedAlternative: 'Combine multiple errands into a single trip chain and share rides.',
      estimatedAvoidedCo2Kg: 2.5,
      estimatedAvoidedPmGrams: 0.45,
      rationale:
        'Engine cold-starts produce 60% of vehicle emissions in the first 5 minutes. Chaining errands keeps catalytic converters warm and minimizes cold-start toxic pulses.',
      directImpactExplanation: 'Eliminates repeated cold-start emission spikes and reduces weekly vehicle travel distance by 30%.',
    });
  }

  // Energy & Community Burning Alternative
  alternatives.push({
    id: 'alt-clean-heating',
    title: 'Zero Biomass & Waste Burning Protocol',
    category: 'energy',
    currentHabit: 'Using open heating or disposing garden leaves/waste via burning.',
    recommendedAlternative: 'Compost garden leaves and use electric ceramic heaters or heavy thermal blankets.',
    estimatedAvoidedCo2Kg: 5.0,
    estimatedAvoidedPmGrams: 15.0,
    rationale:
      'Smoldering leaf and domestic waste fires produce massive polycyclic aromatic hydrocarbons (PAHs) and dense black carbon right in immediate residential neighborhoods.',
    directImpactExplanation: 'Eliminates carcinogenic localized smoke that would otherwise drift directly into neighbor windows.',
  });

  return alternatives;
}

/**
 * Generates community-scale and neighborhood smog defense blueprints
 */
export function generateCommunityActions(
  category: PollutionCategory,
  _pm25: number,
  _profile: UserProfile
): CommunityAction[] {
  return [
    {
      id: 'comm-anti-burning',
      title: 'Apartment & Neighborhood Anti-Open-Burning Protocol',
      category: 'anti_burning',
      targetAudience: 'Apartment RWAs',
      impactStatement: 'Eliminates acute, highly toxic ground-level smoke plumes that penetrate surrounding homes.',
      actionSteps: [
        'Provide electrical convection/oil heaters and heavy winter blankets to society security guards, gardeners, and night staff instead of allowing wood/dry leaf fires.',
        'Enforce strict zero-burning rules across society premises for garden pruning, leaves, and trash.',
        'Designate a compost pit for fallen leaves and garden biomass rather than burning.',
        'Report neighborhood open burning violations directly to municipal helplines (Sameer app / Delhi Green app / 311).',
      ],
      broadcastTemplate: `*URGENT NOTICE: WINTER SMOG PROTOCOL - NO OPEN BURNING*\nDear Residents & Staff, With AQI in ${category} category, open burning of dry leaves, waste, or wood on society premises is strictly prohibited under municipal environmental regulations. Society has provided electric heaters to all night security posts. Please report any open burning to the RWA office immediately.`,
      estimatedCommunityBenefit: 'Prevents 10-25 kg of direct localized particulate emission per night across the neighborhood block.',
    },
    {
      id: 'comm-school-pool',
      title: 'School-Pool & Neighborhood Commuter Coordination',
      category: 'school_commute',
      targetAudience: 'Schools & Parents',
      impactStatement: 'Cuts local school-gate toxic tailpipe emissions by up to 60% during the peak morning inversion.',
      actionSteps: [
        'Connect with 3-4 families attending the same school or daycare to form a shared morning carpool or vanpool.',
        'Mandate strict "Engine Off" no-idling policies within 200 meters of school gates and bus drop-off points.',
        'Advise school administration to move morning physical education (PE) classes and assemblies strictly indoors or postpone to 12:30 PM.',
      ],
      broadcastTemplate: `*COMMUNITY SCHOOL-POOL INITIATIVE*\nDear Parents, With current severe winter smog, let us coordinate carpools to reduce children's exposure to idling exhaust at the school gate. Every 4-family pool eliminates 3 cars from the morning rush and protects young lungs.`,
      estimatedCommunityBenefit: 'Reduces school zone morning idling PM2.5 concentrations by up to 45% and saves ~12 kg CO2e per school day.',
    },
    {
      id: 'comm-clean-air-sanctuary',
      title: 'Society Clubhouse Clean Air Sanctuary Setup',
      category: 'clean_air_sanctuary',
      targetAudience: 'Apartment RWAs',
      impactStatement: 'Provides a safe, purified refuge for elderly residents, children, and domestic staff whose homes lack HEPA filtration.',
      actionSteps: [
        'Designate a common society room (clubhouse, reading room, or indoor gym) as a public Clean Air Sanctuary.',
        'Equip the room with 2 Corsi-Rosenthal DIY box fan filters or commercial HEPA units (approximate setup cost ₹5,000).',
        'Keep windows sealed and maintain doors closed with a simple bottom draft stopper.',
        'Open the room daily from 06:00 to 22:00 for vulnerable residents and study groups during severe smog episodes.',
      ],
      broadcastTemplate: `*COMMUNITY CLEAN AIR SANCTUARY OPEN*\nDear Residents, Our Society Clubhouse (Room 101) is now operating as a designated Clean Air Sanctuary with active HEPA air filtration (indoor AQI < 50). All senior citizens, children, and residents needing clean air refuge are welcome daily from 6 AM to 10 PM.`,
      estimatedCommunityBenefit: 'Protects 30-50 community members daily from hazardous ambient PM2.5 exposure.',
    },
    {
      id: 'comm-smog-alert',
      title: 'Community AQI Sentinel & WhatsApp Broadcast System',
      category: 'community_alert',
      targetAudience: 'General Public',
      impactStatement: 'Empowers neighbors with real-time validated health alerts to prevent unnecessary outdoor exposure.',
      actionSteps: [
        'Share weekly or daily morning smog advisory on society WhatsApp groups before 07:00 AM.',
        'Remind families with asthmatic or elderly members to keep windows sealed until solar noon.',
        'Distribute certified N95 masks to building maintenance, housekeeping, and security personnel.',
      ],
      broadcastTemplate: `*MORNING AIR QUALITY ADVISORY*\nGood morning neighbors, Today's AQI is ${category}. Temperature inversion has trapped dangerous particulate matter at breathing height. Please avoid morning jogging, ensure children wear N95 masks, and keep balcony doors shut. Safe ventilation window is 12:30 PM - 2:00 PM today.`,
      estimatedCommunityBenefit: 'Informs 200+ households to take immediate preventive protective measures.',
    },
  ];
}

/**
 * Generates an executive situational summary headline based on CPCB category
 */
function generateSummaryHeadline(
  category: PollutionCategory,
  aqi: number,
  dominantPollutant: string,
  hasVulnerableMembers: boolean
): string {
  if (category === 'Severe') {
    return `EMERGENCY ALERT: Severe smog event (AQI ${aqi}, ${dominantPollutant}). Implement immediate indoor sanctuary protocols${
      hasVulnerableMembers ? ' and shield sensitive family members.' : '.'
    }`;
  }
  if (category === 'Very Poor') {
    return `HIGH CAUTION: Very Poor air quality (AQI ${aqi}). Strictly avoid outdoor morning/evening workouts and keep indoor air purified.`;
  }
  if (category === 'Poor') {
    return `AIR QUALITY WARNING: Poor conditions (AQI ${aqi}). Limit prolonged outdoor exertion; use N95 respirators for active commutes.`;
  }
  if (category === 'Moderate') {
    return `MODERATE AIR: Acceptable for general public, but sensitive individuals should monitor respiratory symptoms.`;
  }
  return `FAVORABLE CONDITIONS: Air quality is in the ${category} band (AQI ${aqi}). Ideal window for outdoor recreation and home ventilation.`;
}
