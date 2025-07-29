import baseConfig from '@zamp-platform/config/jest.config';
import type { Config } from 'jest';

const config: Config = {
  ...baseConfig,
  displayName: 'utils',
  moduleDirectories: ['node_modules', 'packages/utils'],
  collectCoverageFrom: [
    'blob/**/*.{js,jsx,ts,tsx}',
    'cache/**/*.{js,jsx,ts,tsx}',
    'localstorage/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'index.ts',
    '!**/*.{spec,test}.{js,jsx,ts,tsx}',
    '!**/__tests__/**',
    '!**/*.mock.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/.turbo/**',
  ],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@zamp-platform/utils/(.*)$': '<rootDir>/$1',
    '^@zamp-platform/utils$': '<rootDir>/index.ts',
  },
};

export default config;
