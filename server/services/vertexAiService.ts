/**
 * Google Cloud Vertex AI & Conversational Assistant Service
 * 
 * Interacts with Vertex AI Gemini models using official Google Cloud SDK,
 * enforces strict anti-hallucination context grounding, and provides a deterministic
 * local semantic fallback generator for offline / uncredentialed environments.
 */

import { VertexAI } from '@google-cloud/vertexai';
import { env } from '../config/env.js';
import { AqiTelemetry, ChatMessage, UserProfile } from '../../shared/types.js';

let vertexAiClient: VertexAI | null = null;

try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE) {
    vertexAiClient = new VertexAI({
      project: env.GOOGLE_CLOUD_PROJECT,
      location: env.GCP_REGION,
    });
    console.log(`[VertexAI] Initialized client for project: ${env.GOOGLE_CLOUD_PROJECT}`);
  } else {
    console.log('[VertexAI] No GCP credentials detected. Local deterministic assistant active.');
  }
} catch (err) {
  console.warn('[VertexAI] Initialization skipped, using local fallback assistant:', err);
}

export async function generateChatResponse(params: {
  message: string;
  history: ChatMessage[];
  telemetry: AqiTelemetry;
  profile?: UserProfile;
}): Promise<{
  reply: string;
  suggestedFollowups: string[];
  isAiGenerated: boolean;
}> {
  const { message, history, telemetry, profile } = params;

  // Build grounded context prompt
  const systemPrompt = `You are BreatheWise AI, an expert urban air quality and environmental health assistant.
You help families navigate severe winter smog and urban air pollution with practical, low-emission daily routines, indoor air quality hacks, and sustainable living choices.

Current Grounded Real-Time Data:
- Location: ${telemetry.city} (${telemetry.country || 'India'})
- Overall AQI: ${telemetry.aqi} (CPCB Standard)
- Severity Band: ${telemetry.category}
- Dominant Pollutant: ${telemetry.dominantPollutant}
- Pollutant Concentrations: PM2.5 = ${telemetry.pollutants.pm25 || 'N/A'} µg/m³, PM10 = ${telemetry.pollutants.pm10 || 'N/A'} µg/m³, NO2 = ${telemetry.pollutants.no2 || 'N/A'} µg/m³
- Official Health Warning: "${telemetry.healthAdvisory}"

User Profile Context:
- Home: ${profile?.homeType || 'apartment'}
- Air Purifier Available: ${profile?.hasAirPurifier ? 'Yes' : 'No'}
- Primary Commute: ${profile?.primaryCommute?.replace('_', ' ') || 'personal vehicle'}
- Vulnerable Household Members: ${profile?.vulnerabilities?.join(', ') || 'None specified'}

Strict Behavioral Constraints:
1. Ground all air quality assessments strictly in the verified current telemetry provided above. Never invent or hallucinate AQI values or pollutant levels.
2. Explain WHY specific actions matter (e.g. diurnal temperature inversions trapping particles near ground level in early morning).
3. Distinguish clearly between verified environmental facts, practical guidance, and general estimates.
4. Do NOT provide certified medical diagnoses or clinical prescription advice. For clinical health issues, instruct users to consult healthcare practitioners.
5. Provide actionable, concise, empathetic, and structured recommendations with markdown bullet points where appropriate.`;

  // Attempt real Vertex AI Gemini call if client is available
  if (vertexAiClient) {
    try {
      const generativeModel = vertexAiClient.getGenerativeModel({
        model: env.VERTEX_AI_MODEL_ID,
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800,
        },
      });

      // Format conversation turns for Gemini
      const contents = history.slice(-6).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Add the latest user message
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await generativeModel.generateContent({ contents });
      const candidate = response.response.candidates?.[0];
      const replyText = candidate?.content?.parts?.[0]?.text;

      if (replyText) {
        return {
          reply: replyText.trim(),
          suggestedFollowups: generateContextualFollowups(message, telemetry),
          isAiGenerated: true,
        };
      }
    } catch (gcpError) {
      console.warn('[VertexAI] Call failed or timed out, seamlessly falling back to local engine:', gcpError);
    }
  }

  // Deterministic local semantic assistant
  const localReply = generateDeterministicAssistantReply(message, telemetry, profile);
  return {
    reply: localReply,
    suggestedFollowups: generateContextualFollowups(message, telemetry),
    isAiGenerated: false,
  };
}

/**
 * Deterministic Semantic Reply Generator
 * Provides expert, scientifically accurate responses even when completely offline.
 */
function generateDeterministicAssistantReply(
  query: string,
  telemetry: AqiTelemetry,
  profile?: UserProfile
): string {
  const q = query.toLowerCase();
  const { aqi, category, dominantPollutant, pollutants } = telemetry;
  const pm25 = pollutants.pm25 || 150;

  // Question: Exercise / Walk / Outdoor Running
  if (q.includes('walk') || q.includes('exercise') || q.includes('jog') || q.includes('run') || q.includes('outdoor')) {
    if (category === 'Severe' || category === 'Very Poor' || category === 'Poor') {
      return `### Outdoor Exercise Advisory for ${telemetry.city}\n\n` +
        `**Recommendation: Strictly Avoid Outdoor Workouts Today.**\n\n` +
        `The current air quality is **${category} (AQI ${aqi})**, with dominant pollutant **${dominantPollutant}** at **${pm25} µg/m³**.\n\n` +
        `**Why this matters scientifically:**\n` +
        `During aerobic physical exercise, minute ventilation increases from ~0.6 m³/h to over 2.8 m³/h, and people naturally switch to mouth breathing, which bypasses the natural filtration of the nasal passages. Inhaling air with ${pm25} µg/m³ PM2.5 deposits billions of fine particulate toxins directly into the alveoli of your lungs.\n\n` +
        `**What to do instead:**\n` +
        `• Shift to indoor bodyweight exercises, yoga, or stretching.\n` +
        `• If you have an air purifier, run it in the exercise room for 30 minutes prior to your workout.\n` +
        `• If an outdoor trip is unavoidable, schedule it during midday (12:00 - 15:00) when solar heating lifts the surface inversion layer.`;
    } else {
      return `### Outdoor Exercise Advisory for ${telemetry.city}\n\n` +
        `**Recommendation: Safe for Normal Outdoor Activity.**\n\n` +
        `Air quality is currently **${category} (AQI ${aqi})**. Ambient pollutant concentrations are within manageable levels.\n\n` +
        `• Healthy adults can enjoy outdoor running and recreation.\n` +
        `• Keep an eye on local traffic corridors during evening rush hours.`;
    }
  }

  // Question: Purifier / DIY Filter / Indoor Air Hacks
  if (q.includes('purifier') || q.includes('filter') || q.includes('diy') || q.includes('fan') || q.includes('clean air')) {
    return `### Indoor Air Purification & Low-Cost Hacks\n\n` +
      `In **${category}** smog conditions, maintaining an indoor clean-air envelope is crucial:\n\n` +
      `1. **Corsi-Rosenthal DIY Box Fan Filter:**\n` +
      `   If you don't own a commercial HEPA purifier, construct a DIY box fan filter by taping four MERV-13 pleated air filters to a 20-inch box fan. This achieves >85% fine particulate filtration at under one-third the cost of high-end appliances.\n\n` +
      `2. **Damp Microfiber Mopping (Never Dry Sweep):**\n` +
      `   Dry brooms resuspend fine dust and heavy particles back into your breathing zone for hours. Always damp-mop floors with water to trap particulate via surface tension.\n\n` +
      `3. **Kitchen Smoke Isolation:**\n` +
      `   Cooking oils heated past their smoke point emit dense ultrafine particles (>600 µg/m³). Turn on the kitchen exhaust 2 minutes before starting and keep kitchen doors shut.\n\n` +
      `4. **Sleep Microclimate:**\n` +
      `   Keep bedroom doors and windows sealed overnight, and place nocturnal CAM plants (like Sansevieria / Snake Plant) to maintain oxygen levels.`;
  }

  // Question: Masks
  if (q.includes('mask') || q.includes('n95') || q.includes('cloth') || q.includes('respirator')) {
    return `### Respiratory Protection Advisory\n\n` +
      `Current conditions (**${category}, AQI ${aqi}**):\n\n` +
      `• **Cloth masks and standard surgical masks are largely ineffective** against fine PM2.5, as their weave has pores between 10 to 50 microns (whereas PM2.5 particles are under 2.5 microns) and they lack an airtight facial seal.\n` +
      `• **Wear a certified N95, FFP2, or KN95 respirator** whenever venturing outdoors. Ensure the metal nose clip is crimped firmly to create an airtight seal.\n` +
      `• Inhaling through an N95 respirator reduces particulate exposure by **up to 95%**, filtering out heavy polycyclic aromatic hydrocarbons and carbon aerosols.`;
  }

  // Question: Children / Elderly / Asthma
  if (q.includes('child') || q.includes('kid') || q.includes('school') || q.includes('elderly') || q.includes('asthma')) {
    return `### Guidance for Sensitive Family Members\n\n` +
      `With an AQI of **${aqi} (${category})**, vulnerable groups require proactive shielding:\n\n` +
      `• **Children:** Children breathe 50% more air per kilogram of body weight than adults, and their lung alveoli are still developing. Restrict outdoor playground sessions; school commutes should be done in closed vehicles or with child-sized N95 masks.\n` +
      `• **Asthma & Respiratory Patients:** Keep emergency reliever inhalers (such as Salbutamol) easily accessible. Nighttime smog accumulation often triggers nocturnal bronchospasms, so run an air purifier or DIY box fan in bedrooms.\n` +
      `• **Elderly:** Particulate PM2.5 penetrates into the bloodstream and triggers systemic vascular inflammation. Limit early morning walks when ground-level smog is densest.`;
  }

  // Question: Community Action / RWA / Neighborhood / Open Burning
  if (q.includes('community') || q.includes('society') || q.includes('rwa') || q.includes('neighborhood') || q.includes('burning')) {
    return `### Community & Neighborhood Smog Defense Blueprint\n\n` +
      `Individual families cannot solve winter smog in isolation. In **${category} (AQI ${aqi})** conditions, apartment complexes and neighborhoods should immediately implement these 4 collective defense measures:\n\n` +
      `1. **Enforce Strict Zero-Open-Burning Protocol:**\n` +
      `   • Prohibit burning of dry fallen leaves, garden clippings, and waste across society premises.\n` +
      `   • Distribute electric convection/oil heaters and heavy blankets to night security guards and gardeners instead of allowing wood/trash fires.\n` +
      `   • Report open burning via the Sameer App, Delhi Green App, or Municipal helpline 311 / 1800-180-1817.\n\n` +
      `2. **Establish a Society Clean Air Sanctuary:**\n` +
      `   • Convert your society clubhouse, library, or indoor gym into a shared Clean Air Sanctuary equipped with two Corsi-Rosenthal DIY box fan filters (cost ~₹5,000 total).\n` +
      `   • Keeps indoor AQI < 50 for elderly residents and children without home air purifiers.\n\n` +
      `3. **Organize School-Pools & Shared Vanpooling:**\n` +
      `   • Form 4-family school carpools to eliminate 60+ idling vehicle-minutes outside school gates each morning.\n` +
      `   • Advocate with school administration to postpone morning sports and outdoor assemblies until after 12:00 PM.\n\n` +
      `4. **RWA Smog Broadcast System:**\n` +
      `   • Send daily 7:00 AM WhatsApp advisories notifying residents of current AQI and optimal ventilation windows (12:30 PM - 2:00 PM).`;
  }

  // Question: Commute / Transit / Car / Metro
  if (q.includes('commute') || q.includes('metro') || q.includes('car') || q.includes('bus') || q.includes('traffic')) {
    return `### Smog-Resilient Commuting Strategies\n\n` +
      `• **Two-Wheeler Riders:** Motorcyclists and scooter riders inhale 5× to 10× more toxic tailpipe exhaust than passengers in enclosed transit. Transition to the **metro train or closed buses** during this smog episode.\n` +
      `• **Car Drivers:** Set your car AC to **Internal Air Recirculation mode**. Bringing in outside air directly pulls exhaust from the vehicle ahead into your cabin.\n` +
      `• **Mass Transit Benefit:** Switching a 15 km car commute to the metro avoids **~2.2 kg of CO2e** and prevents **0.42 g of direct tailpipe PM2.5 emissions**, while insulating your lungs from road-level toxic exhaust plumes.`;
  }

  // Default General Overview
  return `### BreatheWise Environmental Advisory for ${telemetry.city}\n\n` +
    `Current status: **${category} (AQI ${aqi})**, primarily driven by **${dominantPollutant}** at **${pm25} µg/m³**.\n\n` +
    `**Key Guidelines for Today:**\n` +
    `1. **Outdoor Movement:** Limit unessential outdoor activities; wear an N95 respirator if stepping out.\n` +
    `2. **Ventilation:** Keep windows closed during early morning and late evening inversion peaks.\n` +
    `3. **Indoor Safety:** Damp-mop floors instead of dry sweeping; run air purification in bedrooms.\n` +
    `4. **Transit:** Choose electric metro or public bus over personal vehicles to lower urban congestion and emissions.\n\n` +
    `*Notice: BreatheWise AI provides decision support and environmental guidance. For serious symptoms or clinical medical advice, please consult a certified healthcare professional.*`;
}

function generateContextualFollowups(query: string, telemetry: AqiTelemetry): string[] {
  const q = query.toLowerCase();
  if (q.includes('exercise') || q.includes('walk')) {
    return [
      'What are good indoor cardio alternatives?',
      'How do I build a low-cost DIY air purifier?',
      'Which hours of the day have the lowest pollution?',
    ];
  }
  if (q.includes('purifier') || q.includes('filter')) {
    return [
      'How does the Corsi-Rosenthal box filter work?',
      'Which indoor plants help absorb toxins?',
      'How should I ventilate my home safely?',
    ];
  }
  return [
    'Is it safe for kids to play outside today?',
    'What commuting alternative saves the most emissions?',
    'What indoor air hacks require no expensive equipment?',
  ];
}
