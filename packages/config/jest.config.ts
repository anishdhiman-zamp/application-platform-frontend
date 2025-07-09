import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,

  collectCoverage: true,

  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '!src/**/*.mock.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/components/**/*.{js,jsx,ts,tsx}',
    '!src/apis/**/*.{js,jsx,ts,tsx}',
    '!src/types/**/*.{js,jsx,ts,tsx}',
    '!src/styles/**/*.{js,jsx,ts,tsx}',
    '!src/constants/**/*.{js,jsx,ts,tsx}',
    '!src/serviceWorker.ts',
  ],

  coverageDirectory: 'coverage',

  coverageProvider: 'v8',

  moduleDirectories: ['node_modules', 'src'],

  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],

  moduleNameMapper: {
    '^@zamp-platform/api$': '<rootDir>/../../packages/api/index.ts',
    '^@zamp-platform/utils/(.*)$': '<rootDir>/../../packages/utils/$1',
    '^@zamp-platform/utils$': '<rootDir>/../../packages/utils/index.ts',
    '^@zamp-platform/svg-loader$': '<rootDir>/../../packages/svg-loader/svg-loader.ts',
    '^@zamp-platform/svg-loader/(.*)$': '<rootDir>/../../packages/svg-loader/$1',
    '^@zamp-platform/ui$': '<rootDir>/../../packages/ui/src/components/index.ts',
    '^@zamp-platform/ui/assets$': '<rootDir>/../../packages/ui/src/components/assets/index.ts',
    '^@zamp-platform/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '^modules/(.*)$': '<rootDir>/src/modules/$1',
    '^apis/(.*)$': '<rootDir>/src/apis/$1',
    '^constants/(.*)$': '<rootDir>/src/constants/$1',
    '^types/(.*)$': '<rootDir>/src/types/$1',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^styles/(.*)$': '<rootDir>/src/styles/$1',
    '^store/(.*)$': '<rootDir>/src/store/$1',
    '^services/(.*)$': '<rootDir>/src/services/$1',
    '^hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^pages/(.*)$': '<rootDir>/src/pages/$1',
    '^hooks$': '<rootDir>/src/hooks',
  },

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  testEnvironment: 'jsdom',

  testPathIgnorePatterns: ['.*\\.mock\\.(ts|tsx|js)$'],

  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },

  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};

export default config;
