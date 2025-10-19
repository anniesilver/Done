// Test setup file - runs before all tests

// Polyfill for React 19 compatibility with jest-expo
if (typeof globalThis !== 'undefined') {
  // @ts-ignore
  globalThis.setImmediate = globalThis.setImmediate || ((fn: Function) => setTimeout(fn, 0));
}

// Note: @testing-library/jest-native is deprecated
// Jest matchers are now built into @testing-library/react-native v12.4+
import '@testing-library/react-native/extend-expect';

// Mock Supabase client
jest.mock('../src/config/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
}));

// Silence console errors in tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
