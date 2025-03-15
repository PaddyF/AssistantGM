import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as FantraxApi from '../services/fantraxApi';
import GoogleSignInButton from '../components/GoogleSignInButton';

const FantraxLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Login Failed', 'Please check your credentials and try again.');
        return;
      }

      setLoading(true);
      const response = await FantraxApi.login(email, password);
      
      const leagues = await FantraxApi.getUserLeagues();
      
      if (!leagues || leagues.length === 0) {
        Alert.alert('No Leagues Found', 'No fantasy basketball leagues found in your account.');
        return;
      }

      if (leagues.length === 1) {
        navigation.navigate('Dashboard', { leagueId: leagues[0].id });
      } else {
        navigation.navigate('LeagueSelect', { leagues });
      }
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInSuccess = async (result) => {
    try {
      if (!result?.tokens?.idToken) {
        Alert.alert('Google Sign-In Failed', 'Authentication failed. Please try again.');
        return;
      }

      const response = await FantraxApi.loginWithGoogle(result.tokens.idToken);
      
      const leagues = await FantraxApi.getUserLeagues();
      
      if (!leagues || leagues.length === 0) {
        Alert.alert('No Leagues Found', 'No fantasy basketball leagues found in your account.');
        return;
      }

      if (leagues.length === 1) {
        navigation.navigate('Dashboard', { leagueId: leagues[0].id });
      } else {
        navigation.navigate('LeagueSelect', { leagues });
      }
    } catch (error) {
      Alert.alert('Google Sign-In Failed', 'Authentication failed. Please try again.');
    }
  };

  const handleGoogleSignInError = (error) => {
    Alert.alert('Google Sign-In Failed', 'Authentication failed. Please try again.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Fantrax Account</Text>
      <Text style={styles.subtitle}>
        Link your Fantrax account to sync your fantasy basketball teams
      </Text>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Sign in with</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleSignInButton
        style={styles.googleButton}
        onSignInSuccess={handleGoogleSignInSuccess}
        onSignInError={handleGoogleSignInError}
      />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <View testID="login-form">
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Connect Account</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        Your credentials are only used to connect to Fantrax and are never stored.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  googleButton: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  disclaimer: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
});

export default FantraxLoginScreen; 