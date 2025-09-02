module.exports = {
  ...require('@zamp-platform/config/eslint.js'),
  overrides: [
    ...(require('@zamp-platform/config/eslint.js').overrides || []),
    {
      // Next.js generated files should not be linted for triple slash references
      files: ['next-env.d.ts'],
      rules: {
        '@typescript-eslint/triple-slash-reference': 'off',
      },
    },
  ],
};
