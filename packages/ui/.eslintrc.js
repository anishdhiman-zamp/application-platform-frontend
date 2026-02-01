const config = {
  ...require('@zamp-platform/config/eslint-lib'),
  root: true,
  parser: '@typescript-eslint/parser',

  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },

  env: {
    jest: true,
    browser: true,
    node: true,
    es6: true,
  },

  globals: {
    NodeJS: 'readonly',
  },

  ignorePatterns: ['coverage/', 'node_modules/', 'dist/', '.turbo/'],
};

module.exports = config;
