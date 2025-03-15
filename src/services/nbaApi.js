import axios from 'axios';

// Constants
const NBA_BASE_URL = 'https://stats.nba.com/stats';
const ENDPOINTS = {
  PLAYER_GAME_LOG: '/playergamelog'
};

// API configuration
const api = axios.create({
  baseURL: NBA_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
});

// Date utilities
const getCurrentSeason = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const season = month >= 10 ? `${year}-${(year + 1).toString().slice(-2)}` : `${year - 1}-${year.toString().slice(-2)}`;
  console.debug('[getCurrentSeason] Current date:', now.toISOString(), 'Calculated season:', season);
  return season;
};

const formatDate = (date) => date.toISOString().split('T')[0];

const getDateRange = (timeRange) => {
  console.debug('[getDateRange] Input timeRange:', timeRange);
  const endDate = new Date();
  let startDate = new Date(endDate);

  switch (timeRange) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '2weeks':
      startDate.setDate(endDate.getDate() - 14);
      break;
    case 'month':
      startDate.setDate(endDate.getDate() - 30);
      break;
    default:
      console.debug('[getDateRange] Invalid timeRange, returning null');
      return null;
  }

  const range = {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
  console.debug('[getDateRange] Calculated date range:', range);
  return range;
};

// Data processing
const processGameStats = (headers, row) => {
  console.debug('[processGameStats] Processing game stats with headers:', headers);
  console.debug('[processGameStats] Raw row data:', row);

  const getValue = (field) => {
    const index = headers.indexOf(field);
    const value = index !== -1 ? row[index] : null;
    console.debug(`[processGameStats] Getting value for ${field}:`, { index, value });
    return value;
  };

  const formatPercent = (value) => {
    const formatted = value !== null ? (value * 100).toFixed(1) : null;
    console.debug('[processGameStats] Formatting percentage:', { input: value, output: formatted });
    return formatted;
  };

  const stats = {
    date: getValue('GAME_DATE'),
    points: getValue('PTS'),
    rebounds: getValue('REB'),
    assists: getValue('AST'),
    steals: getValue('STL'),
    blocks: getValue('BLK'),
    fgPercent: formatPercent(getValue('FG_PCT')),
    ftPercent: formatPercent(getValue('FT_PCT')),
    threePM: getValue('FG3M'),
    turnovers: getValue('TOV'),
    minutes: getValue('MIN')
  };

  console.debug('[processGameStats] Processed game stats:', stats);
  return stats;
};

const calculateAverages = (games) => {
  if (!games.length) return null;

  const totals = games.reduce((acc, game) => {
    Object.entries(game).forEach(([key, value]) => {
      if (key !== 'date' && value !== null) {
        acc[key] = (acc[key] || 0) + parseFloat(value);
      }
    });
    return acc;
  }, {});

  return Object.entries(totals).reduce((acc, [key, total]) => {
    acc[key] = (total / games.length).toFixed(1);
    return acc;
  }, {});
};

// API functions
export const getPlayerStats = async (playerId, timeRange = 'season') => {
  console.debug('[getPlayerStats] Starting request for player:', playerId, 'timeRange:', timeRange);
  
  try {
    const dateRange = getDateRange(timeRange);
    const params = {
      PlayerID: playerId,
      Season: getCurrentSeason(),
      SeasonType: 'Regular Season',
      ...(dateRange && { DateFrom: dateRange.startDate, DateTo: dateRange.endDate })
    };
    console.debug('[getPlayerStats] Request parameters:', params);

    const response = await api.get(ENDPOINTS.PLAYER_GAME_LOG, { params });
    console.debug('[getPlayerStats] Raw API response:', response.data);

    // Validate response structure
    if (!response?.data?.resultSets?.[0]) {
      console.debug('[getPlayerStats] Invalid API response structure:', response);
      throw new Error('Invalid API response structure');
    }

    const { headers, rowSet } = response.data.resultSets[0];
    console.debug('[getPlayerStats] Extracted headers and rowSet:', { headers, rowSetLength: rowSet?.length });

    if (!headers || !rowSet) {
      console.debug('[getPlayerStats] Missing headers or rowSet');
      throw new Error('Invalid data format');
    }

    // Process game data
    const games = rowSet.map(row => processGameStats(headers, row));
    console.debug('[getPlayerStats] Processed games:', games.length, 'entries');

    const averages = calculateAverages(games);
    console.debug('[getPlayerStats] Calculated averages:', averages);

    const result = {
      games,
      averages,
      gamesPlayed: games.length
    };
    console.debug('[getPlayerStats] Final result:', result);
    return result;

  } catch (error) {
    console.debug('[getPlayerStats] Error occurred:', error.message, error.stack);
    if (error.message === 'Invalid API response structure' || error.message === 'Invalid data format') {
      throw error;
    }
    throw new Error(`Failed to fetch player stats: ${error.message}`);
  }
};

export const calculateTrends = (currentStats, previousStats) => {
  if (!currentStats || !previousStats) return {};

  return Object.entries(currentStats).reduce((acc, [key, currentValue]) => {
    const previousValue = previousStats[key];
    if (currentValue !== undefined && previousValue !== undefined && 
        !isNaN(parseFloat(currentValue)) && !isNaN(parseFloat(previousValue))) {
      const diff = parseFloat(currentValue) - parseFloat(previousValue);
      if (!isNaN(diff)) {
        acc[key] = diff;
      }
    }
    return acc;
  }, {});
};

const formatPlayerStats = (data) => {
  if (!data?.headers || !data?.rowSet) {
    throw new Error('Invalid data format');
  }

  const headers = data.headers;
  const games = data.rowSet.map(row => ({
    points: row[headers.indexOf('PTS')],
    rebounds: row[headers.indexOf('REB')],
    assists: row[headers.indexOf('AST')],
    steals: row[headers.indexOf('STL')],
    blocks: row[headers.indexOf('BLK')],
    fgPercent: (row[headers.indexOf('FG_PCT')] * 100).toFixed(1),
    ftPercent: (row[headers.indexOf('FT_PCT')] * 100).toFixed(1),
    threePM: row[headers.indexOf('FG3M')],
    turnovers: row[headers.indexOf('TOV')],
    minutes: row[headers.indexOf('MIN')],
    date: row[headers.indexOf('GAME_DATE')]
  }));

  const averages = calculateAverages(games);
  return {
    averages,
    games,
    gamesPlayed: games.length
  };
};

export const getPlayerInfo = async (playerId) => {
  try {
    const response = await api.get(`/players/${playerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching player info:', error);
    throw error;
  }
};

export const searchPlayers = async (query) => {
  try {
    const response = await api.get(`/players?search=${query}`);
    return response.data.data;
  } catch (error) {
    console.error('Error searching players:', error);
    throw error;
  }
};

export const getGamesByDate = async (date) => {
  try {
    const formattedDate = date.toISOString().split('T')[0];
    const response = await api.get(`/games?dates[]=${formattedDate}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
};

// Get games for a date range (inclusive)
export const getGamesInDateRange = async (startDate, endDate) => {
  try {
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    const response = await api.get(`/games?start_date=${formattedStartDate}&end_date=${formattedEndDate}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching games in date range:', error);
    throw error;
  }
};