import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    // Case-study routes are split; keep GSAP out of the entry chunk where possible.
    chunkSizeWarningLimit: 400,
  },
  preview: {
    port: 4173,
  },
})
