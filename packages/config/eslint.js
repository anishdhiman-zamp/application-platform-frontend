module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:react/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    'react',
    '@typescript-eslint',
    'simple-import-sort',
    'import',
    'tsdoc',
    'absolute-imports',
    'jsx-a11y',
    'prettier',
    'react-hooks',
  ],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2022,
    ecmaFeatures: {
      modules: true,
      jsx: true,
    },
  },
  settings: {
    next: {
      rootDir: ['apps/*/', 'packages/*/'],
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['apps/*/tsconfig.json', 'packages/*/tsconfig.json'],
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['*.webp', '*.png', '*.svg', 'fonts.css', 'eslint.js'],
  rules: {
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-ignore': 'allow-with-description',
        'ts-nocheck': 'allow-with-description',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        ignoreRestSiblings: true,
        vars: 'local',
      },
    ],
    '@typescript-eslint/no-require-imports': 'off',
    'absolute-imports/only-absolute-imports': 'error',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'always',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-extraneous-dependencies': 'error',
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: 'return',
      },
      {
        blankLine: 'always',
        prev: ['const', 'let', 'var'],
        next: '*',
      },
      {
        blankLine: 'any',
        prev: ['const', 'let', 'var'],
        next: ['const', 'let', 'var'],
      },
    ],
    'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'import/default': 'off',
  },
  overrides: [
    // override "simple-import-sort" config
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      rules: {
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              [
                '^react', // Packages `react` related packages come first.
                '^@?\\w',
                '^(@|components)(/.*|$)', // Internal packages.
                '^\\u0000', // Side effect imports.
                '^\\.\\.(?!/?$)', // Parent imports. Put `..` last.
                '^\\.\\./?$',
                '^\\./(?=.*/)(?!/?$)', // Other relative imports. Put same-folder imports and `.` last.
                '^\\.(?!/?$)',
                '^\\./?$',
                '^.+\\.?(css)$', // Style imports.
              ],
            ],
          },
        ],
        'react/react-in-jsx-scope': 'off',
      },
    },
  ],
};
