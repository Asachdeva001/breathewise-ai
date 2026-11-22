import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImpactTrackerView } from '../features/impact-tracker/ImpactTrackerView.js';
import { ImpactSummary } from '../../shared/types.js';

describe('ImpactTrackerView Component Tests', () => {
  const mockImpact: ImpactSummary = {
    userId: 'usr-123',
    totalAvoidedCo2Kg: 5.4,
    totalAvoidedPm25Ug: 1850,
    actionsCompletedCount: 4,
    weeklyStreakDays: 3,
    recentActions: [
      {
        id: 'act-1',
        userId: 'usr-123',
        actionType: 'transit_shift',
        title: 'Took Metro Train instead of Solo Car',
        avoidedCo2Kg: 2.4,
        avoidedPm25Ug: 450,
        timestamp: '2026-11-21T07:00:00Z',
        calculationBasis: '18 km commute shift from personal car to electric metro',
      },
    ],
    equivalentTreesPlanted: 0.25,
    equivalentCleanAirHours: 24.5,
  };

  it('renders loading state properly', () => {
    render(<ImpactTrackerView impact={null} loading={true} successMessage={null} />);
    expect(screen.getByText(/Calculating cumulative environmental/i)).toBeInTheDocument();
  });

  it('renders all 4 primary impact metrics cards', () => {
    render(<ImpactTrackerView impact={mockImpact} loading={false} successMessage="Action recorded!" />);

    expect(screen.getByText(/Action recorded!/i)).toBeInTheDocument();
    expect(screen.getByText(/1,850/i)).toBeInTheDocument();
    expect(screen.getByText(/5\.4/i)).toBeInTheDocument();
    expect(screen.getByText(/Took Metro Train instead of Solo Car/i)).toBeInTheDocument();
  });

  it('opens and displays scientific methodology and formula modal', () => {
    render(<ImpactTrackerView impact={mockImpact} loading={false} successMessage={null} />);

    const formulaBtn = screen.getByRole('button', { name: /View Scientific Formulas/i });
    fireEvent.click(formulaBtn);

    expect(screen.getByText(/Impact Mathematical Formulas/i)).toBeInTheDocument();
    expect(screen.getByText(/Inhaled Lung Dose Avoided/i)).toBeInTheDocument();
  });
});
