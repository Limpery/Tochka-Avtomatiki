export default {
  // Frontend
  'webapp/src/**/*.{ts,tsx,js}': [
    'eslint --cache --cache-location ./webapp/.eslintcache --fix',
    'prettier --loglevel warn --cache --write',
  ],

  'webapp/**/*.{json,mjs,yml,scss}': 'prettier --loglevel warn --cache --write',

  // Backend
  'backend/src/**/*.{ts,tsx,js}': [
    'eslint --cache --cache-location ./backend/.eslintcache --fix',
    'prettier --loglevel warn --cache --write',
  ],

  'backend/**/*.{json,mjs,yml,scss}': 'prettier --loglevel warn --cache --write',

  // Корневые конфиги, утилиты, скрипты
  '*.{ts,js,mjs,json,yml}': 'prettier --loglevel warn --cache --write',
}
