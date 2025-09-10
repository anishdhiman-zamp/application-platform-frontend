import baseConfig from '@zamp-platform/config/jest.config';
import type { Config } from 'jest';

const config: Config = {
  ...baseConfig,
  moduleDirectories: ['node_modules', 'packages/ui/src'],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@zamp-platform/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
  },
  testPathIgnorePatterns: [...(baseConfig.testPathIgnorePatterns || []), '/tests/', '/node_modules/'],
  // Explicitly include only test files that should be run with Jest
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)', '!**/tests/**/*.[jt]s?(x)'],
};

export default config;
