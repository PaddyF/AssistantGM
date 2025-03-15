// Set up React Native environment
import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';

// React Native components are now mocked in __mocks__/react-native.js

// Mock fetch
global.fetch = jest.fn(() => Promise.resolve({
  json: jest.fn(() => Promise.resolve({})),
  text: jest.fn(() => Promise.resolve("")),
  ok: true
}));

// Allow synchronous timers to avoid timeout issues
jest.useFakeTimers();

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});