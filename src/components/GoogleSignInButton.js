import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { googleAuthService } from '../services/googleAuthService';

const GoogleSignInButton = ({ onSignInSuccess, onSignInError, style }) => {
  const [loading, setLoading] = React.useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const result = await googleAuthService.signIn();
      if (result.success) {
        onSignInSuccess?.(result);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      onSignInError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleSignIn}
      disabled={loading}
      testID="google-signin-button"
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" testID="google-signin-loading" />
      ) : (
        <Text style={styles.text}>Sign in with Google</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default GoogleSignInButton; 