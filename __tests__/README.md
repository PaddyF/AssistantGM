# Test Documentation

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.js

# Run tests matching a pattern
npm test -- -t "pattern"
```

### Code Coverage
We have implemented comprehensive code coverage tracking with the following thresholds:
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

Coverage reports are generated in multiple formats:
- HTML: `coverage/index.html`
- LCOV: `coverage/lcov.info`
- Clover: `coverage/clover.xml`
- JUnit: `coverage/junit/junit.xml`

## Services

### Google Auth Service (`__tests__/services/googleAuthService.test.js`)

#### `signIn`
- ✅ Should sign in successfully
  - Verifies user info and tokens are returned
  - Checks Play Services availability
  - Tests automatic sign out if already signed in
  - Validates success flag

- ✅ Should handle sign in errors
  - Tests cancellation handling
  - Verifies Play Services errors
  - Tests in-progress state
  - Validates error messages

#### `signOut`
- ✅ Should sign out successfully
  - Verifies sign out completion
  - Tests success flag
  - Validates error handling

#### `getCurrentUser`
- ✅ Should get current user info
  - Tests successful user retrieval
  - Verifies null return on error
  - Validates user object structure

#### `isSignedIn`
- ✅ Should check sign in status
  - Tests both signed in and out states
  - Verifies error handling
  - Validates boolean return

### NBA API Service (`__tests__/services/nbaApi.test.js`)

#### `getPlayerStats`
- ✅ Should fetch player stats successfully for week range
  - Verifies both season and week stats are fetched
  - Checks for averages, games, and trends properties
  - Validates game count and API call count
  - Verifies exact API parameters and date formatting
  - Tests proper date handling with mocked Date object

- ✅ Should handle season-only stats correctly
  - Verifies only season stats are fetched
  - Checks for averages, games, and trends properties
  - Validates API call count
  - Ensures proper data structure for season stats

- ✅ Should handle API errors gracefully
  - Tests specific HTTP error codes (500)
  - Verifies error message and response structure
  - Validates error propagation
  - Tests network error scenarios

- ✅ Should handle empty response data
  - Tests handling of empty game data
  - Verifies null averages for empty data
  - Ensures empty trends object
  - Validates game count is zero

- ✅ Should handle malformed API response
  - Tests partial data scenarios
  - Verifies handling of missing fields
  - Validates undefined property handling
  - Ensures graceful degradation

#### `calculateTrends`
- ✅ Should calculate trends correctly with positive and negative trends
  - Tests both increasing and decreasing trends
  - Validates trend direction calculation
  - Verifies percentage change values
  - Tests multiple stat categories

- ✅ Should handle empty or null inputs
  - Tests edge case with empty game data
  - Verifies empty trend object returned
  - Tests null and undefined inputs
  - Validates error prevention

- ✅ Should handle undefined values in games
  - Tests robustness against malformed game data
  - Verifies trend calculation with partial data
  - Validates missing stat handling
  - Ensures NaN prevention

- ✅ Should handle single game scenario
  - Tests trend calculation with minimal data
  - Verifies comparison against season averages
  - Validates direction calculation
  - Ensures proper percentage handling

## Components

### Google Sign-In Button (`__tests__/components/GoogleSignInButton.test.js`)

#### Rendering
- ✅ Renders correctly
  - Verifies button presence
  - Tests text content
  - Validates loading state
  - Checks disabled state

#### Interaction
- ✅ Handles sign in flow
  - Tests loading indicator
  - Verifies success callback
  - Validates error callback
  - Tests button disabled state

#### Styling
- ✅ Supports custom styling
  - Tests style prop application
  - Verifies default styles
  - Validates style composition

## Screens

### Fantrax Login Screen (`__tests__/screens/FantraxLoginScreen.test.js`)

#### Rendering
- ✅ Renders correctly with all UI elements
  - Verifies all UI elements present
  - Checks placeholder texts and labels
  - Validates button text and state
  - Tests disclaimer text presence
  - Verifies form structure

#### Form Validation
- ✅ Validates email format
  - Tests invalid email formats
  - Verifies error messages
  - Ensures API not called
  - Tests valid email acceptance

- ✅ Validates password length
  - Tests minimum password length
  - Verifies error messages
  - Ensures API not called
  - Tests valid password acceptance

#### Network and API Handling
- ✅ Handles network error during login
  - Tests connection failure scenarios
  - Verifies error message display
  - Validates loading state management
  - Tests retry functionality

- ✅ Handles case when no leagues are found
  - Tests empty league list scenario
  - Verifies appropriate error message
  - Ensures proper navigation handling
  - Tests user guidance

#### Loading States
- ✅ Disables form inputs during loading
  - Tests input field disabled states
  - Verifies button disabled state
  - Validates loading indicator
  - Tests state restoration after load

## Test Setup

### Jest Configuration
- Uses `jest-expo` preset for React Native testing
- Configured code coverage thresholds and reporting
- Includes custom module mocks
- Added proper timeout settings (10s)
- Configured module name mapping for React Native
- Uses parallel test execution (50% of CPU cores)
- Includes watch mode plugins for better development experience
- Generates multiple coverage report formats

### React Native Mocks
- Components properly mocked using React.createElement
- Services mocked: AsyncStorage, Alert, StyleSheet
- Platform utilities mocked for consistent testing
- Proper children prop handling in component mocks
- Improved mock reusability with helper functions

### API Mocks
- Axios mocked with proper interceptors
- Complete mock structure for API responses
- Proper error response structure
- Consistent date handling using mocked Date class
- Enhanced response validation

### Best Practices
- Uses proper async/await patterns
- Implements proper cleanup in beforeEach/afterEach
- Avoids test pollution with proper mock clearing
- Provides detailed error messages
- Uses meaningful test descriptions
- Maintains high code coverage standards
- Implements proper date mocking for consistent tests
- Uses proper type checking and validation

### Recent Improvements
1. Added Google Sign-In Integration
   - Implemented Google auth service
   - Created reusable sign-in button
   - Added comprehensive test coverage
   - Improved error handling

2. Enhanced Test Configuration
   - Added comprehensive code coverage tracking
   - Implemented coverage thresholds
   - Added multiple coverage report formats
   - Improved test execution performance

3. Better Date Handling
   - Implemented proper Date class mocking
   - Fixed date mutation issues
   - Enhanced date calculation precision
   - Improved timezone handling

4. Improved Test Organization
   - Better test grouping
   - More descriptive test names
   - Enhanced setup and teardown
   - Better mock management

### Future Improvements
1. Add snapshot testing for UI components
2. Implement E2E tests using Detox
3. Add performance testing metrics
4. Implement visual regression testing
5. Add API contract testing 