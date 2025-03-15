import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Initialize the Google Sign-In configuration
GoogleSignin.configure({
  // You'll need to get your Web Client ID from Google Cloud Console
  webClientId: 'YOUR_WEB_CLIENT_ID',
  offlineAccess: true
});

export const googleAuthService = {
  /**
   * Signs in the user with Google
   * @returns {Promise<Object>} User info and tokens
   */
  async signIn() {
    try {
      // Check if user is already signed in
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.signOut();
      }

      // Trigger sign-in flow
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      return {
        user: userInfo,
        tokens,
        success: true
      };
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Sign in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Sign in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Play services not available');
      } else {
        throw new Error('Unknown error during sign in');
      }
    }
  },

  /**
   * Signs out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      await GoogleSignin.signOut();
      return { success: true };
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
      throw new Error('Error signing out');
    }
  },

  /**
   * Gets the current user's info
   * @returns {Promise<Object>} Current user info
   */
  async getCurrentUser() {
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      return currentUser;
    } catch (error) {
      console.error('Get Current User Error:', error);
      return null;
    }
  },

  /**
   * Checks if a user is currently signed in
   * @returns {Promise<boolean>}
   */
  async isSignedIn() {
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('Check Sign-In Status Error:', error);
      return false;
    }
  }
}; 