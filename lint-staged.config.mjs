import { mkdirSync } from 'node:fs'

// Создаем папку один раз, игнорируем ошибку, если она уже есть
try {
  mkdirSync('node_modules/.cache', { recursive: true })
} catch (e) {
  // Игнорируем, если папка уже существует
}

export default {
  // Frontend
  'webapp/src/**/*.{ts,tsx,js}': [
    'eslint --cache --cache-location ./webapp/.eslintcache --fix',
    'prettier --cache --write',
  ],
  'webapp/**/*.{json,mjs,yml}': 'prettier --cache --write',

  // Backend
  'backend/src/**/*.{ts,tsx,js}': [
    'eslint --cache --cache-location ./backend/.eslintcache --fix',
    'prettier --cache --write',
  ],
  'backend/**/*.{json,mjs,yml}': 'prettier --cache --write',

  // Корневые конфиги, утилиты, скрипты (исключаем node_modules явно на всякий случай)
  '*.{ts,js,mjs,json,yml}': 'prettier --cache --write',

  // SCSS
  'webapp/**/*.scss': [
    'webapp/node_modules/.bin/stylelint --cache --cache-location ./node_modules/.cache/stylelintcache --fix',
    'prettier --cache --write',
  ],
}
