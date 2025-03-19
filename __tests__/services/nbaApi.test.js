import { render } from '@testing-library/react-native';
import { jest } from '@jest/globals';
import * as nbaApi from '../../src/services/nbaApi';

describe('NBA API Service', () => {
  const mockPlayerStatsResponse = {
    resultSets: [{
      headers: ['GAME_DATE', 'MIN', 'PTS', 'REB', 'AST', 'STL', 'BLK', 'FG_PCT', 'FT_PCT', 'FG3M', 'TOV'],
      rowSet: [
        ['2024-03-15', '35', '25', '5', '8', '2', '1', '0.500', '0.800', '3', '2'],
        ['2024-03-13', '32', '22', '4', '6', '1', '0', '0.450', '0.750', '2', '3']
      ]
    }]
  };

  const mockPlayerInfoResponse = {
    resultSets: [{
      headers: [
        'PERSON_ID', 'FIRST_NAME', 'LAST_NAME', 'TEAM_ID', 'TEAM_NAME',
        'JERSEY', 'POSITION', 'HEIGHT', 'WEIGHT', 'BIRTHDATE',
        'SEASON_EXP', 'COUNTRY', 'LAST_AFFILIATION', 'DRAFT_YEAR',
        'DRAFT_ROUND', 'DRAFT_NUMBER'
      ],
      rowSet: [[
        203999, 'Nikola', 'Jokic', 1610612743, 'Denver Nuggets',
        '15', 'C', '6-11', '284', '1995-02-19',
        8, 'Serbia', 'KK Mega Basket', '2014', '2', '41'
      ]]
    }]
  };

  const mockSearchPlayersResponse = {
    resultSets: [{
      headers: ['PERSON_ID', 'FIRST_NAME', 'LAST_NAME', 'IS_ACTIVE'],
      rowSet: [
        [203999, 'Nikola', 'Jokic', 1],
        [201142, 'Kevin', 'Durant', 1]
      ]
    }]
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlayerStats', () => {
    it('should fetch player stats successfully', async () => {
      const mockResponse = {
        data: {
          games: [
            {
              assists: 8,
              blocks: 1,
              date: '2024-03-15',
              fgPercent: '50.0',
              ftPercent: '80.0',
              minutes: 35,
              points: 25,
              rebounds: 5,
              steals: 2,
              threePM: 3,
              turnovers: 2
            },
            {
              assists: 6,
              blocks: 0,
              date: '2024-03-13',
              fgPercent: '45.0',
              ftPercent: '75.0',
              minutes: 32,
              points: 22,
              rebounds: 4,
              steals: 1,
              threePM: 2,
              turnovers: 3
            }
          ]
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await nbaApi.getPlayerStats('203999', 'week');
      expect(result).toEqual({
        games: mockResponse.data.games,
        averages: {
          assists: '7.0',
          blocks: '0.5',
          fgPercent: '47.5',
          ftPercent: '77.5',
          minutes: '33.5',
          points: '23.5',
          rebounds: '4.5',
          steals: '1.5',
          threePM: '2.5',
          turnovers: '2.5'
        },
        gamesPlayed: 2
      });
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(nbaApi.getPlayerStats('203999', 'week'))
        .rejects.toThrow('Failed to fetch player stats: Network error');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle empty response data', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { games: [] } })
      });

      const result = await nbaApi.getPlayerStats('203999', 'week');
      expect(result).toEqual({
        games: [],
        averages: null,
        gamesPlayed: 0
      });
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPlayerInfo', () => {
    it('should fetch player info successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPlayerInfoResponse)
      });

      const result = await nbaApi.getPlayerInfo('203999');
      expect(result).toEqual({
        id: 203999,
        firstName: 'Nikola',
        lastName: 'Jokic',
        teamId: 1610612743,
        teamName: 'Denver Nuggets',
        jersey: '15',
        position: 'C',
        height: '6-11',
        weight: '284',
        birthdate: '1995-02-19',
        experience: 8,
        country: 'Serbia',
        lastAffiliation: 'KK Mega Basket',
        draft: {
          year: '2014',
          round: '2',
          number: '41'
        }
      });
      expect(fetch).toHaveBeenCalledTimes(1);
    }, 10000);

    it('should handle player not found', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ resultSets: [] })
      });

      await expect(nbaApi.getPlayerInfo('999999'))
        .rejects.toThrow('Player not found');
      expect(fetch).toHaveBeenCalledTimes(1);
    }, 10000);
  });

  describe('searchPlayers', () => {
    it('should search players successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSearchPlayersResponse)
      });

      const result = await nbaApi.searchPlayers('jok');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 203999,
        firstName: 'Nikola',
        lastName: 'Jokic',
        fullName: 'Nikola Jokic',
        isActive: true
      });
      expect(fetch).toHaveBeenCalledTimes(1);
    }, 10000);

    it('should handle empty search results', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ resultSets: [] })
      });

      const result = await nbaApi.searchPlayers('nonexistent');
      expect(result).toEqual([]);
      expect(fetch).toHaveBeenCalledTimes(1);
    }, 10000);
  });

  describe('calculateTrends', () => {
    it('should calculate trends correctly', () => {
      const currentStats = { points: 25, rebounds: 10, assists: 8 };
      const previousStats = { points: 20, rebounds: 8, assists: 6 };

      const trends = nbaApi.calculateTrends(currentStats, previousStats);
      expect(trends).toEqual({
        points: 5,
        rebounds: 2,
        assists: 2
      });
    });

    it('should handle missing stats', () => {
      const currentStats = { points: 25 };
      const previousStats = { points: 20, rebounds: 8 };

      const trends = nbaApi.calculateTrends(currentStats, previousStats);
      expect(trends).toEqual({
        points: 5
      });
    });
  });

  describe('formatPlayerStats', () => {
    it('should format player stats successfully', () => {
      const stats = {
        averages: {
          points: 25,
          rebounds: 10,
          assists: 8,
          steals: 2,
          blocks: 1,
          fgPercent: 50,
          ftPercent: 80,
          threePM: 3,
          turnovers: 2
        },
        gamesPlayed: 2
      };

      const info = {
        id: 203999,
        firstName: 'Nikola',
        lastName: 'Jokic',
        teamName: 'Denver Nuggets',
        position: 'C'
      };

      const result = nbaApi.formatPlayerStats(stats, info);
      expect(result).toEqual({
        id: 203999,
        name: 'Nikola Jokic',
        team: 'Denver Nuggets',
        position: 'C',
        imageUrl: 'https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/1040x760/203999.png',
        stats: {
          points: 25,
          rebounds: 10,
          assists: 8,
          steals: 2,
          blocks: 1,
          fgPercent: 50,
          ftPercent: 80,
          threePM: 3,
          turnovers: 2
        },
        gamesPlayed: 2
      });
    });

    it('should handle null stats or info', () => {
      expect(nbaApi.formatPlayerStats(null, {})).toBeNull();
      expect(nbaApi.formatPlayerStats({}, null)).toBeNull();
      expect(nbaApi.formatPlayerStats(null, null)).toBeNull();
    });

    it('should use default stats when averages are missing', () => {
      const stats = { gamesPlayed: 0 };
      const info = {
        id: 203999,
        firstName: 'Nikola',
        lastName: 'Jokic',
        teamName: 'Denver Nuggets',
        position: 'C'
      };

      const result = nbaApi.formatPlayerStats(stats, info);
      expect(result.stats).toEqual({
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        fgPercent: 0,
        ftPercent: 0,
        threePM: 0,
        turnovers: 0,
        gamesPlayed: 0
      });
    });
  });

  describe('getGamesInDateRange', () => {
    it('should fetch games for date range successfully', async () => {
      const mockResponse = {
        data: [
          {
            awayTeam: {
              id: 1610612744,
              name: 'Golden State Warriors',
              score: 115
            },
            date: '2024-03-15',
            gameId: '0022300001',
            homeTeam: {
              id: 1610612743,
              name: 'Denver Nuggets',
              score: 120
            },
            status: 'Final'
          }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const startDate = new Date('2024-03-15');
      const endDate = new Date('2024-03-15');
      
      const result = await nbaApi.getGamesInDateRange(startDate, endDate);
      expect(result).toEqual(mockResponse.data);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const startDate = new Date('2024-03-15');
      const endDate = new Date('2024-03-15');
      
      await expect(nbaApi.getGamesInDateRange(startDate, endDate))
        .rejects.toThrow('Failed to fetch games: Network error');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle empty response data', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] })
      });

      const startDate = new Date('2024-03-15');
      const endDate = new Date('2024-03-15');
      
      const result = await nbaApi.getGamesInDateRange(startDate, endDate);
      expect(result).toEqual([]);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
}); 