# NBA API Implementation Documentation

## 1. Configuration and Setup

### Constants and Base Configuration
```javascript
const NBA_BASE_URL = 'https://stats.nba.com/stats';
const ENDPOINTS = {
  PLAYER_GAME_LOG: '/playergamelog'
};
```
- Defines the base URL for the NBA stats API
- Defines available endpoints, currently only including player game logs

### API Instance
```javascript
const api = axios.create({
  baseURL: NBA_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 ...'
  }
});
```
- Creates an axios instance with predefined configuration
- Sets necessary headers for NBA API requests

## 2. Utility Functions

### Date Utilities

#### `getCurrentSeason()`
- Determines the current NBA season based on the current date
- Returns season in format 'YYYY-YY' (e.g., '2023-24')
- Handles season transition in October (month >= 10)

#### `getDateRange(timeRange)`
- Accepts timeRange parameter: 'week', '2weeks', 'month'
- Returns an object with formatted startDate and endDate
- Used for filtering player statistics by time period

### Data Processing

#### `processGameStats(headers, row)`
- Processes raw game statistics data into a structured format
- Maps array indices to meaningful field names
- Handles percentage formatting (multiplies by 100 and fixes to 1 decimal)
- Returns an object with formatted game statistics including:
  - Basic stats (points, rebounds, assists, etc.)
  - Shooting percentages (FG%, FT%)
  - Game metadata (date, minutes played)

## 3. Main API Functions

### `getPlayerStats(playerId, timeRange = 'season')`
- Primary function for retrieving player statistics
- Parameters:
  - playerId: NBA player identifier
  - timeRange: Optional period ('season', 'week', '2weeks', 'month')
- Functionality:
  - Constructs API request with appropriate parameters
  - Validates response structure
  - Processes raw data into formatted game statistics
  - Calculates averages across games
- Returns:
  - games: Array of processed game statistics
  - averages: Calculated average statistics
  - gamesPlayed: Total number of games in the period

### `getPlayerInfo(playerId)`
- Retrieves detailed information about a specific player
- Makes GET request to `/players/{playerId}`
- Returns raw player data from API

### `searchPlayers(query)`
- Searches for players based on query string
- Makes GET request to `/players` with search parameter
- Returns array of matching player data

### `getGamesByDate(date)` and `getGamesInDateRange(startDate, endDate)`
- Retrieves game information for specific dates or date ranges
- Formats dates to ISO string format
- Returns game data for specified period

## 4. Test Suite Overview

The test suite (`nbaApi.test.js`) verifies the functionality of the NBA API implementation with the following test cases:

### Setup
- Mocks axios for API request simulation
- Sets up fixed date (2024-03-15) for consistent testing

### Test Cases

#### getPlayerStats Tests
1. "should fetch player stats successfully for week range"
   - Verifies correct parameter handling
   - Checks response processing
   - Validates stat calculations and formatting

2. "should handle season-only stats correctly"
   - Tests default timeRange behavior
   - Verifies season parameter formatting

3. "should handle network errors"
   - Verifies error handling for failed requests
   - Checks error message formatting

4. "should handle empty response data"
   - Tests handling of empty game lists
   - Verifies proper null/empty state handling

5. "should handle invalid API response structure"
   - Tests validation of response format
   - Verifies error handling for malformed responses

### Mock Data Structure
```javascript
const mockHeaders = [
  'GAME_DATE', 'PLAYER_ID', 'PLAYER_NAME', 'PTS', 'REB', 'AST',
  'STL', 'BLK', 'FG_PCT', 'FT_PCT', 'FG3M', 'TOV', 'MIN'
];
```
- Defines expected data structure for tests
- Matches NBA API response format
- Used for consistent test data generation 