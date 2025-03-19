import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import WebErrorBoundary from '../../src/components/WebErrorBoundary';
import { PerformanceMonitor } from '../../src/utils/performance';

// Mock PerformanceMonitor
jest.mock('../../src/utils/performance', () => ({
  PerformanceMonitor: {
    trackError: jest.fn(),
  },
}));

// Mock console.error to avoid test output noise
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('WebErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when no error occurs', () => {
    const { getByText } = render(
      <WebErrorBoundary>
        <Text>Test Content</Text>
      </WebErrorBoundary>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('renders error UI when an error occurs', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    const { getByText } = render(
      <WebErrorBoundary>
        <ErrorComponent />
      </WebErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Test error')).toBeTruthy();
    expect(getByText('Please try refreshing the page. If the problem persists, contact support.')).toBeTruthy();
  });

  it('renders error UI with default message when error has no message', () => {
    const ErrorComponent = () => {
      throw new Error();
    };

    const { getByText } = render(
      <WebErrorBoundary>
        <ErrorComponent />
      </WebErrorBoundary>
    );

    expect(getByText('An unexpected error occurred')).toBeTruthy();
  });

  it('tracks error using PerformanceMonitor', () => {
    const testError = new Error('Test error');
    const ErrorComponent = () => {
      throw testError;
    };

    render(
      <WebErrorBoundary>
        <ErrorComponent />
      </WebErrorBoundary>
    );

    expect(PerformanceMonitor.trackError).toHaveBeenCalledWith(testError, 'WebErrorBoundary');
  });

  it('logs error to console in development', () => {
    const testError = new Error('Test error');
    const ErrorComponent = () => {
      throw testError;
    };

    render(
      <WebErrorBoundary>
        <ErrorComponent />
      </WebErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });
}); 