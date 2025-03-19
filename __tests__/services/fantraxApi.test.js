import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as fantraxApi from '../../src/services/fantraxApi';

// Mock axios and AsyncStorage
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage');

// Mock fetchWithCache
const mockFetchWithCache = jest.fn();
jest.mock('../../src/services/fantraxApi', () => {
  const originalModule = jest.requireActual('../../src/services/fantraxApi');
  return {
    ...originalModule,
    fetchWithCache: mockFetchWithCache
  };
});

// Mock the cache functions
const mockGetCachedData = jest.fn();
const mockCacheData = jest.fn();

jest.mock('../../src/services/fantraxApi', () => {
  const originalModule = jest.requireActual('../../src/services/fantraxApi');
  return {
    ...originalModule,
    getCachedData: mockGetCachedData,
    cacheData: mockCacheData
  };
});

describe('Fantrax API Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Create a mock axios instance with all necessary properties
    const mockAxios = {
      get: jest.fn(),
      post: jest.fn(),
      create: jest.fn(),
      defaults: {
        headers: {
          common: {}
        }
      }
    };
    axios.create.mockReturnValue(mockAxios);
    axios.get = mockAxios.get;
    axios.post = mockAxios.post;
    axios.defaults = mockAxios.defaults;
    mockGetCachedData.mockResolvedValue(null);
    mockCacheData.mockResolvedValue();
  });

  describe('login', () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';
    const mockToken = 'mock-token';

    it('should login successfully', async () => {
      const mockResponse = { data: { token: mockToken, success: true } };
      axios.post.mockResolvedValueOnce(mockResponse);

      const result = await fantraxApi.login(mockEmail, mockPassword);

      expect(axios.post).toHaveBeenCalledWith('https://www.fantrax.com/login', {
        email: mockEmail,
        password: mockPassword,
        rememberMe: true
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle login failure', async () => {
      const mockError = new Error('Login failed');
      axios.post.mockRejectedValueOnce(mockError);

      await expect(fantraxApi.login(mockEmail, mockPassword))
        .rejects.toThrow('Failed to login to Fantrax');
    });
  });

  describe('loginWithGoogle', () => {
    const mockIdToken = 'mock-google-token';
    const mockToken = 'mock-fantrax-token';

    it('should login with Google successfully', async () => {
      const mockResponse = { data: { token: mockToken, success: true } };
      axios.post.mockResolvedValueOnce(mockResponse);

      const result = await fantraxApi.loginWithGoogle(mockIdToken);

      expect(axios.post).toHaveBeenCalledWith('/auth/google', { idToken: mockIdToken });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('fantrax_token', mockToken);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle Google login failure', async () => {
      const mockError = { data: { success: false, message: 'Authentication failed' } };
      axios.post.mockResolvedValueOnce(mockError);

      await expect(fantraxApi.loginWithGoogle(mockIdToken))
        .rejects.toThrow('Authentication failed');
    });
  });

  describe('getUserLeagues', () => {
    it('should fetch user leagues successfully', async () => {
      const mockLeagues = [
        { id: 1, name: 'League 1' },
        { id: 2, name: 'League 2' }
      ];
      const mockResponse = { data: { leagues: mockLeagues } };
      axios.get.mockResolvedValueOnce(mockResponse);

      const result = await fantraxApi.getUserLeagues();
      expect(result).toEqual(mockLeagues);
      expect(axios.get).toHaveBeenCalledWith('/getUserLeagues', expect.any(Object));
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      axios.get.mockRejectedValueOnce(mockError);

      await expect(fantraxApi.getUserLeagues()).rejects.toThrow(mockError);
    });
  });

  describe('getLeagueInfo', () => {
    const mockLeagueId = '123';

    it('should fetch league info successfully', async () => {
      const mockLeagueInfo = { id: mockLeagueId, name: 'Test League', settings: {} };
      const mockResponse = { data: mockLeagueInfo };
      axios.get.mockResolvedValueOnce(mockResponse);

      const result = await fantraxApi.getLeagueInfo(mockLeagueId);
      expect(result).toEqual(mockLeagueInfo);
      expect(axios.get).toHaveBeenCalledWith('/getLeagueInfo', {
        params: { leagueId: mockLeagueId }
      });
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      axios.get.mockRejectedValueOnce(mockError);

      await expect(fantraxApi.getLeagueInfo(mockLeagueId)).rejects.toThrow(mockError);
    });
  });

  describe('getTeamRoster', () => {
    const mockLeagueId = '123';

    it('should fetch team roster successfully', async () => {
      const mockRoster = [
        { id: 1, name: 'Player 1' },
        { id: 2, name: 'Player 2' }
      ];
      const mockResponse = { data: { roster: mockRoster } };
      axios.get.mockResolvedValueOnce(mockResponse);

      const result = await fantraxApi.getTeamRoster(mockLeagueId);
      expect(result).toEqual(mockRoster);
      expect(axios.get).toHaveBeenCalledWith('/getTeamRoster', {
        params: { leagueId: mockLeagueId }
      });
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      axios.get.mockRejectedValueOnce(mockError);

      await expect(fantraxApi.getTeamRoster(mockLeagueId)).rejects.toThrow(mockError);
    });
  });

  describe('getLeagueStandings', () => {
    const mockLeagueId = '123';

    it('should fetch league standings successfully', async () => {
      const mockStandings = [
        { teamId: 1, rank: 1, points: 100 },
        { teamId: 2, rank: 2, points: 90 }
      ];
      const mockResponse = { data: { standings: mockStandings } };
      axios.get.mockResolvedValueOnce(mockResponse);

      const result = await fantraxApi.getLeagueStandings(mockLeagueId);
      expect(result).toEqual(mockStandings);
      expect(axios.get).toHaveBeenCalledWith('/getLeagueStandings', {
        params: { leagueId: mockLeagueId }
      });
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      axios.get.mockRejectedValueOnce(mockError);

      await expect(fantraxApi.getLeagueStandings(mockLeagueId)).rejects.toThrow(mockError);
    });
  });

  describe('getMatchupInfo', () => {
    const mockLeagueId = '123';
    const mockScoringPeriodId = '1';

    it('should fetch matchup info successfully', async () => {
      const mockMatchup = {
        team1: { id: 1, score: 100 },
        team2: { id: 2, score: 90 }
      };
      const mockResponse = { data: { matchup: mockMatchup } };
      axios.get.mockResolvedValueOnce(mockResponse);

      const result = await fantraxApi.getMatchupInfo(mockLeagueId, mockScoringPeriodId);
      expect(result).toEqual(mockMatchup);
      expect(axios.get).toHaveBeenCalledWith('/getMatchupInfo', {
        params: { leagueId: mockLeagueId, scoringPeriodId: mockScoringPeriodId }
      });
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      axios.get.mockRejectedValueOnce(mockError);

      await expect(fantraxApi.getMatchupInfo(mockLeagueId, mockScoringPeriodId)).rejects.toThrow(mockError);
    });
  });

  describe('getAvailablePlayers', () => {
    const mockLeagueId = '123';
    const mockFilters = { position: 'PG' };
    const mockPlayers = [
      { id: 1, name: 'Player 1', position: 'PG' },
      { id: 2, name: 'Player 2', position: 'PG' }
    ];

    it('should fetch available players successfully', async () => {
      const mockResponse = { data: { players: mockPlayers } };
      axios.get.mockResolvedValueOnce(mockResponse);

      const result = await fantraxApi.getAvailablePlayers(mockLeagueId, mockFilters);

      expect(axios.get).toHaveBeenCalledWith('/getAvailablePlayers', {
        params: { leagueId: mockLeagueId, position: 'PG' }
      });
      expect(result).toEqual(mockPlayers);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      axios.get.mockRejectedValueOnce(mockError);

      await expect(fantraxApi.getAvailablePlayers(mockLeagueId, mockFilters))
        .rejects.toThrow(mockError);
    });
  });

  describe('makeWaiverClaim', () => {
    const mockLeagueId = '123';
    const mockAddPlayerId = '456';
    const mockDropPlayerId = '789';

    it('should make waiver claim successfully', async () => {
      const mockResponse = { data: { success: true } };
      axios.post.mockResolvedValueOnce(mockResponse);

      const result = await fantraxApi.makeWaiverClaim(mockLeagueId, mockAddPlayerId, mockDropPlayerId);

      expect(axios.post).toHaveBeenCalledWith('/makeWaiverClaim', {
        leagueId: mockLeagueId,
        addPlayerId: mockAddPlayerId,
        dropPlayerId: mockDropPlayerId
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      axios.post.mockRejectedValueOnce(mockError);

      await expect(fantraxApi.makeWaiverClaim(mockLeagueId, mockAddPlayerId, mockDropPlayerId))
        .rejects.toThrow(mockError);
    });
  });

  describe('proposeTrade', () => {
    const mockLeagueId = '123';
    const mockTradeData = {
      offeredPlayers: ['456'],
      requestedPlayers: ['789'],
      targetTeamId: '321'
    };

    it('should propose trade successfully', async () => {
      const mockResponse = { data: { success: true } };
      axios.post.mockResolvedValueOnce(mockResponse);

      const result = await fantraxApi.proposeTrade(mockLeagueId, mockTradeData);

      expect(axios.post).toHaveBeenCalledWith('/proposeTrade', {
        leagueId: mockLeagueId,
        ...mockTradeData
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      axios.post.mockRejectedValueOnce(mockError);

      await expect(fantraxApi.proposeTrade(mockLeagueId, mockTradeData))
        .rejects.toThrow(mockError);
    });
  });

  describe('getLeagueActivity', () => {
    const mockLeagueId = '123';

    it('should fetch league activity successfully', async () => {
      const mockActivity = [
        { id: 1, type: 'trade', timestamp: '2024-03-20' },
        { id: 2, type: 'waiver', timestamp: '2024-03-19' }
      ];
      const mockResponse = { data: { activity: mockActivity } };
      axios.get.mockResolvedValueOnce(mockResponse);

      const result = await fantraxApi.getLeagueActivity(mockLeagueId);
      expect(result).toEqual(mockActivity);
      expect(axios.get).toHaveBeenCalledWith('/getLeagueActivity', {
        params: { leagueId: mockLeagueId }
      });
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      axios.get.mockRejectedValueOnce(mockError);

      await expect(fantraxApi.getLeagueActivity(mockLeagueId)).rejects.toThrow(mockError);
    });
  });

  describe('setAuthToken', () => {
    const mockToken = 'mock-token';

    it('should set the auth token in axios defaults', () => {
      fantraxApi.setAuthToken(mockToken);
      expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
    });
  });
}); 