import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FANTRAX_API_BASE_URL = 'https://www.fantrax.com/fxpa/req';
let authToken = null;

// Cache configuration
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

const api = axios.create({
  baseURL: FANTRAX_API_BASE_URL,
  withCredentials: true // Important for maintaining session
});

const getCachedData = async (key) => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

const cacheData = async (key, data) => {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

// Helper function to handle API calls with caching
const fetchWithCache = async (url, options = {}, useCache = true) => {
  try {
    // Check cache first if caching is enabled
    if (useCache) {
      const cachedData = await getCachedData(url);
      if (cachedData) {
        return cachedData;
      }
    }

    // Make the API request
    const response = await api.get(url, options);
    const data = response.data;
    
    // Cache the response if caching is enabled
    if (useCache) {
      await cacheData(url, data);
    }

    return data;
  } catch (error) {
    console.error('Fantrax API error:', error);
    throw error;
  }
};

// Set auth token after login
export const setAuthToken = (token) => {
  authToken = token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Login to Fantrax
export const login = async (email, password) => {
  try {
    const response = await axios.post('https://www.fantrax.com/login', {
      email,
      password,
      rememberMe: true
    });
    
    setAuthToken(response.data.token);
    return response.data;
  } catch (error) {
    console.error('Fantrax login error:', error);
    throw new Error('Failed to login to Fantrax');
  }
};

/**
 * Authenticates user with Google ID token
 * @param {string} idToken - Google ID token
 * @returns {Promise<void>}
 */
export const loginWithGoogle = async (idToken) => {
  try {
    const response = await api.post('/auth/google', { idToken });
    if (response.data.success) {
      // Store the authentication token
      await AsyncStorage.setItem('fantrax_token', response.data.token);
      return response.data;
    } else {
      throw new Error(response.data.message || 'Google authentication failed');
    }
  } catch (error) {
    console.error('Google Login Error:', error);
    throw error;
  }
};

// Get user's leagues
export const getUserLeagues = async () => {
  try {
    const data = await fetchWithCache('/getUserLeagues');
    if (!data || !data.leagues) {
      throw new Error('Failed to fetch user leagues');
    }
    return data.leagues;
  } catch (error) {
    console.error('Error fetching leagues:', error);
    throw error;
  }
};

// Get league info
export const getLeagueInfo = async (leagueId) => {
  try {
    const data = await fetchWithCache('/getLeagueInfo', {
      params: { leagueId }
    });
    if (!data) {
      throw new Error('Failed to fetch league info');
    }
    return data;
  } catch (error) {
    console.error('Error fetching league info:', error);
    throw error;
  }
};

// Get user's team in a league
export const getTeamRoster = async (leagueId) => {
  try {
    const data = await fetchWithCache('/getTeamRoster', {
      params: { leagueId }
    });
    if (!data || !data.roster) {
      throw new Error('Failed to fetch team roster');
    }
    return data.roster;
  } catch (error) {
    console.error('Error fetching team roster:', error);
    throw error;
  }
};

// Get league standings
export const getLeagueStandings = async (leagueId) => {
  try {
    const data = await fetchWithCache('/getLeagueStandings', {
      params: { leagueId }
    });
    if (!data || !data.standings) {
      throw new Error('Failed to fetch league standings');
    }
    return data.standings;
  } catch (error) {
    console.error('Error fetching league standings:', error);
    throw error;
  }
};

// Get matchup info
export const getMatchupInfo = async (leagueId, scoringPeriodId) => {
  try {
    const data = await fetchWithCache('/getMatchupInfo', {
      params: { 
        leagueId,
        scoringPeriodId 
      }
    });
    if (!data || !data.matchup) {
      throw new Error('Failed to fetch matchup info');
    }
    return data.matchup;
  } catch (error) {
    console.error('Error fetching matchup info:', error);
    throw error;
  }
};

// Get available players (waiver wire)
export const getAvailablePlayers = async (leagueId, filters = {}) => {
  try {
    const response = await api.get('/getAvailablePlayers', {
      params: {
        leagueId,
        ...filters
      }
    });
    return response.data.players;
  } catch (error) {
    console.error('Error fetching available players:', error);
    throw error;
  }
};

// Make a waiver claim
export const makeWaiverClaim = async (leagueId, addPlayerId, dropPlayerId = null) => {
  try {
    const response = await api.post('/makeWaiverClaim', {
      leagueId,
      addPlayerId,
      dropPlayerId
    });
    return response.data;
  } catch (error) {
    console.error('Error making waiver claim:', error);
    throw error;
  }
};

// Propose a trade
export const proposeTrade = async (leagueId, tradeData) => {
  try {
    const response = await api.post('/proposeTrade', {
      leagueId,
      ...tradeData
    });
    return response.data;
  } catch (error) {
    console.error('Error proposing trade:', error);
    throw error;
  }
};

// Get league messages/activity
export const getLeagueActivity = async (leagueId) => {
  try {
    const data = await fetchWithCache('/getLeagueActivity', {
      params: { leagueId }
    });
    if (!data || !data.activity) {
      throw new Error('Failed to fetch league activity');
    }
    return data.activity;
  } catch (error) {
    console.error('Error fetching league activity:', error);
    throw error;
  }
}; 