import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'design', 'assets', 'tools', 'plan', 'tests']),

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
    },
  },

  // design/ui-rules.md §2: colours come from tokens.json, never typed by hand.
  // Plan: one seeded RNG for everything random, so a seed always replays the same run.
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
          message: 'Take colours from design/tokens.json, never type a hex value.',
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message: 'Use the seeded RNG in src/core/rng.ts, so runs can be replayed.',
        },
      ],
    },
  },

  // Game rules know nothing about the screen (plan/Stage0_Programmer.txt §3).
  {
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['**/screens/**', '**/ui/**', 'preact', 'preact/*'] },
      ],
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage', 'navigator'],
    },
  },

  prettier,
]);
