import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  js.configs.recommended,

  {
    files: ['src/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
    },
  },

  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },

  {
    files: ['*.config.js', '*.config.mjs', 'jest.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
])
