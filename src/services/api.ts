/**
 * Frontend Typed API Client for BreatheWise AI
 */

import {
  ActionLog,
  AqiTelemetry,
  ChatMessage,
  ImpactSummary,
  RecommendationResponse,
  UserProfile,
} from '../../shared/types.js';

const API_BASE = '/api';

export async function fetchAirQualityApi(
  city: string,
  isDemo: boolean = false,
  scenario?: string
): Promise<AqiTelemetry> {
  const params = new URLSearchParams({
    city,
    demo: isDemo ? 'true' : 'false',
  });
  if (scenario) params.append('scenario', scenario);

  const res = await fetch(`${API_BASE}/air-quality?${params.toString()}`);
  if (!res.ok) throw new Error(`Air quality API failed: ${res.statusText}`);
  return res.json();
}

export async function fetchRecommendationsApi(
  telemetry: AqiTelemetry,
  profile: UserProfile
): Promise<RecommendationResponse> {
  const res = await fetch(`${API_BASE}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telemetry, profile }),
  });
  if (!res.ok) throw new Error(`Recommendations API failed: ${res.statusText}`);
  return res.json();
}

export async function sendChatMessageApi(params: {
  message: string;
  conversationId?: string;
  telemetry: AqiTelemetry;
  profile?: UserProfile;
}): Promise<{
  conversationId: string;
  message: ChatMessage;
  isAiGenerated: boolean;
}> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Chat assistant failed: ${res.statusText}`);
  return res.json();
}

export async function fetchPreferencesApi(userId: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/preferences?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(`Fetch preferences failed: ${res.statusText}`);
  return res.json();
}

export async function updatePreferencesApi(profile: UserProfile): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error(`Update preferences failed: ${res.statusText}`);
  return res.json();
}

export async function fetchImpactApi(userId: string): Promise<ImpactSummary> {
  const res = await fetch(`${API_BASE}/impact?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(`Fetch impact failed: ${res.statusText}`);
  return res.json();
}

export async function logActionApi(payload: {
  userId: string;
  actionType: string;
  title: string;
  distanceKm?: number;
  baselineMode?: string;
  alternativeMode?: string;
  ambientPm25?: number;
  durationHours?: number;
}): Promise<{ action: ActionLog; summary: ImpactSummary }> {
  const res = await fetch(`${API_BASE}/impact/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Log action failed: ${res.statusText}`);
  return res.json();
}
