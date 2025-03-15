import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FANTRAX_API_BASE_URL = 'https://www.fantrax.com/fxpa/req';
let authToken = null;

const api = axios.create({
  baseURL: FANTRAX_API_BASE_URL,
  withCredentials: true // Important for maintaining session
});

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
    const response = await api.get('/getUserLeagues');
    return response.data.leagues;
  } catch (error) {
    console.error('Error fetching leagues:', error);
    throw error;
  }
};

// Get league info
export const getLeagueInfo = async (leagueId) => {
  try {
    const response = await api.get('/getLeagueInfo', {
      params: { leagueId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching league info:', error);
    throw error;
  }
};

// Get user's team in a league
export const getTeamRoster = async (leagueId) => {
  try {
    const response = await api.get('/getTeamRoster', {
      params: { leagueId }
    });
    return response.data.roster;
  } catch (error) {
    console.error('Error fetching team roster:', error);
    throw error;
  }
};

// Get league standings
export const getLeagueStandings = async (leagueId) => {
  try {
    const response = await api.get('/getLeagueStandings', {
      params: { leagueId }
    });
    return response.data.standings;
  } catch (error) {
    console.error('Error fetching league standings:', error);
    throw error;
  }
};

// Get matchup info
export const getMatchupInfo = async (leagueId, scoringPeriodId) => {
  try {
    const response = await api.get('/getMatchupInfo', {
      params: { 
        leagueId,
        scoringPeriodId 
      }
    });
    return response.data.matchup;
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
    const response = await api.get('/getLeagueActivity', {
      params: { leagueId }
    });
    return response.data.activity;
  } catch (error) {
    console.error('Error fetching league activity:', error);
    throw error;
  }
}; 