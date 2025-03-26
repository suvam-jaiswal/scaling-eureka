import globals from 'globals';
import js from '@eslint/js';
import eslintPluginVue from 'eslint-plugin-vue';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptEslintParser from '@typescript-eslint/parser';
import vueEslintParser from 'vue-eslint-parser';

export default [
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  // Global config
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    }
  },
  // Base JS config using eslint recommended rules
  js.configs.recommended,
  // Additional base config for JS files
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    }
  },
  
  // TypeScript configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface']
    }
  },
  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },
  // Vue files
  {
    files: ['**/*.vue'],
    plugins: {
      vue: eslintPluginVue
    },
    languageOptions: {
      globals: {
        ...globals.browser
      },
      parser: vueEslintParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parser: typescriptEslintParser
      }
    },
    rules: {
      'vue/comment-directive': 'off',
      'vue/jsx-uses-vars': 'error',
      'vue/script-setup-uses-vars': 'error',
      'vue/no-unused-vars': 'error',
      'vue/no-unused-components': 'error',
      'vue/component-tags-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/html-closing-bracket-newline': ['error', { singleline: 'never', multiline: 'always' }],
      'vue/html-indent': ['error', 2],
      'vue/max-attributes-per-line': ['error', { singleline: 3, multiline: 1 }],
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/require-default-prop': 'off'
    }
  },
  // Common rules for all file types
  {
    rules: {
      'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
      'semi': ['error', 'always'],
      'no-unused-vars': ['warn', { 
        'argsIgnorePattern': '^_|^e$|^id$|^position$|^size$',
        'varsIgnorePattern': '^_'
      }],
      'no-self-assign': 'warn',
      'indent': ['error', 2],
      'comma-dangle': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'arrow-parens': ['error', 'as-needed'],
      'max-len': ['error', { 'code': 100, 'ignoreComments': true, 'ignoreStrings': true, 'ignoreTemplateLiterals': true }]
    }
  }
];