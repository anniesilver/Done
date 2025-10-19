module.exports = {
  // Use ts-jest for TypeScript support
  preset: 'ts-jest',
  testEnvironment: 'node',

  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],

  // Transform TypeScript files
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
      },
    }],
  },

  // Module resolution
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock React Native modules that we don't need for unit tests
    '^react-native$': '<rootDir>/__tests__/mocks/react-native.js',
    '^react-native-vector-icons/(.*)$': '<rootDir>/__tests__/mocks/react-native-vector-icons.js',
    '^react-native-paper$': '<rootDir>/__tests__/mocks/react-native-paper.js',
    '^@react-navigation/(.*)$': '<rootDir>/__tests__/mocks/react-navigation.js',
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
    '!src/types/**',
    '!src/config/**',
    '!src/navigation/**',
    '!src/screens/**',
    '!src/App.tsx',
    // Exclude UI components from Phase 1 coverage requirements
    '!src/components/**',
  ],

  coverageThreshold: {
    // Phase 1 focuses on critical business logic
    './src/stores/authStore.ts': {
      branches: 95,
      functions: 85,
      lines: 95,
      statements: 95,
    },
    './src/stores/categoryStore.ts': {
      branches: 65,
      functions: 100,
      lines: 95,
      statements: 95,
    },
    './src/stores/taskStore.ts': {
      branches: 70,
      functions: 95,
      lines: 90,
      statements: 90,
    },
    './src/services/supabaseService.ts': {
      branches: 60,
      functions: 85,
      lines: 70,
      statements: 70,
    },
    './src/utils/recurringTasks.ts': {
      branches: 90,
      functions: 100,
      lines: 90,
      statements: 90,
    },
  },

  // Ignore node_modules except for packages we need to transform
  transformIgnorePatterns: [
    'node_modules/(?!(zustand|@supabase|date-fns)/)',
  ],
};
