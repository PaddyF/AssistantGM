import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import FantraxLoginScreen from '../../src/screens/FantraxLoginScreen';
import * as FantraxApi from '../../src/services/fantraxApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock GoogleSignInButton component
jest.mock('../../src/components/GoogleSignInButton', () => {
  const MockGoogleSignInButton = ({ onSignInSuccess, onSignInError }) => (
    <button
      testID="google-signin-button"
      onPress={() => onSignInSuccess({ tokens: { idToken: 'mock-id-token' } })}
    >
      Sign in with Google
    </button>
  );
  return MockGoogleSignInButton;
});

// Mock fantraxApi
jest.mock('../../src/services/fantraxApi', () => ({
  login: jest.fn(),
  getUserLeagues: jest.fn(),
  loginWithGoogle: jest.fn(),
  setAuthToken: jest.fn()
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

describe('FantraxLoginScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    setOptions: jest.fn()
  };

  const mockLeagues = [
    { id: '1', name: 'League 1' },
    { id: '2', name: 'League 2' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Email/Password Login', () => {
    it('renders login form correctly', () => {
      const { getByPlaceholderText, getByText } = render(
        <FantraxLoginScreen navigation={mockNavigation} />
      );

      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
      expect(getByText('Connect Account')).toBeTruthy();
    });

    it('handles successful login with multiple leagues', async () => {
      FantraxApi.login.mockResolvedValueOnce({ success: true });
      FantraxApi.getUserLeagues.mockResolvedValueOnce(mockLeagues);

      const { getByPlaceholderText, getByText } = render(
        <FantraxLoginScreen navigation={mockNavigation} />
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Connect Account');

      await act(async () => {
        fireEvent.changeText(emailInput, 'test@example.com');
      });

      await act(async () => {
        fireEvent.changeText(passwordInput, 'password123');
      });

      await act(async () => {
        fireEvent.press(loginButton);
      });

      expect(FantraxApi.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigation.navigate).toHaveBeenCalledWith('LeagueSelect', { leagues: mockLeagues });
    });

    it('handles successful login with single league', async () => {
      FantraxApi.login.mockResolvedValueOnce({ success: true });
      FantraxApi.getUserLeagues.mockResolvedValueOnce([mockLeagues[0]]);

      const { getByPlaceholderText, getByText } = render(
        <FantraxLoginScreen navigation={mockNavigation} />
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Connect Account');

      await act(async () => {
        fireEvent.changeText(emailInput, 'test@example.com');
      });

      await act(async () => {
        fireEvent.changeText(passwordInput, 'password123');
      });

      await act(async () => {
        fireEvent.press(loginButton);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Dashboard', { leagueId: '1' });
    });

    it('handles login failure', async () => {
      FantraxApi.login.mockRejectedValueOnce(new Error('Invalid credentials'));

      const { getByPlaceholderText, getByText } = render(
        <FantraxLoginScreen navigation={mockNavigation} />
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Connect Account');

      await act(async () => {
        fireEvent.changeText(emailInput, 'test@example.com');
      });

      await act(async () => {
        fireEvent.changeText(passwordInput, 'password123');
      });

      await act(async () => {
        fireEvent.press(loginButton);
      });

      expect(Alert.alert).toHaveBeenCalledWith('Login Failed', 'Please check your credentials and try again.');
    });

    it('validates required fields', async () => {
      const { getByText } = render(
        <FantraxLoginScreen navigation={mockNavigation} />
      );

      const loginButton = getByText('Connect Account');

      await act(async () => {
        fireEvent.press(loginButton);
      });

      expect(Alert.alert).toHaveBeenCalledWith('Login Failed', 'Please check your credentials and try again.');
      expect(FantraxApi.login).not.toHaveBeenCalled();
    });
  });

  describe('Google Sign-In', () => {
    it('handles successful Google sign-in with multiple leagues', async () => {
      FantraxApi.loginWithGoogle.mockResolvedValueOnce({ success: true });
      FantraxApi.getUserLeagues.mockResolvedValueOnce(mockLeagues);

      const { getByTestId } = render(
        <FantraxLoginScreen navigation={mockNavigation} />
      );

      const googleButton = getByTestId('google-signin-button');

      await act(async () => {
        fireEvent.press(googleButton);
      });

      expect(FantraxApi.loginWithGoogle).toHaveBeenCalledWith('mock-id-token');
      expect(mockNavigation.navigate).toHaveBeenCalledWith('LeagueSelect', { leagues: mockLeagues });
    });

    it('handles Google sign-in failure', async () => {
      FantraxApi.loginWithGoogle.mockRejectedValueOnce(new Error('Google auth failed'));

      const { getByTestId } = render(
        <FantraxLoginScreen navigation={mockNavigation} />
      );

      const googleButton = getByTestId('google-signin-button');

      await act(async () => {
        fireEvent.press(googleButton);
      });

      expect(Alert.alert).toHaveBeenCalledWith('Google Sign-In Failed', 'Authentication failed. Please try again.');
    });

    it('handles no leagues found after Google sign-in', async () => {
      FantraxApi.loginWithGoogle.mockResolvedValueOnce({ success: true });
      FantraxApi.getUserLeagues.mockResolvedValueOnce([]);

      const { getByTestId } = render(
        <FantraxLoginScreen navigation={mockNavigation} />
      );

      const googleButton = getByTestId('google-signin-button');

      await act(async () => {
        fireEvent.press(googleButton);
      });

      expect(Alert.alert).toHaveBeenCalledWith('No Leagues Found', 'No fantasy basketball leagues found in your account.');
    });
  });
}); 