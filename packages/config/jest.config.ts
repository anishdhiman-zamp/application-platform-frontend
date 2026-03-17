import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,

  collectCoverage: true,

  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '!src/**/*.mock.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/apis/**/*.{js,jsx,ts,tsx}',
    '!src/types/**/*.{js,jsx,ts,tsx}',
    '!src/styles/**/*.{js,jsx,ts,tsx}',
    '!src/constants/**/*.{js,jsx,ts,tsx}',
    '!src/serviceWorker.ts',
  ],

  coverageDirectory: 'coverage',

  coverageProvider: 'v8',

  coverageReporters: ['text', 'lcov', 'html', 'json'],

  moduleDirectories: ['node_modules', 'src'],

  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],

  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/../../packages/config/css-stub.js',
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

  transformIgnorePatterns: [
    'node_modules/(?!(' +
      'lowlight|devlop|fault|' +
      'react-markdown|' +
      '@tiptap/markdown|marked|' +
      'remark-gfm|remark-parse|remark-stringify|remark-rehype|' +
      'rehype-slug|rehype-raw|' +
      'unified|bail|trough|vfile|vfile-message|' +
      'unist-util-visit|unist-util-visit-parents|unist-util-is|unist-util-stringify-position|unist-util-position|unist-util-generated|unist-util-position-from-estree|' +
      'mdast-util-to-hast|mdast-util-from-markdown|mdast-util-to-markdown|mdast-util-to-string|mdast-util-phrasing|mdast-util-gfm|mdast-util-gfm-table|mdast-util-gfm-task-list-item|mdast-util-gfm-strikethrough|mdast-util-gfm-footnote|mdast-util-gfm-autolink-literal|mdast-util-find-and-replace|' +
      'micromark|micromark-util-combine-extensions|micromark-util-chunked|micromark-util-decode-numeric-character-reference|micromark-util-encode|micromark-util-sanitize-uri|micromark-util-character|micromark-util-resolve-all|micromark-util-subtokenize|micromark-util-normalize-identifier|micromark-util-decode-string|micromark-util-classify-character|micromark-util-html-tag-name|micromark-util-types|micromark-util-symbol|micromark-extension-gfm|micromark-extension-gfm-table|micromark-extension-gfm-task-list-item|micromark-extension-gfm-strikethrough|micromark-extension-gfm-footnote|micromark-extension-gfm-autolink-literal|micromark-extension-gfm-tagfilter|micromark-factory-space|micromark-factory-destination|micromark-factory-label|micromark-factory-title|micromark-factory-whitespace|micromark-core-commonmark|' +
      'hast-util-to-jsx-runtime|hast-util-whitespace|hast-util-from-parse5|hast-util-raw|hast-util-to-parse5|hast-util-from-html|hast-util-heading-rank|hast-util-has-property|hast-util-parse-selector|hast-util-is-element|' +
      'hastscript|' +
      'property-information|comma-separated-tokens|space-separated-tokens|' +
      'web-namespaces|' +
      'html-void-elements|' +
      'ccount|escape-string-regexp|' +
      'character-entities|decode-named-character-reference|' +
      'github-slugger|' +
      'estree-util-is-identifier-name|' +
      'zwitch|' +
      'longest-streak|' +
      'parse5|' +
      'trim-lines|' +
      'style-to-object|inline-style-parser' +
      ')/)',
  ],

  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
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

  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};

export default config;
