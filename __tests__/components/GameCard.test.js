import React from 'react';
import { render } from '@testing-library/react-native';
import GameCard from '../../src/components/GameCard';

describe('GameCard', () => {
  const mockGame = {
    status: 'In Progress',
    start_time: '2024-03-20T19:30:00Z',
    home_team: {
      abbreviation: 'LAL',
    },
    visitor_team: {
      abbreviation: 'GSW',
    },
    home_team_score: 85,
    visitor_team_score: 80,
  };

  it('renders correctly with in-progress game', () => {
    const { getByText } = render(<GameCard game={mockGame} />);

    // Check team names are rendered
    expect(getByText('LAL')).toBeTruthy();
    expect(getByText('GSW')).toBeTruthy();

    // Check scores are rendered
    expect(getByText('85')).toBeTruthy();
    expect(getByText('80')).toBeTruthy();

    // Check status is rendered
    expect(getByText('In Progress')).toBeTruthy();
  });

  it('renders correctly with final game', () => {
    const finalGame = {
      ...mockGame,
      status: 'Final',
    };
    const { getByText, queryByText } = render(<GameCard game={finalGame} />);

    // Check "Final" text is rendered
    expect(getByText('Final')).toBeTruthy();

    // Status container should not be present for final games
    expect(queryByText('In Progress')).toBeNull();
  });

  it('renders correctly with zero scores', () => {
    const zeroScoreGame = {
      ...mockGame,
      home_team_score: 0,
      visitor_team_score: 0,
    };
    const { getAllByText } = render(<GameCard game={zeroScoreGame} />);

    // Both scores should be rendered as '-'
    const dashes = getAllByText('-');
    expect(dashes).toHaveLength(2);
  });

  it('highlights winning team', () => {
    const { getByText } = render(<GameCard game={mockGame} />);

    // Home team is winning, should have winning style
    const homeTeamScore = getByText('85');
    const homeTeamName = getByText('LAL');
    expect(homeTeamScore.props.style).toContainEqual(expect.objectContaining({ color: '#007AFF' }));
    expect(homeTeamName.props.style).toContainEqual(expect.objectContaining({ color: '#007AFF' }));

    // Visitor team is losing, should not have winning style
    const visitorTeamScore = getByText('80');
    const visitorTeamName = getByText('GSW');
    expect(visitorTeamScore.props.style).not.toContainEqual(expect.objectContaining({ color: '#007AFF' }));
    expect(visitorTeamName.props.style).not.toContainEqual(expect.objectContaining({ color: '#007AFF' }));
  });

  it('formats game time correctly', () => {
    const { getByText } = render(<GameCard game={mockGame} />);
    
    // Convert UTC time to local time for comparison
    const date = new Date('2024-03-20T19:30:00Z');
    const expectedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    expect(getByText(expectedTime)).toBeTruthy();
  });
}); 