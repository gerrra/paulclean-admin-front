import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    open: true,
    proxy: {
      '/api': {
        target: 'https://api.paulcleanwa.com',
        changeOrigin: true,
        secure: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
