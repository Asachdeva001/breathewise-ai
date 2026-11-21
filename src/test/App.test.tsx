import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App.js';

// Mock the API client
vi.mock('../services/api.js', () => ({
  fetchAirQualityApi: vi.fn().mockResolvedValue({
    city: 'New Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.209,
    aqi: 412,
    standard: 'CPCB',
    category: 'Severe',
    categoryColor: '#C00000',
    categoryTextColor: '#FFFFFF',
    dominantPollutant: 'PM25',
    subIndices: [{ pollutant: 'pm25', concentration: 350, subIndex: 412, unit: 'µg/m³' }],
    pollutants: { pm25: 350, pm10: 480 },
    timestamp: '2026-11-21T06:00:00Z',
    source: 'Open-Meteo',
    isDemo: false,
    healthAdvisory: 'Emergency health hazard',
    sensitiveGroupWarning: 'Vulnerable must stay indoors',
  }),
  fetchRecommendationsApi: vi.fn().mockResolvedValue({
    summary: 'EMERGENCY ALERT: Severe smog event',
    dominantThreat: 'PM25',
    vulnerabilityFactor: 'Standard profile',
    routineSlots: [
      {
        timeSlot: 'Morning (06:00 - 10:00)',
        title: 'Inversion Smog Peak',
        outdoorStatus: 'Avoid',
        recommendedActions: ['Avoid outdoor jogging'],
        indoorActivities: ['Indoor yoga'],
        commuteAdvice: 'Take metro',
        scientificReason: 'Inversion layer traps particles',
      },
    ],
    indoorHacks: [
      {
        id: 'hack-diy',
        title: 'Corsi-Rosenthal Box Fan Filter',
        category: 'purification',
        room: 'Living Room',
        action: 'Build DIY box filter',
        costTier: 'Low Cost',
        expectedPmReductionPercent: 85,
        instructions: ['Tape 4 MERV-13 filters to fan'],
        scientificMechanism: 'High surface area lowers velocity',
      },
    ],
    sustainableAlternatives: [
      {
        id: 'alt-metro',
        title: 'Shift to Metro',
        category: 'transit',
        currentHabit: 'Solo car',
        recommendedAlternative: 'Metro rail',
        estimatedAvoidedCo2Kg: 2.2,
        estimatedAvoidedPmGrams: 0.42,
        rationale: 'Zero street-level emissions',
      },
    ],
    generatedAt: '2026-11-21T06:00:00Z',
    isAiEnhanced: false,
  }),
  fetchPreferencesApi: vi.fn().mockResolvedValue({
    userId: 'mock-user-1',
    cityName: 'New Delhi',
    householdSize: 4,
    vulnerabilities: [],
    homeType: 'apartment',
    hasAirPurifier: false,
    hasKitchenExhaust: true,
    primaryCommute: 'personal_car',
    averageCommuteDistanceKm: 15,
    exercisePreference: 'morning',
    onboardingCompleted: true,
  }),
  updatePreferencesApi: vi.fn().mockResolvedValue({}),
  fetchImpactApi: vi.fn().mockResolvedValue({
    userId: 'mock-user-1',
    totalAvoidedCo2Kg: 4.8,
    totalAvoidedPm25Ug: 1250,
    actionsCompletedCount: 3,
    weeklyStreakDays: 3,
    recentActions: [],
    equivalentTreesPlanted: 0.2,
    equivalentCleanAirHours: 20.8,
  }),
  logActionApi: vi.fn().mockResolvedValue({
    action: {},
    summary: {
      userId: 'mock-user-1',
      totalAvoidedCo2Kg: 6.8,
      totalAvoidedPm25Ug: 1850,
      actionsCompletedCount: 4,
      weeklyStreakDays: 4,
      recentActions: [],
      equivalentTreesPlanted: 0.3,
      equivalentCleanAirHours: 30.8,
    },
  }),
  sendChatMessageApi: vi.fn().mockResolvedValue({
    conversationId: 'convo-1',
    message: {
      id: 'm1',
      role: 'assistant',
      content: 'Here is tailored guidance.',
      timestamp: '2026-11-21T06:01:00Z',
    },
    isAiGenerated: false,
  }),
}));

describe('Frontend App Shell Integration Tests', () => {
  it('renders branding and main navigation tabs', async () => {
    render(<App />);

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings[0]).toHaveTextContent(/BreatheWise/i);
    expect(screen.getByText(/Breathe Smarter\. Live Better\./i)).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: /AQI Intelligence/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Daily Routine/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Indoor Optimizer/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Sustainable Living/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /AI Assistant/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Impact Tracker/i })).toBeInTheDocument();

    await waitFor(() => {
      const aqiElements = screen.getAllByText(/412/i);
      expect(aqiElements.length).toBeGreaterThan(0);
    });
  });

  it('allows tab switching between application views', async () => {
    render(<App />);

    const indoorTab = screen.getByRole('tab', { name: /Indoor Optimizer/i });
    fireEvent.click(indoorTab);
    expect(indoorTab).toHaveAttribute('aria-selected', 'true');

    const impactTab = screen.getByRole('tab', { name: /Impact Tracker/i });
    fireEvent.click(impactTab);
    expect(impactTab).toHaveAttribute('aria-selected', 'true');
  });
});
