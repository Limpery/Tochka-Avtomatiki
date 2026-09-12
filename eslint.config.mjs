// eslint.config.mjs
import js from '@eslint/js'
import globals from 'globals'
import love from 'eslint-config-love'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/public/**',
      '*.config.js',
      '*.config.mjs',
      'eslint.config.mjs',
    ],
  },

  // Базовые правила JS/TS от ESLint
  js.configs.recommended,

  // eslint-config-love (строгий TS/JS стандарт)
  love,

  // Настройки TS-парсера (отключаем type-aware, т.к. типы проверяете отдельно)
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // Объект (не boolean): allowDefaultProject работает только внутри projectService.
        // До этого ключ лежал рядом и игнорировался — отсюда была предсуществующая
        // ошибка парсинга backend/prisma.config.ts.
        projectService: {
          // Только точные пути без `**`: широкие глобы запрещены
          // (см. tseslint allowDefaultProject-glob-too-wide).
          allowDefaultProject: [
            'backend/prisma.config.ts',
            'backend/src/*.test.ts',
            'backend/src/*/*.test.ts',
            'webapp/src/*.test.ts',
            'webapp/src/*/*.test.ts',
            'webapp/src/*/*/*.test.ts',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Отключает правила, конфликтующие с Prettier
  prettier,

  // Настройки для React-файлов
  {
    files: ['webapp/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2021 },
      sourceType: 'module',
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@tochka-avtomatiki/backend/**',
                '!@tochka-avtomatiki/backend/**/',
                '!@tochka-avtomatiki/backend/**/input',
              ],
              allowTypeImports: true,
              message: 'Only types and input schemas are allowed to be imported from backend workspace',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['backend/**/*.{js,ts}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.es2021 },
      sourceType: 'module',
    },
  },

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/consistent-typy-assertions': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@eslint-community/eslint-comments/require-description': 'off',
      // React 17+ не требует импорта React для JSX
      'react/react-in-jsx-scope': 'off',
      'no-undef': 'off', // Отключаем осторожно: типы TS уже проверяют переменные
    },
  },
]
