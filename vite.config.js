// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // @vitejs/api-react가 아니라 plugin-react입니다!
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
})
