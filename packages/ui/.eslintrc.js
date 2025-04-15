const config = {
  ...require('@zamp-platform/config/eslint-lib'),
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: '.',
  },
};

module.exports = config;
