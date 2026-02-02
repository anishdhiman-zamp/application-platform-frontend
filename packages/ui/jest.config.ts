import baseConfig from '@zamp-platform/config/jest.config';
import type { Config } from 'jest';

const config: Config = {
  ...baseConfig,
  moduleDirectories: ['node_modules', 'packages/ui/src'],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@zamp-platform/ui/(.*)$': '<rootDir>/src/$1',
    '^react-resizable-panels$': '<rootDir>/src/__mocks__/react-resizable-panels.tsx',
  },
};

export default config;
