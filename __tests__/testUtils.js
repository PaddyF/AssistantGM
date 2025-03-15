import React from 'react';
import { render as rtlRender, fireEvent, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { afterAll } from '@jest/globals';

// Mock the switch component that's causing issues
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Switch = 'Switch';
  return rn;
});

// Create a wrapper component that provides any necessary context providers
const AllTheProviders = ({ children }) => {
  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
};

const customRender = (ui, options = {}) => {
  const Wrapper = options.wrapper || AllTheProviders;
  return rtlRender(ui, {
    wrapper: Wrapper,
    ...options,
  });
};

// re-export everything
export * from '@testing-library/react-native';

// override render method
export { customRender as render, fireEvent, act };

// Add a test to verify the custom render function
describe('testUtils', () => {
  it('should render a component with the custom render function', () => {
    const { getByText } = customRender(<Text>Test Component</Text>);
    expect(getByText('Test Component')).toBeTruthy();
  });
});

// Debug logging setup
export const setupDebugLogging = () => {
  const isDebugEnabled = process.env.DEBUG === 'true';
  
  if (isDebugEnabled) {
    // Store original console.debug
    const originalDebug = console.debug;
    
    // Override console.debug to add test context
    console.debug = (...args) => {
      const testInfo = expect.getState();
      const testName = testInfo.currentTestName || 'Unknown Test';
      originalDebug(`[${testName}]`, ...args);
    };

    // Return cleanup function instead of using afterAll
    return () => {
      console.debug = originalDebug;
    };
  } else {
    // Disable debug logging when not in debug mode
    console.debug = () => {};
    return () => {}; // Return no-op cleanup function
  }
};

// Collect debug logs for a specific test
export const collectDebugLogs = async (testFn) => {
  const logs = [];
  const originalDebug = console.debug;
  console.debug = (...args) => logs.push(args);
  
  try {
    await testFn();
  } finally {
    console.debug = originalDebug;
  }
  
  return logs;
}; 