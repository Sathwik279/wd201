const globals = require('globals');
const { recommended: jsRecommended } = require('@eslint/js').configs;
const { recommended: jestRecommended } = require('eslint-plugin-jest').configs;

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
    plugins: {
      jest: require('eslint-plugin-jest'),
    },
    rules: {},
  },
  jsRecommended,
  jestRecommended,
];
