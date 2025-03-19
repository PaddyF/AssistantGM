// Performance monitoring utility
const performanceMetrics = {
  apiCalls: new Map(),
  renderTimes: new Map(),
  errors: []
};

export const PerformanceMonitor = {
  // Track API call performance
  trackApiCall: (endpoint, startTime) => {
    const duration = Date.now() - startTime;
    const existing = performanceMetrics.apiCalls.get(endpoint) || [];
    performanceMetrics.apiCalls.set(endpoint, [...existing, duration]);
    
    // Log slow API calls in development
    if (duration > 1000) {
      console.warn(`Slow API call to ${endpoint}: ${duration}ms`);
    }
  },

  // Track component render time
  trackRender: (componentName, startTime) => {
    const duration = Date.now() - startTime;
    const existing = performanceMetrics.renderTimes.get(componentName) || [];
    performanceMetrics.renderTimes.set(componentName, [...existing, duration]);
    
    // Log slow renders in development
    if (duration > 16) { // More than one frame
      console.warn(`Slow render for ${componentName}: ${duration}ms`);
    }
  },

  // Track errors
  trackError: (error, context) => {
    performanceMetrics.errors.push({
      error,
      context,
      timestamp: Date.now()
    });
    
    // Log errors in development
    console.error(`Error in ${context}:`, error);
  },

  // Get performance report
  getReport: () => {
    const report = {
      apiCalls: {},
      renderTimes: {},
      errors: performanceMetrics.errors.length
    };

    // Calculate average API call times
    performanceMetrics.apiCalls.forEach((durations, endpoint) => {
      report.apiCalls[endpoint] = {
        count: durations.length,
        average: durations.reduce((a, b) => a + b, 0) / durations.length,
        max: Math.max(...durations)
      };
    });

    // Calculate average render times
    performanceMetrics.renderTimes.forEach((durations, component) => {
      report.renderTimes[component] = {
        count: durations.length,
        average: durations.reduce((a, b) => a + b, 0) / durations.length,
        max: Math.max(...durations)
      };
    });

    return report;
  },

  // Clear metrics
  clear: () => {
    performanceMetrics.apiCalls.clear();
    performanceMetrics.renderTimes.clear();
    performanceMetrics.errors = [];
  }
}; 