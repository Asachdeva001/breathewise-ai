import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommunityActionView } from '../features/community/CommunityActionView.js';
import { CommunityAction } from '../../shared/types.js';

describe('CommunityActionView Component Tests', () => {
  const mockCommunityActions: CommunityAction[] = [
    {
      id: 'comm-anti-burning',
      title: 'Apartment & Neighborhood Anti-Open-Burning Protocol',
      category: 'anti_burning',
      targetAudience: 'Apartment RWAs',
      impactStatement: 'Eliminates acute, highly toxic ground-level smoke plumes that penetrate surrounding homes.',
      actionSteps: [
        'Provide electrical convection/oil heaters and heavy winter blankets to society security guards.',
        'Enforce strict zero-burning rules across society premises for garden pruning, leaves, and trash.',
      ],
      broadcastTemplate: '*URGENT NOTICE: NO OPEN BURNING*\nDear Residents, open burning is strictly prohibited.',
      estimatedCommunityBenefit: 'Prevents 10-25 kg of direct localized particulate emission per night.',
    },
    {
      id: 'comm-school-pool',
      title: 'School-Pool & Neighborhood Commuter Coordination',
      category: 'school_commute',
      targetAudience: 'Schools & Parents',
      impactStatement: 'Cuts local school-gate toxic tailpipe emissions by up to 60%.',
      actionSteps: ['Connect with 3-4 families to form a morning carpool.'],
      broadcastTemplate: '*COMMUNITY SCHOOL-POOL INITIATIVE*\nCoordinate carpools to protect young lungs.',
      estimatedCommunityBenefit: 'Reduces school zone morning idling PM2.5 concentrations by up to 45%.',
    },
  ];

  it('renders hero title and emergency helpline strip', () => {
    render(<CommunityActionView communityActions={mockCommunityActions} onLogAction={vi.fn()} />);

    expect(screen.getByText(/Community Smog Defense & Neighborhood Action Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Municipal Smog & Open Burning Helplines/i)).toBeInTheDocument();
    expect(screen.getByText(/1800-180-1817/i)).toBeInTheDocument();
  });

  it('renders community action cards with audience badges and steps', () => {
    render(<CommunityActionView communityActions={mockCommunityActions} onLogAction={vi.fn()} />);

    expect(screen.getByText(/Apartment & Neighborhood Anti-Open-Burning Protocol/i)).toBeInTheDocument();
    expect(screen.getByText(/Target: Apartment RWAs/i)).toBeInTheDocument();
    expect(screen.getByText(/School-Pool & Neighborhood Commuter Coordination/i)).toBeInTheDocument();
  });

  it('allows copying notice template to clipboard and logs community action', () => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    const handleLog = vi.fn();
    render(<CommunityActionView communityActions={mockCommunityActions} onLogAction={handleLog} />);

    // Click copy notice
    const copyBtns = screen.getAllByRole('button', { name: /Copy Notice Template to Clipboard/i });
    expect(copyBtns.length).toBeGreaterThan(0);
    fireEvent.click(copyBtns[0]);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);

    // Click log community action
    const logBtns = screen.getAllByRole('button', { name: /I Organized \/ Shared This In My Community/i });
    expect(logBtns.length).toBeGreaterThan(0);
    fireEvent.click(logBtns[0]);

    expect(handleLog).toHaveBeenCalledTimes(1);
    expect(handleLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: 'community_action',
      })
    );
  });
});
