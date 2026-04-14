import js from '@eslint/js';
import globals from 'globals';

export default [
  // Ignore build output, dependencies, and legacy files
  {
    ignores: ['_site/', 'node_modules/', '_original/'],
  },

  // Base recommended rules for all JS files
  {
    ...js.configs.recommended,
    rules: {
      ...js.configs.recommended.rules,
      // Allow unused variables prefixed with underscore (intentionally unused params)
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      curly: 'error',
    },
  },

  // Node.js files (config, scripts, tests, eleventy config, data files)
  {
    files: [
      'config/**/*.js',
      'scripts/**/*.mjs',
      'tests/**/*.js',
      'eleventy.config.mjs',
      'vitest.config.js',
      'src/_data/**/*.js',
      'src/posts/**/*.js',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },

  // Browser scripts (IIFEs bundled by esbuild)
  {
    files: ['src/scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.browser,
      },
    },
  },
];
