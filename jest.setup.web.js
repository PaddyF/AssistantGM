import { jest } from '@jest/globals';
import React from 'react';

// Set up proper DOM mocking for Jest
global.HTMLElement.prototype.children = { 
  item: jest.fn(),
  indexOf: jest.fn(() => 0) 
};

// Patch to handle Switch component properly
Object.defineProperty(global.HTMLElement.prototype, 'testID', {
  get() {
    return this.getAttribute('data-testid');
  },
  set(value) {
    this.setAttribute('data-testid', value);
  }
});

// Enhanced component factory for better state handling
const createComponent = (name) => {
  return React.forwardRef((props, ref) => {
    const [value, setValue] = React.useState(props.value || '');
    const [isFocused, setIsFocused] = React.useState(false);

    const componentProps = {
      ...props,
      ref,
      value: props.value !== undefined ? props.value : value,
      onChangeText: (text) => {
        setValue(text);
        props.onChangeText && props.onChangeText(text);
      },
      onFocus: (e) => {
        setIsFocused(true);
        props.onFocus && props.onFocus(e);
      },
      onBlur: (e) => {
        setIsFocused(false);
        props.onBlur && props.onBlur(e);
      },
      testID: props.testID || `${name}-${Math.random().toString(36).substr(2, 9)}`
    };

    return React.createElement(name, componentProps);
  });
};

// Enhanced Switch component with state management
const mockSwitch = (props) => {
  const [isEnabled, setIsEnabled] = React.useState(props.value || false);
  
  return React.createElement('Switch', { 
    testID: props.testID || 'switch',
    value: props.value !== undefined ? props.value : isEnabled,
    onValueChange: (newValue) => {
      setIsEnabled(newValue);
      props.onValueChange && props.onValueChange(newValue);
    },
    ...props
  });
};

// Enhanced Alert mock with promise support
const mockAlert = {
  alert: jest.fn((title, message, buttons = [{ text: 'OK' }]) => {
    return new Promise((resolve) => {
      const buttonIndex = buttons.length - 1;
      if (buttons[buttonIndex].onPress) {
        buttons[buttonIndex].onPress();
      }
      resolve(buttonIndex);
    });
  })
};

// Mock React Native with enhanced components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native-web');
  
  return {
    ...RN,
    StyleSheet: {
      create: (styles) => styles,
      hairlineWidth: 1,
      flatten: jest.fn((style) => style)
    },
    View: createComponent('View'),
    Text: createComponent('Text'),
    TextInput: createComponent('TextInput'),
    TouchableOpacity: createComponent('TouchableOpacity'),
    TouchableHighlight: createComponent('TouchableHighlight'),
    TouchableWithoutFeedback: createComponent('TouchableWithoutFeedback'),
    ActivityIndicator: createComponent('ActivityIndicator'),
    Image: createComponent('Image'),
    ScrollView: createComponent('ScrollView'),
    FlatList: createComponent('FlatList'),
    SectionList: createComponent('SectionList'),
    Modal: createComponent('Modal'),
    Switch: mockSwitch,
    Platform: {
      OS: 'web',
      select: jest.fn(obj => obj.web || obj.default)
    },
    Alert: mockAlert,
    Animated: {
      Value: jest.fn(() => ({
        interpolate: jest.fn(() => ({
          interpolate: jest.fn()
        })),
        setValue: jest.fn(),
        addListener: jest.fn(() => ({ remove: jest.fn() })),
        removeListener: jest.fn(),
        setOffset: jest.fn(),
        flattenOffset: jest.fn(),
        extractOffset: jest.fn(),
        stopAnimation: jest.fn()
      })),
      View: createComponent('AnimatedView'),
      Text: createComponent('AnimatedText'),
      Image: createComponent('AnimatedImage'),
      createAnimatedComponent: jest.fn((component) => component),
      timing: jest.fn(() => ({
        start: jest.fn(cb => cb && cb({ finished: true }))
      })),
      spring: jest.fn(() => ({
        start: jest.fn(cb => cb && cb({ finished: true }))
      })),
      parallel: jest.fn(() => ({
        start: jest.fn(cb => cb && cb({ finished: true }))
      })),
      sequence: jest.fn(() => ({
        start: jest.fn(cb => cb && cb({ finished: true }))
      })),
      event: jest.fn(() => jest.fn())
    }
  };
});

// Enhanced AsyncStorage mock with better error handling
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key) => {
    if (!key) return Promise.reject(new Error('Key is required'));
    return Promise.resolve(null);
  }),
  setItem: jest.fn((key, value) => {
    if (!key) return Promise.reject(new Error('Key is required'));
    if (!value) return Promise.reject(new Error('Value is required'));
    return Promise.resolve(null);
  }),
  removeItem: jest.fn((key) => {
    if (!key) return Promise.reject(new Error('Key is required'));
    return Promise.resolve(null);
  }),
  clear: jest.fn(() => Promise.resolve(null)),
  getAllKeys: jest.fn(() => Promise.resolve([]))
}));

// Enhanced fetch mock with more realistic responses
global.fetch = jest.fn((url) => Promise.resolve({
  json: jest.fn(() => Promise.resolve({})),
  text: jest.fn(() => Promise.resolve("")),
  ok: true,
  status: 200,
  headers: new Headers(),
  statusText: 'OK'
}));

// Allow synchronous timers to avoid timeout issues
jest.useFakeTimers({ legacyFakeTimers: true });

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 