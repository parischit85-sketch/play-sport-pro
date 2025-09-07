// ESLint Flat Config (v9)
import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist/**', 'node_modules/**', '**/*.backup.*', '**/*.backup'] },
  // Base for JS/TS/React
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [
            ['@app', './src/app'],
            ['@features', './src/features'],
            ['@ui', './src/components/ui'],
            ['@lib', './src/lib'],
            ['@data', './src/data'],
            ['@services', './src/services'],
            ['@contexts', './src/contexts'],
            ['@hooks', './src/hooks'],
            ['@pages', './src/pages'],
            ['@layouts', './src/layouts'],
            ['@components', './src/components'],
            ['@utils', './src/utils'],
          ],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Reduce noise initially
      'no-empty': 'warn',
      'no-undef': 'warn',
      'no-unused-vars': 'warn',
      // Relax a11y rules for now; can be re-enabled gradually
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
  // Evita errori per apostrofi non scappati in stringhe italiane
  'react/no-unescaped-entities': 'off',
  // Evita falsi positivi su import nominati quando i file JS non esportano type info
  'import/named': 'off',
    },
  },
  // TS-specific tweaks (only adjust rules, no invalid spreads)
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  // Prettier compatibility (turn off formatting rules)
  prettier,
];
