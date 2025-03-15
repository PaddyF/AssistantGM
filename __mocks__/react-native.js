// Mock for React Native

const React = require('react');

const mockComponent = (name) => {
  return function MockComponent(props) {
    return React.createElement(name, {
      ...props,
      children: props.children,
    });
  };
};

// Mocked React Native components
const ReactNative = {
  StyleSheet: {
    create: (styles) => styles,
    hairlineWidth: 1,
    absoluteFill: {},
    flatten: jest.fn((style) => style),
  },
  Platform: {
    OS: 'web',
    Version: 9,
    select: jest.fn((obj) => obj.web || obj.default),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  View: mockComponent('View'),
  Text: mockComponent('Text'),
  TextInput: mockComponent('TextInput'),
  TouchableOpacity: mockComponent('TouchableOpacity'),
  TouchableHighlight: mockComponent('TouchableHighlight'),
  TouchableWithoutFeedback: mockComponent('TouchableWithoutFeedback'),
  ActivityIndicator: mockComponent('ActivityIndicator'),
  ScrollView: mockComponent('ScrollView'),
  FlatList: mockComponent('FlatList'),
  SectionList: mockComponent('SectionList'),
  Image: mockComponent('Image'),
  Modal: mockComponent('Modal'),
  Switch: mockComponent('Switch'),
  Button: mockComponent('Button'),
  Alert: {
    alert: jest.fn(),
  },
  Animated: {
    View: mockComponent('Animated.View'),
    Text: mockComponent('Animated.Text'),
    Image: mockComponent('Animated.Image'),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      setOffset: jest.fn(),
      flattenOffset: jest.fn(),
      extractOffset: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      stopAnimation: jest.fn(),
      resetAnimation: jest.fn(),
      interpolate: jest.fn(() => ({
        interpolate: jest.fn(),
      })),
    })),
    timing: jest.fn(() => ({
      start: jest.fn((cb) => cb && cb({ finished: true })),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((cb) => cb && cb({ finished: true })),
    })),
    decay: jest.fn(() => ({
      start: jest.fn((cb) => cb && cb({ finished: true })),
    })),
    parallel: jest.fn(() => ({
      start: jest.fn((cb) => cb && cb({ finished: true })),
    })),
    sequence: jest.fn(() => ({
      start: jest.fn((cb) => cb && cb({ finished: true })),
    })),
    event: jest.fn(() => jest.fn()),
    createAnimatedComponent: jest.fn((component) => component),
  },
  AsyncStorage: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve(null)),
    clear: jest.fn(() => Promise.resolve(null)),
    getAllKeys: jest.fn(() => Promise.resolve([])),
  },
  UIManager: {
    measure: jest.fn(),
    measureInWindow: jest.fn(),
    measureLayout: jest.fn(),
    dispatchViewManagerCommand: jest.fn(),
  },
  BackHandler: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getInitialURL: jest.fn(() => Promise.resolve('')),
  },
  Keyboard: {
    dismiss: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
  },
  LayoutAnimation: {
    configureNext: jest.fn(),
    create: jest.fn(),
  },
  I18nManager: {
    isRTL: false,
    getConstants: jest.fn(() => ({ isRTL: false })),
  },
};

module.exports = ReactNative; 