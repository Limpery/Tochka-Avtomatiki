import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Отключаем предупреждения об устаревании @import и if-function
        silenceDeprecations: ['import', 'if-function'],
      },
    },
  },
})
