import baseConfig from '@zamp-platform/config/jest.config';
import type { Config } from 'jest';

const config: Config = {
  ...baseConfig,
  moduleDirectories: ['node_modules', 'packages/api'],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@zamp-platform/api/(.*)$': '<rootDir>/../../packages/api/$1',
  },
  // Override coverage collection to include API package files
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.{spec,test}.{js,jsx,ts,tsx}',
    '!**/*.mock.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/build/**',
  ],
};

export default config;
