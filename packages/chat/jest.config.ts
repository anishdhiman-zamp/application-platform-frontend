import baseConfig from '@zamp-platform/config/jest.config';
import type { Config } from 'jest';

const config: Config = {
  ...baseConfig,
  displayName: 'chat',
  setupFilesAfterEnv: [],
  collectCoverage: false,
  moduleDirectories: ['node_modules', 'packages/chat/src'],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@zamp-platform/chat/(.*)$': '<rootDir>/src/$1',
    '^@zamp-platform/chat$': '<rootDir>/index.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          paths: {
            '@zamp-platform/ui': ['../../packages/ui/src/components/index.ts'],
            '@zamp-platform/ui/*': ['../../packages/ui/src/*'],
          },
        },
      },
    ],
    '^.+\\.jsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowJs: true,
        },
      },
    ],
  },
};

export default config;
