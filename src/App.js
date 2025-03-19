import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import WebErrorBoundary from './components/WebErrorBoundary';

export default function App() {
  return (
    <WebErrorBoundary>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </WebErrorBoundary>
  );
} 