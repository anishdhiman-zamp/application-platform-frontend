import baseConfig from '@zamp-platform/config/jest.config';
import type { Config } from 'jest';

const config: Config = {
  ...baseConfig,
  displayName: 'conversation-stream',
  setupFilesAfterEnv: [],
  collectCoverage: false,
  moduleDirectories: ['node_modules', 'packages/conversation-stream/src'],
};

export default config;
