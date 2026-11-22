import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IndoorOptimizerView } from '../features/indoor-air/IndoorOptimizerView.js';
import { IndoorHack } from '../../shared/types.js';

describe('IndoorOptimizerView Component Tests', () => {
  const mockHacks: IndoorHack[] = [
    {
      id: 'hack-1',
      title: 'Damp Microfiber Mopping Protocol',
      category: 'cleaning',
      room: 'Living Room',
      action: 'Replace dry broom sweeping with damp microfiber mopping',
      costTier: 'Free',
      expectedPmReductionPercent: 40,
      instructions: ['Use damp cloth to bind settled particulates', 'Avoid broom sweeping which resuspends PM10'],
      scientificMechanism: 'Surface liquid tension binds PM2.5/PM10 preventing aerosolization into breathing zone.',
    },
  ];

  it('renders Corsi-Rosenthal box fan featured section and BOM', () => {
    render(<IndoorOptimizerView indoorHacks={mockHacks} onLogAction={vi.fn()} />);

    expect(screen.getByText(/Corsi-Rosenthal Box Filter/i)).toBeInTheDocument();
    expect(screen.getByText(/~85%/i)).toBeInTheDocument();
    expect(screen.getByText(/Bill of Materials/i)).toBeInTheDocument();
    expect(screen.getAllByText(/NASA Clean Air Study/i).length).toBeGreaterThan(0);
  });

  it('renders room-by-room hacks and fires log callback', () => {
    const handleLog = vi.fn();
    render(<IndoorOptimizerView indoorHacks={mockHacks} onLogAction={handleLog} />);

    expect(screen.getByText(/Damp Microfiber Mopping Protocol/i)).toBeInTheDocument();
    expect(screen.getByText(/Surface liquid tension binds PM2\.5/i)).toBeInTheDocument();

    const logBtn = screen.getByRole('button', { name: /I Did This Hack Today/i });
    fireEvent.click(logBtn);

    expect(handleLog).toHaveBeenCalledTimes(1);
    expect(handleLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: 'indoor_hack',
      })
    );
  });
});
