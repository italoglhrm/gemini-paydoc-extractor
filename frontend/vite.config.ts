import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    // The API allows http://localhost:5173 by default (R15); a drifting port would break CORS silently.
    strictPort: true,
    // samples/ lives one level above frontend/ and is served from there (design FD10).
    fs: { allow: ['..'] },
  },
})
