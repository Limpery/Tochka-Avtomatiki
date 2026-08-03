export default {
  // Frontend
  'webapp/src/**/*.{ts,tsx,js}': [
    'eslint --cache --cache-location ./webapp/.eslintcache --fix',
    'prettier --log-level warn --cache --write',
  ],

  'webapp/**/*.{json,mjs,yml,scss}': 'prettier --log-level warn --cache --write',

  // Backend
  'backend/src/**/*.{ts,tsx,js}': [
    'eslint --cache --cache-location ./backend/.eslintcache --fix',
    'prettier --log-level warn --cache --write',
  ],

  'backend/**/*.{json,mjs,yml,scss}': 'prettier --log-level warn --cache --write',

  // Корневые конфиги, утилиты, скрипты
  '*.{ts,js,mjs,json,yml}': 'prettier --log-level warn --cache --write',

  '**/*.scss': 'stylelint --cache --cache-location ./node_modules/.cache/stylelintcache --fix',
}
