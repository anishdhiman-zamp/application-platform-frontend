const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['eslint:recommended', 'turbo'],
  plugins: ['only-warn'],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
  },
  rules: {
    'no-html-link-for-pages': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    '.*.js',
    'node_modules/',
    'dist/',
    '.turbo/',
    'node_modules/',
  ],
  overrides: [
    {
      files: ['*.js?(x)', '*.ts?(x)'],
    },
  ],
};
