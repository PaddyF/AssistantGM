import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PlayerStatCard from '../../src/components/PlayerStatCard';

describe('PlayerStatCard', () => {
  const mockPlayer = {
    id: '123',
    name: 'LeBron James',
    team: 'LAL',
    position: 'SF',
    imageUrl: 'https://example.com/lebron.jpg',
    stats: {
      points: 25.5,
      rebounds: 7.9,
      assists: 7.8,
      steals: 1.2,
      blocks: 0.9,
      fgPercent: '53.4',
      ftPercent: '75.6',
      threePM: 2.1,
      turnovers: 3.2,
      gamesPlayed: 55
    }
  };

  const mockOnTimeRangeChange = jest.fn();

  it('renders correctly with all player information', () => {
    const { getByText } = render(
      <PlayerStatCard player={mockPlayer} onTimeRangeChange={mockOnTimeRangeChange} />
    );

    // Check player info
    expect(getByText('LeBron James')).toBeTruthy();
    expect(getByText('LAL - SF')).toBeTruthy();

    // Check stats
    expect(getByText('25.5')).toBeTruthy();
    expect(getByText('7.9')).toBeTruthy();
    expect(getByText('7.8')).toBeTruthy();
    expect(getByText('1.2')).toBeTruthy();
    expect(getByText('0.9')).toBeTruthy();
    expect(getByText('53.4')).toBeTruthy();
    expect(getByText('75.6')).toBeTruthy();
    expect(getByText('2.1')).toBeTruthy();
    expect(getByText('3.2')).toBeTruthy();
    expect(getByText('55')).toBeTruthy();

    // Check stat labels
    expect(getByText('PTS')).toBeTruthy();
    expect(getByText('REB')).toBeTruthy();
    expect(getByText('AST')).toBeTruthy();
    expect(getByText('STL')).toBeTruthy();
    expect(getByText('BLK')).toBeTruthy();
    expect(getByText('FG%')).toBeTruthy();
    expect(getByText('FT%')).toBeTruthy();
    expect(getByText('3PM')).toBeTruthy();
    expect(getByText('TO')).toBeTruthy();
    expect(getByText('GP')).toBeTruthy();
  });

  it('shows injury status when present', () => {
    const playerWithInjury = {
      ...mockPlayer,
      injury: 'Ankle - GTD'
    };

    const { getByText } = render(
      <PlayerStatCard player={playerWithInjury} onTimeRangeChange={mockOnTimeRangeChange} />
    );

    expect(getByText('Ankle - GTD')).toBeTruthy();
  });

  it('shows trend indicator when present', () => {
    const playerWithTrend = {
      ...mockPlayer,
      trend: 'up',
      trendValue: '+5.2'
    };

    const { getByText } = render(
      <PlayerStatCard player={playerWithTrend} onTimeRangeChange={mockOnTimeRangeChange} />
    );

    expect(getByText('↑ +5.2')).toBeTruthy();
  });

  it('handles time range selection', () => {
    const { getByText } = render(
      <PlayerStatCard player={mockPlayer} onTimeRangeChange={mockOnTimeRangeChange} />
    );

    // Test each time range button
    fireEvent.press(getByText('Month'));
    expect(mockOnTimeRangeChange).toHaveBeenCalledWith(mockPlayer.id, 'month');

    fireEvent.press(getByText('2 Weeks'));
    expect(mockOnTimeRangeChange).toHaveBeenCalledWith(mockPlayer.id, '2weeks');

    fireEvent.press(getByText('Week'));
    expect(mockOnTimeRangeChange).toHaveBeenCalledWith(mockPlayer.id, 'week');

    fireEvent.press(getByText('Season'));
    expect(mockOnTimeRangeChange).toHaveBeenCalledWith(mockPlayer.id, 'season');
  });

  it('uses placeholder image when imageUrl is not provided', () => {
    const playerWithoutImage = {
      ...mockPlayer,
      imageUrl: null
    };

    const { getByTestId } = render(
      <PlayerStatCard player={playerWithoutImage} onTimeRangeChange={mockOnTimeRangeChange} />
    );

    const image = getByTestId('player-image');
    expect(image.props.source.uri).toBe('https://via.placeholder.com/150');
  });

  it('shows downward trend correctly', () => {
    const playerWithDownTrend = {
      ...mockPlayer,
      trend: 'down',
      trendValue: '-3.8'
    };

    const { getByText } = render(
      <PlayerStatCard player={playerWithDownTrend} onTimeRangeChange={mockOnTimeRangeChange} />
    );

    expect(getByText('↓ -3.8')).toBeTruthy();
  });
}); 