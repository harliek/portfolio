import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Media working files (frames, renders, transcript work) are large and
    // irrelevant to the app; keep the dev watcher away from them.
    watch: { ignored: ['**/.media-cache/**', '**/tests/screenshots/**'] },
  },
  optimizeDeps: { entries: ['index.html'] },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 400,
  },
  preview: {
    port: 4173,
  },
})
