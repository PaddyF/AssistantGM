const mockAxios = {
  create: jest.fn(() => mockAxios),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};

// Mock response for /commonplayerinfo endpoint
const playerInfoResponse = {
  data: {
    resource: "commonplayerinfo",
    resultSets: [
      {
        name: "CommonPlayerInfo",
        headers: [
          "PERSON_ID",
          "DISPLAY_FIRST_LAST",
          "TEAM_NAME",
          "POSITION",
          "HEIGHT",
          "WEIGHT",
          "JERSEY",
          "BIRTHDATE",
          "SEASON_EXP"
        ],
        rowSet: [
          [
            203507,
            "Giannis Antetokounmpo",
            "Milwaukee Bucks",
            "F",
            "6-11",
            "242",
            "34",
            "1994-12-06T00:00:00",
            10
          ]
        ]
      }
    ]
  }
};

// Mock response for /playergamelog endpoint
const gameLogResponse = {
  data: {
    resource: "playergamelog",
    resultSets: [
      {
        name: "PlayerGameLog",
        headers: [
          "GAME_DATE",
          "MATCHUP",
          "WL",
          "MIN",
          "PTS",
          "REB",
          "AST"
        ],
        rowSet: [
          [
            "2024-03-14",
            "MIL vs PHI",
            "W",
            "35",
            "32",
            "12",
            "8"
          ]
        ]
      }
    ]
  }
};

// Set up mock responses for different endpoints
mockAxios.get.mockImplementation((url, config) => {
  console.debug('Mock Axios GET:', { url, config });

  if (url.includes('/commonplayerinfo')) {
    return Promise.resolve(playerInfoResponse);
  }
  
  if (url.includes('/playergamelog')) {
    return Promise.resolve(gameLogResponse);
  }

  return Promise.reject(new Error(`No mock response for endpoint: ${url}`));
});

module.exports = mockAxios; 