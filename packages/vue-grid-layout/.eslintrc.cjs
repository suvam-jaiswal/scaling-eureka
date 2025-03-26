/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential', // Base Vue 3 rules
    'eslint:recommended',
    '@vue/eslint-config-typescript/recommended', // TypeScript rules for Vue
    '@vue/eslint-config-prettier', // Integrates Prettier, disables conflicting rules
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // Add any project-specific rule overrides here
    'prettier/prettier': 'warn', // Show Prettier issues as warnings
    'vue/multi-word-component-names': 'off', // Allow single-word component names if needed for library components
  },
};
