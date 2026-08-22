import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Отключаем предупреждения об устаревании @import и if-function
        silenceDeprecations: ['import', 'if-function'],
      },
    },
  },
})
