import { Platform } from 'react-native';
import axios from 'axios';
import { cacheImage } from '../utils/imageCache';

// Constants
const NBA_API_BASE_URL = 'https://api.nba.com/v1';
const HEADERS = {
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Host': 'stats.nba.com',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'x-nba-stats-origin': 'stats',
  'x-nba-stats-token': 'true',
  'Referer': 'https://www.nba.com/'
};

const API_CONFIG = {
  timeout: 10000,
  maxRetries: 3,
  retryDelay: 1000
};

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

// Helper function to handle API calls with retries and caching
async function fetchWithRetry(url, retries = 3, delay = 1000, useCache = true) {
  // Check cache first if enabled
  if (useCache && cache.has(url)) {
    const { data, timestamp } = cache.get(url);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }

  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Cache the successful response
      if (useCache) {
        cache.set(url, {
          data,
          timestamp: Date.now()
        });
      }
      
      return data;
    } catch (error) {
      lastError = new Error('Network error');
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// Helper function to format date to YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Helper function to calculate averages from games
const calculateAverages = (games) => {
  if (!games || games.length === 0) return null;

  const sum = games.reduce((acc, game) => ({
    minutes: acc.minutes + game.minutes,
    points: acc.points + game.points,
    rebounds: acc.rebounds + game.rebounds,
    assists: acc.assists + game.assists,
    steals: acc.steals + game.steals,
    blocks: acc.blocks + game.blocks,
    fgPercent: acc.fgPercent + parseFloat(game.fgPercent),
    ftPercent: acc.ftPercent + parseFloat(game.ftPercent),
    threePM: acc.threePM + game.threePM,
    turnovers: acc.turnovers + game.turnovers
  }), {
    minutes: 0,
    points: 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    fgPercent: 0,
    ftPercent: 0,
    threePM: 0,
    turnovers: 0
  });

  const count = games.length;
  return {
    minutes: (sum.minutes / count).toFixed(1),
    points: (sum.points / count).toFixed(1),
    rebounds: (sum.rebounds / count).toFixed(1),
    assists: (sum.assists / count).toFixed(1),
    steals: (sum.steals / count).toFixed(1),
    blocks: (sum.blocks / count).toFixed(1),
    fgPercent: (sum.fgPercent / count).toFixed(1),
    ftPercent: (sum.ftPercent / count).toFixed(1),
    threePM: (sum.threePM / count).toFixed(1),
    turnovers: (sum.turnovers / count).toFixed(1)
  };
};

export const getPlayerStats = async (playerId, timeframe = 'week') => {
  try {
    const response = await fetch(`${NBA_API_BASE_URL}/players/${playerId}/stats?timeframe=${timeframe}`);
    if (!response.ok) {
      throw new Error('API request failed');
    }
    const data = await response.json();
    if (!data.data || !data.data.games) {
      return {
        games: [],
        averages: null,
        gamesPlayed: 0
      };
    }

    const games = data.data.games;
    const gamesPlayed = games.length;

    if (gamesPlayed === 0) {
      return {
        games: [],
        averages: null,
        gamesPlayed: 0
      };
    }

    const averages = calculateAverages(games);
    return {
      games,
      averages,
      gamesPlayed
    };
  } catch (error) {
    throw new Error(`Failed to fetch player stats: ${error.message}`);
  }
};

export async function getPlayerInfo(playerId) {
  const url = `${NBA_API_BASE_URL}/commonplayerinfo`;
  const params = new URLSearchParams({
    PlayerID: playerId,
    LeagueID: '00'
  });

  try {
    const data = await fetchWithRetry(`${url}?${params}`);
    if (!data?.resultSets?.[0]) {
      throw new Error('Player not found');
    }

    const { headers, rowSet } = data.resultSets[0];
    if (!headers || !rowSet || !rowSet[0]) {
      throw new Error('Player not found');
    }

    const headerIndices = {
      id: headers.indexOf('PERSON_ID'),
      firstName: headers.indexOf('FIRST_NAME'),
      lastName: headers.indexOf('LAST_NAME'),
      teamId: headers.indexOf('TEAM_ID'),
      teamName: headers.indexOf('TEAM_NAME'),
      jersey: headers.indexOf('JERSEY'),
      position: headers.indexOf('POSITION'),
      height: headers.indexOf('HEIGHT'),
      weight: headers.indexOf('WEIGHT'),
      birthdate: headers.indexOf('BIRTHDATE'),
      experience: headers.indexOf('SEASON_EXP'),
      country: headers.indexOf('COUNTRY'),
      lastAffiliation: headers.indexOf('LAST_AFFILIATION'),
      draftYear: headers.indexOf('DRAFT_YEAR'),
      draftRound: headers.indexOf('DRAFT_ROUND'),
      draftNumber: headers.indexOf('DRAFT_NUMBER')
    };

    const row = rowSet[0];
    return {
      id: row[headerIndices.id],
      firstName: row[headerIndices.firstName],
      lastName: row[headerIndices.lastName],
      teamId: row[headerIndices.teamId],
      teamName: row[headerIndices.teamName],
      jersey: row[headerIndices.jersey],
      position: row[headerIndices.position],
      height: row[headerIndices.height],
      weight: row[headerIndices.weight],
      birthdate: row[headerIndices.birthdate],
      experience: row[headerIndices.experience],
      country: row[headerIndices.country],
      lastAffiliation: row[headerIndices.lastAffiliation],
      draft: {
        year: row[headerIndices.draftYear],
        round: row[headerIndices.draftRound],
        number: row[headerIndices.draftNumber]
      }
    };
  } catch (error) {
    throw new Error(`Failed to fetch player info: ${error.message}`);
  }
}

export async function searchPlayers(query) {
  const url = `${NBA_API_BASE_URL}/searchplayers`;
  const params = new URLSearchParams({
    SearchCriteria: query
  });

  try {
    const data = await fetchWithRetry(`${url}?${params}`);
    if (!data?.resultSets?.[0]) {
      return [];
    }

    const { headers, rowSet } = data.resultSets[0];
    if (!headers || !rowSet) {
      return [];
    }

    const headerIndices = {
      id: headers.indexOf('PERSON_ID'),
      firstName: headers.indexOf('FIRST_NAME'),
      lastName: headers.indexOf('LAST_NAME'),
      isActive: headers.indexOf('IS_ACTIVE')
    };

    return rowSet.map(row => ({
      id: row[headerIndices.id],
      firstName: row[headerIndices.firstName],
      lastName: row[headerIndices.lastName],
      fullName: `${row[headerIndices.firstName]} ${row[headerIndices.lastName]}`,
      isActive: row[headerIndices.isActive] === 1
    })).slice(0, 20);
  } catch (error) {
    throw new Error(`Failed to search players: ${error.message}`);
  }
}

export async function getGamesByDate(date) {
  const url = `${NBA_API_BASE_URL}/scoreboardv3`;
  const params = new URLSearchParams({
    GameDate: date,
    LeagueID: '00'
  });

  try {
    const data = await fetchWithRetry(`${url}?${params}`);
    if (!data?.resultSets?.[0]) {
      return [];
    }

    const { headers, rowSet } = data.resultSets[0];
    if (!headers || !rowSet) {
      return [];
    }

    const headerIndices = {
      gameId: headers.indexOf('GAME_ID'),
      date: headers.indexOf('GAME_DATE'),
      status: headers.indexOf('GAME_STATUS'),
      homeTeamId: headers.indexOf('HOME_TEAM_ID'),
      homeTeamName: headers.indexOf('HOME_TEAM_NAME'),
      homeTeamScore: headers.indexOf('HOME_TEAM_SCORE'),
      awayTeamId: headers.indexOf('AWAY_TEAM_ID'),
      awayTeamName: headers.indexOf('AWAY_TEAM_NAME'),
      awayTeamScore: headers.indexOf('AWAY_TEAM_SCORE')
    };

    return rowSet.map(row => ({
      gameId: row[headerIndices.gameId],
      date: row[headerIndices.date],
      status: row[headerIndices.status],
      homeTeam: {
        id: row[headerIndices.homeTeamId],
        name: row[headerIndices.homeTeamName],
        score: parseInt(row[headerIndices.homeTeamScore])
      },
      awayTeam: {
        id: row[headerIndices.awayTeamId],
        name: row[headerIndices.awayTeamName],
        score: parseInt(row[headerIndices.awayTeamScore])
      }
    }));
  } catch (error) {
    throw new Error(`Failed to fetch games: ${error.message}`);
  }
}

export function calculateTrends(currentStats, previousStats) {
  const trends = {};
  
  for (const stat in currentStats) {
    if (previousStats[stat]) {
      trends[stat] = parseFloat(currentStats[stat]) - parseFloat(previousStats[stat]);
    }
  }
  
  return trends;
}

export function formatPlayerStats(stats, info) {
  if (!stats || !info) {
    return null;
  }

  return {
    id: info.id,
    name: `${info.firstName} ${info.lastName}`,
    team: info.teamName,
    position: info.position,
    imageUrl: `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/1040x760/${info.id}.png`,
    stats: stats.averages || {
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
    },
    gamesPlayed: stats.gamesPlayed
  };
}

export const getGamesInDateRange = async (startDate, endDate) => {
  try {
    const response = await fetch(`${NBA_API_BASE_URL}/games?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`);
    if (!response.ok) {
      throw new Error('API request failed');
    }
    const data = await response.json();
    if (!data.data) {
      return [];
    }
    return data.data;
  } catch (error) {
    throw new Error(`Failed to fetch games: ${error.message}`);
  }
};

export const getPlayerImage = async (playerId) => {
  try {
    const url = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/1040x760/${playerId}.png`;
    return await cacheImage(url);
  } catch (error) {
    console.error('Error fetching player image:', error);
    return null;
  }
};