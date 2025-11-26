module.exports = {
  ...require('@zamp-platform/config/eslint.js'),
  ignorePatterns: ['src/unused/**'],
  overrides: [
    ...(require('@zamp-platform/config/eslint.js').overrides || []),
    {
      // Next.js generated files should not be linted for triple slash references
      files: ['next-env.d.ts'],
      rules: {
        '@typescript-eslint/triple-slash-reference': 'off',
      },
    },
    {
      // Test files should not be linted with React rules
      files: ['**/*.spec.ts', '**/*.spec.tsx', '**/tests/**/*.ts', '**/tests/**/*.tsx'],
      rules: {
        // Playwright fixtures use 'use' parameter, which is not a React Hook
        'react-hooks/rules-of-hooks': 'off',
        // Test files legitimately import from devDependencies
        'import/no-extraneous-dependencies': 'off',
        // Test files can use relative imports for test utilities
        'absolute-imports/only-absolute-imports': 'off',
      },
    },
  ],
};
