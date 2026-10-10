import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:9091' }
  },
  build: {
    outDir: process.env.VERCEL ? 'dist' : '../src/main/resources/static',
    emptyOutDir: true
  }
})
