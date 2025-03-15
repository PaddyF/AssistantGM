import { describe, it, expect, jest, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import axios, { mockGet } from 'axios';
import { setupDebugLogging } from '../testUtils';

// Mock axios before importing the module that uses it
jest.mock('axios');

// Import after mocking axios
import { getPlayerStats, calculateTrends } from '../../src/services/nbaApi';

describe('NBA API Service', () => {
  const FIXED_DATE = '2024-03-15';
  let cleanupDebugLogging;

  // Test data
  const mockHeaders = [
    'GAME_DATE', 'PLAYER_ID', 'PLAYER_NAME', 'PTS', 'REB', 'AST',
    'STL', 'BLK', 'FG_PCT', 'FT_PCT', 'FG3M', 'TOV', 'MIN'
  ];

  const mockRowSet = [
    ['2024-03-15', 1, 'Player Name', 20, 10, 5, 2, 1, 0.5, 0.8, 2, 2, 30],
    ['2024-03-13', 1, 'Player Name', 25, 8, 7, 1, 2, 0.6, 0.9, 3, 1, 32]
  ];

  const createMockResponse = (rowSet = mockRowSet) => ({
    data: {
      resultSets: [{
        headers: mockHeaders,
        rowSet: rowSet
      }]
    }
  });

  beforeAll(() => {
    // Setup debug logging if enabled and store cleanup function
    cleanupDebugLogging = setupDebugLogging();
  });

  afterAll(() => {
    // Clean up debug logging
    cleanupDebugLogging();
  });

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Use a fixed date for consistent test results
    jest.useFakeTimers();
    jest.setSystemTime(new Date(FIXED_DATE));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getPlayerStats', () => {
    it('should fetch player stats successfully for week range', async () => {
      mockGet.mockResolvedValueOnce(createMockResponse());

      const result = await getPlayerStats('123', 'week');

      expect(mockGet).toHaveBeenCalledWith('/playergamelog', {
        params: {
          PlayerID: '123',
          Season: '2023-24',
          SeasonType: 'Regular Season',
          DateFrom: '2024-03-08',
          DateTo: '2024-03-15'
        }
      });

      expect(result).toEqual({
        games: [
          {
            date: '2024-03-15',
            points: 20,
            rebounds: 10,
            assists: 5,
            steals: 2,
            blocks: 1,
            fgPercent: '50.0',
            ftPercent: '80.0',
            threePM: 2,
            turnovers: 2,
            minutes: 30
          },
          {
            date: '2024-03-13',
            points: 25,
            rebounds: 8,
            assists: 7,
            steals: 1,
            blocks: 2,
            fgPercent: '60.0',
            ftPercent: '90.0',
            threePM: 3,
            turnovers: 1,
            minutes: 32
          }
        ],
        averages: {
          points: '22.5',
          rebounds: '9.0',
          assists: '6.0',
          steals: '1.5',
          blocks: '1.5',
          fgPercent: '55.0',
          ftPercent: '85.0',
          threePM: '2.5',
          turnovers: '1.5',
          minutes: '31.0'
        },
        gamesPlayed: 2
      });
    });

    it('should handle season-only stats correctly', async () => {
      mockGet.mockResolvedValueOnce(createMockResponse());

      const result = await getPlayerStats('123', 'season');

      expect(mockGet).toHaveBeenCalledWith('/playergamelog', {
        params: {
          PlayerID: '123',
          Season: '2023-24',
          SeasonType: 'Regular Season'
        }
      });

      expect(result.games).toHaveLength(2);
      expect(result.gamesPlayed).toBe(2);
      expect(result.averages).toBeDefined();
    });

    it('should handle network errors', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network error'));

      await expect(getPlayerStats('123', 'week'))
        .rejects.toThrow('Failed to fetch player stats: Network error');

      expect(mockGet).toHaveBeenCalled();
    });

    it('should handle empty response data', async () => {
      mockGet.mockResolvedValueOnce(createMockResponse([]));

      const result = await getPlayerStats('123', 'week');
      
      expect(result).toEqual({
        games: [],
        averages: null,
        gamesPlayed: 0
      });
    });

    it('should handle invalid API response structure', async () => {
      mockGet.mockResolvedValueOnce({ data: {} });

      await expect(getPlayerStats('123', 'week'))
        .rejects.toThrow('Invalid API response structure');
    });

    it('should handle malformed data format', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          resultSets: [{
            headers: null,
            rowSet: null
          }]
        }
      });

      await expect(getPlayerStats('123', 'week'))
        .rejects.toThrow('Invalid data format');
    });

    it('should handle different time ranges correctly', async () => {
      mockGet.mockResolvedValueOnce(createMockResponse());

      const result = await getPlayerStats('123', '2weeks');

      expect(mockGet).toHaveBeenCalledWith('/playergamelog', {
        params: {
          PlayerID: '123',
          Season: '2023-24',
          SeasonType: 'Regular Season',
          DateFrom: '2024-03-01',
          DateTo: '2024-03-15'
        }
      });

      expect(result.games).toHaveLength(2);
      expect(result.gamesPlayed).toBe(2);
    });
  });

  describe('calculateTrends', () => {
    it('should calculate trends correctly', () => {
      const currentStats = {
        points: '25.0',
        rebounds: '10.0',
        assists: '5.0'
      };

      const previousStats = {
        points: '20.0',
        rebounds: '12.0',
        assists: '5.0'
      };

      const trends = calculateTrends(currentStats, previousStats);

      expect(trends).toEqual({
        points: 5,
        rebounds: -2,
        assists: 0
      });
    });

    it('should handle null or undefined inputs', () => {
      expect(calculateTrends(null, null)).toEqual({});
      expect(calculateTrends(undefined, undefined)).toEqual({});
      expect(calculateTrends({}, {})).toEqual({});
    });

    it('should handle missing stats', () => {
      const currentStats = {
        points: '25.0',
        rebounds: '10.0'
      };

      const previousStats = {
        points: '20.0',
        assists: '5.0'
      };

      const trends = calculateTrends(currentStats, previousStats);

      expect(trends).toEqual({
        points: 5
      });
    });

    it('should handle non-numeric values', () => {
      const currentStats = {
        points: '25.0',
        status: 'active'
      };

      const previousStats = {
        points: '20.0',
        status: 'inactive'
      };

      const trends = calculateTrends(currentStats, previousStats);

      expect(trends).toEqual({
        points: 5
      });
    });
  });
}); 