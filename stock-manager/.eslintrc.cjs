module.exports = {
  root: true,
  env: {
    node: true,
    browser: false,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2021,
  },
  ignorePatterns: ['dist', 'node_modules'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
