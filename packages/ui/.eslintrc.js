const config = {
  ...require('@zamp-platform/config/eslint-lib'),
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: '.',
  },
  env: {
    jest: true,
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    module: 'readonly',
    global: 'readonly',
    window: 'readonly',
    document: 'readonly',
    console: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    NodeJS: 'readonly',
  },
  ignorePatterns: ['coverage/', 'node_modules/', 'dist/', '.turbo/'],
};

module.exports = config;
