module.exports = {
  extends: ['clinia', 'clinia/jest', 'clinia/react', 'clinia/typescript'],
  plugins: ['react-hooks'],
  rules: {
    'no-param-reassign': 0,
    'import/extensions': 0,
    'import/no-extraneous-dependencies': 0,
    'new-cap': [
      'error',
      {
        capIsNewExceptions: [
          'EXPERIMENTAL_use',
          'EXPERIMENTAL_configureRelatedItems',
          'EXPERIMENTAL_connectConfigureRelatedItems',
        ],
      },
    ],
    'react/no-string-refs': 1,
    // Avoid errors about `UNSAFE` lifecycles (e.g. `UNSAFE_componentWillMount`)
    'react/no-deprecated': 0,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'jest/no-test-callback': 0,
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
    "@typescript-eslint/explicit-member-accessibility": 0,
    '@typescript-eslint/camelcase': [
      'error',
      {
        allow: [
          'health_facility',
          '^EXPERIMENTAL_',
        ],
      },
    ],
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      "files": ["*.ts", "*.tsx"],
      "rules": {
        "@typescript-eslint/explicit-member-accessibility": ["error"]
      }
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'valid-jsdoc': 0,
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
      pragma: 'h',
    },
    'import/resolver': {
      node: {
        // The migration is an incremental process so we import TypeScript modules
        // from JavaScript files.
        // By default, `import/resolver` only supports JavaScript modules.
        extensions: ['.js', '.ts', '.tsx'],
      },
    },
  },
  globals: {
    __DEV__: false,
  },
};
