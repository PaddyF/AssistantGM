import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import GoogleSignInButton from '../../src/components/GoogleSignInButton';
import { googleAuthService } from '../../src/services/googleAuthService';

jest.mock('../../src/services/googleAuthService', () => ({
  googleAuthService: {
    signIn: jest.fn()
  }
}));

describe('GoogleSignInButton', () => {
  const mockUserInfo = {
    user: {
      email: 'test@example.com',
      id: '123',
      name: 'Test User'
    },
    success: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByTestId } = render(<GoogleSignInButton />);
    
    expect(getByTestId('google-signin-button')).toBeTruthy();
    expect(getByText('Sign in with Google')).toBeTruthy();
  });

  it('shows loading indicator when signing in', async () => {
    googleAuthService.signIn.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(mockUserInfo), 100);
    }));

    const { getByTestId, queryByTestId } = render(<GoogleSignInButton />);
    
    await act(async () => {
      fireEvent.press(getByTestId('google-signin-button'));
    });

    expect(queryByTestId('google-signin-loading')).toBeTruthy();
  });

  it('calls onSignInSuccess when sign in succeeds', async () => {
    const onSignInSuccess = jest.fn();
    googleAuthService.signIn.mockResolvedValueOnce(mockUserInfo);

    const { getByTestId } = render(
      <GoogleSignInButton onSignInSuccess={onSignInSuccess} />
    );

    await act(async () => {
      fireEvent.press(getByTestId('google-signin-button'));
    });

    expect(onSignInSuccess).toHaveBeenCalledWith(mockUserInfo);
  });

  it('calls onSignInError when sign in fails', async () => {
    const onSignInError = jest.fn();
    const error = new Error('Sign in failed');
    googleAuthService.signIn.mockRejectedValueOnce(error);

    const { getByTestId } = render(
      <GoogleSignInButton onSignInError={onSignInError} />
    );

    await act(async () => {
      fireEvent.press(getByTestId('google-signin-button'));
    });

    expect(onSignInError).toHaveBeenCalledWith(error);
  });

  it('disables button while loading', async () => {
    googleAuthService.signIn.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(mockUserInfo), 100);
    }));

    const { getByTestId } = render(<GoogleSignInButton />);
    const button = getByTestId('google-signin-button');

    await act(async () => {
      fireEvent.press(button);
    });

    expect(button.props.disabled).toBe(true);
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(<GoogleSignInButton style={customStyle} />);
    
    const button = getByTestId('google-signin-button');
    expect(button.props.style).toContainEqual(customStyle);
  });
}); 