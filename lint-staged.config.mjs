import { mkdirSync } from 'node:fs'

// гарантируем, что папка для кэша stylelint существует
mkdirSync('node_modules/.cache', { recursive: true })

export default {
  // Frontend
  'webapp/src/**/*.{ts,tsx,js}': [
    'eslint --cache --cache-location ./webapp/.eslintcache --fix',
    'prettier --log-level warn --cache --write',
  ],

  'webapp/**/*.{json,mjs,yml}': 'prettier --log-level warn --cache --write',

  // Backend
  'backend/src/**/*.{ts,tsx,js}': [
    'eslint --cache --cache-location ./backend/.eslintcache --fix',
    'prettier --log-level warn --cache --write',
  ],

  'backend/**/*.{json,mjs,yml}': 'prettier --log-level warn --cache --write',

  // Корневые конфиги, утилиты, скрипты
  '*.{ts,js,mjs,json,yml}': 'prettier --log-level warn --cache --write',

  // SCSS: берём stylelint из webapp, в корень ничего не ставим
  'webapp/**/*.scss': [
    'webapp/node_modules/.bin/stylelint --cache --cache-location ./node_modules/.cache/stylelintcache --fix',
    'prettier --log-level warn --cache --write',
  ],
}