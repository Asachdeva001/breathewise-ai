import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DailyRoutineView } from '../features/daily-routines/DailyRoutineView.js';
import { RecommendationResponse } from '../../shared/types.js';

describe('DailyRoutineView Component Tests', () => {
  const mockRecommendations: RecommendationResponse = {
    summary: 'ALERT: Severe winter smog inversion in Delhi NCR',
    dominantThreat: 'PM25 (380 µg/m³)',
    vulnerabilityFactor: 'High risk: Asthma / Chronic respiratory',
    routineSlots: [
      {
        timeSlot: 'Morning (06:00 - 10:00)',
        title: 'Dawn Inversion Smog Peak',
        outdoorStatus: 'Avoid',
        recommendedActions: ['Shift aerobic exercise indoors', 'Close all exterior windows'],
        indoorActivities: ['Mat yoga', 'Living room stretching'],
        commuteAdvice: 'Use enclosed metro train',
        scientificReason: 'Nocturnal boundary layer inversion height drops below 100m.',
      },
      {
        timeSlot: 'Midday (10:00 - 16:00)',
        title: 'Thermal Dispersion Window',
        outdoorStatus: 'Caution',
        recommendedActions: ['Brief outdoor transit permissible with N95 mask'],
        indoorActivities: ['General household tasks'],
        commuteAdvice: 'Flexible commute hours advised',
        scientificReason: 'Solar radiative heating breaks surface inversion layer.',
      },
    ],
    indoorHacks: [],
    sustainableAlternatives: [],
    generatedAt: '2026-11-21T06:00:00Z',
    isAiEnhanced: false,
  };

  it('renders loading state when recommendations are null', () => {
    render(<DailyRoutineView recommendations={null} loading={true} onLogAction={vi.fn()} />);
    expect(screen.getByText(/Generating tailored diurnal routine plan/i)).toBeInTheDocument();
  });

  it('renders summary, vulnerability factor, and diurnal slots correctly', () => {
    render(<DailyRoutineView recommendations={mockRecommendations} loading={false} onLogAction={vi.fn()} />);

    expect(screen.getByText(/ALERT: Severe winter smog inversion in Delhi NCR/i)).toBeInTheDocument();
    expect(screen.getByText(/High risk: Asthma \/ Chronic respiratory/i)).toBeInTheDocument();
    expect(screen.getByText(/Morning \(06:00 - 10:00\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Midday \(10:00 - 16:00\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Avoid Outdoors/i)).toBeInTheDocument();
  });

  it('toggles interactive activity swap and logs swapped action', () => {
    const handleLog = vi.fn();
    render(<DailyRoutineView recommendations={mockRecommendations} loading={false} onLogAction={handleLog} />);

    // Click swap button for morning slot
    const swapButtons = screen.getAllByRole('button', { name: /Swap to Safer Indoor Activity/i });
    expect(swapButtons.length).toBeGreaterThan(0);
    fireEvent.click(swapButtons[0]);

    // Should now show Indoor Safe Swap badge and protocol
    expect(screen.getByText(/Indoor Safe Swap/i)).toBeInTheDocument();
    expect(screen.getByText(/\+115 µg PM2\.5 Inhalation Avoided/i)).toBeInTheDocument();

    // Click log button
    const logButton = screen.getByRole('button', { name: /Log Swapped Safe Activity/i });
    fireEvent.click(logButton);

    expect(handleLog).toHaveBeenCalledTimes(1);
    expect(handleLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: 'routine_shift',
      })
    );
  });
});
