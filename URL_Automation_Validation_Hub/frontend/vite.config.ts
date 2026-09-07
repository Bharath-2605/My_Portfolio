import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/upload': { target: 'http://localhost:8000', changeOrigin: true },
      '/process': { target: 'http://localhost:8000', changeOrigin: true },
      '/status': { target: 'http://localhost:8000', changeOrigin: true },
      '/download': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
