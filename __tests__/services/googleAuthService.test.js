import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { googleAuthService } from '../../src/services/googleAuthService';

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
    isSignedIn: jest.fn(),
    hasPlayServices: jest.fn(),
    getTokens: jest.fn(),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE'
  }
}));

describe('Google Auth Service', () => {
  const mockUserInfo = {
    user: {
      email: 'test@example.com',
      id: '123',
      name: 'Test User',
      photo: 'https://example.com/photo.jpg'
    }
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    idToken: 'mock-id-token'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      GoogleSignin.isSignedIn.mockResolvedValueOnce(false);
      GoogleSignin.hasPlayServices.mockResolvedValueOnce(true);
      GoogleSignin.signIn.mockResolvedValueOnce(mockUserInfo);
      GoogleSignin.getTokens.mockResolvedValueOnce(mockTokens);

      const result = await googleAuthService.signIn();

      expect(result).toEqual({
        user: mockUserInfo,
        tokens: mockTokens,
        success: true
      });
      expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
      expect(GoogleSignin.signIn).toHaveBeenCalled();
      expect(GoogleSignin.getTokens).toHaveBeenCalled();
    });

    it('should sign out first if already signed in', async () => {
      GoogleSignin.isSignedIn.mockResolvedValueOnce(true);
      GoogleSignin.hasPlayServices.mockResolvedValueOnce(true);
      GoogleSignin.signIn.mockResolvedValueOnce(mockUserInfo);
      GoogleSignin.getTokens.mockResolvedValueOnce(mockTokens);

      await googleAuthService.signIn();

      expect(GoogleSignin.signOut).toHaveBeenCalled();
      expect(GoogleSignin.signIn).toHaveBeenCalled();
    });

    it('should handle sign in cancellation', async () => {
      GoogleSignin.isSignedIn.mockResolvedValueOnce(false);
      GoogleSignin.hasPlayServices.mockResolvedValueOnce(true);
      GoogleSignin.signIn.mockRejectedValueOnce({ code: statusCodes.SIGN_IN_CANCELLED });

      await expect(googleAuthService.signIn()).rejects.toThrow('Sign in cancelled');
    });

    it('should handle play services not available', async () => {
      GoogleSignin.isSignedIn.mockResolvedValueOnce(false);
      GoogleSignin.hasPlayServices.mockRejectedValueOnce({ code: statusCodes.PLAY_SERVICES_NOT_AVAILABLE });

      await expect(googleAuthService.signIn()).rejects.toThrow('Play services not available');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      GoogleSignin.signOut.mockResolvedValueOnce();

      const result = await googleAuthService.signOut();

      expect(result).toEqual({ success: true });
      expect(GoogleSignin.signOut).toHaveBeenCalled();
    });

    it('should handle sign out error', async () => {
      GoogleSignin.signOut.mockRejectedValueOnce(new Error('Sign out failed'));

      await expect(googleAuthService.signOut()).rejects.toThrow('Error signing out');
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      GoogleSignin.getCurrentUser.mockResolvedValueOnce(mockUserInfo);

      const result = await googleAuthService.getCurrentUser();

      expect(result).toEqual(mockUserInfo);
    });

    it('should return null on error', async () => {
      GoogleSignin.getCurrentUser.mockRejectedValueOnce(new Error('Get user failed'));

      const result = await googleAuthService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isSignedIn', () => {
    it('should check sign in status successfully', async () => {
      GoogleSignin.isSignedIn.mockResolvedValueOnce(true);

      const result = await googleAuthService.isSignedIn();

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      GoogleSignin.isSignedIn.mockRejectedValueOnce(new Error('Check failed'));

      const result = await googleAuthService.isSignedIn();

      expect(result).toBe(false);
    });
  });
}); 